// FAQ Toggle Functionality
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-icon');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.querySelector('.faq-answer').style.maxHeight = '0';
            item.querySelector('.faq-icon').textContent = '+';
            item.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current FAQ
    if (answer.style.maxHeight && answer.style.maxHeight !== '0px') {
        answer.style.maxHeight = '0';
        icon.textContent = '+';
        icon.style.transform = 'rotate(0deg)';
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
        icon.style.transform = 'rotate(180deg)';
    }
}

// Before/After Slider Functionality - Optimized
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('imageSlider');
    const imgBefore = document.getElementById('imgBefore');
    const sliderLine = document.getElementById('sliderLine');
    const sliderButton = document.getElementById('sliderButton');
    
    if (slider && imgBefore && sliderLine && sliderButton) {
        let isSliding = false;
        let rafId = null;

        function updateSlider(e) {
            if (!isSliding && e.type !== 'mousemove' && e.type !== 'touchmove') return;
            
            // Cancel previous animation frame if exists
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            
            rafId = requestAnimationFrame(() => {
                const rect = slider.getBoundingClientRect();
                let x;
                
                if (e.type.startsWith('touch')) {
                    x = e.touches[0].clientX - rect.left;
                } else {
                    x = e.clientX - rect.left;
                }
                
                // Limit slider between 0 and container width
                x = Math.max(0, Math.min(x, rect.width));
                
                const percentage = (x / rect.width) * 100;
                
                imgBefore.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
                sliderLine.style.left = `${percentage}%`;
                sliderButton.style.left = `${percentage}%`;
            });
        }

        // Mouse events
        slider.addEventListener('mousedown', () => { isSliding = true; }, { passive: true });
        document.addEventListener('mouseup', () => { isSliding = false; }, { passive: true });
        slider.addEventListener('mousemove', updateSlider, { passive: true });

        // Touch events for mobile
        slider.addEventListener('touchstart', () => { isSliding = true; }, { passive: true });
        document.addEventListener('touchend', () => { isSliding = false; }, { passive: true });
        slider.addEventListener('touchmove', updateSlider, { passive: true });
    }
}, { passive: true });

// Wait for everything to load
window.addEventListener('load', function() {
    console.log('=== TRANSFORMATION VIEWER INITIALIZING ===');
    
    // Hero Slideshow
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 1) {
        let currentSlide = 0;
        setInterval(function() {
            heroSlides[currentSlide].classList.remove('active');
            const img = heroSlides[currentSlide].querySelector('img');
            if (img) {
                const newImg = img.cloneNode(true);
                img.parentNode.replaceChild(newImg, img);
            }
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 8000);
    }
    
    // Transformation Viewer - GUARANTEED TO WORK
    setTimeout(function() {
        const buttons = document.querySelectorAll('.stage-btn');
        const stages = document.querySelectorAll('.transformation-stage');
        
        console.log('Found buttons:', buttons.length);
        console.log('Found stages:', stages.length);
        
        if (buttons.length === 0 || stages.length === 0) {
            console.error('Elements not found!');
            return;
        }
        
        let autoInterval = null;
        let currentIdx = 0;
        
        // Main function to switch stages
        function switchToStage(stageName) {
            console.log('Switching to:', stageName);
            
            // Remove all active classes
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            for (let i = 0; i < stages.length; i++) {
                stages[i].classList.remove('active');
            }
            
            // Add active to target
            for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].getAttribute('data-stage') === stageName) {
                    buttons[i].classList.add('active');
                }
            }
            for (let i = 0; i < stages.length; i++) {
                if (stages[i].getAttribute('data-stage') === stageName) {
                    stages[i].classList.add('active');
                }
            }
        }
        
        // Auto-play function
        function autoAdvance() {
            const stageList = ['before', 'during', 'after'];
            currentIdx = (currentIdx + 1) % stageList.length;
            switchToStage(stageList[currentIdx]);
        }
        
        // Setup button clicks
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const targetStage = this.getAttribute('data-stage');
                console.log('Button clicked:', targetStage);
                
                // Update current index
                if (targetStage === 'before') currentIdx = 0;
                if (targetStage === 'during') currentIdx = 1;
                if (targetStage === 'after') currentIdx = 2;
                
                switchToStage(targetStage);
                
                // Restart auto-play
                if (autoInterval) clearInterval(autoInterval);
                autoInterval = setInterval(autoAdvance, 3000);
            }, false);
        }
        
        // Start auto-play immediately
        autoInterval = setInterval(autoAdvance, 3000);
        console.log('=== AUTO-PLAY STARTED (3 seconds) ===');
        
    }, 500); // Wait 500ms to ensure DOM is ready
});
