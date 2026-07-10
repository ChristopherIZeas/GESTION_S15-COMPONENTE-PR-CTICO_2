// Módulo de Controladores de Eventos y Delegación
export function initEvents(handlers) {
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const statusFilter = document.getElementById("status-filter");
    const sortSelect = document.getElementById("sort-select");
    const addBookBtn = document.getElementById("add-book-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelModalBtn = document.getElementById("cancel-modal-btn");
    const addBookForm = document.getElementById("add-book-form");

    const closeEditModalBtn = document.getElementById("close-edit-modal-btn");
    const cancelEditModalBtn = document.getElementById("cancel-edit-modal-btn");
    const editBookForm = document.getElementById("edit-book-form");

    const closeDetailsModalBtn = document.getElementById("close-details-modal-btn");
    const closeDetailsBottomBtn = document.getElementById("close-details-bottom-btn");

    const resetCatalogBtn = document.getElementById("reset-catalog-btn");
    const resetConfirmCancelBtn = document.getElementById("reset-confirm-cancel-btn");
    const resetConfirmBtn = document.getElementById("reset-confirm-btn");

    const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const viewToggle = document.getElementById("view-toggle");
    const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");

    const genreSelect = document.getElementById("book-genre-select");
    const genreCustomInput = document.getElementById("book-genre-custom-input");
    const editGenreSelect = document.getElementById("edit-book-genre-select");
    const editGenreCustomInput = document.getElementById("edit-book-genre-custom-input");

    const booksGrid = document.getElementById("books-grid");
    const addBookModal = document.getElementById("add-book-modal");
    const editBookModal = document.getElementById("edit-book-modal");
    const detailsBookModal = document.getElementById("details-book-modal");
    const confirmModal = document.getElementById("confirm-modal");
    const resetConfirmModal = document.getElementById("reset-confirm-modal");

    // Enlace de Eventos
    if (searchInput) searchInput.addEventListener("input", handlers.handleSearch);
    if (genreFilter) genreFilter.addEventListener("change", handlers.handleSearch);
    if (statusFilter) statusFilter.addEventListener("change", handlers.handleSearch);
    if (sortSelect) sortSelect.addEventListener("change", handlers.handleSearch);

    if (addBookBtn) addBookBtn.addEventListener("click", handlers.openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", handlers.closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", handlers.closeModal);
    if (addBookForm) addBookForm.addEventListener("submit", handlers.handleAddBook);

    if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", handlers.closeEditModal);
    if (cancelEditModalBtn) cancelEditModalBtn.addEventListener("click", handlers.closeEditModal);
    if (editBookForm) editBookForm.addEventListener("submit", handlers.handleEditBook);

    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener("click", handlers.closeDetailsModal);
    if (closeDetailsBottomBtn) closeDetailsBottomBtn.addEventListener("click", handlers.closeDetailsModal);

    if (resetCatalogBtn) resetCatalogBtn.addEventListener("click", handlers.openResetConfirmModal);
    if (resetConfirmCancelBtn) resetConfirmCancelBtn.addEventListener("click", handlers.closeResetConfirmModal);
    if (resetConfirmBtn) resetConfirmBtn.addEventListener("click", handlers.executeResetCatalog);

    if (confirmCancelBtn) confirmCancelBtn.addEventListener("click", handlers.closeConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", handlers.executeDeleteBook);
    
    if (themeToggle) themeToggle.addEventListener("click", handlers.toggleTheme);
    if (viewToggle) viewToggle.addEventListener("click", handlers.toggleView);

    if (favoritesToggleBtn) {
        favoritesToggleBtn.addEventListener("click", () => {
            const current = handlers.getShowOnlyFavorites();
            handlers.setShowOnlyFavorites(!current);
            if (handlers.getShowOnlyFavorites()) {
                favoritesToggleBtn.classList.add("active-filter");
                favoritesToggleBtn.innerHTML = "❤️ Solo Favoritos";
            } else {
                favoritesToggleBtn.classList.remove("active-filter");
                favoritesToggleBtn.innerHTML = "❤️ Favoritos";
            }
            handlers.handleSearch();
        });
    }

    if (genreSelect && genreCustomInput) {
        genreSelect.addEventListener("change", (e) => {
            if (e.target.value === "custom") {
                genreCustomInput.style.display = "block";
                genreCustomInput.required = true;
                genreCustomInput.focus();
            } else {
                genreCustomInput.style.display = "none";
                genreCustomInput.required = false;
                genreCustomInput.value = "";
            }
        });
    }

    if (editGenreSelect && editGenreCustomInput) {
        editGenreSelect.addEventListener("change", (e) => {
            if (e.target.value === "custom") {
                editGenreCustomInput.style.display = "block";
                editGenreCustomInput.required = true;
                editGenreCustomInput.focus();
            } else {
                editGenreCustomInput.style.display = "none";
                editGenreCustomInput.required = false;
                editGenreCustomInput.value = "";
            }
        });
    }

    if (booksGrid) {
        booksGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".book-card");
            if (!card) return;
            const bookId = parseInt(card.dataset.id);

            if (e.target.classList.contains("toggle-status-btn")) {
                handlers.toggleBookStatus(bookId);
            } else if (e.target.classList.contains("book-title")) {
                handlers.openDetailsModal(bookId);
            } else if (e.target.closest(".edit-book-btn")) {
                handlers.openEditModal(bookId);
            } else if (e.target.closest(".delete-book-btn")) {
                handlers.openConfirmModal(bookId);
            } else if (e.target.classList.contains("star")) {
                const ratingVal = parseInt(e.target.dataset.value);
                handlers.rateBook(bookId, ratingVal);
            } else if (e.target.closest(".favorite-btn")) {
                handlers.toggleFavorite(bookId);
            }
        });
    }

    if (addBookModal) {
        addBookModal.addEventListener("click", (e) => {
            if (e.target === addBookModal) handlers.closeModal();
        });
    }

    if (editBookModal) {
        editBookModal.addEventListener("click", (e) => {
            if (e.target === editBookModal) handlers.closeEditModal();
        });
    }

    if (detailsBookModal) {
        detailsBookModal.addEventListener("click", (e) => {
            if (e.target === detailsBookModal) handlers.closeDetailsModal();
        });
    }

    if (confirmModal) {
        confirmModal.addEventListener("click", (e) => {
            if (e.target === confirmModal) handlers.closeConfirmModal();
        });
    }

    if (resetConfirmModal) {
        resetConfirmModal.addEventListener("click", (e) => {
            if (e.target === resetConfirmModal) handlers.closeResetConfirmModal();
        });
    }
}
