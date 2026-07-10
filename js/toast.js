// Módulo de Notificaciones Toast
const toastContainer = document.getElementById("toast-container");

const toastConfig = {
    success: {
        icon: "fa-circle-check",
        label: "Éxito"
    },
    error: {
        icon: "fa-circle-exclamation",
        label: "Error"
    },
    info: {
        icon: "fa-circle-info",
        label: "Información"
    }
};

/**
 * Muestra una notificación toast dinámica
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast ("success" | "error" | "info")
 */
export function showToast(message, type = "success") {
    const config = toastConfig[type] || toastConfig.info;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon-wrap">
            <i class="fa-solid ${config.icon}"></i>
        </div>
        <div class="toast-content">
            <span class="toast-label">${config.label}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" aria-label="Cerrar notificación"><i class="fa-solid fa-xmark"></i></button>
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
