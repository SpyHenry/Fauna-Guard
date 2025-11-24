// Mobile
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        // Acessibilidade
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('aria-label', 'Abrir menu de navegação');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        hamburger.tabIndex = 0;

        const toggle = () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            hamburger.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu de navegação');
        };

        // Click
        hamburger.addEventListener('click', toggle);

        // Teclado
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });

        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !hamburger.contains(e.target) && 
                !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.setAttribute('aria-label', 'Abrir menu de navegação');
            }
        });
    }
}

// Gallery Image Swap
function initGallery() {
    const galleryThumbs = document.querySelectorAll('.gallery-thumbs img');
    
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const mainImg = thumb.closest('.ong-gallery').querySelector('.gallery-main img');
            if (mainImg) {
                const tempSrc = mainImg.src;
                mainImg.src = thumb.src;
                thumb.src = tempSrc;
            }
        });
    });
}

// Modal simples para ampliar imagens

function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const closeBtn = modal ? modal.querySelector('.image-modal-close') : null;
    const prevBtn = modal ? modal.querySelector('.image-modal-nav.prev') : null;
    const nextBtn = modal ? modal.querySelector('.image-modal-nav.next') : null;
    let lastFocused = null;
    let currentIndex = 0;
    let currentList = [];

    const updateButtons = () => {
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= currentList.length - 1;
    };

    const render = () => {
        const img = currentList[currentIndex];
        if (!img) return;
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Imagem ampliada';
        updateButtons();
    };

    const open = (images, startIndex = 0) => {
        if (!modal || !modalImg) return;
        currentList = images.filter(Boolean);
        currentIndex = startIndex;
        lastFocused = document.activeElement;
        render();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden','false');
        (nextBtn && !nextBtn.disabled ? nextBtn : closeBtn)?.focus();
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
        currentList = [];
        currentIndex = 0;
    };

    const go = (delta) => {
        const newIndex = currentIndex + delta;
        if (newIndex < 0 || newIndex >= currentList.length) return;
        currentIndex = newIndex;
        render();
    };

    prevBtn && prevBtn.addEventListener('click', () => go(-1));
    nextBtn && nextBtn.addEventListener('click', () => go(1));
    closeBtn && closeBtn.addEventListener('click', close);
    modal && modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
    document.addEventListener('keydown', (e)=>{
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') return close();
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
    });
    return { open };
}

// Botão de lupa em cada imagem principal
function injectZoomButtons(modalApi) {
    document.querySelectorAll('.ong-card').forEach(card => {
        const mainContainer = card.querySelector('.gallery-main');
        if (!mainContainer) return;
        if (mainContainer.querySelector('.img-zoom-btn')) return; // já existe
        const mainImg = mainContainer.querySelector('img');
        if (!mainImg) return;

        // Coleta lista: primeiro a imagem principal + thumbs
        const images = Array.from(card.querySelectorAll('.gallery-main img, .gallery-thumbs img'));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'img-zoom-btn';
        btn.setAttribute('aria-label','Ampliar e navegar imagens');
        btn.innerHTML = '<i class="fas fa-search-plus"></i>';
        btn.addEventListener('click', () => {
            modalApi.open(images, 0); // abre começando na principal
        });
        mainContainer.appendChild(btn);
        // Também permitir clique direto na imagem abrir a sequência
        mainImg.addEventListener('click', () => modalApi.open(images, 0));
    });
}

// Education Tabs
function initEducationTabs() {
    const eduTabs = document.querySelectorAll('.edu-tab');
    const eduContents = document.querySelectorAll('.edu-content');

    eduTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Tratamento especial para abas externas com embed
            if (tab.dataset.url && tab.dataset.tab) {
                const targetContent = document.getElementById(tab.dataset.tab);
                if (targetContent && !targetContent.dataset.loaded) {
                    const wrapper = targetContent.querySelector('.embed-wrapper');
                    if (wrapper) {
                        const iframe = document.createElement('iframe');
                        iframe.src = tab.dataset.url;
                        iframe.title = 'Lista de espécies ameaçadas (ICMBio)';
                        iframe.loading = 'lazy';
                        iframe.style.width = '100%';
                        iframe.style.height = '72vh';
                        iframe.style.border = 'none';
                        iframe.setAttribute('referrerpolicy', 'no-referrer');
                        wrapper.appendChild(iframe);
                        targetContent.dataset.loaded = 'true';
                        const status = wrapper.querySelector('.embed-status');
                        if (status) status.textContent = 'Conteúdo carregando...';

                        // Fallback após timeout se bloqueado
                        setTimeout(() => {
                            if (!iframe.contentWindow) {
                                const fallback = document.createElement('div');
                                fallback.className = 'embed-fallback';
                                fallback.innerHTML = 'Não foi possível carregar via embed. <button type="button" class="open-external">Abrir em nova guia</button>';
                                wrapper.appendChild(fallback);
                                fallback.querySelector('.open-external').addEventListener('click', () => window.open(tab.dataset.url, '_blank'));
                                if (status) status.textContent = 'Embed bloqueado pelo site.';
                            } else {
                                if (status) status.textContent = '';
                            }
                        }, 5000);
                    }
                }
            } else if (tab.dataset.url) {
                // Caso genérico externo sem área de destino
                window.open(tab.dataset.url, '_blank');
                return;
            }

            eduTabs.forEach(t => t.classList.remove('active'));
            eduContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

// ONG Links
function initONGLinks() {
    const learnMoreButtons = document.querySelectorAll('.btn-learn-more[data-url]');
    
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            }
        });
    });
}

// Sons do Oceano - Áudio Player
function initOceanSounds() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;
    let currentBtn = null;

    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const audioId = 'audio-' + btn.dataset.audio;
            const audio = document.getElementById(audioId);
            if (!audio) return;

            // Pausa o áudio anterior se houver
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                if (currentBtn) currentBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
            }

            if (audio.paused) {
                audio.play();
                btn.querySelector('i').classList.replace('fa-play', 'fa-pause');
                currentAudio = audio;
                currentBtn = btn;
            } else {
                audio.pause();
                btn.querySelector('i').classList.replace('fa-pause', 'fa-play');
            }
        });
    });

    // Atualiza barra de progresso
    document.querySelectorAll('audio').forEach(audio => {
        const progressBar = audio.parentElement.querySelector('.progress-bar');
        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percent + '%';
        });
        audio.addEventListener('ended', () => {
            progressBar.style.width = '0%';
            if (currentBtn) currentBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        });
    });
}

// Initialize

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initGallery();
    initEducationTabs();
    initONGLinks();
    initOceanSounds();
    const modalApi = initImageModal();
    injectZoomButtons(modalApi);
});