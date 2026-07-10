// Datos iniciales de prueba (Mock Data)
const initialBooks = [
    {
        id: 1,
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        genre: "Realismo Mágico",
        year: 1967,
        status: "available", // available | borrowed
        rating: 5
    },
    {
        id: 2,
        title: "Don Quijote de la Mancha",
        author: "Miguel de Cervantes",
        genre: "Novela",
        year: 1605,
        status: "available",
        rating: 4
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Distopía",
        year: 1949,
        status: "borrowed",
        rating: 4
    },
    {
        id: 4,
        title: "El principito",
        author: "Antoine de Saint-Exupéry",
        genre: "Fantasía",
        year: 1943,
        status: "available",
        rating: 5
    },
    {
        id: 5,
        title: "Breve historia del tiempo",
        author: "Stephen Hawking",
        genre: "Divulgación Científica",
        year: 1988,
        status: "borrowed",
        rating: 3
    }
];

// Estado global de la aplicación (intenta cargar de localStorage, si no usa mock data)
let books = JSON.parse(localStorage.getItem("biblio_books")) || [...initialBooks];

// Referencias a elementos del DOM
const booksGrid = document.getElementById("books-grid");
const searchInput = document.getElementById("search-input");
const addBookBtn = document.getElementById("add-book-btn");
const addBookModal = document.getElementById("add-book-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const addBookForm = document.getElementById("add-book-form");
const genreFilter = document.getElementById("genre-filter");
const statusFilter = document.getElementById("status-filter");
const sortSelect = document.getElementById("sort-select");

// Referencias del Dashboard de estadísticas
const statsTotal = document.getElementById("stats-total");
const statsAvailable = document.getElementById("stats-available");
const statsBorrowed = document.getElementById("stats-borrowed");
const statsPercentage = document.getElementById("stats-percentage");

// Referencia del contenedor Toast
const toastContainer = document.getElementById("toast-container");

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
let showOnlyFavorites = false;

/**
 * Renderiza la lista de libros en la cuadrícula del DOM
 * @param {Array} booksToRender - Lista de libros a renderizar
 */
function renderBooks(booksToRender) {
    booksGrid.innerHTML = "";
    
    if (booksToRender.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
                <h3>No se encontraron libros</h3>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">Prueba con otros términos de búsqueda.</p>
            </div>
        `;
        return;
    }

    booksToRender.forEach((book, index) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.id = book.id;
        bookCard.style.animationDelay = `${index * 0.04}s`;

        const isAvailable = book.status === "available";
        const badgeClass = isAvailable ? "badge-available" : "badge-borrowed";
        const badgeText = isAvailable ? "Disponible" : "Prestado";
        const buttonText = isAvailable ? "Prestar" : "Devolver";
        const ratingHtml = getStarsHtml(book.rating || 0);

        const isFav = book.favorite ? "active" : "";

        bookCard.innerHTML = `
            <button class="favorite-btn ${isFav}" aria-label="Favorito">❤️</button>
            <div class="book-info">
                <span class="book-badge ${badgeClass}">${badgeText}</span>
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">por ${book.author}</p>
                ${ratingHtml}
                <div class="book-meta-details">
                    <span>${book.genre}</span>
                    <span>${book.year}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-primary toggle-status-btn">${buttonText}</button>
                <button class="btn-secondary edit-book-btn" aria-label="Editar libro">✏️</button>
                <button class="btn-danger-outline delete-book-btn" aria-label="Eliminar libro">🗑️</button>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });
}

/**
 * Filtra los libros en tiempo real basados en la búsqueda del usuario y el género seleccionado
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;
    const selectedStatus = statusFilter.value;
    
    const filtered = books.filter(book => {
        const matchesQuery = (
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query)
        );
        const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre;
        const matchesStatus = selectedStatus === "all" || book.status === selectedStatus;
        const matchesFav = !showOnlyFavorites || book.favorite;
        return matchesQuery && matchesGenre && matchesStatus && matchesFav;
    });
    
    const sortBy = sortSelect.value;
    filtered.sort((a, b) => {
        if (sortBy === "title-asc") {
            return a.title.localeCompare(b.title);
        } else if (sortBy === "title-desc") {
            return b.title.localeCompare(a.title);
        } else if (sortBy === "year-desc") {
            return b.year - a.year;
        } else if (sortBy === "year-asc") {
            return a.year - b.year;
        } else if (sortBy === "rating-desc") {
            return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
    });
    
    renderBooks(filtered);
}

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

// Funciones para el Modal
function openModal() {
    addBookModal.classList.add("active");
}

// Cerrar modal
function closeModal() {
    addBookModal.classList.remove("active");
    addBookForm.reset();
    genreCustomInput.style.display = "none";
    genreCustomInput.required = false;
}

// Funciones para el Modal de Edición
function openEditModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        editBookId.value = book.id;
        editTitleInput.value = book.title;
        editAuthorInput.value = book.author;
        
        // Cargar género en select
        editGenreSelect.value = book.genre;
        editGenreCustomInput.style.display = "none";
        editGenreCustomInput.required = false;
        editGenreCustomInput.value = "";
        
        editYearInput.value = book.year;
        editBookModal.classList.add("active");
    }
}

function closeEditModal() {
    editBookModal.classList.remove("active");
    editBookForm.reset();
    editGenreCustomInput.style.display = "none";
    editGenreCustomInput.required = false;
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

// Funciones para el Modal de Detalle
function openDetailsModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        detailsTitle.textContent = book.title;
        detailsAuthor.textContent = `por ${book.author}`;
        detailsGenre.textContent = book.genre;
        detailsYear.textContent = book.year;
        
        const isAvailable = book.status === "available";
        detailsBadge.className = `book-badge ${isAvailable ? 'badge-available' : 'badge-borrowed'}`;
        detailsBadge.textContent = isAvailable ? "Disponible" : "Prestado";
        
        detailsDescription.textContent = `Esta es una obra destacada del género "${book.genre}", escrita originalmente por el reconocido autor ${book.author} y publicada en el año ${book.year}. Un título indispensable para ampliar la colección.`;
        
        detailsBookModal.classList.add("active");
    }
}

function closeDetailsModal() {
    detailsBookModal.classList.remove("active");
}

/**
 * Genera el marcado HTML de las estrellas de calificación
 * @param {number} rating - Calificación (1 a 5)
 */
function getStarsHtml(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? "star filled" : "star";
        stars += `<span class="${starClass}" data-value="${i}">★</span>`;
    }
    return `<div class="book-rating" aria-label="Calificación: ${rating} estrellas">${stars}</div>`;
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

/**
 * Guarda el estado actual de los libros en localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem("biblio_books", JSON.stringify(books));
}

/**
 * Calcula y actualiza las estadísticas de la biblioteca en el dashboard
 */
function updateStatistics() {
    const total = books.length;
    const available = books.filter(b => b.status === "available").length;
    const borrowed = total - available;
    const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

    statsTotal.textContent = total;
    statsAvailable.textContent = available;
    statsBorrowed.textContent = borrowed;
    statsPercentage.textContent = `${percentage}%`;
}

/**
 * Muestra una notificación toast dinámica
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast ("success" | "error" | "info")
 */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
    `;
    toastContainer.appendChild(toast);
    
    // Forzar reflow para animación
    setTimeout(() => toast.classList.add("show"), 10);
    
    const autoClose = setTimeout(() => {
        dismissToast(toast);
    }, 4000);
    
    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(autoClose);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
        toast.remove();
    });
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

// Funciones para el modal de confirmación
function openConfirmModal(bookId) {
    bookIdToDelete = bookId;
    confirmModal.classList.add("active");
}

// Cerrar confirmación
function closeConfirmModal() {
    bookIdToDelete = null;
    confirmModal.classList.remove("active");
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
function openResetConfirmModal() {
    resetConfirmModal.classList.add("active");
}

function closeResetConfirmModal() {
    resetConfirmModal.classList.remove("active");
}

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

// Referencia al botón de tema
const themeToggle = document.getElementById("theme-toggle");

// Funciones para el control de temas
function initTheme() {
    const savedTheme = localStorage.getItem("biblio_theme") || "dark";
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
        themeToggle.textContent = "🌙";
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        themeToggle.textContent = "☀️";
    }
    localStorage.setItem("biblio_theme", theme);
}

function toggleTheme() {
    const isLight = document.body.classList.contains("light-theme");
    applyTheme(isLight ? "dark" : "light");
}

// Referencia al alternador de vista y funciones de vista
const viewToggle = document.getElementById("view-toggle");

function initView() {
    const savedView = localStorage.getItem("biblio_view") || "grid";
    if (savedView === "list") {
        booksGrid.classList.remove("grid-view");
        booksGrid.classList.add("list-view");
        viewToggle.textContent = "⬜ Cuadrícula";
    } else {
        booksGrid.classList.remove("list-view");
        booksGrid.classList.add("grid-view");
        viewToggle.textContent = "📋 Lista";
    }
}

function toggleView() {
    const isGrid = booksGrid.classList.contains("grid-view");
    if (isGrid) {
        booksGrid.classList.remove("grid-view");
        booksGrid.classList.add("list-view");
        viewToggle.textContent = "⬜ Cuadrícula";
        localStorage.setItem("biblio_view", "list");
    } else {
        booksGrid.classList.remove("list-view");
        booksGrid.classList.add("grid-view");
        viewToggle.textContent = "📋 Lista";
        localStorage.setItem("biblio_view", "grid");
    }
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
