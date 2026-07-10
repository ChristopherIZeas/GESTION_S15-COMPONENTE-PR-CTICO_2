import {
    getBooks,
    setBooks,
    getShowOnlyFavorites,
    setShowOnlyFavorites,
    getCurrentUser,
    setCurrentUser,
    setIsCatalogLoading
} from "./state.js";
import { showToast } from "./toast.js";
import { updateStatistics } from "./stats.js";
import { handleSearch } from "./filter.js";
import {
    openModal, closeModal, openEditModal, closeEditModal,
    openDetailsModal, closeDetailsModal, openConfirmModal, closeConfirmModal,
    openResetConfirmModal, closeResetConfirmModal, getBookIdToDelete, getActiveDetailsBookId
} from "./modals.js";
import {
    initTheme, applyTheme,
    initView, toggleView
} from "./storage.js";
import { initEvents } from "./events.js";
import {
    clearUserBooks,
    createBook,
    listenAuth,
    listenUserBooks,
    loginWithGoogle,
    logout,
    removeBook,
    updateBook,
    upsertUserProfile
} from "./firebase.js";

let unsubscribeBooks = null;

function refreshCatalogUI() {
    updateGenreOptions();
    handleSearch();
    updateStatistics();
}

function requireUser() {
    const user = getCurrentUser();
    if (!user) {
        showToast("Inicia sesión para administrar tu biblioteca.", "error");
        return null;
    }

    return user;
}

function getFirebaseErrorMessage(error, fallback) {
    const code = error?.code || "";

    if (code.includes("permission-denied")) {
        return "Permiso denegado en Firestore. Publica reglas que permitan leer/escribir users/{uid}.";
    }

    if (code.includes("not-found")) {
        return "Firestore no encontró la base de datos. Crea Firestore Database en Firebase Console.";
    }

    if (code.includes("unavailable")) {
        return "Firestore no está disponible temporalmente. Intenta nuevamente en unos minutos.";
    }

    return fallback;
}

/**
 * Actualiza dinámicamente las opciones del selector de géneros
 */
function updateGenreOptions() {
    const genreFilter = document.getElementById("genre-filter");
    const genrePills = document.getElementById("genre-pills");
    if (!genreFilter) return;

    const books = getBooks();
    const genres = ["all", ...new Set(books.map(b => b.genre))];
    const currentValue = genreFilter.value;
    
    genreFilter.innerHTML = "";
    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre === "all" ? "Todos los géneros" : genre;
        genreFilter.appendChild(option);
    });
    
    if (genres.includes(currentValue)) {
        genreFilter.value = currentValue;
    } else {
        genreFilter.value = "all";
    }

    if (genrePills) {
        genrePills.innerHTML = "";
        genres.forEach((genre) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `filter-pill ${genreFilter.value === genre ? "active" : ""}`;
            button.dataset.genre = genre;
            button.textContent = genre === "all" ? "Todos" : genre;
            genrePills.appendChild(button);
        });
    }
    
    // Sincronizar selectores de los formularios de añadir/editar
    updateFormGenreSelects();
    // Actualizar sugerencias de autores
    updateAuthorSuggestions();
}

/**
 * Actualiza dinámicamente las sugerencias de autocompletado para el autor
 */
function updateAuthorSuggestions() {
    const books = getBooks();
    const authors = [...new Set(books.map(b => b.author))];
    
    const populateDatalist = (datalistId) => {
        const datalist = document.getElementById(datalistId);
        if (datalist) {
            datalist.innerHTML = "";
            authors.forEach(author => {
                const option = document.createElement("option");
                option.value = author;
                datalist.appendChild(option);
            });
        }
    };
    
    populateDatalist("authors-list");
    populateDatalist("edit-authors-list");
}

/**
 * Actualiza dinámicamente las opciones de género en los formularios de añadir y editar
 */
function updateFormGenreSelects() {
    const genreSelect = document.getElementById("book-genre-select");
    const editGenreSelect = document.getElementById("edit-book-genre-select");
    if (!genreSelect || !editGenreSelect) return;

    const books = getBooks();
    const genres = [...new Set(books.map(b => b.genre))];
    
    const populateSelect = (selectEl) => {
        const currentValue = selectEl.value;
        selectEl.innerHTML = '<option value="" disabled selected>Selecciona un género...</option>';
        
        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            selectEl.appendChild(option);
        });
        
        // Agregar opción personalizada
        const customOption = document.createElement("option");
        customOption.value = "custom";
        customOption.textContent = "Otro (Crear nuevo)...";
        selectEl.appendChild(customOption);
        
        if (genres.includes(currentValue) || currentValue === "custom") {
            selectEl.value = currentValue;
        }
    };
    
    populateSelect(genreSelect);
    populateSelect(editGenreSelect);
}

async function handleAddBook(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById("book-title-input");
    const authorInput = document.getElementById("book-author-input");
    const genreSelect = document.getElementById("book-genre-select");
    const genreCustomInput = document.getElementById("book-genre-custom-input");
    const yearInput = document.getElementById("book-year-input");
    const statusSelect = document.getElementById("book-status-select");
    const descriptionInput = document.getElementById("book-description-input");
    const ratingInput = document.getElementById("book-rating-input");

    if (!titleInput || !authorInput || !genreSelect || !genreCustomInput || !yearInput || !statusSelect || !descriptionInput || !ratingInput) return;

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const year = parseInt(yearInput.value);
    const status = statusSelect.value;
    const description = descriptionInput.value.trim();
    const rating = parseInt(ratingInput.dataset.rating || "0");
    
    let genre = genreSelect.value;
    if (genre === "custom") {
        genre = genreCustomInput.value.trim();
    }
    
    // Validar género seleccionado
    if (!genre) {
        showToast("Por favor selecciona o escribe un género.", "error");
        return;
    }
    
    // Validar longitudes
    if (title.length < 2 || author.length < 2 || genre.length < 2) {
        showToast("El título, el autor y el género deben tener al menos 2 caracteres.", "error");
        return;
    }
    
    // Validar año no futuro
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
        showToast(`El año de publicación no puede ser mayor al año actual (${currentYear}).`, "error");
        return;
    }
    
    // Validar duplicados
    const books = getBooks();
    const isDuplicate = books.some(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (isDuplicate) {
        showToast("Este libro ya está registrado en la biblioteca.", "error");
        return;
    }
    
    const user = requireUser();
    if (!user) return;

    const newBook = {
        title,
        author,
        genre,
        year,
        status,
        description,
        rating
    };

    try {
        await createBook(user.uid, newBook);
        showToast(`Libro "${title}" agregado con éxito.`, "success");
        closeModal();
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el libro en Firestore.", "error");
    }
}

async function handleEditBook(e) {
    e.preventDefault();
    
    const editBookId = document.getElementById("edit-book-id");
    const editTitleInput = document.getElementById("edit-book-title-input");
    const editAuthorInput = document.getElementById("edit-book-author-input");
    const editGenreSelect = document.getElementById("edit-book-genre-select");
    const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");
    const editYearInput = document.getElementById("edit-book-year-input");
    const editStatusSelect = document.getElementById("edit-book-status-select");
    const editDescriptionInput = document.getElementById("edit-book-description-input");
    const editRatingInput = document.getElementById("edit-book-rating-input");

    if (!editBookId || !editTitleInput || !editAuthorInput || !editGenreSelect || !editGenreCustomInput || !editYearInput || !editStatusSelect || !editDescriptionInput || !editRatingInput) return;

    const id = editBookId.value;
    const title = editTitleInput.value.trim();
    const author = editAuthorInput.value.trim();
    const year = parseInt(editYearInput.value);
    const status = editStatusSelect.value;
    const description = editDescriptionInput.value.trim();
    const rating = parseInt(editRatingInput.dataset.rating || "0");
    
    let genre = editGenreSelect.value;
    if (genre === "custom") {
        genre = editGenreCustomInput.value.trim();
    }
    
    // Validar género seleccionado
    if (!genre) {
        showToast("Por favor selecciona o escribe un género.", "error");
        return;
    }
    
    // Validar longitudes
    if (title.length < 2 || author.length < 2 || genre.length < 2) {
        showToast("El título, el autor y el género deben tener al menos 2 caracteres.", "error");
        return;
    }
    
    // Validar año no futuro
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
        showToast(`El año de publicación no puede ser mayor al año actual (${currentYear}).`, "error");
        return;
    }
    
    // Validar duplicados (excluyendo el libro actual)
    const books = getBooks();
    const isDuplicate = books.some(b => b.id !== id && b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (isDuplicate) {
        showToast("Ya existe otro libro registrado con el mismo título y autor.", "error");
        return;
    }
    
    const user = requireUser();
    if (!user) return;

    try {
        await updateBook(user.uid, id, {
            title,
            author,
            genre,
            year,
            status,
            description,
            rating
        });
        showToast(`Libro "${title}" actualizado con éxito.`, "success");
        closeEditModal();
    } catch (error) {
        console.error(error);
        showToast("No se pudieron guardar los cambios en Firestore.", "error");
    }
}

function toggleActiveDetailsBookStatus() {
    const activeDetailsBookId = getActiveDetailsBookId();
    if (activeDetailsBookId !== null) {
        toggleBookStatus(activeDetailsBookId);
        openDetailsModal(activeDetailsBookId);
    }
}

function editActiveDetailsBook() {
    const activeDetailsBookId = getActiveDetailsBookId();
    if (activeDetailsBookId !== null) {
        closeDetailsModal();
        openEditModal(activeDetailsBookId);
    }
}

function handleThemeChange(theme) {
    const activeDetailsBookId = getActiveDetailsBookId();
    applyTheme(theme);
    handleSearch();
    if (activeDetailsBookId !== null) {
        openDetailsModal(activeDetailsBookId);
    }
}

/**
 * Alterna el estado de préstamo de un libro
 * @param {number} bookId - ID del libro a alternar
 */
async function toggleBookStatus(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        const user = requireUser();
        if (!user) return;

        const nextStatus = book.status === "available" ? "borrowed" : "available";

        try {
            await updateBook(user.uid, bookId, { status: nextStatus });
            const actionText = nextStatus === "borrowed" ? "prestado" : "devuelto";
            showToast(`Libro "${book.title}" ${actionText} con éxito.`, "info");
        } catch (error) {
            console.error(error);
            showToast("No se pudo actualizar el estado del libro.", "error");
        }
    }
}

/**
 * Califica un libro y actualiza la vista y el almacenamiento local
 * @param {number} bookId - ID del libro
 * @param {number} ratingValue - Calificación asignada
 */
async function rateBook(bookId, ratingValue) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        const user = requireUser();
        if (!user) return;

        try {
            await updateBook(user.uid, bookId, { rating: ratingValue });
            showToast(`Calificaste "${book.title}" con ${ratingValue} estrellas.`, "success");
        } catch (error) {
            console.error(error);
            showToast("No se pudo guardar la calificación.", "error");
        }
    }
}

/**
 * Alterna el estado de favorito de un libro
 * @param {number} bookId - ID del libro
 */
async function toggleFavorite(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        const user = requireUser();
        if (!user) return;

        const nextFavorite = !book.favorite;

        try {
            await updateBook(user.uid, bookId, { favorite: nextFavorite });
            showToast(
                nextFavorite ? `"${book.title}" añadido a Favoritos.` : `"${book.title}" eliminado de Favoritos.`,
                nextFavorite ? "success" : "info"
            );
        } catch (error) {
            console.error(error);
            showToast("No se pudo actualizar favoritos.", "error");
        }
    }
}

async function executeDeleteBook() {
    const bookIdToDelete = getBookIdToDelete();
    if (bookIdToDelete !== null) {
        const user = requireUser();
        if (!user) return;

        const books = getBooks();
        const book = books.find(b => b.id === bookIdToDelete);
        const title = book ? book.title : "";

        try {
            await removeBook(user.uid, bookIdToDelete);
            closeConfirmModal();

            if (title) {
                showToast(`Libro "${title}" eliminado con éxito.`, "info");
            }
        } catch (error) {
            console.error(error);
            showToast("No se pudo eliminar el libro.", "error");
        }
    }
}

async function executeResetCatalog() {
    const user = requireUser();
    if (!user) return;
    
    // Limpiar buscador y filtros
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const statusFilter = document.getElementById("status-filter");
    const sortSelect = document.getElementById("sort-select");
    const genrePills = document.getElementById("genre-pills");
    const statusButtons = document.querySelectorAll(".status-group .filter-pill");
    const sortCycleBtn = document.getElementById("sort-cycle-btn");

    if (searchInput) searchInput.value = "";
    if (genreFilter) genreFilter.value = "all";
    if (statusFilter) statusFilter.value = "all";
    if (sortSelect) sortSelect.value = "title-asc";
    if (sortCycleBtn) sortCycleBtn.innerHTML = '<i class="fa-solid fa-arrow-up-a-z"></i><span>Título</span>';
    if (genrePills) {
        genrePills.querySelectorAll(".filter-pill").forEach((pill) => {
            pill.classList.toggle("active", pill.dataset.genre === "all");
        });
    }
    statusButtons.forEach((pill) => {
        pill.classList.toggle("active", pill.dataset.status === "all");
    });
    
    try {
        await clearUserBooks(user.uid);
        closeResetConfirmModal();
        showToast("Catálogo eliminado de Firestore.", "info");
    } catch (error) {
        console.error(error);
        showToast("No se pudo limpiar el catálogo.", "error");
    }
}

async function handleLogin() {
    try {
        await loginWithGoogle();
    } catch (error) {
        console.error(error);
        showToast("No se pudo iniciar sesión con Google.", "error");
    }
}

async function handleLogout() {
    try {
        await logout();
    } catch (error) {
        console.error(error);
        showToast("No se pudo cerrar la sesión.", "error");
    }
}

function setAuthView(user) {
    const loginView = document.getElementById("login-view");
    const appShell = document.querySelector(".page-shell");
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userAvatar = document.getElementById("user-avatar");

    document.body.classList.toggle("is-authenticated", Boolean(user));
    document.body.classList.toggle("is-guest", !user);

    if (loginView) loginView.hidden = Boolean(user);
    if (appShell) appShell.hidden = !user;
    if (userName) userName.textContent = user?.displayName || "Usuario";
    if (userEmail) userEmail.textContent = user?.email || "";
    if (userAvatar) {
        userAvatar.src = user?.photoURL || "";
        userAvatar.alt = user?.displayName ? `Foto de ${user.displayName}` : "Foto de usuario";
    }

    if (!user && location.hash !== "#/login") {
        location.hash = "#/login";
    } else if (user && (!location.hash || location.hash === "#/login")) {
        location.hash = "#/app";
    }
}

function bindAuthEvents() {
    const googleLoginBtn = document.getElementById("google-login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (googleLoginBtn) googleLoginBtn.addEventListener("click", handleLogin);
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    window.addEventListener("hashchange", () => {
        if (!getCurrentUser() && location.hash !== "#/login") {
            location.hash = "#/login";
            showToast("Esa ruta requiere iniciar sesión.", "error");
        }
    });
}

function initAuthState() {
    listenAuth(async (user) => {
        setCurrentUser(user);
        setAuthView(user);

        if (unsubscribeBooks) {
            unsubscribeBooks();
            unsubscribeBooks = null;
        }

        if (!user) {
            setBooks([]);
            setIsCatalogLoading(false);
            refreshCatalogUI();
            return;
        }

        try {
            await upsertUserProfile(user);
        } catch (error) {
            console.error(error);
            showToast(getFirebaseErrorMessage(error, "No se pudo actualizar el perfil del usuario."), "error");
        }

        setIsCatalogLoading(true);
        unsubscribeBooks = listenUserBooks(user.uid, (books) => {
            setBooks(books);
            setIsCatalogLoading(false);
            refreshCatalogUI();
        }, (error) => {
            console.error(error);
            setIsCatalogLoading(false);
            showToast(getFirebaseErrorMessage(error, "No se pudo leer el catálogo desde Firestore."), "error");
        });
    });
}

// Inicialización de la aplicación e inicio de Eventos
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initView();
    bindAuthEvents();
    refreshCatalogUI();
    initAuthState();
    
    // Iniciar el enrutador de eventos modular
    initEvents({
        handleSearch,
        openModal,
        closeModal,
        openEditModal,
        closeEditModal,
        openDetailsModal,
        closeDetailsModal,
        openConfirmModal,
        closeConfirmModal,
        openResetConfirmModal,
        closeResetConfirmModal,
        setTheme: handleThemeChange,
        toggleView,
        getShowOnlyFavorites,
        setShowOnlyFavorites,
        handleAddBook,
        handleEditBook,
        executeResetCatalog,
        executeDeleteBook,
        toggleBookStatus,
        rateBook,
        toggleFavorite,
        toggleActiveDetailsBookStatus,
        editActiveDetailsBook
    });
});
