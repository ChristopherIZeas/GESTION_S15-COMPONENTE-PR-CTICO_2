import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import admin from "firebase-admin";
import { libraryBooks, librarySeedVersion } from "./seed-data/library-books.js";

loadEnvFile();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const seedUserId = process.env.SEED_USER_ID;

if (!projectId) {
    exitWithError("Falta VITE_FIREBASE_PROJECT_ID o FIREBASE_PROJECT_ID en el entorno.");
}

if (!seedUserId) {
    exitWithError("Falta SEED_USER_ID. Usa el uid del usuario autenticado en Firebase Authentication.");
}

admin.initializeApp({
    credential: getCredential(),
    projectId
});

const db = admin.firestore();
const userRef = db.collection("users").doc(seedUserId);
const seedRunRef = userRef.collection("seedRuns").doc(librarySeedVersion);

try {
    const seedRunSnapshot = await seedRunRef.get();

    if (seedRunSnapshot.exists && !process.argv.includes("--force")) {
        console.log(`Seed omitido: ${librarySeedVersion} ya fue ejecutado para ${seedUserId}.`);
        process.exit(0);
    }

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    batch.set(userRef, {
        uid: seedUserId,
        seededAt: now,
        updatedAt: now
    }, { merge: true });

    libraryBooks.forEach(({ id, ...book }) => {
        const bookRef = userRef.collection("books").doc(id);

        batch.set(bookRef, {
            ...book,
            createdAt: now,
            updatedAt: now
        }, { merge: true });
    });

    batch.set(seedRunRef, {
        version: librarySeedVersion,
        totalBooks: libraryBooks.length,
        executedAt: now
    });

    await batch.commit();

    console.log(`Seed completado: ${libraryBooks.length} libros cargados para ${seedUserId}.`);
} catch (error) {
    handleFirestoreError(error);
}

function getCredential() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
        return admin.credential.cert(JSON.parse(json));
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const serviceAccountPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        return admin.credential.cert(JSON.parse(readFileSync(serviceAccountPath, "utf8")));
    }

    return admin.credential.applicationDefault();
}

function loadEnvFile() {
    const envPath = resolve(".env");
    if (!existsSync(envPath)) return;

    const envContent = readFileSync(envPath, "utf8");

    envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

function exitWithError(message) {
    console.error(message);
    process.exit(1);
}

function handleFirestoreError(error) {
    const activationUrl = error?.errorInfoMetadata?.activationUrl
        || error?.metadata?.internalRepr?.get?.("google.rpc.help-bin")
        || `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${projectId}`;

    if (error?.reason === "SERVICE_DISABLED" || error?.code === 7) {
        exitWithError([
            "No se pudo ejecutar el seed porque Cloud Firestore API está deshabilitada.",
            `Proyecto: ${projectId}`,
            `Actívala aquí: ${activationUrl}`,
            "Después de activarla, espera unos minutos y vuelve a ejecutar: npm run seed:library"
        ].join("\n"));
    }

    if (error?.code === 5) {
        exitWithError([
            "No se pudo ejecutar el seed porque Firestore no encontró la base de datos del proyecto.",
            `Proyecto: ${projectId}`,
            "Crea la base de datos en Firebase Console > Firestore Database > Create database.",
            "Selecciona una región y el modo de reglas que prefieras; después vuelve a ejecutar: npm run seed:library"
        ].join("\n"));
    }

    exitWithError(error?.message || "No se pudo ejecutar el seed.");
}
