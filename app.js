// --- STATE MANAGEMENT ---
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';

// Global memory to hold onto processed album data fetched from JSON + folder scanning
let activeAlbumsData = []; 

// --- TRANSLATIONS DICTIONARY ---
const translations = {
    en: {
        nav_home: "Home",
        nav_portfolio: "Portfolio",
        nav_tos: "Terms",
        hero_title: "Capturing the World",
        hero_desc: "I shoot photos, vehicles, and everything in between. Welcome to my personal portfolio.",
        hero_btn: "View My Work",
        featured_title: "Featured Showcase",
        view_album: "View Gallery",
        back_to_portfolio: "Back to Portfolio",
        tos_p1: "Welcome to my personal photography portfolio.",
        tos_p2: "All images, photographs, and content on this website are my exclusive personal property and are protected by copyright laws.",
        tos_p3: "You may not download, reproduce, distribute, or use these images for personal, commercial, or AI-training purposes without my explicit written permission. By browsing this site, you agree to respect these terms. Enjoy the view, but please do not take the photos.",
        footer_bio: "A curated archive of personal photography capturing landscapes, architecture, and automotive machinery.",
        footer_explore: "Explore",
        footer_connect: "Connect With Me",
        footer_rights: "All rights reserved.",
        footer_roadmap: "Roadmap",
        photos_label: "photos",
        featured_photos_title: "Featured Photos",
        featured_albums_title: "Featured Albums",
        nav_about: "About",
        about_subtitle: "The Photographer",
        about_title: "Hi, I'm a Visual Storyteller",
        about_p1: "I am a passionate photographer specializing in capturing high-speed action, machinery, and urban landscapes. My journey started behind the lens looking for unique angles that tell a story beyond what the naked eye catches on a daily basis.",
        about_p2: "Whether it's the roar of engines echoing through the sand dunes at the Zandvoort race circuit or the quiet stillness of geometric city architectures, I strive to preserve those fleeting moments with dramatic lighting and razor-sharp clarity.",
        about_p3: "When I'm not tracking down machinery tracks or carrying gear into city streets, I spend my time exploring backend tech, setting up portfolio architectures, and building digital spaces to host my curation.",
        about_contact: "Get in Touch"
    },
    nl: {
        nav_home: "Thuis",
        nav_portfolio: "Portfolio",
        nav_tos: "Voorwaarden",
        hero_title: "De Wereld Vastleggen",
        hero_desc: "Ik fotografeer foto's, voertuigen en alles daartussenin. Welkom op mijn persoonlijke portfolio.",
        hero_btn: "Bekijk Mijn Werk",
        featured_title: "Uitgelichte Showcase",
        view_album: "Bekijk Galerij",
        back_to_portfolio: "Terug naar Portfolio",
        tos_p1: "Welkom op mijn persoonlijke portfolio.",
        tos_p2: "Alle afbeeldingen, foto's en inhoud op deze website zijn mijn exclusieve persoonlijke eigendom en worden beschermd door auteursrecht.",
        tos_p3: "U mag deze afbeeldingen niet downloaden, reproduceren, distribueren of gebruiken voor persoonlijke, commerciële of AI-trainingsdoeleinden zonder mijn expliciete schriftelijke toestemming. Door deze site te bezoeken, gaat u akkoord met deze voorwaarden. Geniet van het uitzicht, maar neem de foto's niet mee.",
        footer_bio: "Een gecureerd archive van persoonlijke fotografie waarin landschappen, architectuur en auto-machines worden vastgelegd.",
        footer_explore: "Ontdekken",
        footer_connect: "Verbinden",
        footer_rights: "Alle rechten voorbehouden.",
        footer_roadmap: "Stappenplan",
        photos_label: "foto's",
        featured_photos_title: "Uitgelichte Foto's",
        featured_albums_title: "Uitgelichte Albums",
        nav_about: "Over Mij",
        about_subtitle: "De Fotograaf",
        about_title: "Hoi, Ik ben een Visuele Verhalenverteller",
        about_p1: "Ik ben een gepassioneerde fotograaf die gespecialiseerd is in het vastleggen van snelle actie, machines en stedelijke landschappen. Mijn reis begon achter de lens, altijd op zoek naar unieke hoeken die een verhaal vertellen dat verder gaat dan het blote oog dagelijks ziet.",
        about_p2: "Of het nu gaat om het brullen van motoren die door de duinen op het circuit van Zandvoort galmen, of de stille rust van geometrische stadsarchitectuur, ik streef ernaar om die vluchtige momenten te bewaren met dramatische belichting en vlijmscherpe helderheid.",
        about_p3: "Als ik niet bezig ben met het volgen van circuits of het sjouwen met apparatuur door de straten van de stad, besteed ik mijn tijd aan het verkennen van backend-technologie, het opzetten van portfolio-architecturen en het bouwen van digitale ruimtes om mijn werk te presenteren.",
        about_contact: "Neem Contact Op"
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initLang();
    
    // 1. Fetch JSON config, 2. Scan folders on the fly, 3. Build UI elements
    await loadAndScanAlbums();
    
    // Read the current hash token on load or hard refresh
    const initialPage = window.location.hash.replace('#', '') || 'home';
    
    // Execute visual route selection
    handleRouting(initialPage);
});

// --- CENTRAL ROUTING LOGIC ---
function navigate(pageId) {
    // Simply setting the hash changes the URL bar safely and fires 'hashchange'
    window.location.hash = pageId;
}

function handleRouting(pageId) {
    // 1. Clear out active styling across page panels
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    
    // 2. Compute true target element (e.g., "gallery-0" points to "portfolio" wrapper layout)
    const basePage = pageId.split('-')[0]; 
    const targetPage = document.getElementById(basePage);
    
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Safe layout fallback if user inputs gibberish route string
        const homePage = document.getElementById('home');
        if (homePage) homePage.classList.add('active');
    }

    // 3. Close open lightbox overlay if routing to a separate view section entirely
    if (!pageId.startsWith('gallery-')) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
            resetZoom();
        }
    } else {
        // Directly route deep links directly into open lightboxes
        const albumIndex = parseInt(pageId.split('-')[1], 10);
        if (!isNaN(albumIndex)) {
            openGallery(albumIndex);
        }
    }
}

// Watch window mutations dynamically for manual input, link clicks, or historical navigation presses
window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || 'home';
    handleRouting(page);
});

// --- THEME ENGINE ---
const themeBtn = document.getElementById('themeToggle');

function initTheme() {
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

themeBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});

// --- TRANSLATION SWITCHER ---
function initLang() {
    if (!translations[currentLang]) {
        currentLang = 'en';
        localStorage.setItem('lang', 'en');
    }
    applyTranslations(currentLang);
    updateLangUI(currentLang);
}

window.setLang = function(lang) {
    currentLang = lang;
    localStorage.setItem('lang', currentLang);
    applyTranslations(currentLang);
    updateLangUI(currentLang);
    renderInterface();

    // If a gallery is currently open, refresh its title/description in the new language
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('gallery-')) {
        const albumIndex = parseInt(hash.split('-')[1], 10);
        if (!isNaN(albumIndex)) {
            const album = activeAlbumsData[albumIndex];
            if (album) {
                const gTitle = document.getElementById('gallery-title');
                const gDesc = document.getElementById('gallery-description');
                if (gTitle) gTitle.textContent = album.title[currentLang] || album.title['en'];
                if (gDesc) gDesc.textContent = album.description[currentLang] || album.description['en'];
            }
        }
    }
}

function updateLangUI(activeLang) {
    const btnEn = document.getElementById('btn-en');
    const btnNl = document.getElementById('btn-nl');
    [btnEn, btnNl].forEach(btn => {
        btn.className = "px-3 py-1 rounded-full text-xs font-bold transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200";
    });
    const activeBtn = document.getElementById(`btn-${activeLang}`);
    if (activeBtn) {
        activeBtn.className = "px-3 py-1 rounded-full text-xs font-bold transition-colors bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400";
    }
}

function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

const isImageFile = (pathOrFilename) => /\.(jpe?g|png|webp|gif)/i.test(pathOrFilename);

async function loadAndScanAlbums() {
    activeAlbumsData = []; 

    try {
        const jsonResponse = await fetch(`albums.json?t=${Date.now()}`);
        if (!jsonResponse.ok) throw new Error("Could not find or read albums.json");
        
        const albumConfigs = await jsonResponse.json();

        for (let config of albumConfigs) {
            let filesDetected = [];
            try {
                const response = await fetch(config.folder);
                if (!response.ok) throw new Error(`HTTP target error ${response.status}`);

                const htmlString = await response.text();
                const domParser = new DOMParser();
                const parsedHTML = domParser.parseFromString(htmlString, 'text/html');
                const anchoredLinks = Array.from(parsedHTML.querySelectorAll('a'));
                
                const trackedNames = new Set();

                anchoredLinks.forEach(anchor => {
                    let href = anchor.getAttribute('href');
                    if (!href) return;

                    if (isImageFile(href)) {
                        if (href.endsWith('.preview')) {
                            href = href.replace('.preview', '');
                        }

                        let cleanUrl = href.split('?')[0];
                        let filename = cleanUrl.split('/').pop();
                        filename = decodeURIComponent(filename);

                        if (filename && filename !== '..' && filename !== '.') {
                            trackedNames.add(filename);
                        }
                    }
                });

                filesDetected = Array.from(trackedNames);
            } catch (err) {
                console.warn(`Could not live scan directory folder ${config.folder}:`, err);
                filesDetected = []; 
            }

            console.log(`[Success] Automatically detected ${filesDetected.length} images inside: ${config.folder}`, filesDetected);

            // Fallback: if live directory scanning isn't supported by the host
            // (e.g. static hosting with no directory listing), use featured_images
            // so the gallery and photo count aren't left empty.
            if (filesDetected.length === 0 && config.featured_images && config.featured_images.length > 0) {
                console.warn(`[Fallback] Using featured_images list for ${config.folder} since folder scan returned nothing.`);
                filesDetected = [...config.featured_images];
            }

            activeAlbumsData.push({
                ...config,
                images: filesDetected
            });
        }

    } catch (rootError) {
        console.error("Critical error loading live metadata mapping config:", rootError);
    }

    renderInterface();
}

function renderInterface() {
    const grid = document.getElementById('album-grid');
    const featuredContainer = document.getElementById('featured-album-container');
    const featuredPhotosContainer = document.getElementById('featured-photos-container'); 
    
    if(!grid || !featuredContainer || !featuredPhotosContainer) return;
    
    grid.innerHTML = ''; 
    featuredContainer.innerHTML = ''; 
    featuredPhotosContainer.innerHTML = ''; 
    
    const photoLabel = translations[currentLang].photos_label;

    activeAlbumsData.forEach((album, idx) => {
        const imageCount = album.images.length;
        const displayTitle = album.title[currentLang] || album.title['en'];
        const displayDesc = album.description[currentLang] || album.description['en'];

        if (album.featured_images && album.featured_images.length > 0) {
            album.featured_images.forEach(imgName => {
                const photoCard = document.createElement('div');
                photoCard.className = "group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 aspect-[3/2] cursor-pointer relative";
                
                const resourcePath = `${album.folder}${imgName}`;
                
                photoCard.innerHTML = `
                    <img src="${resourcePath}" alt="Featured Shot" 
                         class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                         loading="lazy">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span class="text-white font-medium text-sm tracking-wide bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                            <i class="fas fa-search-plus"></i> View Album
                        </span>
                    </div>
                `;
                
                photoCard.onclick = () => navigate(`gallery-${idx}`);
                featuredPhotosContainer.appendChild(photoCard);
            });
        }

        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800";
        card.onclick = () => navigate(`gallery-${idx}`);
        card.innerHTML = `
            <div class="h-52 overflow-hidden relative">
                <img src="${album.cover}" alt="Cover" class="w-full h-full object-cover">
                <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                    <i class="fas fa-camera mr-1"></i> ${imageCount} ${photoLabel}
                </div>
            </div>
            <div class="p-5">
                <div class="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">${album.date}</div>
                <h3 class="text-xl font-bold mb-2">${displayTitle}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">${displayDesc}</p>
            </div>
        `;
        grid.appendChild(card);

        if (album.featured) {
            const featuredCard = document.createElement('div');
            featuredCard.className = "flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 mb-8";

            featuredCard.innerHTML = `
                <div class="md:w-1/2 h-72 md:h-96 relative">
                    <img src="${album.cover}" alt="Cover" class="w-full h-full object-cover">
                    <div class="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-md font-semibold">
                        <i class="fas fa-camera mr-1"></i> ${imageCount} ${photoLabel}
                    </div>
                </div>
                <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div class="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-widest">${album.date}</div>
                    <h4 class="text-3xl md:text-4xl font-black mb-4">${displayTitle}</h4>
                    <p class="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-base md:text-lg">${displayDesc}</p>
                    <div>
                        <button onclick="navigate('gallery-${idx}')" class="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2">
                            <i class="fas fa-images"></i> <span>${translations[currentLang].view_album}</span>
                        </button>
                    </div>
                </div>
            `;
            featuredContainer.appendChild(featuredCard);
        }
    });

    applyTranslations(currentLang);
}

// --- PHOTO ALBUM TRACKING STATE ---
let currentAlbumImages = [];
let currentAlbumFolder = "";
let currentImageIndex = 0;

// Advanced Interactive Coordinates
let isZoomed = false;
let isDragging = false;
let didDrag = false; 
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;
let currentScale = 1;

const MIN_SCALE = 1.0;
const MAX_SCALE = 4.0;
const SCALE_STEP = 0.5;

// --- MOBILE & TRACKPAD SWIPE NAVIGATION ---
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 60; 

window.addEventListener('touchstart', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    if (isZoomed) return; 
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance < -SWIPE_THRESHOLD) {
        animateImageSwitch('next');
    } else if (swipeDistance > SWIPE_THRESHOLD) {
        animateImageSwitch('prev');
    }
}

function animateImageSwitch(direction) {
    if (isZoomed) return;
    const img = document.getElementById('lightbox-img');
    if (!img || currentAlbumImages.length <= 1) return;

    const exitClass = direction === 'next' ? 'lightbox-swipe-left' : 'lightbox-swipe-right';
    const enterClass = direction === 'next' ? 'lightbox-enter-right' : 'lightbox-enter-left';

    img.className = `max-w-full max-h-full object-contain rounded shadow-2xl ${exitClass}`;
    
    setTimeout(() => {
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % currentAlbumImages.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
        }
        updateLightboxImage();
        
        img.className = `max-w-full max-h-full object-contain rounded shadow-2xl ${enterClass}`;
        
        requestAnimationFrame(() => {
            setTimeout(() => {
                img.className = "max-w-full max-h-full object-contain rounded shadow-2xl lightbox-animate-reset";
            }, 20);
        });
    }, 200); 
}

function openGallery(albumIndex) {
    const album = activeAlbumsData[albumIndex];
    if(!album) return;

    const gTitle = document.getElementById('gallery-title');
    const gDesc = document.getElementById('gallery-description');
    if (gTitle) gTitle.textContent = album.title[currentLang] || album.title['en'];
    if (gDesc) gDesc.textContent = album.description[currentLang] || album.description['en'];
    
    const imagesGrid = document.getElementById('gallery-images-grid');
    if(!imagesGrid) return;
    
    imagesGrid.innerHTML = ''; 

    currentAlbumImages = album.images || [];
    currentAlbumFolder = album.folder || "";

    if (currentAlbumImages.length > 0) {
        currentAlbumImages.forEach((imgName, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = "group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 aspect-[3/2] cursor-pointer";
            
            const resourcePath = `${currentAlbumFolder}${imgName}`;
            
            wrapper.innerHTML = `
                <img src="${resourcePath}" alt="Portfolio Shot" 
                     class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                     loading="lazy">
            `;
            
            wrapper.onclick = () => triggerLightbox(idx);
            imagesGrid.appendChild(wrapper);
        });
    }
}

// --- LIGHTBOX INTERACTION CONTROLLER ---
function triggerLightbox(index) {
    currentImageIndex = index;
    resetZoom(); 

    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if (prevBtn && nextBtn) {
        if (currentAlbumImages.length > 1) {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            prevBtn.classList.add('hidden');
            nextBtn.classList.add('hidden');
        }
    }

    updateLightboxImage();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightboxImg || currentAlbumImages.length === 0) return;
    
    currentScale = 1.0;
    translateX = 0;
    translateY = 0;
    applyTransform();

    const currentFile = currentAlbumImages[currentImageIndex];
    lightboxImg.src = `${currentAlbumFolder}${currentFile}`;
    if (lightboxCaption) {
        lightboxCaption.textContent = `${currentImageIndex + 1} / ${currentAlbumImages.length} — ${currentFile}`;
    }
}

// --- POSITIONING & MATRICES ENGINES ---
function applyTransform() {
    const img = document.getElementById('lightbox-img');
    if (!img) return;
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
}

function handleImageClick(e) {
    e.stopPropagation();
    const img = document.getElementById('lightbox-img');
    if (!img) return;

    if (!isZoomed) {
        const rect = img.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        currentScale = 2.5; 
        
        translateX = (rect.width / 2 - mouseX) * (currentScale - 1);
        translateY = (rect.height / 2 - mouseY) * (currentScale - 1);

        img.classList.replace('cursor-zoom-in', 'cursor-grab');
        img.style.transition = "transform 0.25s ease-out"; 
        applyTransform();
        isZoomed = true;
    } else {
        if (!didDrag) { 
            resetZoom();
        }
    }
}

function handleImageScroll(e) {
    e.preventDefault(); 
    const img = document.getElementById('lightbox-img');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
    const oldScale = currentScale;
    
    currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale + delta));

    if (currentScale === oldScale) return; 

    if (currentScale <= MIN_SCALE) {
        resetZoom(); 
        return;
    }

    const factor = currentScale / oldScale;
    translateX = (translateX - (rect.width / 2 - mouseX)) * factor + (rect.width / 2 - mouseX);
    translateY = (translateY - (rect.height / 2 - mouseY)) * factor + (rect.height / 2 - mouseY);

    img.className = "max-w-full max-h-full object-contain rounded shadow-2xl border border-white/10 cursor-grab will-change-transform";
    img.style.transition = "transform 0.1s ease-out"; 
    applyTransform();
    isZoomed = true;
}

function resetZoom() {
    const img = document.getElementById('lightbox-img');
    if (!img) return;

    currentScale = 1.0;
    translateX = 0;
    translateY = 0;
    
    img.style.transition = "transform 0.2s ease-out";
    img.className = "max-w-full max-h-full object-contain rounded shadow-2xl border border-white/10 cursor-zoom-in ease-out will-change-transform";
    applyTransform();
    
    isZoomed = false;
    isDragging = false;
    didDrag = false;
}

// --- DRAGGING ENGINE ---
function startDrag(e) {
    if (!isZoomed) return;
    e.preventDefault();
    
    const img = document.getElementById('lightbox-img');
    if (img) img.classList.replace('cursor-grab', 'cursor-grabbing');

    isDragging = true;
    didDrag = false; 
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    
    if (img) img.style.transition = 'none'; 
}

function processDrag(e) {
    if (!isDragging || !isZoomed) return;
    e.preventDefault();
    
    didDrag = true; 
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
}

function endDrag() {
    if (!isDragging) return;
    
    const img = document.getElementById('lightbox-img');
    if (img) img.classList.replace('cursor-grabbing', 'cursor-grab');
    
    isDragging = false; 
}

function nextImage(e) { if (e && e.stopPropagation) e.stopPropagation(); animateImageSwitch('next'); }
function prevImage(e) { if (e && e.stopPropagation) e.stopPropagation(); animateImageSwitch('prev'); }

// --- EVENT MANAGEMENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!lightbox || !img) return;

    const closeAction = () => {
        // Return browser history contextually backward out of deep lightbox hash states safely
        if (window.location.hash.startsWith('#gallery-')) {
            window.location.hash = 'portfolio';
        } else {
            lightbox.classList.add('hidden');
            document.body.style.overflow = ''; 
            resetZoom();
        }
    };

    if (closeBtn) closeBtn.onclick = closeAction;
    if (prevBtn) prevBtn.onclick = prevImage;
    if (nextBtn) nextBtn.onclick = nextImage;
    
    img.onclick = handleImageClick;
    img.onwheel = handleImageScroll;
    img.onmousedown = startDrag;
    window.onmousemove = processDrag; 
    window.onmouseup = endDrag;

    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target.id === 'lightbox-frame') {
            closeAction();
        }
    };

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;

        if (e.key === 'Escape') {
            closeAction();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        }
    });
});