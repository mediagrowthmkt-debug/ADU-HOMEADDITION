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
