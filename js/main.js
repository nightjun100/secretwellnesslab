// Main JavaScript functionality
(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initCountdown();
        initFAQ();
        initSmoothScrolling();
        initAccessibility();
    });

    // Configuration from YAML
    const CONFIG = {
        DISCOUNT_HOURS: 48,
        PRICE_REGULAR: 1980,
        PRICE_DISCOUNT: 1280
    };

    // Countdown Timer (Dynamic based on YAML config)
    function initCountdown() {
        const countdownElement = document.querySelector('.countdown');
        if (!countdownElement) return;

        // Get discount hours from data attribute or use config default
        const discountHours = parseInt(countdownElement.getAttribute('data-discount-hours')) || CONFIG.DISCOUNT_HOURS;
        
        // Set end time to current time + discount hours
        const endTime = new Date().getTime() + (discountHours * 60 * 60 * 1000);
        
        function updateCountdown() {
            const now = new Date().getTime();
            const timeLeft = endTime - now;
            
            if (timeLeft <= 0) {
                // Timer expired - show regular price
                countdownElement.innerHTML = '<div class="countdown-item"><span class="countdown-number">終了</span><span class="countdown-label">期間終了</span></div>';
                
                // Update price display to regular price
                const priceElement = document.querySelector('.price');
                const regularElement = document.querySelector('.regular');
                if (priceElement && regularElement) {
                    priceElement.textContent = `¥${CONFIG.PRICE_REGULAR.toLocaleString()}`;
                    regularElement.style.display = 'none';
                }
                
                // Update CTA buttons - improved method
                const ctaButtons = document.querySelectorAll('.btn-primary');
                ctaButtons.forEach(btn => {
                    const strongElement = btn.querySelector('strong');
                    if (strongElement && strongElement.textContent.includes('1,280円')) {
                        strongElement.textContent = `今すぐ${CONFIG.PRICE_REGULAR.toLocaleString()}円で手に入れる`;
                    }
                });
                
                // Update timer text
                const timerElement = document.querySelector('.timer');
                if (timerElement) {
                    timerElement.textContent = '通常価格';
                }
                
                return;
            }
            
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            // Update countdown display
            const hoursElement = document.getElementById('hours');
            const minutesElement = document.getElementById('minutes');
            const secondsElement = document.getElementById('seconds');
            
            if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
            if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
            if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
        }
        
        // Update immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // FAQ Accordion
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(function(item) {
            const question = item.querySelector('.q');
            
            if (question) {
                // Click handler
                function toggleFAQ() {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other items
                    faqItems.forEach(function(otherItem) {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherQuestion = otherItem.querySelector('.q');
                            if (otherQuestion) {
                                otherQuestion.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });
                    
                    // Toggle current item
                    const newState = !isActive;
                    item.classList.toggle('active', newState);
                    question.setAttribute('aria-expanded', newState.toString());
                }

                question.addEventListener('click', toggleFAQ);

                // Add keyboard support
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFAQ();
                    }
                });

                // Set initial attributes
                question.setAttribute('tabindex', '0');
                question.setAttribute('role', 'button');
                question.setAttribute('aria-expanded', 'false');
                
                // Add aria-controls if answer has an ID
                const answer = item.querySelector('.a');
                if (answer) {
                    const answerId = `faq-answer-${Math.random().toString(36).substr(2, 9)}`;
                    answer.setAttribute('id', answerId);
                    question.setAttribute('aria-controls', answerId);
                }
            }
        });
    }

    // Smooth Scrolling
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const offsetTop = target.offsetTop - 80; // Account for potential fixed header
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }

    // Accessibility enhancements
    function initAccessibility() {
        // Add ARIA labels to countdown
        const countdownItems = document.querySelectorAll('.countdown-item');
        countdownItems.forEach(function(item) {
            const number = item.querySelector('.countdown-number');
            const label = item.querySelector('.countdown-label');
            if (number && label) {
                item.setAttribute('aria-label', `${number.textContent} ${label.textContent}`);
            }
        });

        // Add live region for countdown updates
        const countdown = document.querySelector('.countdown');
        if (countdown) {
            countdown.setAttribute('aria-live', 'polite');
            countdown.setAttribute('aria-atomic', 'true');
        }

        // Enhance form accessibility if forms exist
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                // Add required indicator to screen readers
                if (input.hasAttribute('required')) {
                    const label = form.querySelector(`label[for="${input.id}"]`);
                    if (label && !label.textContent.includes('必須')) {
                        label.innerHTML += ' <span class="sr-only">(必須)</span>';
                    }
                }
            });
        });

        // Announce page changes for single page apps
        let lastUrl = location.href;
        new MutationObserver(function() {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                announcePageChange();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Announce page changes to screen readers
    function announcePageChange() {
        const title = document.title;
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `ページが変更されました: ${title}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Performance: Lazy load images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            const images = document.querySelectorAll('img[data-src]');
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    // Initialize lazy loading
    initLazyLoading();

    // Error handling
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        // Could send to error tracking service
    });

    // Performance monitoring
    if ('performance' in window && 'measure' in window.performance) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log('Page load time:', loadTime + 'ms');
            }, 0);
        });
    }

})();