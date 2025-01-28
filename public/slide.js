// Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const totalSlides = slides.length;
const carouselSlide = document.querySelector('.carousel-slide');

// Function to show the slide based on current index
function showSlide(index) {
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    carouselSlide.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Automatically change slides every 3 seconds
setInterval(() => {
    showSlide(currentSlide + 1);
}, 3000);
