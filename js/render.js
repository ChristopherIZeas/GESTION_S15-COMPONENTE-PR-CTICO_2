// Modulo de Renderizado del Catalogo
import { getIsCatalogLoading } from "./state.js";

const booksGrid = document.getElementById("books-grid");

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

/**
 * Genera el marcado HTML de las estrellas de calificacion
 * @param {number} rating - Calificacion (1 a 5)
 */
export function getStarsHtml(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? "star filled" : "star";
        stars += `<span class="${starClass}" data-value="${i}" aria-hidden="true"><i class="fa-solid fa-star"></i></span>`;
    }
    return `<div class="book-rating" aria-label="Calificación: ${rating} estrellas">${stars}</div>`;
}

function getGenreGradient(genre) {
    const isLight = document.body.classList.contains("light-theme");
    const palette = isLight ? lightGenreThemes : genreThemes;
    const [from, to] = palette[genre] || (isLight ? ["#eef3f9", "#ffffff"] : ["#334155", "#1e293b"]);
    return `linear-gradient(135deg, ${from}, ${to})`;
}

/**
 * Renderiza la lista de libros en el DOM
 * @param {Array} booksToRender - Lista de libros a renderizar
 */
export function renderBooks(booksToRender) {
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    if (getIsCatalogLoading()) {
        booksGrid.innerHTML = `
            <div class="no-results">
                <h3>Cargando catálogo</h3>
                <p>Conectando con Firestore...</p>
            </div>
        `;
        return;
    }

    if (booksToRender.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron libros</h3>
                <p>Agrega tu primer libro o cambia los filtros activos.</p>
            </div>
        `;
        return;
    }

    booksToRender.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.id = book.id;

        const isAvailable = book.status === "available";
        const badgeClass = isAvailable ? "badge-available" : "badge-borrowed";
        const badgeText = isAvailable ? "Disponible" : "Prestado";
        const ratingHtml = getStarsHtml(book.rating || 0);
        const isFav = book.favorite ? "active" : "";
        const initialLetter = (book.title || "?").trim().charAt(0).toUpperCase();
        const statusIcon = isAvailable
            ? '<i class="fa-solid fa-hand-holding-medical"></i>'
            : '<i class="fa-solid fa-rotate-left"></i>';
        const favoriteIcon = book.favorite
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

        bookCard.innerHTML = `
            <div class="book-cover" style="background: ${getGenreGradient(book.genre)}" data-letter="${initialLetter}">
                <span class="book-genre-tag">${book.genre}</span>
                <div class="badge-anchor">
                    <span class="book-badge ${badgeClass}">${badgeText}</span>
                </div>
            </div>
            <div class="book-content">
                <div>
                    <h3 class="book-title" title="${book.title}">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                </div>
                <div class="book-meta-row">
                    ${ratingHtml}
                    <span class="book-year">${book.year}</span>
                </div>
                <div class="card-actions">
                    <button class="icon-btn favorite-btn ${isFav}" aria-label="Favorito">${favoriteIcon}</button>
                    <button class="icon-btn toggle-status-btn" aria-label="Cambiar estado">${statusIcon}</button>
                    <button class="icon-btn edit-book-btn" aria-label="Editar libro"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete-book-btn" aria-label="Eliminar libro"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });
}
