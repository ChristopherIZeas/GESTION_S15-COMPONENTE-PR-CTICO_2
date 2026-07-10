import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const missingConfig = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingConfig.length) {
    throw new Error(`Faltan variables de Firebase: ${missingConfig.join(", ")}`);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

function userDocRef(uid) {
    return doc(db, "users", uid);
}

function booksCollectionRef(uid) {
    return collection(db, "users", uid, "books");
}

export function listenAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

export function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export function logout() {
    return signOut(auth);
}

export async function upsertUserProfile(user) {
    if (!user) return;

    await setDoc(userDocRef(user.uid), {
        uid: user.uid,
        name: user.displayName || "Usuario",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp()
    }, { merge: true });
}

export function listenUserBooks(uid, onBooks, onError) {
    const booksQuery = query(booksCollectionRef(uid), orderBy("createdAt", "desc"));

    return onSnapshot(booksQuery, (snapshot) => {
        const books = snapshot.docs.map((bookDoc) => ({
            id: bookDoc.id,
            ...bookDoc.data()
        }));

        onBooks(books);
    }, onError);
}

export async function createBook(uid, book) {
    await addDoc(booksCollectionRef(uid), {
        ...book,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}

export async function updateBook(uid, bookId, updates) {
    await updateDoc(doc(db, "users", uid, "books", bookId), {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

export async function removeBook(uid, bookId) {
    await deleteDoc(doc(db, "users", uid, "books", bookId));
}

export async function clearUserBooks(uid) {
    const snapshot = await getDocs(booksCollectionRef(uid));
    const batch = writeBatch(db);

    snapshot.docs.forEach((bookDoc) => {
        batch.delete(bookDoc.ref);
    });

    await batch.commit();
}
