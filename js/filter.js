// Módulo de Búsqueda, Filtrado y Ordenamiento
import { getBooks, getShowOnlyFavorites } from "./state.js";
import { renderBooks } from "./render.js";

const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const statusFilter = document.getElementById("status-filter");
const sortSelect = document.getElementById("sort-select");

/**
 * Filtra los libros en tiempo real basados en la búsqueda del usuario y el género seleccionado
 */
export function handleSearch() {
    if (!searchInput || !genreFilter || !statusFilter || !sortSelect) return;
    
    const query = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;
    const selectedStatus = statusFilter.value;
    const books = getBooks();
    const showOnlyFavorites = getShowOnlyFavorites();
    
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
