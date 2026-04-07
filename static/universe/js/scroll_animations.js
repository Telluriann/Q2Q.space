document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const sections = gsap.utils.toArray(".section-panel");

    sections.forEach((sec, i) => {
        const textElement = sec.querySelector(".reveal-text");
        const imgElement = sec.querySelector(".reveal-img");
        const parallaxImg = sec.querySelector(".parallax-img");

        // Set initial invisible states to prevent FOUC (Flash of Unstyled Content) before animation triggers
        gsap.set([textElement, imgElement], { autoAlpha: 0 });

        // Create a Timeline for entering animations
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: sec,
                start: "top 75%", // Plays when top of the section goes 75% down the viewport
                end: "bottom 25%", 
                toggleActions: "play reverse play reverse", 
                // Play out, reverse when going intensely back up, etc. Gives it a dynamic snapping feel without native CSS snap bugs.
            }
        });

        // Determine alternate staggering side based on index (even fades left, odd fades right)
        // Note: For complex layouts this is cool, but here both are cleanly left to right, up to down.
        // Let's standardise: images scale in slightly, text slides up from bottom
        
        tl.fromTo(imgElement, 
            { y: 30, scale: 0.95, autoAlpha: 0 }, 
            { y: 0, scale: 1, autoAlpha: 1, duration: 1.2, ease: "power3.out" }
        )
        .fromTo(textElement, 
            { y: 50, autoAlpha: 0 }, 
            { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, 
            "-=0.7" // Highly overlapped start for seamless feel
        );

        // Native Parallax Image Scrolling 
        // This is separate from the timeline so it scrubs linearly as you scroll past
        if (parallaxImg) {
            gsap.to(parallaxImg, {
                yPercent: 20, // Move the image 20% down vertically over the scroll duration
                ease: "none",
                scrollTrigger: {
                    trigger: sec,
                    start: "top bottom", // Starts moving immediately when section touches bottom of screen
                    end: "bottom top", // Ends moving when section leaves top of screen
                    scrub: true // ties animation progress tightly to scrollbar mathematically
                }
            });
        }
    });

    console.log("Tailwind + GSAP Scroll Engine initialized.");
});
