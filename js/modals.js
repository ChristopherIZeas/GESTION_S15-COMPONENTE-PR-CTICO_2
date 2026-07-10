// Módulo de Modales
import { getBooks } from "./state.js";
import { getStarsHtml } from "./render.js";

// Referencias a modales
const addBookModal = document.getElementById("add-book-modal");
const addBookForm = document.getElementById("add-book-form");
const genreCustomInput = document.getElementById("book-genre-custom-input");
const addRatingInput = document.getElementById("book-rating-input");

const editBookModal = document.getElementById("edit-book-modal");
const editBookForm = document.getElementById("edit-book-form");
const editBookId = document.getElementById("edit-book-id");
const editTitleInput = document.getElementById("edit-book-title-input");
const editAuthorInput = document.getElementById("edit-book-author-input");
const editGenreSelect = document.getElementById("edit-book-genre-select");
const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");
const editYearInput = document.getElementById("edit-book-year-input");
const editRatingInput = document.getElementById("edit-book-rating-input");
const editStatusSelect = document.getElementById("edit-book-status-select");
const editDescriptionInput = document.getElementById("edit-book-description-input");

const detailsBookModal = document.getElementById("details-book-modal");
const detailsCover = detailsBookModal ? detailsBookModal.querySelector(".details-cover") : null;
const detailsTitle = document.getElementById("details-book-title");
const detailsAuthor = document.getElementById("details-book-author");
const detailsGenre = document.getElementById("details-book-genre");
const detailsRating = document.getElementById("details-book-rating");
const detailsBadge = document.getElementById("details-book-badge");
const detailsDescription = document.getElementById("details-book-description");
const detailsToggleStatusBtn = document.getElementById("details-toggle-status-btn");

const confirmModal = document.getElementById("confirm-modal");
const resetConfirmModal = document.getElementById("reset-confirm-modal");

// Variable de borrado temporal (guardada en el ámbito del módulo)
let bookIdToDelete = null;
let activeDetailsBookId = null;

const genreThemes = {
    "Realismo Mágico": ["#2d3748", "#1a2332"],
    "Novela": ["#312a1e", "#1e1a12"],
    "Distopía": ["#2d1f1f", "#1a1212"],
    "Fantasía": ["#1e2d38", "#121c24"],
    "Divulgación Científica": ["#1e2e26", "#121c18"],
    "Ficción": ["#2d3748", "#1a2332"],
    "Clásico": ["#312a1e", "#1e1a12"],
    "Filosofía": ["#1e2d38", "#121c24"],
    "Ciencia": ["#1e2e26", "#121c18"]
};

const lightGenreThemes = {
    "Realismo Mágico": ["#edf3fb", "#ffffff"],
    "Novela": ["#f9f1df", "#fffdf8"],
    "Distopía": ["#f7eaea", "#fffdfd"],
    "Fantasía": ["#eaf4f8", "#fbfeff"],
    "Divulgación Científica": ["#edf6ef", "#fcfffd"],
    "Ficción": ["#edf3fb", "#ffffff"],
    "Clásico": ["#f9f1df", "#fffdf8"],
    "Filosofía": ["#eaf4f8", "#fbfeff"],
    "Ciencia": ["#edf6ef", "#fcfffd"]
};

export function getBookIdToDelete() {
    return bookIdToDelete;
}

// Funciones para el Modal de Adición
export function openModal() {
    if (addBookModal) addBookModal.classList.add("active");
}

export function closeModal() {
    if (addBookModal) addBookModal.classList.remove("active");
    if (addBookForm) addBookForm.reset();
    if (addRatingInput) updateRatingInput(addRatingInput, 3);
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
        if (editRatingInput) updateRatingInput(editRatingInput, book.rating || 0);
        if (editStatusSelect) editStatusSelect.value = book.status || "available";
        if (editDescriptionInput) editDescriptionInput.value = book.description || "";
        if (editBookModal) editBookModal.classList.add("active");
    }
}

export function closeEditModal() {
    if (editBookModal) editBookModal.classList.remove("active");
    if (editBookForm) editBookForm.reset();
    if (editRatingInput) updateRatingInput(editRatingInput, 3);
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
        activeDetailsBookId = bookId;
        const isLight = document.body.classList.contains("light-theme");
        const palette = isLight ? lightGenreThemes : genreThemes;
        const [from, to] = palette[book.genre] || (isLight ? ["#eef3f9", "#ffffff"] : ["#334155", "#1e293b"]);

        if (detailsTitle) detailsTitle.textContent = book.title;
        if (detailsAuthor) detailsAuthor.textContent = `${book.author} · ${book.year}`;
        if (detailsGenre) detailsGenre.textContent = book.genre;
        if (detailsRating) detailsRating.innerHTML = getStarsHtml(book.rating || 0);
        if (detailsCover) detailsCover.style.background = `linear-gradient(135deg, ${from}, ${to})`;
        
        const isAvailable = book.status === "available";
        if (detailsBadge) {
            detailsBadge.className = `book-badge ${isAvailable ? 'badge-available' : 'badge-borrowed'}`;
            detailsBadge.textContent = isAvailable ? "Disponible" : "Prestado";
        }
        if (detailsToggleStatusBtn) {
            detailsToggleStatusBtn.textContent = isAvailable ? "Prestar" : "Devolver";
        }
        
        if (detailsDescription) {
            detailsDescription.textContent = book.description || `Esta es una obra destacada del género "${book.genre}", escrita originalmente por ${book.author}.`;
        }
        
        if (detailsBookModal) detailsBookModal.classList.add("active");
    }
}

export function closeDetailsModal() {
    activeDetailsBookId = null;
    if (detailsBookModal) detailsBookModal.classList.remove("active");
}

export function getActiveDetailsBookId() {
    return activeDetailsBookId;
}

export function updateRatingInput(container, value) {
    if (!container) return;
    container.dataset.rating = value;
    container.querySelectorAll(".rating-star").forEach((star) => {
        const starValue = parseInt(star.dataset.value);
        star.classList.toggle("filled", starValue <= value);
    });
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
