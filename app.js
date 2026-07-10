import { getBooks, setBooks, getShowOnlyFavorites, setShowOnlyFavorites, initialBooks } from "./js/state.js";
import { showToast } from "./js/toast.js";
import { renderBooks, getStarsHtml } from "./js/render.js";
import { updateStatistics } from "./js/stats.js";
import { handleSearch } from "./js/filter.js";
import {
    openModal, closeModal, openEditModal, closeEditModal,
    openDetailsModal, closeDetailsModal, openConfirmModal, closeConfirmModal,
    openResetConfirmModal, closeResetConfirmModal, getBookIdToDelete, setBookIdToDelete
} from "./js/modals.js";
import {
    saveToLocalStorage, initTheme, applyTheme, toggleTheme,
    initView, toggleView
} from "./js/storage.js";

// Vincular a window para compatibilidad temporal en este archivo
window.showToast = showToast;
window.renderBooks = renderBooks;
window.getStarsHtml = getStarsHtml;
window.updateStatistics = updateStatistics;
window.handleSearch = handleSearch;
window.openModal = openModal;
window.closeModal = closeModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openDetailsModal = openDetailsModal;
window.closeDetailsModal = closeDetailsModal;
window.openConfirmModal = openConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.saveToLocalStorage = saveToLocalStorage;
window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.initView = initView;
window.toggleView = toggleView;
window.openResetConfirmModal = openResetConfirmModal;
window.closeResetConfirmModal = closeResetConfirmModal;

Object.defineProperty(window, "bookIdToDelete", {
    get() { return getBookIdToDelete(); },
    set(val) { setBookIdToDelete(val); },
    configurable: true
});

// Vincular getters y setters globales para retrocompatibilidad modular
Object.defineProperty(window, "books", {
    get() { return getBooks(); },
    set(val) { setBooks(val); },
    configurable: true
});

Object.defineProperty(window, "showOnlyFavorites", {
    get() { return getShowOnlyFavorites(); },
    set(val) { setShowOnlyFavorites(val); },
    configurable: true
});

Object.defineProperty(window, "initialBooks", {
    get() { return initialBooks; },
    configurable: true
});

// Referencias a elementos del DOM
const addBookBtn = document.getElementById("add-book-btn");
const addBookModal = document.getElementById("add-book-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const addBookForm = document.getElementById("add-book-form");





// Inputs del formulario
const titleInput = document.getElementById("book-title-input");
const authorInput = document.getElementById("book-author-input");
const genreSelect = document.getElementById("book-genre-select");
const genreCustomInput = document.getElementById("book-genre-custom-input");
const yearInput = document.getElementById("book-year-input");

// Referencias del modal de edición
const editBookModal = document.getElementById("edit-book-modal");
const closeEditModalBtn = document.getElementById("close-edit-modal-btn");
const cancelEditModalBtn = document.getElementById("cancel-edit-modal-btn");
const editBookForm = document.getElementById("edit-book-form");
const editBookId = document.getElementById("edit-book-id");
const editTitleInput = document.getElementById("edit-book-title-input");
const editAuthorInput = document.getElementById("edit-book-author-input");
const editGenreSelect = document.getElementById("edit-book-genre-select");
const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");
const editYearInput = document.getElementById("edit-book-year-input");

// Referencias del modal de vista detallada
const detailsBookModal = document.getElementById("details-book-modal");
const closeDetailsModalBtn = document.getElementById("close-details-modal-btn");
const closeDetailsBottomBtn = document.getElementById("close-details-bottom-btn");
const detailsTitle = document.getElementById("details-book-title");
const detailsAuthor = document.getElementById("details-book-author");
const detailsGenre = document.getElementById("details-book-genre");
const detailsYear = document.getElementById("details-book-year");
const detailsBadge = document.getElementById("details-book-badge");
const detailsDescription = document.getElementById("details-book-description");

// Referencias del botón y modal de restauración de catálogo
const resetCatalogBtn = document.getElementById("reset-catalog-btn");
const resetConfirmModal = document.getElementById("reset-confirm-modal");
const resetConfirmCancelBtn = document.getElementById("reset-confirm-cancel-btn");
const resetConfirmBtn = document.getElementById("reset-confirm-btn");

// Referencia del botón de favoritos
const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");





/**
 * Actualiza dinámicamente las opciones del selector de géneros
 */
function updateGenreOptions() {
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
    
    // Sincronizar selectores de los formularios de añadir/editar
    updateFormGenreSelects();
    // Actualizar sugerencias de autores
    updateAuthorSuggestions();
}

/**
 * Actualiza dinámicamente las sugerencias de autocompletado para el autor
 */
function updateAuthorSuggestions() {
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



function handleEditBook(e) {
    e.preventDefault();
    
    const id = parseInt(editBookId.value);
    const title = editTitleInput.value.trim();
    const author = editAuthorInput.value.trim();
    const year = parseInt(editYearInput.value);
    
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
    const isDuplicate = books.some(b => b.id !== id && b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (isDuplicate) {
        showToast("Ya existe otro libro registrado con el mismo título y autor.", "error");
        return;
    }
    
    // Actualizar libro
    const bookIndex = books.findIndex(b => b.id === id);
    if (bookIndex !== -1) {
        books[bookIndex].title = title;
        books[bookIndex].author = author;
        books[bookIndex].genre = genre;
        books[bookIndex].year = year;
        
        saveToLocalStorage();
        updateGenreOptions();
        handleSearch();
        updateStatistics();
        showToast(`Libro "${title}" actualizado con éxito.`, "success");
        closeEditModal();
    }
}





/**
 * Califica un libro y actualiza la vista y el almacenamiento local
 * @param {number} bookId - ID del libro
 * @param {number} ratingValue - Calificación asignada
 */
function rateBook(bookId, ratingValue) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.rating = ratingValue;
        saveToLocalStorage();
        handleSearch(); // Recargar respetando filtros actuales
        showToast(`Calificaste "${book.title}" con ${ratingValue} estrellas.`, "success");
    }
}

/**
 * Alterna el estado de favorito de un libro
 * @param {number} bookId - ID del libro
 */
function toggleFavorite(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.favorite = !book.favorite;
        saveToLocalStorage();
        handleSearch();
        showToast(
            book.favorite ? `"${book.title}" añadido a Favoritos.` : `"${book.title}" eliminado de Favoritos.`,
            book.favorite ? "success" : "info"
        );
    }
}







function handleAddBook(e) {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const year = parseInt(yearInput.value);
    
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
    const isDuplicate = books.some(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (isDuplicate) {
        showToast("Este libro ya está registrado en la biblioteca.", "error");
        return;
    }
    
    const newBook = {
        id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title,
        author,
        genre,
        year,
        status: "available"
    };

    books.push(newBook);
    saveToLocalStorage();
    updateGenreOptions();
    renderBooks(books);
    updateStatistics();
    showToast(`Libro "${title}" agregado con éxito.`, "success");
    closeModal();
}

// Referencias del modal de confirmación
const confirmModal = document.getElementById("confirm-modal");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
let bookIdToDelete = null;

/**
 * Alterna el estado de préstamo de un libro
 * @param {number} bookId - ID del libro a alternar
 */
function toggleBookStatus(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.status = book.status === "available" ? "borrowed" : "available";
        saveToLocalStorage();
        handleSearch(); // Recargar respetando filtros
        updateStatistics();
        
        const actionText = book.status === "borrowed" ? "prestado" : "devuelto";
        showToast(`Libro "${book.title}" ${actionText} con éxito.`, "info");
    }
}



function executeDeleteBook() {
    if (bookIdToDelete !== null) {
        const book = books.find(b => b.id === bookIdToDelete);
        const title = book ? book.title : "";
        
        books = books.filter(b => b.id !== bookIdToDelete);
        saveToLocalStorage();
        updateGenreOptions();
        handleSearch();
        updateStatistics();
        closeConfirmModal();
        
        if (title) {
            showToast(`Libro "${title}" eliminado con éxito.`, "info");
        }
    }
}

// Funciones para restaurar el catálogo inicial

function executeResetCatalog() {
    books = [...initialBooks];
    saveToLocalStorage();
    
    // Limpiar buscador y filtros
    searchInput.value = "";
    genreFilter.value = "all";
    statusFilter.value = "all";
    sortSelect.value = "title-asc";
    
    updateGenreOptions();
    handleSearch();
    updateStatistics();
    closeResetConfirmModal();
    showToast("Catálogo inicial restaurado con éxito.", "info");
}





// Event Listeners
searchInput.addEventListener("input", handleSearch);
genreFilter.addEventListener("change", handleSearch);
statusFilter.addEventListener("change", handleSearch);
sortSelect.addEventListener("change", handleSearch);
addBookBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
addBookForm.addEventListener("submit", handleAddBook);

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditModalBtn.addEventListener("click", closeEditModal);
editBookForm.addEventListener("submit", handleEditBook);

closeDetailsModalBtn.addEventListener("click", closeDetailsModal);
closeDetailsBottomBtn.addEventListener("click", closeDetailsModal);

resetCatalogBtn.addEventListener("click", openResetConfirmModal);
resetConfirmCancelBtn.addEventListener("click", closeResetConfirmModal);
resetConfirmBtn.addEventListener("click", executeResetCatalog);

confirmCancelBtn.addEventListener("click", closeConfirmModal);
confirmDeleteBtn.addEventListener("click", executeDeleteBook);
themeToggle.addEventListener("click", toggleTheme);
viewToggle.addEventListener("click", toggleView);

favoritesToggleBtn.addEventListener("click", () => {
    showOnlyFavorites = !showOnlyFavorites;
    if (showOnlyFavorites) {
        favoritesToggleBtn.classList.add("active-filter");
        favoritesToggleBtn.innerHTML = "❤️ Solo Favoritos";
    } else {
        favoritesToggleBtn.classList.remove("active-filter");
        favoritesToggleBtn.innerHTML = "❤️ Favoritos";
    }
    handleSearch();
});

// Eventos de selección de género personalizado
genreSelect.addEventListener("change", (e) => {
    if (e.target.value === "custom") {
        genreCustomInput.style.display = "block";
        genreCustomInput.required = true;
        genreCustomInput.focus();
    } else {
        genreCustomInput.style.display = "none";
        genreCustomInput.required = false;
        genreCustomInput.value = "";
    }
});

editGenreSelect.addEventListener("change", (e) => {
    if (e.target.value === "custom") {
        editGenreCustomInput.style.display = "block";
        editGenreCustomInput.required = true;
        editGenreCustomInput.focus();
    } else {
        editGenreCustomInput.style.display = "none";
        editGenreCustomInput.required = false;
        editGenreCustomInput.value = "";
    }
});

// Eventos en la cuadrícula de libros (Delegación de eventos)
booksGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".book-card");
    if (!card) return;
    
    const bookId = parseInt(card.dataset.id);
    
    if (e.target.classList.contains("toggle-status-btn")) {
        toggleBookStatus(bookId);
    } else if (e.target.classList.contains("book-title")) {
        openDetailsModal(bookId);
    } else if (e.target.closest(".edit-book-btn")) {
        openEditModal(bookId);
    } else if (e.target.closest(".delete-book-btn")) {
        openConfirmModal(bookId);
    } else if (e.target.classList.contains("star")) {
        const ratingVal = parseInt(e.target.dataset.value);
        rateBook(bookId, ratingVal);
    } else if (e.target.closest(".favorite-btn")) {
        toggleFavorite(bookId);
    }
});

// Cerrar modal de adición al hacer click fuera
addBookModal.addEventListener("click", (e) => {
    if (e.target === addBookModal) {
        closeModal();
    }
});

// Cerrar modal de edición al hacer click fuera
editBookModal.addEventListener("click", (e) => {
    if (e.target === editBookModal) {
        closeEditModal();
    }
});

// Cerrar modal de detalles al hacer click fuera
detailsBookModal.addEventListener("click", (e) => {
    if (e.target === detailsBookModal) {
        closeDetailsModal();
    }
});

// Cerrar modal de confirmación al hacer click fuera
confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// Cerrar modal de confirmación de restauración al hacer click fuera
resetConfirmModal.addEventListener("click", (e) => {
    if (e.target === resetConfirmModal) {
        closeResetConfirmModal();
    }
});

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initView();
    updateGenreOptions();
    renderBooks(books);
    updateStatistics();
});
