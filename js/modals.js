// Módulo de Modales
import { getBooks } from "./state.js";

// Referencias a modales
const addBookModal = document.getElementById("add-book-modal");
const addBookForm = document.getElementById("add-book-form");
const genreCustomInput = document.getElementById("book-genre-custom-input");

const editBookModal = document.getElementById("edit-book-modal");
const editBookForm = document.getElementById("edit-book-form");
const editBookId = document.getElementById("edit-book-id");
const editTitleInput = document.getElementById("edit-book-title-input");
const editAuthorInput = document.getElementById("edit-book-author-input");
const editGenreSelect = document.getElementById("edit-book-genre-select");
const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");
const editYearInput = document.getElementById("edit-book-year-input");

const detailsBookModal = document.getElementById("details-book-modal");
const detailsTitle = document.getElementById("details-book-title");
const detailsAuthor = document.getElementById("details-book-author");
const detailsGenre = document.getElementById("details-book-genre");
const detailsYear = document.getElementById("details-book-year");
const detailsBadge = document.getElementById("details-book-badge");
const detailsDescription = document.getElementById("details-book-description");

const confirmModal = document.getElementById("confirm-modal");
const resetConfirmModal = document.getElementById("reset-confirm-modal");

// Variable de borrado temporal (guardada en el ámbito del módulo)
let bookIdToDelete = null;

export function getBookIdToDelete() {
    return bookIdToDelete;
}

export function setBookIdToDelete(val) {
    bookIdToDelete = val;
}

// Funciones para el Modal de Adición
export function openModal() {
    if (addBookModal) addBookModal.classList.add("active");
}

export function closeModal() {
    if (addBookModal) addBookModal.classList.remove("active");
    if (addBookForm) addBookForm.reset();
    if (genreCustomInput) {
        genreCustomInput.style.display = "none";
        genreCustomInput.required = false;
    }
}

// Funciones para el Modal de Edición
export function openEditModal(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        if (editBookId) editBookId.value = book.id;
        if (editTitleInput) editTitleInput.value = book.title;
        if (editAuthorInput) editAuthorInput.value = book.author;
        
        if (editGenreSelect) editGenreSelect.value = book.genre;
        if (editGenreCustomInput) {
            editGenreCustomInput.style.display = "none";
            editGenreCustomInput.required = false;
            editGenreCustomInput.value = "";
        }
        
        if (editYearInput) editYearInput.value = book.year;
        if (editBookModal) editBookModal.classList.add("active");
    }
}

export function closeEditModal() {
    if (editBookModal) editBookModal.classList.remove("active");
    if (editBookForm) editBookForm.reset();
    if (editGenreCustomInput) {
        editGenreCustomInput.style.display = "none";
        editGenreCustomInput.required = false;
    }
}

// Funciones para el Modal de Detalle
export function openDetailsModal(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        if (detailsTitle) detailsTitle.textContent = book.title;
        if (detailsAuthor) detailsAuthor.textContent = `por ${book.author}`;
        if (detailsGenre) detailsGenre.textContent = book.genre;
        if (detailsYear) detailsYear.textContent = book.year;
        
        const isAvailable = book.status === "available";
        if (detailsBadge) {
            detailsBadge.className = `book-badge ${isAvailable ? 'badge-available' : 'badge-borrowed'}`;
            detailsBadge.textContent = isAvailable ? "Disponible" : "Prestado";
        }
        
        if (detailsDescription) {
            detailsDescription.textContent = `Esta es una obra destacada del género "${book.genre}", escrita originalmente por el reconocido autor ${book.author} y publicada en el año ${book.year}. Un título indispensable para ampliar la colección.`;
        }
        
        if (detailsBookModal) detailsBookModal.classList.add("active");
    }
}

export function closeDetailsModal() {
    if (detailsBookModal) detailsBookModal.classList.remove("active");
}

// Funciones para el modal de confirmación de eliminación
export function openConfirmModal(bookId) {
    bookIdToDelete = bookId;
    if (confirmModal) confirmModal.classList.add("active");
}

export function closeConfirmModal() {
    bookIdToDelete = null;
    if (confirmModal) confirmModal.classList.remove("active");
}

// Funciones para restaurar el catálogo inicial
export function openResetConfirmModal() {
    if (resetConfirmModal) resetConfirmModal.classList.add("active");
}

export function closeResetConfirmModal() {
    if (resetConfirmModal) resetConfirmModal.classList.remove("active");
}
