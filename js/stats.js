// Módulo de Estadísticas del Dashboard
import { getBooks } from "./state.js";

const statsTotal = document.getElementById("stats-total");
const statsAvailable = document.getElementById("stats-available");
const statsBorrowed = document.getElementById("stats-borrowed");
const statsPercentage = document.getElementById("stats-percentage");
const statsAvailableSub = document.getElementById("stats-available-sub");
const statsBorrowedSub = document.getElementById("stats-borrowed-sub");
const statsTotalSub = document.getElementById("stats-total-sub");
const statsPercentageSub = document.getElementById("stats-percentage-sub");

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
    if (statsTotalSub) statsTotalSub.textContent = `${total} mostrando`;
    if (statsAvailableSub) statsAvailableSub.textContent = `${percentage}% disponible`;
    if (statsBorrowedSub) statsBorrowedSub.textContent = `${total ? Math.round((borrowed / total) * 100) : 0}% del catálogo`;
    if (statsPercentageSub) statsPercentageSub.textContent = `${available} de ${total} disponibles`;
}
