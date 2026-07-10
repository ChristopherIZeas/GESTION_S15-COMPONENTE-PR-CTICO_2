// Módulo de Estado Global
let books = [];
let showOnlyFavorites = false;
let currentUser = null;
let isCatalogLoading = true;

export function getBooks() {
    return books;
}

export function setBooks(newBooks) {
    books = newBooks;
}

export function getCurrentUser() {
    return currentUser;
}

export function setCurrentUser(user) {
    currentUser = user;
}

export function getIsCatalogLoading() {
    return isCatalogLoading;
}

export function setIsCatalogLoading(value) {
    isCatalogLoading = value;
}

export function getShowOnlyFavorites() {
    return showOnlyFavorites;
}

export function setShowOnlyFavorites(val) {
    showOnlyFavorites = val;
}
