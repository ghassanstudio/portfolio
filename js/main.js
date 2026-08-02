/**
 * ملف JavaScript الرئيسي للموقع
 * يحتوي على:
 * - إعدادات particles.js كاملة مع تفاعل الماوس
 * - شريط التحميل
 * - القائمة الجانبية للهاتف
 * - زر العودة للأعلى
 * - إرسال النموذج
 * - تفعيل مكتبة AOS
 * - تأثير الكتابة المتحركة
 * - فلترة المشاريع
 * - تأثيرات إضافية
 */

document.addEventListener('DOMContentLoaded', function() {
    // ======== شريط التحميل ========
    const loader = document.querySelector('.loader');
    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('fade-out');
            // بدء تأثير الكتابة بعد إخفاء الشريط
            setTimeout(() => {
                startTypingEffect();
            }, 500);
        }, 1500);
    });

    // ======== تأثير الكتابة المتحركة ========
    function startTypingEffect() {
        const typingText = document.querySelector('.typing-text');
        if (!typingText) return;

        const texts = [
            'مطور ويب',
            'مصمم واجهات',
            'مطور تطبيقات',
            'مطور Full Stack'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }
            
            if (!isDeleting && charIndex === currentText.length) {
                typingSpeed = 2000; // انتظار قبل الحذف
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500; // انتظار قبل النص التالي
            }
            
            setTimeout(type, typingSpeed);
        }
        
        type();
    }

    // ======== القائمة الجانبية للهاتف ========
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-menu ul li a');

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    if (mobileLinks) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // ======== تغيير لون القائمة عند التمرير ========
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ======== زر العودة للأعلى ========
    const scrollTop = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTop.classList.add('active');
        } else {
            scrollTop.classList.remove('active');
        }
    });

    if (scrollTop) {
        scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ======== إرسال نموذج التواصل ========
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                alert('الرجاء ملء جميع الحقول المطلوبة.');
                return;
            }

            // يمكنك إضافة المزيد من التحقق من الصحة هنا، مثل التحقق من تنسيق البريد الإلكتروني

            // إظهار رسالة نجاح
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-check"></i> تم الإرسال بنجاح!';
            submitBtn.style.background = '#4CAF50';
            submitBtn.style.borderColor = '#4CAF50';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // ======== تحديث سنة الفوتر ========
    document.getElementById('year').textContent = new Date().getFullYear();

    // ======== تفعيل مكتبة AOS للانيميشن ========
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // ======== فلترة المشاريع ========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.classList.add('hidden');
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                }
            });
        });
    });

    // ======== تأثير شريط التقدم ========
    const progressBars = document.querySelectorAll('.progress');

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.dataset.width;
                progressBar.style.width = width + '%';
                progressObserver.unobserve(progressBar);
            }
        });
    }, {
        threshold: 0.5
    });

    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });

    // ======== تأثير العداد ========
    const counters = document.querySelectorAll('.stat-item h4');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCounter = () => {
                    const target = +counter.innerText;
                    const increment = target / 200;

                    if (target > 0) {
                        let current = 1;
                        const updateValues = () => {
                            current = current + increment;
                            if (current > target) {
                                counter.innerText = target;
                            } else {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateValues);
                            }
                        }
                        updateValues();
                    }
                }
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, {
        threshold: 0.2
    });

    counters.forEach(counter => {
        counterObserver.observe(counter)
    });

    // ======== تأثير التمرير السلس ========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ======== تأثير Hover للصور ========
    const projectImages = document.querySelectorAll('.project-img');
    projectImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // ======== إعدادات particles.js الكاملة مع تفاعل الماوس ========
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#64ffda"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#64ffda",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 3,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "window",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "repulse"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 100,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

    // ======== تحميل particles.js من CDN إذا لم يعمل ========
    if (typeof particlesJS === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.onload = function() {
            // إعادة تشغيل particles.js بعد التحميل
            if (document.getElementById('particles-js')) {
                particlesJS('particles-js', {
                    /* نفس الإعدادات السابقة */
                });
            }
        };
        document.body.appendChild(script);
    }

    // ======== تأثيرات إضافية ========
    
    // تأثير النقر على الأزرار
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // إنشاء تأثير النقر
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // تأثير التمرير للعناصر
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // مراقبة العناصر للتحريك
    document.querySelectorAll('.project-item, .skill-item, .contact-item').forEach(item => {
        observer.observe(item);
    });

    // تأثير الكتابة على النموذج
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // تأثير التمرير للقائمة
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('header');
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // التمرير للأسفل
            header.style.transform = 'translateY(-100%)';
        } else {
            // التمرير للأعلى
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

// إضافة CSS للتحريكات الإضافية
const additionalStyles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .form-group.focused label {
        transform: translateY(-20px);
        font-size: 0.8rem;
        color: var(--accent-color);
    }
    
    header {
        transition: transform 0.3s ease;
    }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);