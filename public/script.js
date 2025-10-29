// --- script.js ---

document.addEventListener("DOMContentLoaded", function() {
    // Select all elements that you want to animate on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Create a new Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the element is intersecting (visible)
            if (entry.isIntersecting) {
                // Add the 'animated' class to trigger the animation
                entry.target.classList.add('animated');
                // Stop observing the element so the animation only happens once
                observer.unobserve(entry.target);
            }
        });
    }, {
        // This threshold means the animation will trigger when 20%
        // of the element is visible in the viewport.
        threshold: 0.2 
    });

    // Start observing each of the animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});
