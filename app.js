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
import { initEvents } from "./js/events.js";



/**
 * Actualiza dinámicamente las opciones del selector de géneros
 */
function updateGenreOptions() {
    const genreFilter = document.getElementById("genre-filter");
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

function handleAddBook(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById("book-title-input");
    const authorInput = document.getElementById("book-author-input");
    const genreSelect = document.getElementById("book-genre-select");
    const genreCustomInput = document.getElementById("book-genre-custom-input");
    const yearInput = document.getElementById("book-year-input");

    if (!titleInput || !authorInput || !genreSelect || !genreCustomInput || !yearInput) return;

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
    const books = getBooks();
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
    setBooks(books);
    saveToLocalStorage();
    updateGenreOptions();
    renderBooks(books);
    updateStatistics();
    showToast(`Libro "${title}" agregado con éxito.`, "success");
    closeModal();
}

function handleEditBook(e) {
    e.preventDefault();
    
    const editBookId = document.getElementById("edit-book-id");
    const editTitleInput = document.getElementById("edit-book-title-input");
    const editAuthorInput = document.getElementById("edit-book-author-input");
    const editGenreSelect = document.getElementById("edit-book-genre-select");
    const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");
    const editYearInput = document.getElementById("edit-book-year-input");

    if (!editBookId || !editTitleInput || !editAuthorInput || !editGenreSelect || !editGenreCustomInput || !editYearInput) return;

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
    const books = getBooks();
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
        
        setBooks(books);
        saveToLocalStorage();
        updateGenreOptions();
        handleSearch();
        updateStatistics();
        showToast(`Libro "${title}" actualizado con éxito.`, "success");
        closeEditModal();
    }
}

/**
 * Alterna el estado de préstamo de un libro
 * @param {number} bookId - ID del libro a alternar
 */
function toggleBookStatus(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.status = book.status === "available" ? "borrowed" : "available";
        setBooks(books);
        saveToLocalStorage();
        handleSearch(); // Recargar respetando filtros
        updateStatistics();
        
        const actionText = book.status === "borrowed" ? "prestado" : "devuelto";
        showToast(`Libro "${book.title}" ${actionText} con éxito.`, "info");
    }
}

/**
 * Califica un libro y actualiza la vista y el almacenamiento local
 * @param {number} bookId - ID del libro
 * @param {number} ratingValue - Calificación asignada
 */
function rateBook(bookId, ratingValue) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.rating = ratingValue;
        setBooks(books);
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
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.favorite = !book.favorite;
        setBooks(books);
        saveToLocalStorage();
        handleSearch();
        showToast(
            book.favorite ? `"${book.title}" añadido a Favoritos.` : `"${book.title}" eliminado de Favoritos.`,
            book.favorite ? "success" : "info"
        );
    }
}

function executeDeleteBook() {
    const bookIdToDelete = getBookIdToDelete();
    if (bookIdToDelete !== null) {
        let books = getBooks();
        const book = books.find(b => b.id === bookIdToDelete);
        const title = book ? book.title : "";
        
        books = books.filter(b => b.id !== bookIdToDelete);
        setBooks(books);
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

function executeResetCatalog() {
    setBooks([...initialBooks]);
    saveToLocalStorage();
    
    // Limpiar buscador y filtros
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const statusFilter = document.getElementById("status-filter");
    const sortSelect = document.getElementById("sort-select");

    if (searchInput) searchInput.value = "";
    if (genreFilter) genreFilter.value = "all";
    if (statusFilter) statusFilter.value = "all";
    if (sortSelect) sortSelect.value = "title-asc";
    
    updateGenreOptions();
    handleSearch();
    updateStatistics();
    closeResetConfirmModal();
    showToast("Catálogo inicial restaurado con éxito.", "info");
}

// Inicialización de la aplicación e inicio de Eventos
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initView();
    updateGenreOptions();
    renderBooks(getBooks());
    updateStatistics();
    
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
        toggleTheme,
        toggleView,
        getShowOnlyFavorites,
        setShowOnlyFavorites,
        handleAddBook,
        handleEditBook,
        executeResetCatalog,
        executeDeleteBook,
        toggleBookStatus,
        rateBook,
        toggleFavorite
    });
});
