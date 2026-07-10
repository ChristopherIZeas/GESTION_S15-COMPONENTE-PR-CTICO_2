// Módulo de Estado Global
export const initialBooks = [
    {
        id: 1,
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        genre: "Realismo Mágico",
        year: 1967,
        status: "available",
        rating: 5,
        description: "La historia de la familia Buendía a lo largo de generaciones en Macondo, una de las obras más influyentes del realismo mágico."
    },
    {
        id: 2,
        title: "Don Quijote de la Mancha",
        author: "Miguel de Cervantes",
        genre: "Novela",
        year: 1605,
        status: "available",
        rating: 4,
        description: "Las aventuras de Don Quijote y Sancho Panza en una novela clásica que transformó la literatura occidental."
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Distopía",
        year: 1949,
        status: "borrowed",
        rating: 4,
        description: "Una visión inquietante de un futuro totalitario donde la vigilancia y el control dominan cada aspecto de la vida."
    },
    {
        id: 4,
        title: "El principito",
        author: "Antoine de Saint-Exupéry",
        genre: "Fantasía",
        year: 1943,
        status: "available",
        rating: 5,
        description: "Un pequeño príncipe viaja por el universo reflexionando sobre la soledad, la amistad y el sentido de la vida."
    },
    {
        id: 5,
        title: "Breve historia del tiempo",
        author: "Stephen Hawking",
        genre: "Divulgación Científica",
        year: 1988,
        status: "borrowed",
        rating: 3,
        description: "Una introducción accesible a los grandes conceptos de la cosmología moderna, desde el Big Bang hasta los agujeros negros."
    }
];

// Estado global de la aplicación (intenta cargar de localStorage, si no usa mock data)
let books = JSON.parse(localStorage.getItem("biblio_books")) || [...initialBooks];
let showOnlyFavorites = false;

export function getBooks() {
    return books;
}

export function setBooks(newBooks) {
    books = newBooks;
}

export function getShowOnlyFavorites() {
    return showOnlyFavorites;
}

export function setShowOnlyFavorites(val) {
    showOnlyFavorites = val;
}
