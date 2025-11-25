export function toast(text: string) {
    if (window.pageElements) {
        window.pageElements.toastText.innerHTML = text;

        window.pageElements.toastDisplay.style.animation = "none";

        // this line does nothing, but without it the animation
        // does not reset
        void window.pageElements.toastDisplay.clientWidth;

        window.pageElements.toastDisplay.style.animation = "toast linear 3s";

    } else {
        console.warn("toast: pageElements unavailable");
        console.log("toast: message: " + text);
    }
}