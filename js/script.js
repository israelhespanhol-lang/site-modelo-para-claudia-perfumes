document.addEventListener('DOMContentLoaded', () => {
    // Check Prefers Reduced Motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ==========================================================================
       1. Configurações da Loja
       ========================================================================== */
    initStoreConfig();

    /* ==========================================================================
       2. Gerar Produtos (Vitrine)
       ========================================================================== */
    renderVitrine('todos');

    /* ==========================================================================
       3. Inicializar Lucide Icons
       ========================================================================== */
    lucide.createIcons();
    initPremiumUI(prefersReducedMotion);

    /* ==========================================================================
       4. Inicializar Swiper
       ========================================================================== */
    const swiperPresentes = new Swiper('.swiper-presentes', {
        slidesPerView: 1.15, // Mobile
        spaceBetween: 20,
        grabCursor: true,
        keyboard: { enabled: true },
        breakpoints: {
            576: { slidesPerView: 2.2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            992: { slidesPerView: 4, spaceBetween: 40 }
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        speed: 750,
        autoplay: prefersReducedMotion ? false : {
            delay: 4200,
            disableOnInteraction: true,
            pauseOnMouseEnter: true
        }
    });

    /* ==========================================================================
       5. Inicializar Lenis (Smooth Scroll)
       ========================================================================== */
    let lenis;
    if (!prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.1,
            smoothWheel: true,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        // Conectar Lenis com cliques em âncoras (Menu e Botões)
        document.querySelectorAll('.scroll-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.getAttribute('href') || link.getAttribute('data-target');
                if (target && target.startsWith('#')) {
                    e.preventDefault();
                    lenis.scrollTo(target, { offset: -80 });
                }
            });
        });
    }

    /* ==========================================================================
       6. Inicializar GSAP / ScrollTrigger
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
        // Conectar GSAP Ticker com Lenis
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }

        // Fix visibility antes de animar
        gsap.set('.gs-reveal, .gs-stagger, .gs-scale', { visibility: 'visible' });

        // Hero Parallax sutil
        gsap.to(".gs-parallax", {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Parallax Editoriais
        gsap.utils.toArray('.editorial-image .gs-parallax').forEach(img => {
            gsap.to(img, {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Revelações simples
        gsap.utils.toArray('.gs-reveal').forEach(elem => {
            gsap.from(elem, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        });

        // Staggers (Cards, Listas)
        gsap.utils.toArray('.gs-stagger-container').forEach(container => {
            const elements = container.querySelectorAll('.gs-stagger');
            gsap.from(elements, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: container,
                    start: "top 85%",
                }
            });
        });

        // Scale in sutil
        gsap.utils.toArray('.gs-scale').forEach(elem => {
            gsap.from(elem, {
                scale: 1.05,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%"
                }
            });
        });
    } else {
        // Fallback: garante que tudo está visível se GSAP não animar
        gsap.set('.gs-reveal, .gs-stagger, .gs-scale', { visibility: 'visible', opacity: 1, y: 0, scale: 1 });
    }

    /* ==========================================================================
       7. Ativar Filtros da Vitrine
       ========================================================================== */
    setupFilters();

    /* ==========================================================================
       8. Ativar WhatsApp (Microinteração e Link Inteligente)
       ========================================================================== */
    setupWhatsAppLinks();
    setupQuickContact();

    // FAB Widget (Aparece após 5s)
    const fabTooltip = document.getElementById('fab-tooltip');
    if (fabTooltip) {
        setTimeout(() => {
            fabTooltip.classList.add('show');
            setTimeout(() => fabTooltip.classList.remove('show'), 5000);
        }, 5000);
    }

    /* ==========================================================================
       9. Lógica Área 18+
       ========================================================================== */
    setupAgeGate();

    /* ==========================================================================
       10. Menu Mobile & Quiz
       ========================================================================== */
    setupMobileMenu();
    setupQuiz();

    /* ==========================================================================
       11. ScrollTrigger Refresh (Após carregar tudo)
       ========================================================================== */
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // Header Scroll Shadow
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
});


/* ==========================================================================
   FUNÇÕES DE CONFIGURAÇÃO E LÓGICA
   ========================================================================== */

function initStoreConfig() {
    if(typeof STORE === 'undefined') return;

    document.getElementById('store-name-header').textContent = STORE.name;
    document.getElementById('footer-store-name').textContent = STORE.name;
    document.getElementById('current-year').textContent = new Date().getFullYear();
    document.getElementById('promo-text-display').textContent = STORE.promotion;

    const footerPhone = document.getElementById('footer-phone');
    if (footerPhone && STORE.phone) footerPhone.textContent = STORE.phone;
    
    const instaLink = document.getElementById('insta-link');
    instaLink.innerHTML = `<i data-lucide="instagram" stroke-width="1.5"></i> <span>${STORE.instagram}</span>`;
    
    if(STORE.address) {
        document.getElementById('footer-address-li').style.display = 'flex';
        document.getElementById('footer-address').textContent = STORE.address;
    }

    const marcasContainer = document.getElementById('marcas-container');
    if (marcasContainer && STORE.brands) {
        marcasContainer.innerHTML = '';
        STORE.brands.forEach(brand => {
            const span = document.createElement('span');
            span.className = 'marca-tag';
            span.textContent = brand;
            marcasContainer.appendChild(span);
        });
    }
}

function setupWhatsAppLinks() {
    if(typeof STORE === 'undefined') return;

    document.querySelectorAll('.wpp-link').forEach(link => {
        if (link.dataset.wppBound === 'true') return;
        link.dataset.wppBound = 'true';

        link.addEventListener('click', function(e) {
            e.preventDefault();

            const originalHTML = this.innerHTML;
            if(this.tagName.toLowerCase() === 'button') {
                this.innerHTML = '<span>Abrindo WhatsApp...</span>';
                this.disabled = true;
            }

            const msg = this.getAttribute('data-msg') || "Olá, Cláudia! Gostaria de conversar com você.";
            const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;

            setTimeout(() => {
                window.open(url, '_blank', 'noopener,noreferrer');
                if(this.tagName.toLowerCase() === 'button') {
                    this.innerHTML = originalHTML;
                    this.disabled = false;
                    if (window.lucide) lucide.createIcons();
                }
            }, 420);
        });
    });
}

function renderVitrine(filterCategory) {
    const grid = document.getElementById('vitrine-grid');
    if (!grid || typeof PRODUCTS === 'undefined') return;
    
    grid.innerHTML = '';
    
    const filtered = filterCategory === 'todos' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === filterCategory);

    filtered.forEach(p => {
        let defaultMsg = p.whatsappMsg;
        if (!defaultMsg) {
            if (p.category === 'lingerie') defaultMsg = `Olá, Cláudia! Gostaria de saber mais sobre o modelo ${p.name}.`;
            else if (p.category === 'intimidade') defaultMsg = `Olá, Cláudia! Gostaria de consultar discretamente o produto ${p.name}.`;
            else if (p.category === 'presentes') defaultMsg = `Olá, Cláudia! Gostaria de montar uma opção para presente (${p.name}).`;
            else defaultMsg = `Olá, Cláudia! Gostaria de saber mais sobre o perfume/produto ${p.name}.`;
        }

        const badge = p.promotion ? `<span class="promo-badge">Oferta</span>` : '';
        
        const html = `
            <div class="produto-card">
                <div class="produto-img-box">
                    ${badge}
                    <img src="${p.image}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='https://images.pexels.com/photos/6675831/pexels-photo-6675831.jpeg?auto=compress&cs=tinysrgb&w=900';">
                </div>
                <span class="produto-brand">${p.brand}</span>
                <h3 class="produto-title">${p.name}</h3>
                <p class="produto-desc">${p.description}</p>
                <button class="btn btn-outline wpp-link" data-msg="${defaultMsg}">Tenho interesse</button>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });

    setupWhatsAppLinks();
    ScrollTrigger.refresh();
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Regra 18+ no filtro
            if (this.classList.contains('age-restricted-btn') && sessionStorage.getItem('ageVerified') !== 'true') {
                return; // Bloqueado pelo gate
            }

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-filter');
            
            const grid = document.getElementById('vitrine-grid');
            grid.style.opacity = '0';
            
            setTimeout(() => {
                renderVitrine(category);
                grid.style.opacity = '1';
                grid.style.transition = 'opacity 0.4s ease';
            }, 300);
        });
    });
}

function setupAgeGate() {
    const ageGate = document.getElementById('age-gate');
    if (!ageGate) return;

    let pendingTarget = null;

    function showGate(e) {
        if (sessionStorage.getItem('ageVerified') === 'true') return;
        e.preventDefault();
        e.stopPropagation();
        pendingTarget = e.currentTarget;
        ageGate.style.display = 'flex';
        requestAnimationFrame(() => ageGate.classList.add('is-open'));
    }

    document.querySelectorAll('.age-restricted-link, .age-restricted-btn').forEach(el => {
        el.addEventListener('click', showGate, true);
    });

    document.getElementById('btn-age-yes')?.addEventListener('click', () => {
        sessionStorage.setItem('ageVerified', 'true');
        ageGate.classList.remove('is-open');
        ageGate.style.display = 'none';

        if (pendingTarget) {
            const filter = pendingTarget.getAttribute('data-filter');
            const href = pendingTarget.getAttribute('href');

            if (filter) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                pendingTarget.classList.add('active');
                renderVitrine(filter);
            } else if (pendingTarget.classList.contains('wpp-link')) {
                pendingTarget.click();
            } else if (href?.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        pendingTarget = null;
    });

    document.getElementById('btn-age-no')?.addEventListener('click', () => {
        pendingTarget = null;
        ageGate.classList.remove('is-open');
        ageGate.style.display = 'none';
    });
}

function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    document.querySelectorAll('.close-menu').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

function setupQuiz() {
    let quizData = { estilo: '', ocasiao: '' };
    const progressDots = document.querySelectorAll('.quiz-progress-dot');

    function updateQuizProgress(step) {
        progressDots.forEach((dot, index) => {
            dot.classList.toggle('active', index <= step - 1);
        });
    }
    const step1 = document.getElementById('quiz-step-1');
    const step2 = document.getElementById('quiz-step-2');
    const stepResult = document.getElementById('quiz-step-result');
    const wppBtn = document.getElementById('quiz-wpp-btn');

    document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = this.getAttribute('data-value');
            
            if (this.closest('#quiz-step-1')) {
                quizData.estilo = val;
                step1.style.display = 'none';
                step2.style.display = 'block';
                updateQuizProgress(2);
            } else if (this.closest('#quiz-step-2')) {
                quizData.ocasiao = val;
                step2.style.display = 'none';
                stepResult.style.display = 'block';
                
                const msg = `Olá, Cláudia! Estou procurando uma fragrância ${quizData.estilo} para ${quizData.ocasiao}. Pode me indicar algumas opções?`;
                wppBtn.setAttribute('data-msg', msg);
                setupWhatsAppLinks(); // Re-bind
            }
        });
    });
}


function initPremiumUI(prefersReducedMotion) {
    const progress = document.getElementById('scroll-progress-bar');
    const updateProgress = () => {
        if (!progress) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    if (!prefersReducedMotion && window.SplitType && window.gsap) {
        const title = document.querySelector('.hero-title');
        if (title && !title.dataset.splitReady) {
            title.dataset.splitReady = 'true';
            const split = new SplitType(title, { types: 'words, chars' });
            gsap.from(split.chars, {
                yPercent: 110,
                opacity: 0,
                duration: 0.9,
                ease: 'power4.out',
                stagger: 0.018,
                delay: 0.15
            });
        }
    }

    if (!prefersReducedMotion && window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll('.atalho-card, .lingerie-look, .intimidade-feature'), {
            max: 4,
            speed: 450,
            scale: 1.01,
            glare: true,
            'max-glare': 0.08,
            gyroscope: false
        });
    }

    if (!prefersReducedMotion && window.gsap) {
        gsap.to('.ambient-glow--one', {
            xPercent: -8, yPercent: 8, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
        gsap.to('.ambient-glow--two', {
            xPercent: 10, yPercent: -6, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1
        });

        gsap.utils.toArray('.hero-orbit-badge').forEach((badge, i) => {
            gsap.to(badge, {
                y: i % 2 ? -9 : 9,
                duration: 2.6 + i * .5,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1
            });
        });
    }

    const sections = [...document.querySelectorAll('section[id]')];
    const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
    if ('IntersectionObserver' in window && sections.length && navLinks.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
            });
        }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
        sections.forEach(section => observer.observe(section));
    }

    document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement?.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
        });
    });
}


function setupQuickContact() {
    const widget = document.getElementById('quick-contact-widget');
    const toggle = document.getElementById('quick-contact-toggle');
    const menu = document.getElementById('quick-contact-menu');

    if (!widget || !toggle || !menu) return;

    const setOpen = (open) => {
        widget.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
    };

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!widget.classList.contains('is-open'));
    });

    menu.querySelectorAll('.quick-contact-item').forEach(item => {
        item.addEventListener('click', () => {
            setTimeout(() => setOpen(false), 250);
        });
    });

    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });
}
