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
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Microinteração
            const originalHTML = this.innerHTML;
            if(this.tagName.toLowerCase() === 'button') {
                this.innerHTML = `<span>Abrindo WhatsApp...</span>`;
            }
            
            const msg = this.getAttribute('data-msg') || "Olá, Cláudia! Gostaria de conversar com você.";
            const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;
            
            setTimeout(() => {
                window.open(url, '_blank');
                if(this.tagName.toLowerCase() === 'button') {
                    this.innerHTML = originalHTML;
                    lucide.createIcons(); // Recria o ícone se houver
                }
            }, 600);
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
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
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
    const ageVerified = sessionStorage.getItem('ageVerified') === 'true';

    function showGate(e) {
        if (!ageVerified && sessionStorage.getItem('ageVerified') !== 'true') {
            e.preventDefault();
            e.stopPropagation();
            ageGate.style.display = 'flex';
        }
    }

    document.querySelectorAll('.age-restricted-link').forEach(l => l.addEventListener('click', showGate));
    document.querySelectorAll('.age-restricted-btn').forEach(b => b.addEventListener('click', showGate));

    document.getElementById('btn-age-yes').addEventListener('click', () => {
        sessionStorage.setItem('ageVerified', 'true');
        ageGate.style.display = 'none';
    });

    document.getElementById('btn-age-no').addEventListener('click', () => {
        ageGate.style.display = 'none';
        window.location.hash = '#hero'; // Joga pro topo se for link ancora
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
