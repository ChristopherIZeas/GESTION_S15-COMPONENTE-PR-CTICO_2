// Datos iniciales de prueba (Mock Data)
const initialBooks = [
    {
        id: 1,
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        genre: "Realismo Mágico",
        year: 1967,
        status: "available" // available | borrowed
    },
    {
        id: 2,
        title: "Don Quijote de la Mancha",
        author: "Miguel de Cervantes",
        genre: "Novela",
        year: 1605,
        status: "available"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Distopía",
        year: 1949,
        status: "borrowed"
    },
    {
        id: 4,
        title: "El principito",
        author: "Antoine de Saint-Exupéry",
        genre: "Fantasía",
        year: 1943,
        status: "available"
    },
    {
        id: 5,
        title: "Breve historia del tiempo",
        author: "Stephen Hawking",
        genre: "Divulgación Científica",
        year: 1988,
        status: "borrowed"
    }
];

// Estado global de la aplicación (inicialmente usa los datos mock)
let books = [...initialBooks];

// Referencias a elementos del DOM
const booksGrid = document.getElementById("books-grid");
const searchInput = document.getElementById("search-input");
const addBookBtn = document.getElementById("add-book-btn");
const addBookModal = document.getElementById("add-book-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const addBookForm = document.getElementById("add-book-form");

// Inputs del formulario
const titleInput = document.getElementById("book-title-input");
const authorInput = document.getElementById("book-author-input");
const genreInput = document.getElementById("book-genre-input");
const yearInput = document.getElementById("book-year-input");

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

    booksToRender.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.id = book.id;

        const isAvailable = book.status === "available";
        const badgeClass = isAvailable ? "badge-available" : "badge-borrowed";
        const badgeText = isAvailable ? "Disponible" : "Prestado";
        const buttonText = isAvailable ? "Prestar" : "Devolver";

        bookCard.innerHTML = `
            <div class="book-info">
                <span class="book-badge ${badgeClass}">${badgeText}</span>
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">por ${book.author}</p>
                <div class="book-meta-details">
                    <span>${book.genre}</span>
                    <span>${book.year}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-primary toggle-status-btn">${buttonText}</button>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });
}

/**
 * Filtra los libros en tiempo real basados en la búsqueda del usuario
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    const filtered = books.filter(book => {
        return (
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query)
        );
    });
    
    renderBooks(filtered);
}

// Funciones para el Modal
function openModal() {
    addBookModal.classList.add("active");
}

function closeModal() {
    addBookModal.classList.remove("active");
    addBookForm.reset();
}

function handleAddBook(e) {
    e.preventDefault();
    
    const newBook = {
        id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        genre: genreInput.value.trim(),
        year: parseInt(yearInput.value),
        status: "available"
    };

    books.push(newBook);
    renderBooks(books);
    closeModal();
}

// Event Listeners
searchInput.addEventListener("input", handleSearch);
addBookBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
addBookForm.addEventListener("submit", handleAddBook);

// Cerrar modal al hacer click fuera del contenido
addBookModal.addEventListener("click", (e) => {
    if (e.target === addBookModal) {
        closeModal();
    }
});

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    renderBooks(books);
});
