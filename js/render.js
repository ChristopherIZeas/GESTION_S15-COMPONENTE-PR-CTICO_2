// Módulo de Renderizado del Catálogo
const booksGrid = document.getElementById("books-grid");

/**
 * Genera el marcado HTML de las estrellas de calificación
 * @param {number} rating - Calificación (1 a 5)
 */
export function getStarsHtml(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? "star filled" : "star";
        stars += `<span class="${starClass}" data-value="${i}">★</span>`;
    }
    return `<div class="book-rating" aria-label="Calificación: ${rating} estrellas">${stars}</div>`;
}

/**
 * Renderiza la lista de libros en la cuadrícula del DOM
 * @param {Array} booksToRender - Lista de libros a renderizar
 */
export function renderBooks(booksToRender) {
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
