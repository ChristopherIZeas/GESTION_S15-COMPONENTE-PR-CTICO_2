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

    const resetCatalogBtn = document.getElementById("reset-catalog-btn");
    const resetConfirmCancelBtn = document.getElementById("reset-confirm-cancel-btn");
    const resetConfirmBtn = document.getElementById("reset-confirm-btn");

    const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const viewToggle = document.getElementById("view-toggle");
    const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");
    const addRatingInput = document.getElementById("book-rating-input");
    const editRatingInput = document.getElementById("edit-book-rating-input");
    const detailsToggleStatusBtn = document.getElementById("details-toggle-status-btn");
    const detailsEditBtn = document.getElementById("details-edit-btn");
    const sortCycleBtn = document.getElementById("sort-cycle-btn");
    const genrePills = document.getElementById("genre-pills");
    const statusGroup = document.querySelector(".status-group");

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
    if (detailsToggleStatusBtn) detailsToggleStatusBtn.addEventListener("click", handlers.toggleActiveDetailsBookStatus);
    if (detailsEditBtn) detailsEditBtn.addEventListener("click", handlers.editActiveDetailsBook);

    if (resetCatalogBtn) resetCatalogBtn.addEventListener("click", handlers.openResetConfirmModal);
    if (resetConfirmCancelBtn) resetConfirmCancelBtn.addEventListener("click", handlers.closeResetConfirmModal);
    if (resetConfirmBtn) resetConfirmBtn.addEventListener("click", handlers.executeResetCatalog);

    if (confirmCancelBtn) confirmCancelBtn.addEventListener("click", handlers.closeConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", handlers.executeDeleteBook);
    
    if (themeToggle) {
        themeToggle.addEventListener("click", (e) => {
            const button = e.target.closest("[data-theme]");
            if (!button) return;
            handlers.setTheme(button.dataset.theme);
        });
    }
    if (viewToggle) viewToggle.addEventListener("click", handlers.toggleView);

    if (sortCycleBtn && sortSelect) {
        const sortLabels = {
            "title-asc": '<i class="fa-solid fa-arrow-up-a-z"></i><span>Título</span>',
            "title-desc": '<i class="fa-solid fa-arrow-down-z-a"></i><span>Título</span>',
            "year-desc": '<i class="fa-regular fa-calendar"></i><span>Año</span>',
            "year-asc": '<i class="fa-regular fa-calendar"></i><span>Año asc</span>',
            "rating-desc": '<i class="fa-solid fa-star"></i><span>Rating</span>'
        };
        sortCycleBtn.innerHTML = sortLabels[sortSelect.value] || sortLabels["title-asc"];
        sortCycleBtn.addEventListener("click", () => {
            const values = ["title-asc", "title-desc", "year-desc", "year-asc", "rating-desc"];
            const currentIndex = values.indexOf(sortSelect.value);
            const nextValue = values[(currentIndex + 1) % values.length];
            sortSelect.value = nextValue;
            sortCycleBtn.innerHTML = sortLabels[nextValue];
            handlers.handleSearch();
        });
    }

    if (favoritesToggleBtn) {
        favoritesToggleBtn.addEventListener("click", () => {
            const current = handlers.getShowOnlyFavorites();
            handlers.setShowOnlyFavorites(!current);
            if (handlers.getShowOnlyFavorites()) {
                favoritesToggleBtn.classList.add("active-filter");
                favoritesToggleBtn.innerHTML = '<i class="fa-solid fa-heart"></i><span>Favoritos</span>';
            } else {
                favoritesToggleBtn.classList.remove("active-filter");
                favoritesToggleBtn.innerHTML = '<i class="fa-regular fa-heart"></i><span>Favoritos</span>';
            }
            handlers.handleSearch();
        });
    }

    if (genrePills && genreFilter) {
        genrePills.addEventListener("click", (e) => {
            const button = e.target.closest("[data-genre]");
            if (!button) return;
            genreFilter.value = button.dataset.genre;
            genrePills.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.remove("active"));
            button.classList.add("active");
            handlers.handleSearch();
        });
    }

    if (statusGroup && statusFilter) {
        statusGroup.addEventListener("click", (e) => {
            const button = e.target.closest("[data-status]");
            if (!button) return;
            statusFilter.value = button.dataset.status;
            statusGroup.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.remove("active"));
            button.classList.add("active");
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

    [addRatingInput, editRatingInput].forEach((ratingContainer) => {
        if (!ratingContainer) return;
        ratingContainer.addEventListener("click", (e) => {
            const star = e.target.closest(".rating-star");
            if (!star) return;
            const value = parseInt(star.dataset.value);
            ratingContainer.dataset.rating = value;
            ratingContainer.querySelectorAll(".rating-star").forEach((item) => {
                item.classList.toggle("filled", parseInt(item.dataset.value) <= value);
            });
        });
    });

    if (booksGrid) {
        booksGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".book-card");
            if (!card) return;
            const bookId = card.dataset.id;

            if (e.target.closest(".toggle-status-btn")) {
                handlers.toggleBookStatus(bookId);
            } else if (e.target.classList.contains("book-title")) {
                handlers.openDetailsModal(bookId);
            } else if (e.target.closest(".edit-book-btn")) {
                handlers.openEditModal(bookId);
            } else if (e.target.closest(".delete-book-btn")) {
                handlers.openConfirmModal(bookId);
            } else if (e.target.closest(".star")) {
                const ratingVal = parseInt(e.target.closest(".star").dataset.value);
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
