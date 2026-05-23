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
        view_album: "View Gallery",
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
        view_album: "Bekijk Galerij",
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
    
    const initialPage = window.location.hash.replace('#', '') || 'home';
    if(initialPage.startsWith('gallery-')) {
        navigate('portfolio');
    } else {
        navigate(initialPage);
    }
});

// --- NAVIGATION ROUTER ---
// function navigate(pageId) {
//     document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
//     const basePage = pageId.split('-')[0]; 
//     const targetPage = document.getElementById(basePage);
//     if(targetPage) {
//         targetPage.classList.add('active');
//         window.location.hash = pageId;
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//     const cleanPath = pageId === 'home' ? '/' : `/${pageId}`;
//     history.replaceState(null, '', cleanPath);
// }

// --- NAVIGATION ROUTER ---
function navigate(pageId) {
    // 1. Handle active states exactly how your layout expects it
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    
    const basePage = pageId.split('-')[0]; 
    const targetPage = document.getElementById(basePage);
    
    if(targetPage) {
        targetPage.classList.add('active');
        
        // 2. Clean modern URL handling without hashes
        const cleanPath = pageId === 'home' ? '/' : `/${pageId}`;
        
        // Only push a new step into history if the user is visiting a new page
        if (window.location.pathname !== cleanPath) {
            history.pushState({ pageId: pageId }, '', cleanPath);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

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
    applyTranslations(currentLang);
    updateLangUI(currentLang);
}

window.setLang = function(lang) {
    currentLang = lang;
    localStorage.setItem('lang', currentLang);
    applyTranslations(currentLang);
    updateLangUI(currentLang);
    renderInterface(); 
}

function updateLangUI(activeLang) {
    const btnEn = document.getElementById('btn-en');
    const btnNl = document.getElementById('btn-nl');
    [btnEn, btnNl].forEach(btn => {
        btn.className = "px-3 py-1 rounded-full text-xs font-bold transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200";
    });
    const activeBtn = document.getElementById(`btn-${activeLang}`);
    activeBtn.className = "px-3 py-1 rounded-full text-xs font-bold transition-colors bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400";
}

function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

// Check if the link contains an image extension ANYWHERE in the string (even before .preview)
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

                    // If it contains an image extension anywhere in the text
                    if (isImageFile(href)) {
                        // 1. Clean up Five Server's ".preview" trick if it's there
                        if (href.endsWith('.preview')) {
                            href = href.replace('.preview', '');
                        }

                        // 2. Strip off any browser query strings (?v=123 etc)
                        let cleanUrl = href.split('?')[0];
                        
                        // 3. Extract just the clean filename at the end of the path
                        let filename = cleanUrl.split('/').pop();
                        filename = decodeURIComponent(filename);

                        // Safety check to exclude directory links or credits
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
    
    // 🚨 YOU ARE MISSING THIS EXACT LINE RIGHT HERE:
    const featuredPhotosContainer = document.getElementById('featured-photos-container'); 
    
    // Make sure all three variables are added to this safety check:
    if(!grid || !featuredContainer || !featuredPhotosContainer) return;
    
    // Clear them all out on reload
    grid.innerHTML = ''; 
    featuredContainer.innerHTML = ''; 
    featuredPhotosContainer.innerHTML = ''; // 👈 This is line 220ish where it is crashing!
    
    const photoLabel = translations[currentLang].photos_label;

    activeAlbumsData.forEach((album, idx) => {
        const imageCount = album.images.length;

        // ON-THE-FLY LANGUAGE CHECK (Falls back to English if something is missing)
        const displayTitle = album.title[currentLang] || album.title['en'];
        const displayDesc = album.description[currentLang] || album.description['en'];

        // =========================================================
        // 👇 NEW: FEATURED PHOTOS GENERATION LOGIC
        // =========================================================
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
                
                // Clicking the individual photo takes them straight to that photo's album gallery!
                photoCard.onclick = () => openGallery(idx);
                featuredPhotosContainer.appendChild(photoCard);
            });
        }
        // =========================================================

        // Portfolio View Card Component Construction
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800";
        card.onclick = () => openGallery(idx);
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

        // Featured Item Element Generation Logic
        if (album.featured) {
            const featuredCard = document.createElement('div');

            // 👇 ADDED 'mb-8' TO THE CLASS LIST HERE TO ENFORCE GAPS WHEN STACKED
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
                        <button onclick="openGallery(${idx})" class="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2">
                            <i class="fas fa-images"></i> <span>${translations[currentLang].view_album}</span>
                        </button>
                    </div>
                </div>
            `;
            featuredContainer.appendChild(featuredCard);
        }
    });

    // Run your standard translator for static text elements (nav, hero, footer)
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

// CONSTANTS FOR SCROLL TUNING
const MIN_SCALE = 1.0;
const MAX_SCALE = 4.0;
const SCALE_STEP = 0.5;

// --- MOBILE & TRACKPAD SWIPE NAVIGATION ---
let touchStartX = 0;
let touchEndX = 0;

// The minimum distance (in pixels) a finger must slide to count as an intentional swipe
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

// 1. SWIPE ROUTER: Hands off to central animation engine
function handleSwipeGesture() {
    if (isZoomed) return; 
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance < -SWIPE_THRESHOLD) {
        animateImageSwitch('next'); // 👈 Left swipe means NEXT
    } else if (swipeDistance > SWIPE_THRESHOLD) {
        animateImageSwitch('prev'); // 👈 Right swipe means PREV
    }
}

// 2. CENTRAL ANIMATION ENGINE: Now services swipes, clicks, AND keys!
function animateImageSwitch(direction) {
    if (isZoomed) return;
    const img = document.getElementById('lightbox-img');
    if (!img || currentAlbumImages.length <= 1) return;

    // Pick target classes based on movement vector
    const exitClass = direction === 'next' ? 'lightbox-swipe-left' : 'lightbox-swipe-right';
    const enterClass = direction === 'next' ? 'lightbox-enter-right' : 'lightbox-enter-left';

    // Slide current image out
    img.className = `max-w-full max-h-full object-contain rounded shadow-2xl ${exitClass}`;
    
    setTimeout(() => {
        // Swap core data index paths halfway through transit
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % currentAlbumImages.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
        }
        updateLightboxImage(); // Changes .src & text layout
        
        // Snap new image quietly outside opposite screen border 
        img.className = `max-w-full max-h-full object-contain rounded shadow-2xl ${enterClass}`;
        
        // Glide it beautifully into center screen view
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

    document.getElementById('gallery-title').textContent = album.title[currentLang] || album.title['en'];
    document.getElementById('gallery-description').textContent = album.description[currentLang] || album.description['en'];
    
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

    navigate(`gallery-${albumIndex}`);
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
    
    // Note: We don't want resetZoom wiping out our anim classes during mid-slide transitions,
    // so we manually clear transforms and scale instead of hard-resetting className!
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

// --- DRAGGING ENGINE (HOLD MOUSE & MOVE) ---
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

// --- BACKWARD COMPATIBLE CORE TOGGLES ---
function nextImage(e) { if (e && e.stopPropagation) e.stopPropagation(); animateImageSwitch('next'); }
function prevImage(e) { if (e && e.stopPropagation) e.stopPropagation(); animateImageSwitch('prev'); }

// --- EVENT MANAGEMENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // Read the current path from the URL bar on load/refresh
    const currentPath = window.location.pathname; // e.g., "/gallery-0" or "/about"
    
    // Clean up the string to find your router ID
    const targetPage = currentPath.replace('/', '') || 'home';
    
    // If it's a gallery path, parse out the index and open it up!
    if (targetPage.startsWith('gallery-')) {
        const albumIndex = parseInt(targetPage.split('-')[1], 10);
        openGallery(albumIndex);
    } else {
        // Otherwise, navigate to the standard text page view
        navigate(targetPage); 
    }
    
    if (!lightbox || !img) return;

    const closeAction = () => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = ''; 
        resetZoom();
    };

    // Global Click Wireups
    if (closeBtn) closeBtn.onclick = closeAction;
    if (prevBtn) prevBtn.onclick = prevImage;
    if (nextBtn) nextBtn.onclick = nextImage;
    
    // Precision Mouse Mechanics
    img.onclick = handleImageClick;
    img.onwheel = handleImageScroll;
    img.onmousedown = startDrag;
    window.onmousemove = processDrag; // Window bound guarantees smooth edge tracks
    window.onmouseup = endDrag;

    // Click backdrop to close
    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target.id === 'lightbox-frame') {
            closeAction();
        }
    };

    // Keyboard Hotkeys
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

// Force the UI to update whenever the user moves back or forward in history
window.addEventListener('popstate', () => {
    // 1. Read the clean path name from the address bar, strip symbols, default to home
    let currentPath = window.location.pathname.replace('/', '') || 'home';
    
    // 2. Handle gallery view paths (e.g., "gallery-0" needs to map back to the portfolio layout)
    if (currentPath.startsWith('gallery-')) {
        currentPath = 'portfolio';
    }

    // 3. Strip the 'active' class from all pages to hide them
    document.querySelectorAll('.page-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // 4. Find the matching page panel and make it visible
    const targetPage = document.getElementById(currentPath);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        // Fallback: If a path is unrecognized, safely show the home panel
        const homePage = document.getElementById('home');
        if (homePage) homePage.classList.add('active');
    }
    
    // 5. Keep the smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});