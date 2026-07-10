// Módulo de preferencias locales de tema y vista

const themeToggle = document.getElementById("theme-toggle");
const viewToggle = document.getElementById("view-toggle");
const booksGrid = document.getElementById("books-grid");

// Funciones para el control de temas
export function initTheme() {
    const savedTheme = localStorage.getItem("biblio_theme") || "dark";
    applyTheme(savedTheme);
}

export function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
        if (themeToggle) {
            themeToggle.classList.add("is-light");
            themeToggle.classList.remove("is-dark");
        }
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        if (themeToggle) {
            themeToggle.classList.add("is-dark");
            themeToggle.classList.remove("is-light");
        }
    }
    localStorage.setItem("biblio_theme", theme);
}

export function toggleTheme() {
    const isLight = document.body.classList.contains("light-theme");
    applyTheme(isLight ? "dark" : "light");
}

// Funciones de vista
export function initView() {
    const savedView = localStorage.getItem("biblio_view") || "grid";
    if (savedView === "list") {
        if (booksGrid) {
            booksGrid.classList.remove("grid-view");
            booksGrid.classList.add("list-view");
        }
        if (viewToggle) viewToggle.innerHTML = '<i class="fa-solid fa-list"></i>';
    } else {
        if (booksGrid) {
            booksGrid.classList.remove("list-view");
            booksGrid.classList.add("grid-view");
        }
        if (viewToggle) viewToggle.innerHTML = '<i class="fa-solid fa-grip"></i>';
    }
}

export function toggleView() {
    if (!booksGrid) return;
    const isGrid = booksGrid.classList.contains("grid-view");
    if (isGrid) {
        booksGrid.classList.remove("grid-view");
        booksGrid.classList.add("list-view");
        if (viewToggle) viewToggle.innerHTML = '<i class="fa-solid fa-list"></i>';
        localStorage.setItem("biblio_view", "list");
    } else {
        booksGrid.classList.remove("list-view");
        booksGrid.classList.add("grid-view");
        if (viewToggle) viewToggle.innerHTML = '<i class="fa-solid fa-grip"></i>';
        localStorage.setItem("biblio_view", "grid");
    }
}
