// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const header = document.querySelector('.header');
const contactForm = document.getElementById('contactForm');
const themeToggle = document.getElementById('theme-toggle');
const whatsappFloat = document.getElementById('whatsapp-float');
const whatsappChat = document.getElementById('whatsapp-chat');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const newsletterModal = document.getElementById('newsletter-modal');
const modalClose = document.getElementById('modal-close');
const newsletterForm = document.getElementById('newsletter-form');
const calculateBtn = document.getElementById('calculate-btn');
const calculatorResult = document.getElementById('calculator-result');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme
initTheme();

// Theme toggle event
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = navToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = 'none';
            span.style.opacity = '1';
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Dark mode header adjustment
function updateHeaderBackground() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (window.scrollY > 100) {
        header.style.background = isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = header.offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.solution-card, .portfolio-item, .contact-method, .testimonial-item');
    animatedElements.forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
});

// Statistics Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Initialize counter animation when about section is visible
const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            aboutObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about');
if (aboutSection) {
    aboutObserver.observe(aboutSection);
}

// Testimonials Carousel
let currentSlide = 0;
const testimonials = document.querySelectorAll('.testimonial-item');
const totalSlides = testimonials.length;

function initCarousel() {
    const carousel = document.getElementById('testimonials-carousel');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (!carousel || !dotsContainer) return;
    
    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    
    // Auto-play
    setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000);
    
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('testimonials-carousel');
    const dots = document.querySelectorAll('.dot');
    
    if (!carousel) return;
    
    // Update carousel position
    const slideWidth = testimonials[0].offsetWidth + 32; // 32px gap
    carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Calculator Functionality
const calculatorData = {
    'site-institucional': { base: 3000, simple: 1, medium: 2, complex: 3 },
    'ecommerce': { base: 8000, simple: 2, medium: 3, complex: 4 },
    'app-mobile': { base: 15000, simple: 2, medium: 4, complex: 6 },
    'sistema-web': { base: 12000, simple: 3, medium: 4, complex: 6 },
    'landing-page': { base: 1500, simple: 1, medium: 1, complex: 2 }
};

const featureCosts = {
    'seo': 500,
    'responsive': 300,
    'admin': 800,
    'integrations': 600,
    'analytics': 200,
    'support': 400
};

function calculateBudget() {
    const projectType = document.getElementById('project-type').value;
    const complexity = document.getElementById('project-complexity').value;
    const selectedFeatures = Array.from(document.querySelectorAll('.feature-checkbox input:checked')).map(cb => cb.value);
    
    if (!projectType || !complexity) {
        showNotification('Selecione o tipo e complexidade do projeto', 'error');
        return;
    }
    
    const projectData = calculatorData[projectType];
    let basePrice = projectData.base;
    
    // Adjust for complexity
    switch (complexity) {
        case 'simples':
            basePrice *= 0.8;
            break;
        case 'medio':
            basePrice *= 1.2;
            break;
        case 'complexo':
            basePrice *= 1.5;
            break;
    }
    
    // Add feature costs
    const featureCost = selectedFeatures.reduce((total, feature) => total + featureCosts[feature], 0);
    const totalPrice = basePrice + featureCost;
    
    // Calculate range (±20%)
    const minPrice = Math.round(totalPrice * 0.8);
    const maxPrice = Math.round(totalPrice * 1.2);
    
    // Update result
    document.getElementById('price-value').textContent = `R$ ${minPrice.toLocaleString()} - R$ ${maxPrice.toLocaleString()}`;
    document.getElementById('timeline-value').textContent = `${projectData[complexity]} meses`;
    
    // Update features list
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = `
        <h4>Funcionalidades Incluídas:</h4>
        <ul>
            ${selectedFeatures.map(feature => `<li>${getFeatureName(feature)}</li>`).join('')}
        </ul>
    `;
    
    // Show result
    calculatorResult.style.display = 'block';
    calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getFeatureName(feature) {
    const names = {
        'seo': 'SEO Otimizado',
        'responsive': 'Design Responsivo',
        'admin': 'Painel Administrativo',
        'integrations': 'Integrações',
        'analytics': 'Analytics',
        'support': 'Suporte 24h'
    };
    return names[feature] || feature;
}

// WhatsApp Chat Functionality
function initWhatsAppChat() {
    if (!whatsappFloat || !whatsappChat) return;
    
    whatsappFloat.addEventListener('click', () => {
        whatsappChat.classList.add('active');
        whatsappFloat.style.display = 'none';
    });
    
    chatClose.addEventListener('click', () => {
        whatsappChat.classList.remove('active');
        whatsappFloat.style.display = 'flex';
    });
    
    // Chat input functionality
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Direct WhatsApp link
    whatsappFloat.addEventListener('dblclick', () => {
        window.open('https://wa.me/5511957719763?text=Olá! Gostaria de saber mais sobre desenvolvimento de sites e aplicativos.', '_blank');
    });
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'sent');
    chatInput.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const responses = [
            'Obrigado pelo contato! Vou analisar sua solicitação e retornar em breve.',
            'Interessante! Posso agendar uma reunião para discutir mais detalhes?',
            'Perfeito! Vou preparar um orçamento personalizado para você.',
            'Que ótimo! Nossa equipe está pronta para começar seu projeto.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'received');
    }, 1000);
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <p>${text}</p>
        <span class="time">Agora</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Newsletter Modal
function initNewsletterModal() {
    if (!newsletterModal || !modalClose) return;
    
    // Show modal after 30 seconds
    setTimeout(() => {
        if (!localStorage.getItem('newsletterShown')) {
            newsletterModal.classList.add('active');
            localStorage.setItem('newsletterShown', 'true');
        }
    }, 30000);
    
    modalClose.addEventListener('click', () => {
        newsletterModal.classList.remove('active');
    });
    
    // Close on outside click
    newsletterModal.addEventListener('click', (e) => {
        if (e.target === newsletterModal) {
            newsletterModal.classList.remove('active');
        }
    });
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Simulate subscription
            showNotification('Inscrição realizada com sucesso!', 'success');
            newsletterModal.classList.remove('active');
            newsletterForm.reset();
        });
    }
}

// Contact Form Validation and Submission
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!validateForm(data)) {
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission (replace with actual API call)
            await simulateFormSubmission(data);
            
            // Show success message
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            contactForm.reset();
            
        } catch (error) {
            // Show error message
            showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Form validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Email inválido');
    }
    
    if (!data.service) {
        errors.push('Selecione o tipo de projeto');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simulate form submission
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve(data);
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && heroVisual) {
        const rate = scrolled * -0.5;
        heroVisual.style.transform = `translateY(${rate}px)`;
    }
});

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 1000);
    }
});

// Floating cards animation
function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });
}

// Initialize floating cards animation
document.addEventListener('DOMContentLoaded', animateFloatingCards);

// Smooth reveal animation for sections
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            section.classList.add('revealed');
        }
    });
}

// Add reveal animation styles
const style = document.createElement('style');
style.textContent = `
    section {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    
    section.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero {
        opacity: 1;
        transform: none;
    }
`;
document.head.appendChild(style);

// Initialize reveal animation
window.addEventListener('scroll', revealOnScroll);
document.addEventListener('DOMContentLoaded', revealOnScroll);

// Add CSS for notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .notification-content i {
        font-size: 1.25rem;
    }
`;
document.head.appendChild(notificationStyles);

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    // Header scroll effect
    updateHeaderBackground();
    
    // Parallax effect
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && heroVisual) {
        const rate = scrolled * -0.5;
        heroVisual.style.transform = `translateY(${rate}px)`;
    }
    
    // Reveal animation
    revealOnScroll();
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});

// Add hover effects for interactive elements
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('.btn, .solution-card, .portfolio-item, .contact-method');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = element.style.transform + ' scale(1.02)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = element.style.transform.replace(' scale(1.02)', '');
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
        
        // Close modals
        if (newsletterModal.classList.contains('active')) {
            newsletterModal.classList.remove('active');
        }
        if (whatsappChat.classList.contains('active')) {
            whatsappChat.classList.remove('active');
            whatsappFloat.style.display = 'flex';
        }
    }
});

// Add touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up
            console.log('Swipe up detected');
        } else {
            // Swipe down
            console.log('Swipe down detected');
        }
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    console.log('DevStudio website loaded successfully!');
    
    // Initialize all components
    initCarousel();
    initWhatsAppChat();
    initNewsletterModal();
    
    // Calculator event listener
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateBudget);
    }
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Google Analytics tracking
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Track important interactions
document.addEventListener('DOMContentLoaded', () => {
    // Track form submissions
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            trackEvent('Form', 'Submit', 'Contact Form');
        });
    }
    
    // Track calculator usage
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            trackEvent('Calculator', 'Calculate', 'Budget Calculator');
        });
    }
    
    // Track WhatsApp chat
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', () => {
            trackEvent('Chat', 'Open', 'WhatsApp Chat');
        });
    }
}); 