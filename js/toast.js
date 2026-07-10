// Módulo de Notificaciones Toast
const toastContainer = document.getElementById("toast-container");

/**
 * Muestra una notificación toast dinámica
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast ("success" | "error" | "info")
 */
export function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
    `;
    toastContainer.appendChild(toast);
    
    // Forzar reflow para animación
    setTimeout(() => toast.classList.add("show"), 10);
    
    const autoClose = setTimeout(() => {
        dismissToast(toast);
    }, 4000);
    
    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(autoClose);
        dismissToast(toast);
    });
}

export function dismissToast(toast) {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
        toast.remove();
    });
}
