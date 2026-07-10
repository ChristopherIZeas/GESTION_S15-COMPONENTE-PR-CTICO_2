// Módulo de Estadísticas del Dashboard
import { getBooks } from "./state.js";

const statsTotal = document.getElementById("stats-total");
const statsAvailable = document.getElementById("stats-available");
const statsBorrowed = document.getElementById("stats-borrowed");
const statsPercentage = document.getElementById("stats-percentage");

/**
 * Calcula y actualiza las estadísticas de la biblioteca en el dashboard
 */
export function updateStatistics() {
    const books = getBooks();
    const total = books.length;
    const available = books.filter(b => b.status === "available").length;
    const borrowed = total - available;
    const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

    if (statsTotal) statsTotal.textContent = total;
    if (statsAvailable) statsAvailable.textContent = available;
    if (statsBorrowed) statsBorrowed.textContent = borrowed;
    if (statsPercentage) statsPercentage.textContent = `${percentage}%`;
}
