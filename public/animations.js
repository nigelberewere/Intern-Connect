// A more robust script to handle scroll animations consistently.

function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) {
        // No elements to animate on this page.
        return;
    }

    // This observer will watch for elements coming into view.
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            // When an element is at least 10% visible...
            if (entry.isIntersecting) {
                // Add the 'animated' class to trigger the CSS animation.
                entry.target.classList.add('animated');
                // We've done our job, so stop watching this element.
                observerInstance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Start observing all the elements with the '.animate-on-scroll' class.
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Wait for the initial HTML document to be completely loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
    initializeScrollAnimations();
});
