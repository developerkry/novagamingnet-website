/**
 * Display a custom alert message.
 * @param {string} message - The message to display.
 * @param {string} type - The type of alert ('success', 'neutral', 'error').
 */
function showAlert(message, type = "neutral") {
    const alertContainer = document.getElementById("alert-container");

    // Create alert element
    const alert = document.createElement("div");
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        ${type === "error" ? '<button onclick="this.parentElement.remove()">Acknowledge</button>' : ""}
    `;

    // Append alert to container
    alertContainer.appendChild(alert);

    // Automatically remove non-error alerts after 5 seconds
    if (type !== "error") {
        const timeout = setTimeout(() => {
            alert.style.animation = "fadeOut 0.3s ease";
            alert.addEventListener("animationend", () => {
                alert.remove();
                clearTimeout(timeout); // Clear the timeout to avoid memory leaks
            });
        }, 5000);
    }
}
