/* ==========================================================================
   EKSPLOR TANGGAMUS - Main JavaScript Application (Enhanced Animations)
   ========================================================================== */

// ─── App State ───────────────────────────────────────────────────────────────
let dataWisataGlobal = [];
let favoriteIds       = JSON.parse(localStorage.getItem('tanggamus_favs')) || [];
let currentCategory   = 'Semua';
let currentSearchKeyword = '';
let currentSort       = 'default';
let currentPriceFilter  = 'all';
let currentRatingFilter = 'all';
let showOnlyFavorites = false;

// ─── PWA & Service Worker ──────────────────────────────────────────────────
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(reg => {
                console.log('PWA ServiceWorker registered with scope:', reg.scope);
            }).catch(err => {
                console.warn('PWA ServiceWorker registration failed:', err);
            });
        });

        window.addEventListener('offline', () => {
            showToast('⚡ Mode Offline: Menggunakan data tersimpan (cache)', 'fa-wifi');
        });
        window.addEventListener('online', () => {
            showToast('🌐 Koneksi terhubung kembali!', 'fa-wifi');
        });
    }
}

// ─── DOM References ───────────────────────────────────────────────────────────
const preloader      = document.getElementById('preloader');
const listKontainer  = document.getElementById('destinasi-list');
const searchInput    = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const sortSelect     = document.getElementById('sortSelect');
const filterBtns     = document.querySelectorAll('.btn-pill');
const resultsTitle   = document.getElementById('resultsTitle');
const resultsCount   = document.getElementById('resultsCount');
const favBadgeCount  = document.getElementById('favBadgeCount');
const btnFavoritesTab= document.getElementById('btnFavoritesTab');
const btnViewAll     = document.getElementById('btnViewAll');
const btnViewFavOnly = document.getElementById('btnViewFavOnly');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const navToggle      = document.getElementById('navToggle');
const navLinks       = document.getElementById('navLinks');
const modal          = document.getElementById('detailModal');
const modalBody      = document.getElementById('modalBody');
const modalCloseBtn  = document.getElementById('modalCloseBtn');
const statTotalDestinasi = document.getElementById('statTotalDestinasi');
const statRating     = document.getElementById('statRating');
const statAsri       = document.getElementById('statAsri');
const scrollProgressBar = document.getElementById('scrollProgressBar');
const btnBackToTop   = document.getElementById('btnBackToTop');
const progressRingCircle = document.getElementById('progressRingCircle');
const toastContainer = document.getElementById('toastContainer');

// ─── Fallback Data ────────────────────────────────────────────────────────────
const defaultDataWisata = [
  { id:1, nama:"Pantai Gigi Hiu (Pegadungan)", kategori:"Pantai", lokasi:"Kecamatan Kelumbayan", deskripsi:"Gugusan batu karang tajam nan eksotis yang menjulang tinggi di tepi Samudra Hindia. Destinasi impian fotografer dengan pemandangan ombak memecah karang yang spektakuler.", harga_tiket:15000, rating:4.8, fasilitas:["Spot Foto","Area Parkir","Toilet Umum","Warung Lokal"], gambar:"gigi-hiu.jpg", rekomendasi:true },
  { id:2, nama:"Teluk Kiluan", kategori:"Alam", lokasi:"Kecamatan Kelumbayan", deskripsi:"Habitat alami lumba-lumba hidung botol dan lumba-lumba paruh panjang. Nikmati sensasi berlayar dengan perahu cadik di laut lepas sambil menyapa lumba-lumba melompat gembira.", harga_tiket:20000, rating:4.9, fasilitas:["Sewa Perahu Cadik","Penginapan","Pemandu Lokal","Spot Snorkeling"], gambar:"kiluan.jpg", rekomendasi:true },
  { id:3, nama:"Air Terjun Way Lalaan", kategori:"Air Terjun", lokasi:"Kecamatan Kota Agung Timur", deskripsi:"Air Terjun bertingkat bersejarah yang berada tepat di kaki Gunung Tanggamus. Dikelilingi pepohonan hijau rindang dengan gemericik air jernih yang menyegarkan.", harga_tiket:10000, rating:4.5, fasilitas:["Kamar Ganti","Mushola","Kantin & Gazebo","Area Bermain"], gambar:"way-lalaan.jpg", rekomendasi:false },
  { id:4, nama:"Bendungan Batutegi", kategori:"Edukasi", lokasi:"Kecamatan Air Naningan", deskripsi:"Bendungan terbesar di Asia Tenggara yang menyuguhkan panorama perbukitan hijau megah dan hamparan air danau buatan seluas mata memandang.", harga_tiket:5000, rating:4.4, fasilitas:["Rest Area","Spot Foto Panorama","Perahu Wisata"], gambar:"batutegi.jpg", rekomendasi:false },
  { id:5, nama:"Taman Wisau Muara Indah", kategori:"Taman Kota", lokasi:"Kecamatan Kota Agung", deskripsi:"Taman terbuka hijau di tepi pantai pesisir Kota Agung dengan ikon patung lumba-lumba raksasa. Tempat bersantai favorit keluarga untuk menikmati matahari terbenam.", harga_tiket:5000, rating:4.2, fasilitas:["Jogging Track","Food Court","Area Bermain","Bumi Perkemahan"], gambar:"muara-indah.jpg", rekomendasi:false },
  { id:6, nama:"Gunung Tanggamus", kategori:"Petualangan", lokasi:"Kecamatan Gisting", deskripsi:"Jalur pendakian gunung eksotis yang terkenal dengan Hutan Lumut (Mossy Forest) mistis dan hawa dingin menyegarkan di puncaknya.", harga_tiket:15000, rating:4.7, fasilitas:["Basecamp Pendakian","Pos Perizinan SIMAKSI","Sumber Air Alami"], gambar:"gunung-tanggamus.jpg", rekomendasi:true }
];

// ─── App Init ─────────────────────────────────────────────────────────────────
async function initApp() {
    try { initTheme(); } catch (e) { console.warn("Theme init error:", e); }
    try { initCustomCursor(); } catch (e) { console.warn("Cursor init error:", e); }
    try { initWaterSplashCursor(); } catch (e) { console.warn("Water cursor init error:", e); }
    try { initHeroVideoControl(); } catch (e) { console.warn("Hero video init error:", e); }
    try { initScrollEffects(); } catch (e) { console.warn("Scroll effects init error:", e); }
    try { initScrollReveal(); } catch (e) { console.warn("Scroll reveal init error:", e); }
    try { initGameLauncher(); } catch (e) { console.warn("Game launcher init error:", e); }
    try { initTypingGame(); } catch (e) { console.warn("Typing game init error:", e); }
    try { initQuizGame(); } catch (e) { console.warn("Quiz game init error:", e); }
    try { initShooterGame(); } catch (e) { console.warn("Shooter game init error:", e); }
    try { initWeatherSystem(); } catch (e) { console.warn("Weather init error:", e); }
    try { initLanguageSwitcher(); } catch (e) { console.warn("Language switcher init error:", e); }
    try { initLightbox(); } catch (e) { console.warn("Lightbox init error:", e); }
    try { initEmergencyModal(); } catch (e) { console.warn("Emergency modal init error:", e); }
    try { initCompareModal(); } catch (e) { console.warn("Compare modal init error:", e); }
    try { initNavToolsOverflow(); } catch (e) { console.warn("Nav overflow init error:", e); }
    try { initServiceWorker(); } catch (e) { console.warn("Service worker init error:", e); }
    try { updateFavBadge(); } catch (e) { console.warn("Fav badge error:", e); }
    try { tampilkanSkeletonLoader(); } catch (e) { console.warn("Skeleton loader error:", e); }

    try {
        await muatDataWisata();
    } catch (e) {
        console.warn("Data wisata load error:", e);
    }
    
    try {
        setupEventListeners();
    } catch (e) {
        console.warn("Event listeners error:", e);
    }

    try { initBudgetPlanner(); } catch (e) { console.warn("Budget planner init error:", e); }
    try { initCulinarySection(); } catch (e) { console.warn("Culinary section init error:", e); }
    try { initInteractiveMap(); } catch (e) { console.warn("Interactive map init error:", e); }

    // Dismiss preloader smoothly
    setTimeout(sembunyikanPreloader, 350);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  THEME INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════
function initTheme() {
    const savedTheme = localStorage.getItem('tanggamus_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn) {
        const ic = themeToggleBtn.querySelector('i');
        if (ic) ic.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
function showToast(message, iconClass = 'fa-circle-info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color:#38bdf8;"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HEART BURST SPARKLE PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════
function triggerHeartBurst(element) {
    if (!element) return;
    element.classList.add('burst');
    setTimeout(() => element.classList.remove('burst'), 600);

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = ['#ef4444', '#f43f5e', '#fb7185', '#fda4af', '#38bdf8', '#fbbf24'];
    const count = 12;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'heart-sparkle-particle';
        p.innerHTML = i % 2 === 0 ? '❤️' : '✨';
        
        const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distance = Math.random() * 45 + 30;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        p.style.left = `${centerX}px`;
        p.style.top = `${centerY}px`;
        p.style.setProperty('--dx', `${dx}px`);
        p.style.setProperty('--dy', `${dy}px`);
        p.style.fontSize = `${Math.random() * 8 + 10}px`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 850);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CELEBRATION CONFETTI CANNON
// ═══════════════════════════════════════════════════════════════════════════════
function triggerConfetti() {
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100vw';
    confettiCanvas.style.height = '100vh';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999999';
    document.body.appendChild(confettiCanvas);

    const ctx = confettiCanvas.getContext('2d');
    let width = confettiCanvas.width = window.innerWidth;
    let height = confettiCanvas.height = window.innerHeight;

    const colors = ['#0284c7', '#38bdf8', '#10b981', '#34d399', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const confettiPieces = [];

    for (let i = 0; i < 90; i++) {
        confettiPieces.push({
            x: width * 0.5 + (Math.random() * 100 - 50),
            y: height * 0.5 + (Math.random() * 100 - 50),
            vx: (Math.random() - 0.5) * 14,
            vy: Math.random() * -14 - 4,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.35,
            alpha: 1,
            decay: Math.random() * 0.01 + 0.008
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, width, height);
        let alive = 0;

        for (let i = 0; i < confettiPieces.length; i++) {
            const p = confettiPieces[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            if (p.alpha > 0) {
                alive++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        }

        if (alive > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiCanvas.remove();
        }
    }
    requestAnimationFrame(animateConfetti);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCROLL EFFECTS & PROGRESS BAR & BACK TO TOP
// ═══════════════════════════════════════════════════════════════════════════════
function initScrollEffects() {
    const circumference = 2 * Math.PI * 20; // radius = 20 -> ~125.66
    if (progressRingCircle) {
        progressRingCircle.style.strokeDasharray = `${circumference}`;
        progressRingCircle.style.strokeDashoffset = `${circumference}`;
    }

    function onScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;

        // 1. Update top progress bar
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${progress * 100}%`;
        }

        // 2. Update Back to top button
        if (btnBackToTop) {
            if (scrollTop > 350) {
                btnBackToTop.classList.add('visible');
            } else {
                btnBackToTop.classList.remove('visible');
            }
            if (progressRingCircle) {
                progressRingCircle.style.strokeDashoffset = `${circumference * (1 - progress)}`;
            }
        }

        // 3. Highlight Active Navigation Link on Scroll
        const sections = document.querySelectorAll('header[id], section[id], main[id]');
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (scrollTop >= secTop && scrollTop < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        if (currentSectionId) {
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else if (href && href.startsWith('#')) {
                    link.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btnBackToTop) {
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCROLL REVEAL (IntersectionObserver)
// ═══════════════════════════════════════════════════════════════════════════════
function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NUMBER COUNTER ANIMATION FOR HERO
// ═══════════════════════════════════════════════════════════════════════════════
function animateCounters() {
    function countUp(element, target, duration = 1400, suffix = '', decimals = 0) {
        if (!element) return;
        const start = 0;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * ease;
            element.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    const totalCount = dataWisataGlobal.length > 0 ? dataWisataGlobal.length : 6;
    if (statTotalDestinasi) countUp(statTotalDestinasi, totalCount, 1200, '+');
    if (statRating) countUp(statRating, 4.8, 1400, ' ★', 1);
    if (statAsri) countUp(statAsri, 100, 1600, '%');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3D CARD TILT & MAGNETIC LIGHTING
// ═══════════════════════════════════════════════════════════════════════════════
function initCard3DTilt() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // Ensure glare element exists
        if (!card.querySelector('.card-glare')) {
            const glare = document.createElement('div');
            glare.className = 'card-glare';
            card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const tiltX = (y - 0.5) * -12;
            const tiltY = (x - 0.5) * 12;

            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
            card.style.setProperty('--mouse-x', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${(y * 100).toFixed(1)}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME LAUNCHER (Dropdown)
// ═══════════════════════════════════════════════════════════════════════════════
function initGameLauncher() {
    const btnLauncher  = document.getElementById('btnGameLauncher');
    const dropdown     = document.getElementById('gameDropdown');
    const btnTypingGame= document.getElementById('btnTypingGame');
    const btnQuizGame  = document.getElementById('btnQuizGame');

    if (!btnLauncher || !dropdown) return;

    btnLauncher.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        btnLauncher.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        btnLauncher.classList.remove('active');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());

    if (btnTypingGame) {
        btnTypingGame.addEventListener('click', () => {
            dropdown.classList.remove('show');
            btnLauncher.classList.remove('active');
            bukaTypingGame();
        });
    }
    if (btnQuizGame) {
        btnQuizGame.addEventListener('click', () => {
            dropdown.classList.remove('show');
            btnLauncher.classList.remove('active');
            bukaQuizGame();
        });
    }
    const btnShooterGame = document.getElementById('btnShooterGame');
    if (btnShooterGame) {
        btnShooterGame.addEventListener('click', () => {
            dropdown.classList.remove('show');
            btnLauncher.classList.remove('active');
            bukaShooterGame();
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME 1 — BELAJAR MENGETIK BAHASA INDONESIA
// ═══════════════════════════════════════════════════════════════════════════════
function initTypingGame() {
    const typingModal      = document.getElementById('typingGameModal');
    const typingClose      = document.getElementById('typingGameClose');
    const btnStartTyping   = document.getElementById('btnStartTyping');
    const btnRestartTyping = document.getElementById('btnRestartTyping');
    const typingInput      = document.getElementById('typingInput');
    const sentenceDisplay  = document.getElementById('typingSentenceDisplay');
    const timerElem        = document.getElementById('typingTimer');
    const wpmElem          = document.getElementById('typingWPM');
    const accuracyElem     = document.getElementById('typingAccuracy');
    const sentenceCountElem= document.getElementById('typingSentenceCount');
    const progressFill     = document.getElementById('typingProgressFill');
    const startScreen      = document.getElementById('typingStartScreen');
    const playScreen       = document.getElementById('typingGamePlay');
    const resultScreen     = document.getElementById('typingResultScreen');

    const kalimatList = [
        "Tanggamus adalah kabupaten yang kaya akan keindahan alam dan budaya.",
        "Pantai Gigi Hiu terkenal dengan batu karang tajam yang menjulang tinggi.",
        "Teluk Kiluan merupakan habitat alami lumba-lumba yang sangat indah.",
        "Air Terjun Way Lalaan terletak di kaki Gunung Tanggamus yang sejuk.",
        "Bendungan Batutegi adalah salah satu yang terbesar di Asia Tenggara.",
        "Wisatawan dapat menikmati keindahan alam Lampung yang memukau.",
        "Lumba-lumba di Teluk Kiluan sangat senang melompat di depan perahu.",
        "Gunung Tanggamus menawarkan jalur pendakian yang menantang dan indah.",
        "Kabupaten Tanggamus terletak di pesisir barat Provinsi Lampung.",
        "Setiap destinasi wisata Tanggamus memiliki keunikan dan daya tarik tersendiri.",
        "Festival budaya diadakan setiap tahun untuk melestarikan kearifan lokal.",
        "Pemandangan matahari terbenam di Pantai Muara Indah sangat memesona.",
        "Perahu cadik tradisional digunakan untuk mengarungi lautan Teluk Kiluan.",
        "Hutan lebat mengelilingi air terjun yang jernih dan menyegarkan.",
        "Pariwisata Tanggamus terus berkembang dan menarik minat wisatawan.",
        "Keramahan penduduk lokal menjadi daya tarik tersendiri bagi pengunjung.",
        "Budaya dan tradisi masyarakat Tanggamus sangat beragam dan kaya.",
        "Kopi Lampung merupakan salah satu komoditas unggulan daerah ini.",
        "Alam yang asri dan udara segar membuat Tanggamus nyaman dikunjungi.",
        "Indonesia memiliki ribuan pulau dengan keanekaragaman hayati yang luar biasa."
    ];

    let currentSentence    = '';
    let timerInterval      = null;
    let timeLeft           = 60;
    let totalCharsTyped    = 0;
    let totalCharsCorrect  = 0;
    let sentencesDone      = 0;
    let sentenceIndex      = 0;
    let isGameActive       = false;

    function shuffleSentences() {
        for (let i = kalimatList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [kalimatList[i], kalimatList[j]] = [kalimatList[j], kalimatList[i]];
        }
    }

    function loadNextSentence() {
        if (sentenceIndex >= kalimatList.length) {
            sentenceIndex = 0;
            shuffleSentences();
        }
        currentSentence = kalimatList[sentenceIndex++];
        renderSentence('');
        if (typingInput) {
            typingInput.value = '';
            typingInput.classList.remove('correct-input', 'wrong-input');
        }
    }

    function renderSentence(typed) {
        if (!sentenceDisplay) return;
        let html = '';
        for (let i = 0; i < currentSentence.length; i++) {
            const ch = currentSentence[i];
            if (i < typed.length) {
                const cls = typed[i] === ch ? 'char-correct' : 'char-wrong';
                html += `<span class="${cls}">${ch}</span>`;
            } else if (i === typed.length) {
                html += `<span class="char-pending char-cursor">${ch}</span>`;
            } else {
                html += `<span class="char-pending">${ch}</span>`;
            }
        }
        sentenceDisplay.innerHTML = html;
    }

    function startGame() {
        shuffleSentences();
        sentenceIndex    = 0;
        timeLeft         = 60;
        totalCharsTyped  = 0;
        totalCharsCorrect= 0;
        sentencesDone    = 0;
        isGameActive     = true;

        if (startScreen)  startScreen.style.display  = 'none';
        if (resultScreen) resultScreen.style.display = 'none';
        if (playScreen)   playScreen.style.display   = 'block';

        loadNextSentence();
        if (typingInput) { typingInput.value = ''; typingInput.focus(); }
        if (progressFill) progressFill.style.width = '0%';
        updateStats();

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timerElem) timerElem.textContent = timeLeft;
            if (progressFill) progressFill.style.width = `${((60 - timeLeft) / 60) * 100}%`;
            if (timeLeft <= 0) { clearInterval(timerInterval); endGame(); }
        }, 1000);
    }

    function endGame() {
        isGameActive = false;
        if (playScreen)   playScreen.style.display   = 'none';
        if (resultScreen) resultScreen.style.display = 'block';
        const finalWPM      = calculateWPM();
        const finalAccuracy = totalCharsTyped > 0 ? Math.round((totalCharsCorrect / totalCharsTyped) * 100) : 100;
        document.getElementById('resultWPM').textContent       = finalWPM;
        document.getElementById('resultAccuracy').textContent  = finalAccuracy + '%';
        document.getElementById('resultSentences').textContent = sentencesDone;

        // Trigger victory confetti on good attempt
        if (sentencesDone > 0 || finalWPM > 15) {
            triggerConfetti();
        }
    }

    function calculateWPM() {
        return Math.round((totalCharsCorrect / 5) / (60 / 60));
    }

    function updateStats() {
        const wpm      = calculateWPM();
        const accuracy = totalCharsTyped > 0 ? Math.round((totalCharsCorrect / totalCharsTyped) * 100) : 100;
        if (wpmElem)          wpmElem.textContent          = wpm;
        if (accuracyElem)     accuracyElem.textContent     = accuracy + '%';
        if (sentenceCountElem) sentenceCountElem.textContent = sentencesDone;
    }

    if (typingInput) {
        typingInput.addEventListener('input', () => {
            if (!isGameActive) return;
            const typed = typingInput.value;
            renderSentence(typed);

            totalCharsTyped = Math.max(totalCharsTyped, typed.length);
            let correct = 0;
            for (let i = 0; i < typed.length && i < currentSentence.length; i++) {
                if (typed[i] === currentSentence[i]) correct++;
            }
            totalCharsCorrect = Math.max(totalCharsCorrect, correct);

            if (typed === currentSentence) {
                sentencesDone++;
                totalCharsCorrect += currentSentence.length;
                showToast(`✨ Kalimat selesai! Total: ${sentencesDone}`, 'fa-check');
                loadNextSentence();
            }

            const isCorrectSoFar = currentSentence.startsWith(typed);
            typingInput.classList.toggle('correct-input', isCorrectSoFar && typed.length > 0);
            typingInput.classList.toggle('wrong-input', !isCorrectSoFar && typed.length > 0);
            updateStats();
        });
    }

    if (btnStartTyping)   btnStartTyping.addEventListener('click', startGame);
    if (btnRestartTyping) btnRestartTyping.addEventListener('click', startGame);
    if (typingClose) {
        typingClose.addEventListener('click', () => {
            clearInterval(timerInterval);
            isGameActive = false;
            if (typingModal) { typingModal.style.display = 'none'; document.body.style.overflow = 'auto'; }
            if (startScreen)  startScreen.style.display  = 'flex';
            if (playScreen)   playScreen.style.display   = 'none';
            if (resultScreen) resultScreen.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === typingModal) {
            clearInterval(timerInterval);
            typingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function bukaTypingGame() {
    const m = document.getElementById('typingGameModal');
    if (m) { m.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME 2 — TEBAK-TEBAKAN WISATA TANGGAMUS
// ═══════════════════════════════════════════════════════════════════════════════
function initQuizGame() {
    const quizModal      = document.getElementById('quizGameModal');
    const quizClose      = document.getElementById('quizGameClose');
    const btnStartQuiz   = document.getElementById('btnStartQuiz');
    const btnRestartQuiz = document.getElementById('btnRestartQuiz');
    const quizStartScreen  = document.getElementById('quizStartScreen');
    const quizPlayScreen   = document.getElementById('quizGamePlay');
    const quizResultScreen = document.getElementById('quizResultScreen');
    const quizQuestionNum  = document.getElementById('quizQuestionNum');
    const quizTimerElem    = document.getElementById('quizTimer');
    const quizScoreElem    = document.getElementById('quizScore');
    const quizTimerFill    = document.getElementById('quizTimerFill');
    const quizCategoryElem = document.getElementById('quizCategory');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsGrid  = document.getElementById('quizOptionsGrid');
    const quizFeedback     = document.getElementById('quizFeedback');

    const allSoal = [
        { kategori:"Destinasi", pertanyaan:"Di mana lokasi Pantai Gigi Hiu yang terkenal di Tanggamus?", jawaban:"Kecamatan Kelumbayan", pilihan:["Kecamatan Gisting","Kecamatan Kelumbayan","Kecamatan Kota Agung","Kecamatan Pulau Panggung"], penjelasan:"💡 <strong>Fakta Unik:</strong> Pantai Gigi Hiu terkenal dengan gugusan karang tajam mirip gigi hiu yang eksotis dan menjadi favorit fotografer lanskap dunia." },
        { kategori:"Fauna", pertanyaan:"Hewan apa yang terkenal menjadi daya tarik utama Teluk Kiluan?", jawaban:"Lumba-lumba", pilihan:["Penyu hijau","Lumba-lumba","Paus biru","Dugong"], penjelasan:"🐬 <strong>Fakta Unik:</strong> Teluk Kiluan adalah habitat alami koloni lumba-lumba Spinner dan Hidung Botol terbesar di Indonesia yang sering melompat bebas di laut." },
        { kategori:"Geografi", pertanyaan:"Kabupaten Tanggamus terletak di provinsi mana?", jawaban:"Lampung", pilihan:["Sumatera Selatan","Bengkulu","Lampung","Sumatera Barat"], penjelasan:"📍 <strong>Fakta Unik:</strong> Kabupaten Tanggamus terletak di pesisir selatan Provinsi Lampung, terkenal akan perpaduan spektakuler pantai dan pegunungan." },
        { kategori:"Infrastruktur", pertanyaan:"Bendungan terbesar di Asia Tenggara yang ada di Tanggamus bernama?", jawaban:"Batutegi", pilihan:["Batutegi","Jatiluhur","Sermo","Bilibili"], penjelasan:"🌊 <strong>Fakta Unik:</strong> Bendungan Batutegi di Ulubelu Tanggamus adalah bendungan batu berlipat terbesar di Asia Tenggara dengan panorama danau memukau." },
        { kategori:"Alam", pertanyaan:"Air Terjun Way Lalaan terletak di kaki gunung mana?", jawaban:"Gunung Tanggamus", pilihan:["Gunung Rajabasa","Gunung Seminung","Gunung Tanggamus","Gunung Betung"], penjelasan:"⛰️ <strong>Fakta Unik:</strong> Way Lalaan terletak di kaki Gunung Tanggamus (1.970 mdpl) dan memiliki 2 tingkat air terjun bertingkat yang dikelilingi taman asri." },
        { kategori:"Petualangan", pertanyaan:"Gunung Tanggamus terkenal dengan jalur pendakian melewati apa?", jawaban:"Hutan Lumut (Mossy Forest)", pilihan:["Hutan Bambu","Padang Savana","Hutan Lumut (Mossy Forest)","Hutan Mangrove"], penjelasan:"🌲 <strong>Fakta Unik:</strong> Puncak Gunung Tanggamus memiliki eksosistem Hutan Lumut (Mossy Forest) langka yang amat sejuk dan aromatis." },
        { kategori:"Budaya", pertanyaan:"Apa produk unggulan perkebunan yang terkenal dari Lampung?", jawaban:"Kopi", pilihan:["Teh","Kopi","Kakao","Lada"], penjelasan:"☕ <strong>Fakta Unik:</strong> Tanggamus adalah produsen Kopi Robusta kualitas ekspor terbesar di Lampung, terutama dari perkebunan dingin Ulubelu & Gisting." },
        { kategori:"Destinasi", pertanyaan:"Taman Wisata Muara Indah berlokasi di kecamatan mana?", jawaban:"Kecamatan Kota Agung", pilihan:["Kecamatan Kelumbayan","Kecamatan Gisting","Kecamatan Kota Agung","Kecamatan Air Naningan"], penjelasan:"⛲ <strong>Fakta Unik:</strong> Muara Indah berlokasi tepat di pesisir Kota Agung, menawarkan pemandangan sunset Teluk Semangka dan taman bermain warga." },
        { kategori:"Fauna", pertanyaan:"Jenis lumba-lumba apa yang hidup di Teluk Kiluan?", jawaban:"Lumba-lumba hidung botol", pilihan:["Lumba-lumba spinner","Lumba-lumba hidung botol","Lumba-lumba belang","Lumba-lumba irrawaddy"], penjelasan:"🐬 <strong>Fakta Unik:</strong> Selain lumba-lumba Spinner (Stenella longirostris), Teluk Kiluan juga dihuni lumba-lumba Hidung Botol yang amat ramah pada kapal perahu." },
        { kategori:"Harga Tiket", pertanyaan:"Berapa harga tiket masuk Teluk Kiluan?", jawaban:"Rp 20.000", pilihan:["Rp 10.000","Rp 15.000","Rp 20.000","Rp 25.000"], penjelasan:"🎟️ <strong>Fakta Unik:</strong> Tiket masuk Kiluan terjangkau (Rp 20.000), wisatawan bisa menyewa perahu ketinting nelayan untuk jelajah laut mencari lumba-lumba." },
        { kategori:"Destinasi", pertanyaan:"Ikon patung apa yang terkenal di Taman Wisata Muara Indah?", jawaban:"Lumba-lumba raksasa", pilihan:["Ikan paus","Penyu hijau","Lumba-lumba raksasa","Hiu martil"], penjelasan:"🐬 <strong>Fakta Unik:</strong> Taman Muara Indah memajang monumen patung lumba-lumba raksasa sebagai simbol kebanggaan wisata pesisir Tanggamus." },
        { kategori:"Geografi", pertanyaan:"Tanggamus berbatasan langsung dengan samudra apa?", jawaban:"Samudra Hindia", pilihan:["Samudra Atlantik","Samudra Pasifik","Samudra Hindia","Laut Jawa"], penjelasan:"🌊 <strong>Fakta Unik:</strong> Sisi selatan Tanggamus berhadapan langsung dengan Samudra Hindia, menciptakan garis pantai dengan ombak megah." },
        { kategori:"Alam", pertanyaan:"Fasilitas apa yang tersedia di Air Terjun Way Lalaan?", jawaban:"Mushola & Kantin", pilihan:["Hotel berbintang","Mushola & Kantin","Pusat perbelanjaan","Bioskop"], penjelasan:"🏞️ <strong>Fakta Unik:</strong> Way Lalaan dikelola secara tertata dengan fasilitas publik lengkap: jalur tangga beton, gazebo santai, mushola, & warung kuliner." },
        { kategori:"Petualangan", pertanyaan:"Apa yang dibutuhkan untuk mendaki Gunung Tanggamus secara resmi?", jawaban:"Perizinan SIMAKSI", pilihan:["Paspor wisata","Perizinan SIMAKSI","Visa pendakian","Kartu anggota"], penjelasan:"🥾 <strong>Fakta Unik:</strong> Pendaki wajib mengurus SIMAKSI & melapor ke pos registrasi lokal untuk keamanan dan perlindungan kelestarian hutan lumut." },
        { kategori:"Destinasi", pertanyaan:"Berapa rating destinasi Teluk Kiluan menurut data wisata?", jawaban:"4.9", pilihan:["4.5","4.7","4.8","4.9"], penjelasan:"⭐ <strong>Fakta Unik:</strong> Teluk Kiluan memegang posisi teratas destinasi wisata Tanggamus dengan rating konsisten 4.9 dari ulasan ribuan wisatawan." }
    ];

    let currentSoalIndex = 0;
    let score = 0;
    let correctCount = 0;
    let soalUrut = [];
    let quizTimerInterval = null;
    let timeLeft = 15;
    const highScore = () => parseInt(localStorage.getItem('tanggamus_quiz_highscore')) || 0;
    const TOTAL_SOAL = 10;

    function shuffleArr(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function startQuiz() {
        soalUrut     = shuffleArr(allSoal).slice(0, TOTAL_SOAL);
        currentSoalIndex = 0;
        score        = 0;
        correctCount = 0;

        if (quizStartScreen)  quizStartScreen.style.display  = 'none';
        if (quizResultScreen) quizResultScreen.style.display = 'none';
        if (quizPlayScreen)   quizPlayScreen.style.display   = 'block';
        if (quizScoreElem)    quizScoreElem.textContent       = 0;
        if (quizFeedback)   { quizFeedback.innerHTML = ''; quizFeedback.className = 'quiz-feedback'; }

        tampilkanSoal();
    }

    function tampilkanSoal() {
        if (currentSoalIndex >= soalUrut.length) { endQuiz(); return; }

        const soal = soalUrut[currentSoalIndex];
        if (quizQuestionNum)  quizQuestionNum.textContent  = `${currentSoalIndex + 1} / ${TOTAL_SOAL}`;
        if (quizCategoryElem) quizCategoryElem.textContent = soal.kategori;
        if (quizQuestionText) quizQuestionText.textContent = soal.pertanyaan;
        if (quizFeedback)   { quizFeedback.innerHTML = ''; quizFeedback.className = 'quiz-feedback'; }

        const shuffledPilihan = shuffleArr(soal.pilihan);
        if (quizOptionsGrid) {
            quizOptionsGrid.innerHTML = '';
            shuffledPilihan.forEach(pil => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.textContent = pil;
                btn.addEventListener('click', () => pilihJawaban(pil, soal.jawaban, soal.penjelasan));
                quizOptionsGrid.appendChild(btn);
            });
        }

        startSoalTimer();
    }

    function startSoalTimer() {
        timeLeft = 15;
        if (quizTimerElem) quizTimerElem.textContent = timeLeft;
        if (quizTimerFill) { quizTimerFill.style.width = '100%'; quizTimerFill.className = 'quiz-timer-fill'; }
        clearInterval(quizTimerInterval);

        quizTimerInterval = setInterval(() => {
            timeLeft--;
            if (quizTimerElem) quizTimerElem.textContent = timeLeft;
            if (quizTimerFill) quizTimerFill.style.width = `${(timeLeft / 15) * 100}%`;
            if (timeLeft <= 5 && quizTimerFill) quizTimerFill.classList.add('urgent');
            if (timeLeft <= 0) {
                clearInterval(quizTimerInterval);
                waktHabis();
            }
        }, 1000);
    }

    function waktHabis() {
        const soal = soalUrut[currentSoalIndex];
        if (quizOptionsGrid) {
            quizOptionsGrid.querySelectorAll('.quiz-option-btn').forEach(btn => {
                btn.disabled = true;
                if (btn.textContent === soal.jawaban) btn.classList.add('correct');
            });
        }
        if (quizFeedback) {
            quizFeedback.className = 'quiz-feedback wrong';
            quizFeedback.innerHTML = `
                <div class="qfb-header">⏰ Waktu habis! Jawaban: <strong>${soal.jawaban}</strong></div>
                <div class="qfb-fact">${soal.penjelasan || ''}</div>
            `;
        }
        setTimeout(() => { currentSoalIndex++; tampilkanSoal(); }, 3200);
    }

    function pilihJawaban(pilihan, jawaban, penjelasan) {
        clearInterval(quizTimerInterval);
        const isCorrect = pilihan === jawaban;

        if (quizOptionsGrid) {
            quizOptionsGrid.querySelectorAll('.quiz-option-btn').forEach(btn => {
                btn.disabled = true;
                if (btn.textContent === jawaban) btn.classList.add('correct');
                else if (btn.textContent === pilihan && !isCorrect) btn.classList.add('wrong');
            });
        }

        if (isCorrect) {
            const bonus = Math.ceil((timeLeft / 15) * 100);
            score += bonus;
            correctCount++;
            if (quizScoreElem) quizScoreElem.textContent = score;
            if (quizFeedback) {
                quizFeedback.className = 'quiz-feedback correct';
                quizFeedback.innerHTML = `
                    <div class="qfb-header">✅ Benar! +${bonus} poin (bonus kecepatan)</div>
                    <div class="qfb-fact">${penjelasan || ''}</div>
                `;
            }
        } else {
            if (quizFeedback) {
                quizFeedback.className = 'quiz-feedback wrong';
                quizFeedback.innerHTML = `
                    <div class="qfb-header">❌ Salah! Jawaban tepat: <strong>${jawaban}</strong></div>
                    <div class="qfb-fact">${penjelasan || ''}</div>
                `;
            }
        }

        setTimeout(() => { currentSoalIndex++; tampilkanSoal(); }, 3200);
    }

    function endQuiz() {
        clearInterval(quizTimerInterval);
        if (quizPlayScreen)   quizPlayScreen.style.display   = 'none';
        if (quizResultScreen) quizResultScreen.style.display = 'block';

        const hs = highScore();
        if (score > hs) localStorage.setItem('tanggamus_quiz_highscore', score);

        document.getElementById('quizFinalScore').textContent  = score;
        document.getElementById('quizCorrectCount').textContent= `${correctCount} / ${TOTAL_SOAL}`;
        document.getElementById('quizHighScore').textContent   = Math.max(score, hs);

        const pct = (correctCount / TOTAL_SOAL) * 100;
        let emoji = '😢', title = 'Perlu Belajar Lagi!', msg = 'Jangan menyerah, baca informasi wisata Tanggamus lebih banyak ya!';
        if (pct >= 90) { emoji = '🏆'; title = 'Luar Biasa! Master Wisata!'; msg = 'Pengetahuanmu tentang Tanggamus sangat hebat! Kamu layak jadi pemandu wisata profesional!'; }
        else if (pct >= 70) { emoji = '⭐'; title = 'Bagus Sekali!'; msg = 'Kamu cukup mengenal wisata Tanggamus. Terus eksplorasi dan kunjungi langsung destinasinya!'; }
        else if (pct >= 50) { emoji = '👍'; title = 'Lumayan!'; msg = 'Setengah soal berhasil dijawab. Yuk pelajari lebih banyak tentang keindahan Tanggamus!'; }

        document.getElementById('quizResultEmoji').textContent = emoji;
        document.getElementById('quizResultTitle').textContent = title;
        document.getElementById('quizResultMsg').textContent   = msg;

        if (pct >= 50) {
            triggerConfetti();
        }
    }

    if (btnStartQuiz)   btnStartQuiz.addEventListener('click', startQuiz);
    if (btnRestartQuiz) btnRestartQuiz.addEventListener('click', startQuiz);
    if (quizClose) {
        quizClose.addEventListener('click', () => {
            clearInterval(quizTimerInterval);
            if (quizModal) { quizModal.style.display = 'none'; document.body.style.overflow = 'auto'; }
            if (quizStartScreen)  quizStartScreen.style.display  = 'flex';
            if (quizPlayScreen)   quizPlayScreen.style.display   = 'none';
            if (quizResultScreen) quizResultScreen.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === quizModal) {
            clearInterval(quizTimerInterval);
            quizModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function bukaQuizGame() {
    const m = document.getElementById('quizGameModal');
    if (m) { m.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME 3 — PENJAGA LAUT TANGGAMUS (SHOOTER / TARGET ARCADE)
// ═══════════════════════════════════════════════════════════════════════════════
function initShooterGame() {
    const modal          = document.getElementById('shooterGameModal');
    const closeBtn       = document.getElementById('shooterGameClose');
    const startScreen    = document.getElementById('shooterStartScreen');
    const playScreen     = document.getElementById('shooterGamePlay');
    const resultScreen   = document.getElementById('shooterResultScreen');
    const btnStart       = document.getElementById('btnStartShooter');
    const btnRestart     = document.getElementById('btnRestartShooter');
    const timerElem      = document.getElementById('shooterTimer');
    const scoreElem      = document.getElementById('shooterScore');
    const comboElem      = document.getElementById('shooterCombo');
    const comboMeter     = document.getElementById('shooterComboMeter');
    const comboVal       = document.getElementById('shooterComboVal');
    const canvas         = document.getElementById('shooterCanvas');

    if (!canvas || !modal) return;
    const ctx = canvas.getContext('2d');

    let isGameRunning = false;
    let score = 0;
    let combo = 1;
    let maxCombo = 1;
    let trashCleaned = 0;
    let timeLeft = 45;
    let timerInterval = null;
    let spawnTimer = 0;
    let animFrameId = null;

    let width = 0;
    let height = 0;
    let mousePos = { x: -100, y: -100 };
    let targets = [];
    let particles = [];
    let floatingTexts = [];
    let lasers = [];

    // Synthesize Arcade Audio using Web Audio API
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSound(type) {
        try {
            const actx = getAudioContext();
            if (!actx) return;
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.connect(gain);
            gain.connect(actx.destination);
            const now = actx.currentTime;

            if (type === 'laser') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'hit') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'bonus') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                osc.frequency.setValueAtTime(783.99, now + 0.16);
                osc.frequency.setValueAtTime(1046.50, now + 0.24);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'penalty') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.setValueAtTime(110, now + 0.12);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
                osc.start(now);
                osc.stop(now + 0.28);
            }
        } catch (e) {
            // Audio context silently fails if restricted
        }
    }

    function resizeCanvas() {
        const rect = playScreen.getBoundingClientRect();
        width = canvas.width = rect.width || 720;
        height = canvas.height = rect.height || 420;
    }

    // Target Types Definitions
    const TARGET_TYPES = [
        { type: 'bottle', emoji: '🍾', points: 100, radius: 26, isTrash: true, speedMin: 1.2, speedMax: 2.2, color: '#38bdf8' },
        { type: 'can', emoji: '🥫', points: 150, radius: 24, isTrash: true, speedMin: 1.4, speedMax: 2.5, color: '#f59e0b' },
        { type: 'toxic', emoji: '🛢️', points: 300, radius: 30, isTrash: true, speedMin: 0.9, speedMax: 1.6, color: '#10b981' },
        { type: 'pearl', emoji: '🦪', points: 500, radius: 22, isTrash: true, isBonus: true, speedMin: 2.2, speedMax: 3.2, color: '#ec4899' },
        { type: 'dolphin', emoji: '🐬', points: -250, radius: 32, isTrash: false, speedMin: 1.5, speedMax: 2.4, color: '#38bdf8' },
        { type: 'turtle', emoji: '🐢', points: -200, radius: 28, isTrash: false, speedMin: 1.0, speedMax: 1.8, color: '#34d399' }
    ];

    class Target {
        constructor() {
            const rand = Math.random();
            let chosenDef = TARGET_TYPES[0];
            if (rand < 0.35) {
                chosenDef = TARGET_TYPES[0];
            } else if (rand < 0.60) {
                chosenDef = TARGET_TYPES[1];
            } else if (rand < 0.75) {
                chosenDef = TARGET_TYPES[2];
            } else if (rand < 0.83) {
                chosenDef = TARGET_TYPES[3];
            } else if (rand < 0.92) {
                chosenDef = TARGET_TYPES[4];
            } else {
                chosenDef = TARGET_TYPES[5];
            }

            Object.assign(this, chosenDef);
            this.x = Math.random() * (width - 100) + 50;
            this.y = height + 40;
            this.speed = Math.random() * (this.speedMax - this.speedMin) + this.speedMin;
            this.sway = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.04 + 0.02;
            this.swayAmplitude = Math.random() * 2.5 + 1.2;
            this.alive = true;
        }

        update() {
            this.y -= this.speed;
            this.sway += this.swaySpeed;
            this.x += Math.sin(this.sway) * this.swayAmplitude;

            if (this.x < 30) this.x = 30;
            if (this.x > width - 30) this.x = width - 30;

            if (this.y < -50) {
                this.alive = false;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);

            const rot = Math.sin(this.sway) * 0.15;
            ctx.rotate(rot);

            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
            ctx.fillStyle = this.isTrash ? (this.isBonus ? 'rgba(236, 72, 153, 0.25)' : 'rgba(56, 189, 248, 0.15)') : 'rgba(52, 211, 153, 0.2)';
            ctx.fill();

            ctx.font = `${this.radius * 1.5}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, 0, 2);

            ctx.restore();
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            this.size = Math.random() * 6 + 3;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.color = color;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.02;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.size *= 0.95;
            this.alpha -= this.decay;
        }
        draw() {
            if (this.alpha <= 0 || this.size <= 0.2) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fill();
            ctx.restore();
        }
    }

    class FloatingText {
        constructor(x, y, text, color) {
            this.x = x; this.y = y;
            this.text = text;
            this.color = color;
            this.alpha = 1;
            this.vy = -1.8;
            this.scale = 1.2;
        }
        update() {
            this.y += this.vy;
            this.alpha -= 0.022;
            this.scale = Math.max(0.9, this.scale * 0.98);
        }
        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.font = `bold ${Math.round(18 * this.scale)}px 'Plus Jakarta Sans', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    class LaserBeam {
        constructor(x1, y1, x2, y2, color) {
            this.x1 = x1; this.y1 = y1;
            this.x2 = x2; this.y2 = y2;
            this.color = color;
            this.alpha = 1;
        }
        update() {
            this.alpha -= 0.15;
        }
        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.stroke();
            ctx.restore();
        }
    }

    function shootAt(x, y) {
        if (!isGameRunning) return;

        const turretX = width / 2;
        const turretY = height;

        lasers.push(new LaserBeam(turretX, turretY, x, y, '#38bdf8'));
        playSound('laser');

        let hitSomething = false;

        for (let i = targets.length - 1; i >= 0; i--) {
            const t = targets[i];
            const dist = Math.hypot(x - t.x, y - t.y);

            if (dist <= t.radius + 10) {
                hitSomething = true;
                t.alive = false;

                for (let p = 0; p < 18; p++) {
                    particles.push(new Particle(t.x, t.y, t.color));
                }

                if (t.isTrash) {
                    trashCleaned++;
                    const earned = t.points * combo;
                    score += earned;
                    combo++;
                    if (combo > maxCombo) maxCombo = combo;

                    if (t.isBonus) {
                        timeLeft = Math.min(60, timeLeft + 5);
                        playSound('bonus');
                        floatingTexts.push(new FloatingText(t.x, t.y, `+${earned} ⏱️ +5s!`, '#ec4899'));
                        showToast('🦪 Mutiara Emas! +5 Detik Waktu!', 'fa-gem');
                    } else {
                        playSound('hit');
                        floatingTexts.push(new FloatingText(t.x, t.y, `+${earned}`, '#34d399'));
                    }

                    if (combo >= 3 && comboMeter && comboVal) {
                        comboMeter.style.display = 'block';
                        comboVal.textContent = combo;
                    }
                } else {
                    playSound('penalty');
                    score = Math.max(0, score + t.points);
                    combo = 1;
                    if (comboMeter) comboMeter.style.display = 'none';

                    floatingTexts.push(new FloatingText(t.x, t.y, `${t.points} 💔 JANGAN TEMBAK KAWAN!`, '#ef4444'));

                    playScreen.classList.add('wrong-input');
                    setTimeout(() => playScreen.classList.remove('wrong-input'), 400);
                }

                if (scoreElem) scoreElem.textContent = score;
                if (comboElem) comboElem.textContent = `x${combo}`;
                break;
            }
        }

        if (!hitSomething) {
            for (let p = 0; p < 8; p++) {
                particles.push(new Particle(x, y, 'rgba(56, 189, 248, 0.8)'));
            }
            if (combo > 1) {
                combo = Math.max(1, combo - 1);
                if (comboElem) comboElem.textContent = `x${combo}`;
                if (combo < 3 && comboMeter) comboMeter.style.display = 'none';
            }
        }
    }

    function gameLoop() {
        if (!isGameRunning) return;

        ctx.clearRect(0, 0, width, height);

        if (Math.random() < 0.15) {
            particles.push(new Particle(Math.random() * width, height, 'rgba(255, 255, 255, 0.4)'));
        }

        spawnTimer++;
        if (spawnTimer % 45 === 0 || (spawnTimer % 30 === 0 && timeLeft < 20)) {
            targets.push(new Target());
        }

        for (let i = targets.length - 1; i >= 0; i--) {
            const t = targets[i];
            t.update();
            t.draw();
            if (!t.alive) targets.splice(i, 1);
        }

        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.update();
            l.draw();
            if (l.alpha <= 0) lasers.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.alpha <= 0 || p.size <= 0.2) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.update();
            ft.draw();
            if (ft.alpha <= 0) floatingTexts.splice(i, 1);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height + 10, 45, Math.PI, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.restore();

        if (mousePos.x > 0 && mousePos.y > 0) {
            ctx.save();

            // Laser Sight Line from turret at bottom to aim target
            ctx.beginPath();
            ctx.moveTo(width / 2, height);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.strokeStyle = isTouchActive ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.3)';
            ctx.lineWidth = isTouchActive ? 2.5 : 1.5;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.translate(mousePos.x, mousePos.y);

            // Pulsing target ring for mobile touch feedback & precision aiming
            const baseRadius = isTouchActive ? 26 : 18;
            const pulseBonus = Math.sin(Date.now() * 0.01) * 3;

            // Outer Scope Ring
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius + pulseBonus, 0, Math.PI * 2);
            ctx.strokeStyle = isTouchActive ? '#f59e0b' : 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = isTouchActive ? 2.5 : 2;
            ctx.shadowBlur = isTouchActive ? 14 : 8;
            ctx.shadowColor = isTouchActive ? '#f59e0b' : '#38bdf8';
            ctx.stroke();

            // Inner Ring for Touch Precision
            if (isTouchActive) {
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Crosshair Hairlines
            const lineMin = isTouchActive ? 10 : 8;
            const lineMax = isTouchActive ? 32 : 24;
            ctx.beginPath();
            ctx.moveTo(-lineMax, 0); ctx.lineTo(-lineMin, 0);
            ctx.moveTo(lineMin, 0);  ctx.lineTo(lineMax, 0);
            ctx.moveTo(0, -lineMax); ctx.lineTo(0, -lineMin);
            ctx.moveTo(0, lineMin);  ctx.lineTo(0, lineMax);
            ctx.strokeStyle = isTouchActive ? '#f59e0b' : '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Center Red Bullseye Dot
            ctx.beginPath();
            ctx.arc(0, 0, isTouchActive ? 4 : 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            // Touch Target Tag for Mobile
            if (isTouchActive) {
                ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#000000';
                ctx.fillText("🎯 BIDIKAN SENTUH", 0, -36);
            }

            ctx.restore();
        }

        animFrameId = requestAnimationFrame(gameLoop);
    }

    function startShooterGame() {
        resizeCanvas();
        isGameRunning = true;
        score = 0;
        combo = 1;
        maxCombo = 1;
        trashCleaned = 0;
        timeLeft = 45;
        spawnTimer = 0;
        targets = [];
        particles = [];
        floatingTexts = [];
        lasers = [];

        if (startScreen)  startScreen.style.display  = 'none';
        if (resultScreen) resultScreen.style.display = 'none';
        if (playScreen)   playScreen.style.display   = 'block';
        if (comboMeter)   comboMeter.style.display   = 'none';

        if (scoreElem) scoreElem.textContent = '0';
        if (timerElem) timerElem.textContent = '45';
        if (comboElem) comboElem.textContent = 'x1';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timerElem) timerElem.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endShooterGame();
            }
        }, 1000);

        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function endShooterGame() {
        isGameRunning = false;
        clearInterval(timerInterval);
        if (animFrameId) cancelAnimationFrame(animFrameId);

        if (playScreen)   playScreen.style.display   = 'none';
        if (resultScreen) resultScreen.style.display = 'block';

        const hs = parseInt(localStorage.getItem('tanggamus_shooter_highscore')) || 0;
        if (score > hs) {
            localStorage.setItem('tanggamus_shooter_highscore', score);
        }

        document.getElementById('shooterFinalScore').textContent   = score;
        document.getElementById('shooterTrashCleaned').textContent = trashCleaned;
        document.getElementById('shooterHighScore').textContent    = Math.max(score, hs);

        let emoji = '🌊', title = 'Pembersihan Selesai!', msg = 'Terima kasih telah membantu membersihkan perairan Tanggamus!';
        if (score >= 3500) {
            emoji = '🏆'; title = 'Pahlawan Samudra Tanggamus!'; msg = 'Luar biasa! Teluk Kiluan kini bersih dan asri berkat ketepatan tembakanmu!';
        } else if (score >= 2000) {
            emoji = '🌟'; title = 'Penjaga Laut Handal!'; msg = 'Bagus sekali! Banyak sampah berhasil disingkirkan dari laut.';
        } else {
            emoji = '👍'; title = 'Usaha Yang Bagus!'; msg = 'Latih ketepatan menembakmu lagi untuk skor yang lebih tinggi!';
        }

        document.getElementById('shooterResultEmoji').textContent = emoji;
        document.getElementById('shooterResultTitle').textContent = title;
        document.getElementById('shooterResultMsg').textContent   = msg;

        if (score >= 1000) {
            triggerConfetti();
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        isTouchActive = false;
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    canvas.addEventListener('touchmove', (e) => {
        isTouchActive = true;
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mousePos.x = e.touches[0].clientX - rect.left;
            mousePos.y = e.touches[0].clientY - rect.top;
        }
    }, { passive: true });

    canvas.addEventListener('mousedown', (e) => {
        isTouchActive = false;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        shootAt(x, y);
    });

    canvas.addEventListener('touchstart', (e) => {
        isTouchActive = true;
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            mousePos.x = x;
            mousePos.y = y;
            shootAt(x, y);
        }
    }, { passive: true });

    if (btnStart)   btnStart.addEventListener('click', startShooterGame);
    if (btnRestart) btnRestart.addEventListener('click', startShooterGame);

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            isGameRunning = false;
            clearInterval(timerInterval);
            if (animFrameId) cancelAnimationFrame(animFrameId);
            if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
            if (startScreen)  startScreen.style.display  = 'flex';
            if (playScreen)   playScreen.style.display   = 'none';
            if (resultScreen) resultScreen.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            isGameRunning = false;
            clearInterval(timerInterval);
            if (animFrameId) cancelAnimationFrame(animFrameId);
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.addEventListener('resize', () => {
        if (isGameRunning) resizeCanvas();
    });
}

function bukaShooterGame() {
    const m = document.getElementById('shooterGameModal');
    if (m) {
        m.style.display = 'block';
        document.body.style.overflow = 'hidden';
        const canvas = document.getElementById('shooterCanvas');
        if (canvas) {
            const playContainer = document.getElementById('shooterGamePlay');
            if (playContainer) {
                const rect = playContainer.getBoundingClientRect();
                canvas.width = rect.width || 720;
                canvas.height = rect.height || 420;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BIOLUMINESCENT OCEAN & WATER SPLASH CANVAS
// ═══════════════════════════════════════════════════════════════════════════════
function initWaterSplashCursor() {
    const canvas = document.getElementById('waterCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const ripples = [];
    const ambientPlanktons = [];

    // Ambient floating marine plankton particles
    class AmbientPlankton {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.8;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = Math.random() * -0.5 - 0.15;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.maxAlpha = this.alpha;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;
            this.alpha = this.maxAlpha * (0.6 + 0.4 * Math.sin(this.pulsePhase));

            if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.y = height + 10;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 28; i++) {
        ambientPlanktons.push(new AmbientPlankton());
    }

    class WaterParticle {
        constructor(x, y, isSplash = false) {
            this.x = x; this.y = y;
            this.size = isSplash ? Math.random() * 5.5 + 3.5 : Math.random() * 3.5 + 1.5;
            const angle = Math.random() * Math.PI * 2;
            const speed = isSplash ? Math.random() * 5 + 2 : Math.random() * 1.4 + 0.4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed + (isSplash ? -0.8 : 0.3);
            this.alpha = 1;
            this.decay = isSplash ? Math.random() * 0.028 + 0.018 : Math.random() * 0.024 + 0.014;
            const colors = ['rgba(56,189,248,', 'rgba(52,211,153,', 'rgba(2,132,199,', 'rgba(224,242,254,', 'rgba(147,197,253,'];
            this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.size *= 0.96;
            this.alpha -= this.decay;
        }
        draw() {
            if (this.alpha <= 0 || this.size <= 0.2) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.colorBase + this.alpha + ')';
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(56,189,248,0.7)';
            ctx.fill();
            ctx.restore();
        }
    }

    class WaterRipple {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.radius = 4;
            this.maxRadius = Math.random() * 30 + 25;
            this.alpha = 0.9;
        }
        update() {
            this.radius += (this.maxRadius - this.radius) * 0.14;
            this.alpha -= 0.028;
        }
        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56,189,248,${this.alpha})`;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(56,189,248,0.5)';
            ctx.stroke();
            ctx.restore();
        }
    }

    let lastSpawn = 0;
    window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSpawn > 25) {
            particles.push(new WaterParticle(e.clientX, e.clientY, false));
            lastSpawn = now;
        }
    });

    window.addEventListener('click', (e) => {
        ripples.push(new WaterRipple(e.clientX, e.clientY));
        setTimeout(() => ripples.push(new WaterRipple(e.clientX, e.clientY)), 80);
        for (let i = 0; i < 14; i++) {
            particles.push(new WaterParticle(e.clientX, e.clientY, true));
        }
    });

    function renderLoop() {
        ctx.clearRect(0, 0, width, height);

        // Render ambient marine planktons
        for (let i = 0; i < ambientPlanktons.length; i++) {
            ambientPlanktons[i].update();
            ambientPlanktons[i].draw();
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0 || particles[i].size <= 0.2) particles.splice(i, 1);
        }

        for (let i = ripples.length - 1; i >= 0; i--) {
            ripples[i].update();
            ripples[i].draw();
            if (ripples[i].alpha <= 0) ripples.splice(i, 1);
        }

        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════════════════
function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
        requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, input, select, textarea, .card, .btn-pill, .btn-fav, .forecast-item, .game-dropdown-item')) {
            document.body.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, input, select, textarea, .card, .btn-pill, .btn-fav, .forecast-item, .game-dropdown-item')) {
            document.body.classList.remove('cursor-hover');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PRELOADER
// ═══════════════════════════════════════════════════════════════════════════════
function sembunyikanPreloader() {
    const p = document.getElementById('preloader') || preloader;
    if (p && !p.classList.contains('preloader-hidden')) {
        p.classList.add('preloader-hidden');
        p.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            p.style.display = 'none';
            animateCounters();
        }, 550);
    }
}

function tampilkanSkeletonLoader() {
    if (!listKontainer) return;
    listKontainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        listKontainer.innerHTML += `<div class="skeleton-card"><div class="skeleton-box skeleton-img"></div><div class="skeleton-box skeleton-title"></div><div class="skeleton-box skeleton-text"></div><div class="skeleton-box skeleton-btn"></div></div>`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA & RENDERING
// ═══════════════════════════════════════════════════════════════════════════════
async function muatDataWisata() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (Array.isArray(data)) {
            dataWisataGlobal = data;
        } else if (data && typeof data === 'object') {
            dataWisataGlobal = data.destinasi || defaultDataWisata;
            dataCulinaryGlobal = data.kuliner || [];
            dataTransportGlobal = data.rute_transportasi || [];
            dataEmergencyGlobal = data.kontak_darurat || [];
        } else {
            dataWisataGlobal = defaultDataWisata;
        }
    } catch (err) {
        console.warn("Using fallback data for wisata:", err);
        dataWisataGlobal = defaultDataWisata;
    }
    filterAndRender();
    if (typeof renderCulinary === 'function') renderCulinary(dataCulinaryGlobal);
    if (typeof renderTransport === 'function') renderTransport(dataTransportGlobal);
    if (typeof renderEmergencyGrid === 'function') renderEmergencyGrid(dataEmergencyGlobal);
    if (typeof window._populateCompareSelects === 'function') window._populateCompareSelects();
    if (typeof calculateBudget === 'function') calculateBudget();
}


function filterAndRender() {
    let result = [...dataWisataGlobal];
    if (showOnlyFavorites) {
        result = result.filter(d => favoriteIds.includes(d.id));
        if (resultsTitle) resultsTitle.textContent = 'Destinasi Favorit Saya ❤️';
    } else {
        if (currentCategory !== 'Semua') {
            result = result.filter(d => d.kategori && d.kategori.trim().toLowerCase() === currentCategory.trim().toLowerCase());
            if (resultsTitle) resultsTitle.textContent = `Kategori: ${currentCategory}`;
        } else {
            if (resultsTitle) resultsTitle.textContent = 'Semua Destinasi Wisata';
        }
    }
    if (currentPriceFilter !== 'all') {
        const maxP = parseFloat(currentPriceFilter);
        result = result.filter(d => d.harga_tiket <= maxP);
    }
    if (currentRatingFilter !== 'all') {
        const minR = parseFloat(currentRatingFilter);
        result = result.filter(d => d.rating >= minR);
    }
    if (currentSearchKeyword) {
        const kw = currentSearchKeyword.toLowerCase();
        result = result.filter(d =>
            (d.nama && d.nama.toLowerCase().includes(kw)) ||
            (d.deskripsi && d.deskripsi.toLowerCase().includes(kw)) ||
            (d.lokasi && d.lokasi.toLowerCase().includes(kw)) ||
            (d.kategori && d.kategori.toLowerCase().includes(kw)) ||
            (d.fasilitas && d.fasilitas.some(f => f.toLowerCase().includes(kw)))
        );
    }
    switch (currentSort) {
        case 'rating-desc': result.sort((a,b) => b.rating - a.rating); break;
        case 'price-asc':   result.sort((a,b) => a.harga_tiket - b.harga_tiket); break;
        case 'price-desc':  result.sort((a,b) => b.harga_tiket - a.harga_tiket); break;
        case 'name-asc':    result.sort((a,b) => a.nama.localeCompare(b.nama)); break;
        default: result.sort((a,b) => (b.rekomendasi?1:0) - (a.rekomendasi?1:0) || b.rating - a.rating);
    }
    if (resultsCount) resultsCount.textContent = `Menampilkan ${result.length} dari ${dataWisataGlobal.length} destinasi`;
    tampilkanKeLayar(result);
}

function tampilkanKeLayar(list) {
    if (!listKontainer) return;
    listKontainer.innerHTML = '';
    if (!list || list.length === 0) {
        const qt = currentSearchKeyword ? ` dengan kata kunci "${currentSearchKeyword}"` : '';
        const ft = showOnlyFavorites ? ' di daftar favorit Anda' : '';
        const pt = currentPriceFilter !== 'all' ? ` (Harga ≤ Rp ${parseInt(currentPriceFilter).toLocaleString('id-ID')})` : '';
        const rt = currentRatingFilter !== 'all' ? ` (Rating ≥ ${currentRatingFilter})` : '';
        listKontainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-wrap"><i class="fa-solid fa-face-sad-tear"></i></div>
                <h3>Destinasi Tidak Ditemukan</h3>
                <p>Tidak ada tempat wisata yang cocok${qt}${ft}${pt}${rt}.</p>
                <button class="btn-detail" onclick="resetFilters()" style="margin-top:16px;">
                    <i class="fa-solid fa-rotate-left"></i> <span data-i18n="btn_reset_filters">Reset Semua Filter</span>
                </button>
            </div>`;
        return;
    }

    list.forEach((item, index) => {
        const isFav = favoriteIds.includes(item.id);
        const rp = item.harga_tiket === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(item.harga_tiket);
        const fac = item.fasilitas ? item.fasilitas.slice(0,3).map(f=>`<span class="facility-chip"><i class="fa-solid fa-check"></i> ${f}</span>`).join('') : '';
        const delay = Math.min(index * 70, 500);

        listKontainer.innerHTML += `
        <article class="card card-enter" style="animation-delay: ${delay}ms;">
            <div class="card-glare"></div>
            <div class="card-image-wrap" onclick="bukaDetail(${item.id})">
                <img src="Gambar/${item.gambar}" alt="Foto ${item.nama}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';">
                <div class="card-badges">
                    ${item.rekomendasi ? '<span class="badge-featured"><i class="fa-solid fa-fire"></i> Rekomendasi</span>' : ''}
                    <span class="badge-category">${item.kategori}</span>
                </div>
            </div>
            <button class="btn-fav ${isFav?'active':''}" onclick="toggleFavorite(event,${item.id})" aria-label="${isFav?'Hapus dari Favorit':'Tambah ke Favorit'}">
                <i class="fa-${isFav?'solid':'regular'} fa-heart"></i>
            </button>
            <div class="card-content" onclick="bukaDetail(${item.id})">
                <div class="card-meta">
                    <span class="card-location"><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${item.lokasi}</span>
                    <span class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
                </div>
                <h3 class="card-title">${item.nama}</h3>
                <p class="card-desc">${item.deskripsi}</p>
                <div class="card-facilities">${fac}</div>
                <div class="card-footer">
                    <div><span class="card-price-label">Tiket Masuk</span><span class="card-price-value">${rp}</span></div>
                    <button class="btn-detail" onclick="bukaDetail(${item.id})">Lihat Detail <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </article>`;
    });

    // Re-initialize 3D Card Tilts
    initCard3DTilt();
}

function resetFilters() {
    currentSearchKeyword = '';
    currentCategory = 'Semua';
    currentSort = 'default';
    currentPriceFilter = 'all';
    currentRatingFilter = 'all';
    showOnlyFavorites = false;

    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    if (sortSelect) sortSelect.value = 'default';

    const priceSelect = document.getElementById('priceSelect');
    if (priceSelect) priceSelect.value = 'all';

    const ratingSelect = document.getElementById('ratingSelect');
    if (ratingSelect) ratingSelect.value = 'all';

    filterBtns.forEach(btn => {
        const s = btn.dataset.category === 'Semua';
        btn.classList.toggle('active', s);
        btn.setAttribute('aria-selected', s ? 'true' : 'false');
    });

    if (btnViewAll) btnViewAll.classList.add('active');
    if (btnViewFavOnly) btnViewFavOnly.classList.remove('active');

    filterAndRender();
    if (typeof showToast === 'function') showToast('Semua filter telah direset.', 'fa-rotate-left');
}
window.resetFilters = resetFilters;

function toggleFavorite(event, id) {
    if (event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        if (btn) triggerHeartBurst(btn);
    }
    const idx = favoriteIds.indexOf(id);
    const item = dataWisataGlobal.find(d => d.id === id);
    const itemName = item ? item.nama : 'Destinasi';

    if (idx > -1) {
        favoriteIds.splice(idx, 1);
        showToast(`Dihapus dari favorit: ${itemName}`, 'fa-heart-crack');
    } else {
        favoriteIds.push(id);
        showToast(`❤️ Ditambahkan ke favorit: ${itemName}`, 'fa-heart');
    }

    localStorage.setItem('tanggamus_favs', JSON.stringify(favoriteIds));
    updateFavBadge();
    filterAndRender();
    if (modal && modal.dataset.activeId == id) bukaDetail(id);
}

function updateFavBadge() {
    if (favBadgeCount) {
        favBadgeCount.textContent = favoriteIds.length;
        favBadgeCount.style.display = favoriteIds.length > 0 ? 'flex' : 'none';
    }
}

function bukaDetail(id) {
    const item = dataWisataGlobal.find(d => d.id === id);
    if (!item || !modal || !modalBody) return;
    modal.dataset.activeId = id;
    const isFav = favoriteIds.includes(item.id);
    const rp = item.harga_tiket === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(item.harga_tiket);
    const fac = item.fasilitas ? item.fasilitas.map(f=>`<span class="modal-facility-badge"><i class="fa-solid fa-circle-check"></i> ${f}</span>`).join('') : '<span>Tidak tercantum</span>';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.nama+' '+item.lokasi+' Tanggamus')}`;
    const waUrl   = `https://api.whatsapp.com/send?text=${encodeURIComponent('Yuk jalan-jalan ke '+item.nama+' di Tanggamus!')}`;
    
    modalBody.innerHTML = `
        <img class="modal-hero-img" src="Gambar/${item.gambar}" alt="Foto ${item.nama}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';">
        <div class="modal-body">
            <div class="modal-header-meta">
                <span class="badge-category" style="background:var(--primary);font-size:0.82rem;">${item.kategori}</span>
                <span class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating} / 5.0</span>
            </div>
            <h2 class="modal-title" id="modalTitle">${item.nama}</h2>
            <p class="modal-location-text"><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${item.lokasi}, Kab. Tanggamus</p>
            <div class="modal-grid-info">
                <div class="info-box"><i class="fa-solid fa-ticket"></i><div><label>Tiket Masuk</label><span>${rp}</span></div></div>
                <div class="info-box"><i class="fa-solid fa-shield-halved"></i><div><label>Status</label><span>${item.rekomendasi?'🔥 Populer':'📌 Destinasi Alam'}</span></div></div>
            </div>
            <h4 class="modal-section-title">Deskripsi Destinasi</h4>
            <p class="modal-desc-text">${item.deskripsi}</p>
            <h4 class="modal-section-title">Fasilitas Tersedia</h4>
            <div class="modal-facilities-list">${fac}</div>
            <div class="modal-actions">
                <a href="${mapsUrl}" target="_blank" class="btn-action-primary"><i class="fa-solid fa-diamond-turn-right"></i> Petunjuk Arah</a>
                <a href="${waUrl}" target="_blank" class="btn-action-secondary"><i class="fa-brands fa-whatsapp" style="color:#25D366;font-size:1.2rem;"></i> Bagikan</a>
                <button class="btn-action-secondary" onclick="toggleFavorite(event,${item.id})">
                    <i class="fa-${isFav?'solid':'regular'} fa-heart" style="color:#ef4444;"></i> ${isFav?'Tersimpan':'Simpan'}
                </button>
            </div>
        </div>`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function tutupModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchKeyword = e.target.value.trim();
            if (searchClearBtn) searchClearBtn.style.display = currentSearchKeyword ? 'block' : 'none';
            filterAndRender();
        });
    }
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentSearchKeyword = '';
            searchClearBtn.style.display = 'none';
            filterAndRender();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndRender();
        });
    }
    const priceSelect = document.getElementById('priceSelect');
    if (priceSelect) {
        priceSelect.addEventListener('change', (e) => {
            currentPriceFilter = e.target.value;
            filterAndRender();
        });
    }
    const ratingSelect = document.getElementById('ratingSelect');
    if (ratingSelect) {
        ratingSelect.addEventListener('change', (e) => {
            currentRatingFilter = e.target.value;
            filterAndRender();
        });
    }
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
            const t = e.currentTarget;
            t.classList.add('active');
            t.setAttribute('aria-selected','true');
            currentCategory = t.dataset.category || 'Semua';
            showOnlyFavorites = false;
            if (btnViewAll) btnViewAll.classList.add('active');
            if (btnViewFavOnly) btnViewFavOnly.classList.remove('active');
            filterAndRender();
        });
    });
    if (btnFavoritesTab) {
        btnFavoritesTab.addEventListener('click', () => {
            showOnlyFavorites = true;
            if (btnViewAll) btnViewAll.classList.remove('active');
            if (btnViewFavOnly) btnViewFavOnly.classList.add('active');
            filterAndRender();
            const destinasiElem = document.getElementById('destinasi');
            if (destinasiElem) destinasiElem.scrollIntoView({behavior:'smooth'});
        });
    }
    if (btnViewAll) {
        btnViewAll.addEventListener('click', () => {
            showOnlyFavorites = false;
            btnViewAll.classList.add('active');
            if (btnViewFavOnly) btnViewFavOnly.classList.remove('active');
            filterAndRender();
        });
    }
    if (btnViewFavOnly) {
        btnViewFavOnly.addEventListener('click', () => {
            showOnlyFavorites = true;
            btnViewFavOnly.classList.add('active');
            if (btnViewAll) btnViewAll.classList.remove('active');
            filterAndRender();
        });
    }
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', tutupModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) tutupModal();
        const culModal = document.getElementById('culinaryModal');
        if (culModal && e.target === culModal) tutupCulinaryModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            tutupModal();
            tutupCulinaryModal();
            document.getElementById('compareModal') && (document.getElementById('compareModal').style.display = 'none');
            document.getElementById('emergencyModal') && (document.getElementById('emergencyModal').style.display = 'none');
            document.getElementById('lightboxModal') && document.getElementById('lightboxModal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        if (e.key === '/' && document.activeElement !== searchInput && !document.activeElement.matches('textarea, input')) {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
    });
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const nt = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nt);
            localStorage.setItem('tanggamus_theme', nt);
            const ic = themeToggleBtn.querySelector('i');
            if (ic) ic.className = nt === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            showToast(nt === 'dark' ? '🌙 Mode Gelap diaktifkan' : '☀️ Mode Terang diaktifkan', nt === 'dark' ? 'fa-moon' : 'fa-sun');
        });
    }
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const ex = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !ex);
            navLinks.classList.toggle('show');
        });
    }

    // Footer quick links
    const footerEmergencyLink = document.getElementById('footerEmergencyLink');
    const footerCompareLink   = document.getElementById('footerCompareLink');
    if (footerEmergencyLink) footerEmergencyLink.addEventListener('click', e => { e.preventDefault(); bukaEmergency(); });
    if (footerCompareLink)   footerCompareLink.addEventListener('click', e => { e.preventDefault(); bukaCompare(); });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  I18N — LANGUAGE SWITCHER (ID / EN)
// ═══════════════════════════════════════════════════════════════════════════════
let currentLang = localStorage.getItem('tanggamus_lang') || 'id';

const translations = {
    id: {
        preloader_sub: 'Memuat Keindahan Alam & Kuliner Lampung...',
        nav_home: 'Beranda', nav_dest: 'Destinasi', nav_culinary: 'Kuliner',
        nav_budget: 'Estimasi Biaya', nav_route: 'Rute', nav_map: 'Peta',
        hero_badge: 'Wisata Bahari & Alam Pilihan Lampung',
        hero_title_1: 'Jelajahi Keindahan', hero_title_2: 'yang Menakjubkan',
        hero_subtitle: 'Dari pesona surga lumba-lumba Teluk Kiluan hingga tebing batu karang Pantai Gigi Hiu. Temukan pengalaman wisata, kuliner, dan budaya tak terlupakan di setiap sudutnya.',
        hero_video_title: '🎬 Video Jelajah Tanggamus', hero_video_sub: 'Tonton Video Viral TikTok @riskatsslh1',
        stat_dest: 'Destinasi Pilihan', stat_rating: 'Rating Rata-Rata', stat_asri: 'Keindahan Alam Asri',
        weather_loading: 'Memuat cuaca...', weather_fetch: 'Mengambil data cuaca Tanggamus...', btn_refresh: 'Perbarui',
        w_humidity: 'Kelembapan', w_wind: 'Kecepatan Angin', w_rain: 'Curah Hujan 1j',
        w_visibility: 'Visibilitas', w_uv: 'UV Index', w_pressure: 'Tekanan Udara',
        w_forecast: 'Prakiraan 6 Jam Ke Depan',
        search_placeholder: 'Cari tempat wisata, lokasi, atau fasilitas...',
        sort_label: 'Urutkan:', sort_recom: 'Rekomendasi', sort_rating: 'Rating Tertinggi ⭐',
        sort_price_low: 'Harga: Termurah ➔ Termahal', sort_price_high: 'Harga: Termahal ➔ Termurah', sort_name: 'Nama (A - Z)',
        cat_all: 'Semua', cat_beach: 'Pantai', cat_waterfall: 'Air Terjun', cat_nature: 'Alam',
        cat_adventure: 'Petualangan', cat_education: 'Edukasi', cat_park: 'Taman Kota',
        view_all: 'Semua Destinasi', view_fav: 'Favorit Saya', results_title: 'Daftar Destinasi Wisata',
        culinary_tag: 'Cita Rasa Khas Pesisir & Pegunungan',
        culinary_title_1: 'Eksplorasi Kuliner &', culinary_title_2: 'Oleh-Oleh Khas',
        culinary_subtitle: 'Nikmati kelezatan warisan kuliner autentik Tanggamus dari gulai ikan tuhuk hingga keharuman kopi Robusta Ulubelu.',
        cul_all: 'Semua Kuliner', cul_main: 'Makanan Utama', cul_trad: 'Tradisional', cul_drink: 'Kopi & Minuman', cul_souvenir: 'Oleh-Oleh',
        budget_tag: 'Trip Budget Planner', budget_title_1: 'Kalkulator Estimasi', budget_title_2: 'Biaya Liburan',
        budget_subtitle: 'Rencanakan anggaran liburan Anda ke Tanggamus dengan mudah dan transparan.',
        bp_dest_label: 'Pilih Destinasi Tujuan:', bp_travelers: 'Jumlah Wisatawan:', bp_people: 'Orang',
        bp_days: 'Durasi Liburan:', bp_day_unit: 'Hari', bp_trans_label: 'Moda Transportasi:',
        trans_rental: 'Sewa Mobil + Supir', trans_rental_p: 'Rp 500.000 / hari',
        trans_personal: 'Mobil Pribadi (BBM/Tol)', trans_personal_p: 'Rp 200.000 / hari',
        trans_motor: 'Motor (BBM)', trans_motor_p: 'Rp 60.000 / hari',
        trans_public: 'Travel Eksekutif', trans_public_p: 'Rp 80.000 / orang',
        bp_hotel_label: 'Tipe Penginapan:', hotel_homestay: 'Homestay / Villa Kiluan', hotel_homestay_p: 'Rp 300.000 / malam',
        hotel_standard: 'Hotel / Resort Gisting', hotel_standard_p: 'Rp 500.000 / malam',
        hotel_camp: 'Camping Tenda Alami', hotel_camp_p: 'Rp 75.000 / malam',
        hotel_none: 'Tanpa Menginap (PP)',
        bp_meal_label: 'Paket Konsumsi / Makan:', meal_budget: 'Hemat (Warung Lokal)', meal_standard: 'Standar (Resto & Kuliner)', meal_seafood: 'Pesta Seafood & Seruit',
        receipt_title: 'Ringkasan Estimasi Biaya', receipt_sub: 'Estimasi transparan liburan Tanggamus',
        r_tickets: 'Tiket Masuk Wisata', r_transport: 'Transportasi', r_hotel: 'Akomodasi / Penginapan', r_meal: 'Konsumsi & Kuliner',
        total_estimate: 'TOTAL ESTIMASI BIAYA', btn_print_plan: 'Cetak / Simpan Rencana', btn_share_plan: 'Kirim ke WhatsApp',
        route_tag: 'Panduan Akses Wisatawan', route_title_1: 'Rute & Panduan', route_title_2: 'Transportasi',
        route_subtitle: 'Petunjuk rute lengkap menuju Kabupaten Tanggamus dari berbagai gerbang kedatangan.',
        tips_title: 'Tips Perjalanan Nyaman ke Tanggamus',
        tips_1: '<strong>Waktu Terbaik:</strong> Berangkat pagi (06.00 - 08.00 WIB) untuk menghindari kepadatan di Pasar Pringsewu & Gisting.',
        tips_2: '<strong>Jalur Menuju Kiluan & Gigi Hiu:</strong> Disarankan menggunakan kendaraan roda 4 berpenggerak tinggi / motor bertenaga prima karena medan perbukitan berbatu.',
        tips_3: '<strong>BBM & SPBU:</strong> SPBU 24 Jam tersedia di sepanjang Jalinbar (Pringsewu, Talang Padang, Gisting, Kota Agung).',
        map_section_title: 'Peta Wisata Tanggamus', map_section_desc: 'Kabupaten Tanggamus terletak di pesisir barat Lampung dengan keanekaragaman lanskap alam yang spektakuler dari puncak gunung hingga teluk lumba-lumba.',
        btn_open_maps: 'Buka Google Maps Penuh',
        comp_title: 'Bandingkan 2 Destinasi Wisata', comp_sub: 'Pilih dua tempat wisata di Tanggamus untuk melihat perbandingan fasilitas, tiket, dan kesesuaiannya.',
        comp_dest_1: 'Pilih Destinasi Pertama:', comp_dest_2: 'Pilih Destinasi Kedua:',
        sos_title: 'Kontak Darurat Wisata Tanggamus (SOS)', sos_sub: 'Layanan bantuan darurat, medis, SAR laut, dan keamanan 24 Jam di Kabupaten Tanggamus.',
        sos_note: 'Jika mengalami kendala keselamatan di laut Teluk Kiluan / Pantai Gigi Hiu, segera hubungi Pos Basarnas SAR atau Polsek setempat.',
        footer_desc: 'Platform informasi dan panduan destinasi pariwisata resmi Kabupaten Tanggamus, Provinsi Lampung.',
        footer_cat: 'Kategori Wisata', footer_info: 'Informasi & Layanan', footer_sos: 'Kontak Darurat (SOS)',
        game1_title: 'Belajar Mengetik', game1_sub: 'Latih kecepatan mengetik Bahasa Indonesia',
        game2_title: 'Tebak-Tebakan Wisata', game2_sub: 'Uji pengetahuanmu tentang Tanggamus',
        game3_title: 'Penjaga Laut Tanggamus', game3_sub: 'Tembak sampah & amankan Teluk Kiluan!',
        audio_guide_label: 'Audio Pemandu Wisata',
        review_section_title: '💬 Ulasan Pengunjung',
        btn_call: 'Hubungi',
        hero_cta_explore: 'Jelajahi Destinasi',
        hero_cta_budget: 'Hitung Biaya Liburan',
        video_pause: 'Jeda Video',
        video_play: 'Putar Video',
        filter_price_label: 'Harga:',
        filter_rating_label: 'Rating:',
        price_all: 'Semua Harga',
        price_10k: '≤ Rp 10.000 (Hemat)',
        price_15k: '≤ Rp 15.000',
        price_20k: '≤ Rp 20.000',
        rating_all: 'Semua Rating',
        rating_45: '⭐ 4.5+',
        rating_47: '⭐ 4.7+ (Top)',
        btn_reset_filters: 'Reset Filter',
        btn_open_route_nav: 'Buka Navigasi Rute',
    },
    en: {
        preloader_sub: 'Loading Natural Beauty & Cuisine of Lampung...',
        nav_home: 'Home', nav_dest: 'Destinations', nav_culinary: 'Culinary',
        nav_budget: 'Budget Estimate', nav_route: 'Routes', nav_map: 'Map',
        hero_badge: 'Top Marine & Nature Tourism in Lampung',
        hero_title_1: 'Explore the Beauty of', hero_title_2: 'that Amazes',
        hero_subtitle: 'From the dolphin paradise of Kiluan Bay to the dramatic cliffs of Shark Teeth Beach. Discover unforgettable travel, cuisine, and culture experiences at every corner.',
        hero_video_title: '🎬 Tanggamus Exploration Video', hero_video_sub: 'Watch Viral TikTok Video @riskatsslh1',
        stat_dest: 'Featured Destinations', stat_rating: 'Average Rating', stat_asri: 'Natural Beauty',
        weather_loading: 'Loading weather...', weather_fetch: 'Fetching Tanggamus weather data...', btn_refresh: 'Refresh',
        w_humidity: 'Humidity', w_wind: 'Wind Speed', w_rain: 'Rainfall 1h',
        w_visibility: 'Visibility', w_uv: 'UV Index', w_pressure: 'Air Pressure',
        w_forecast: '6-Hour Forecast',
        search_placeholder: 'Search attractions, locations, or facilities...',
        sort_label: 'Sort:', sort_recom: 'Recommended', sort_rating: 'Highest Rating ⭐',
        sort_price_low: 'Price: Lowest → Highest', sort_price_high: 'Price: Highest → Lowest', sort_name: 'Name (A - Z)',
        cat_all: 'All', cat_beach: 'Beach', cat_waterfall: 'Waterfall', cat_nature: 'Nature',
        cat_adventure: 'Adventure', cat_education: 'Education', cat_park: 'City Park',
        view_all: 'All Destinations', view_fav: 'My Favorites', results_title: 'Tourism Destinations',
        culinary_tag: 'Authentic Coastal & Highland Flavors',
        culinary_title_1: 'Explore Culinary &', culinary_title_2: 'Local Souvenirs',
        culinary_subtitle: 'Savor the authentic culinary heritage of Tanggamus from fish curry to the aroma of Ulubelu Robusta coffee.',
        cul_all: 'All Food', cul_main: 'Main Dishes', cul_trad: 'Traditional', cul_drink: 'Coffee & Drinks', cul_souvenir: 'Souvenirs',
        budget_tag: 'Trip Budget Planner', budget_title_1: 'Estimate Your', budget_title_2: 'Trip Budget',
        budget_subtitle: 'Plan your Tanggamus vacation budget easily and transparently.',
        bp_dest_label: 'Select Destinations:', bp_travelers: 'Number of Travelers:', bp_people: 'People',
        bp_days: 'Trip Duration:', bp_day_unit: 'Days', bp_trans_label: 'Transportation Mode:',
        trans_rental: 'Car Rental + Driver', trans_rental_p: 'IDR 500,000 / day',
        trans_personal: 'Personal Car (Fuel/Toll)', trans_personal_p: 'IDR 200,000 / day',
        trans_motor: 'Motorcycle (Fuel)', trans_motor_p: 'IDR 60,000 / day',
        trans_public: 'Executive Travel Bus', trans_public_p: 'IDR 80,000 / person',
        bp_hotel_label: 'Accommodation Type:', hotel_homestay: 'Homestay / Kiluan Villa', hotel_homestay_p: 'IDR 300,000 / night',
        hotel_standard: 'Hotel / Gisting Resort', hotel_standard_p: 'IDR 500,000 / night',
        hotel_camp: 'Nature Camping Tent', hotel_camp_p: 'IDR 75,000 / night',
        hotel_none: 'Day Trip (No Stay)',
        bp_meal_label: 'Meal Package:', meal_budget: 'Budget (Local Warung)', meal_standard: 'Standard (Restaurant)', meal_seafood: 'Seafood Feast & Seruit',
        receipt_title: 'Budget Summary', receipt_sub: 'Transparent estimate for your Tanggamus trip',
        r_tickets: 'Entrance Tickets', r_transport: 'Transportation', r_hotel: 'Accommodation', r_meal: 'Food & Dining',
        total_estimate: 'TOTAL ESTIMATED COST', btn_print_plan: 'Print / Save Plan', btn_share_plan: 'Share via WhatsApp',
        route_tag: 'Visitor Access Guide', route_title_1: 'Routes & Travel', route_title_2: 'Transport Guide',
        route_subtitle: 'Complete route instructions to reach Tanggamus Regency from various arrival points.',
        tips_title: 'Tips for a Comfortable Trip to Tanggamus',
        tips_1: '<strong>Best Time:</strong> Depart early (06:00 - 08:00 WIB) to avoid congestion at Pringsewu & Gisting markets.',
        tips_2: '<strong>Route to Kiluan & Gigi Hiu:</strong> 4WD vehicles or powerful motorcycles are recommended due to hilly, rocky terrain.',
        tips_3: '<strong>Fuel & Gas Stations:</strong> 24-hour fuel stations available along the Jalinbar highway (Pringsewu, Talang Padang, Gisting, Kota Agung).',
        map_section_title: 'Tanggamus Tourism Map', map_section_desc: 'Tanggamus Regency is located on the western coast of Lampung with a spectacular diversity of natural landscapes from mountain peaks to dolphin bays.',
        btn_open_maps: 'Open Full Google Maps',
        comp_title: 'Compare 2 Tourist Destinations', comp_sub: 'Select two destinations to compare facilities, tickets, and suitability.',
        comp_dest_1: 'Select First Destination:', comp_dest_2: 'Select Second Destination:',
        sos_title: 'Tanggamus Emergency Contacts (SOS)', sos_sub: '24-hour emergency, medical, sea SAR, and security services in Tanggamus Regency.',
        sos_note: 'If you face safety issues at Kiluan Bay / Shark Teeth Beach, immediately contact the nearest Basarnas SAR post or local police.',
        footer_desc: 'Official tourism information and destination guide platform for Tanggamus Regency, Lampung Province.',
        footer_cat: 'Tourism Categories', footer_info: 'Information & Services', footer_sos: 'Emergency Contacts (SOS)',
        game1_title: 'Typing Practice', game1_sub: 'Train your Indonesian typing speed',
        game2_title: 'Tourism Quiz', game2_sub: 'Test your knowledge about Tanggamus',
        game3_title: 'Tanggamus Sea Guardian', game3_sub: 'Shoot trash & protect Kiluan Bay!',
        audio_guide_label: 'Audio Tour Guide',
        review_section_title: '💬 Visitor Reviews',
        btn_call: 'Call',
        hero_cta_explore: 'Explore Destinations',
        hero_cta_budget: 'Trip Budget Calculator',
        video_pause: 'Pause Video',
        video_play: 'Play Video',
        filter_price_label: 'Price:',
        filter_rating_label: 'Rating:',
        price_all: 'All Prices',
        price_10k: '≤ IDR 10,000 (Budget)',
        price_15k: '≤ IDR 15,000',
        price_20k: '≤ IDR 20,000',
        rating_all: 'All Ratings',
        rating_45: '⭐ 4.5+',
        rating_47: '⭐ 4.7+ (Top)',
        btn_reset_filters: 'Reset Filters',
        btn_open_route_nav: 'Open Route Navigation',
    }
};

function initHeroVideoControl() {
    const video = document.getElementById('heroVideo');
    const btn = document.getElementById('btnToggleHeroVideo');
    const txt = document.getElementById('vtoggleText');
    if (!video || !btn) return;

    btn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-pause';
            if (txt) {
                txt.setAttribute('data-i18n', 'video_pause');
                txt.textContent = translations[currentLang]?.video_pause || 'Jeda Video';
            }
            if (typeof showToast === 'function') showToast('Video latar diputar', 'info');
        } else {
            video.pause();
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-play';
            if (txt) {
                txt.setAttribute('data-i18n', 'video_play');
                txt.textContent = translations[currentLang]?.video_play || 'Putar Video';
            }
            if (typeof showToast === 'function') showToast('Video latar dijeda (Hemat Data)', 'info');
        }
    });
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tanggamus_lang', lang);

    const langFlag = document.getElementById('langFlag');
    const langText = document.getElementById('langText');
    if (langFlag) langFlag.textContent = lang === 'id' ? '🇮🇩' : '🇬🇧';
    if (langText) langText.textContent = lang === 'id' ? 'ID' : 'EN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    document.documentElement.lang = lang;
}

function initLanguageSwitcher() {
    const btn = document.getElementById('btnLangToggle');
    if (!btn) return;
    applyLanguage(currentLang);
    btn.addEventListener('click', () => {
        const newLang = currentLang === 'id' ? 'en' : 'id';
        applyLanguage(newLang);
        showToast(newLang === 'id' ? '🇮🇩 Beralih ke Bahasa Indonesia' : '🇬🇧 Switched to English', 'fa-globe');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CULINARY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
let dataCulinaryGlobal = [];

function renderCulinary(list) {
    const container = document.getElementById('kulinerList');
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Tidak ada data kuliner tersedia.</p></div>';
        return;
    }
    list.forEach(item => {
        const lang = currentLang;
        const nama = lang === 'en' && item.nama_en ? item.nama_en : item.nama;
        const deskripsi = lang === 'en' && item.deskripsi_en ? item.deskripsi_en : item.deskripsi;
        const kategori = lang === 'en' && item.kategori_en ? item.kategori_en : item.kategori;
        const placeLabel = translations[lang]?.culinary_best_place_label || 'Lokasi Terbaik Menikmati:';
        const btnText = translations[lang]?.culinary_detail_btn || 'Petunjuk Tempat Beli & Detail';

        const card = document.createElement('div');
        card.className = 'culinary-card';
        card.onclick = () => bukaDetailKuliner(item.id);
        card.innerHTML = `
            <div class="culinary-card-img">
                <img src="${item.gambar}" alt="${nama}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'">
                <span class="culinary-badge">${item.badge || kategori}</span>
                <span class="culinary-price-badge">${item.harga_estimasi}</span>
            </div>
            <div class="culinary-card-body">
                <span class="cul-category">${kategori}</span>
                <h3>${nama}</h3>
                <p>${deskripsi}</p>
                <div class="cul-location-badge" title="Rekomendasi Spot Beli">
                    <i class="fa-solid fa-store" style="color:var(--accent);"></i>
                    <span><strong>${placeLabel}</strong> ${item.lokasi_rekomendasi}</span>
                </div>
                <button class="btn-culinary-spot" onclick="event.stopPropagation(); bukaDetailKuliner(${item.id})">
                    <i class="fa-solid fa-map-pin"></i> ${btnText}
                </button>
            </div>`;
        container.appendChild(card);
    });
}

function bukaDetailKuliner(id) {
    const item = dataCulinaryGlobal.find(c => c.id === id);
    if (!item) return;

    const modal = document.getElementById('culinaryModal');
    const body = document.getElementById('culinaryModalBody');
    if (!modal || !body) return;

    const lang = currentLang;
    const nama = lang === 'en' && item.nama_en ? item.nama_en : item.nama;
    const deskripsi = lang === 'en' && item.deskripsi_en ? item.deskripsi_en : item.deskripsi;
    const kategori = lang === 'en' && item.kategori_en ? item.kategori_en : item.kategori;
    const placeLabel = translations[lang]?.culinary_best_place_label || 'LOKASI TERBAIK MENIKMATI / REKOMENDASI PLACE:';
    const tipText = translations[lang]?.culinary_modal_tip || 'Disarankan berkunjung pada siang/sore hari untuk stok produk yang baru dimasak & segar.';
    
    const mapsQuery = encodeURIComponent(`${item.lokasi_rekomendasi} Tanggamus Lampung`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    body.innerHTML = `
        <div class="modal-hero-img-wrap">
            <img src="${item.gambar}" alt="${nama}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'">
            <div class="modal-hero-overlay"></div>
            <div class="modal-badge-group">
                <span class="badge-category"><i class="fa-solid fa-utensils"></i> ${kategori}</span>
                <span class="badge-featured"><i class="fa-solid fa-tag"></i> ${item.harga_estimasi}</span>
            </div>
            <h2 id="culinaryModalTitle" class="modal-hero-title">${nama}</h2>
        </div>
        <div class="modal-body-content">
            <div class="culinary-spot-highlight-card">
                <div class="cspot-icon"><i class="fa-solid fa-store"></i></div>
                <div>
                    <span class="cspot-label">${placeLabel}</span>
                    <h3 class="cspot-name">${item.lokasi_rekomendasi}</h3>
                    <p class="cspot-tip"><i class="fa-solid fa-lightbulb" style="color:#f59e0b;"></i> ${tipText}</p>
                </div>
            </div>

            <h4 class="modal-section-title"><i class="fa-solid fa-circle-info"></i> Deskripsi Kuliner</h4>
            <p class="modal-desc-text">${deskripsi}</p>

            <div class="modal-actions" style="margin-top:24px;">
                <a href="${mapsUrl}" target="_blank" class="btn-action-primary">
                    <i class="fa-solid fa-map-location-dot"></i> Petunjuk Rute di Google Maps
                </a>
                <button class="btn-action-secondary" onclick="tutupCulinaryModal()">
                    <i class="fa-solid fa-xmark"></i> Tutup
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function tutupCulinaryModal() {
    const modal = document.getElementById('culinaryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}
window.bukaDetailKuliner = bukaDetailKuliner;
window.tutupCulinaryModal = tutupCulinaryModal;

function initCulinarySection() {
    const pills = document.querySelectorAll('.btn-pill-culinary');
    if (!pills.length) return;

    function filterCulinary(cat) {
        let filtered = dataCulinaryGlobal;
        if (cat !== 'Semua') {
            filtered = dataCulinaryGlobal.filter(c =>
                c.kategori.toLowerCase().includes(cat.toLowerCase()) ||
                (c.kategori_en && c.kategori_en.toLowerCase().includes(cat.toLowerCase()))
            );
        }
        renderCulinary(filtered);
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const cat = pill.dataset.culCategory || 'Semua';
            filterCulinary(cat);
        });
    });

    renderCulinary(dataCulinaryGlobal);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TRANSPORT SECTION
// ═══════════════════════════════════════════════════════════════════════════════
let dataTransportGlobal = [];

function renderTransport(list) {
    const container = document.getElementById('transportGrid');
    if (!container || !list || !list.length) return;
    const icons = ['fa-city', 'fa-ship', 'fa-plane'];
    container.innerHTML = '';
    list.forEach((item, i) => {
        const asal = (currentLang === 'en' && item.asal_en) ? item.asal_en : item.asal;
        const btnNavText = translations[currentLang]?.btn_open_route_nav || 'Buka Navigasi Rute';

        let originSpot = 'Bandar Lampung';
        if (item.id === 2) originSpot = 'Pelabuhan Bakauheni';
        if (item.id === 3) originSpot = 'Bandara Radin Inten II Natar';

        const originEnc = encodeURIComponent(originSpot);
        const destEnc = encodeURIComponent('Kota Agung Kabupaten Tanggamus Lampung');
        const mapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${originEnc}&destination=${destEnc}`;

        const card = document.createElement('div');
        card.className = 'transport-card reveal-on-scroll';
        card.innerHTML = `
            <div class="transport-card-header">
                <i class="fa-solid ${icons[i] || 'fa-route'}"></i>
                <h3>${asal}</h3>
                <span class="transport-distance">${item.jarak}</span>
            </div>
            <div class="transport-meta">
                <div class="transport-meta-item"><i class="fa-solid fa-clock"></i> ${item.waktu}</div>
                <div class="transport-meta-item"><i class="fa-solid fa-money-bill-wave"></i> ${item.biaya_estimasi}</div>
            </div>
            <div class="transport-route-detail">${item.rute}</div>
            <div class="transport-options">
                ${item.opsi.map(o => `<span class="transport-option-chip"><i class="fa-solid fa-check" style="color:var(--secondary);font-size:0.7rem;"></i> ${o}</span>`).join('')}
            </div>
            <a href="${mapsDirUrl}" target="_blank" class="btn-transport-maps" title="Buka Rute Navigasi Google Maps">
                <i class="fa-solid fa-diamond-turn-right"></i> <span data-i18n="btn_open_route_nav">${btnNavText}</span>
            </a>`;
        container.appendChild(card);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BUDGET PLANNER (TRIP COST CALCULATOR)
// ═══════════════════════════════════════════════════════════════════════════════
const transportCosts = {
    car_rental:   { perDay: 500000, perPerson: false },
    personal_car: { perDay: 200000, perPerson: false },
    motorcycle:   { perDay: 60000,  perPerson: false },
    travel_public:{ perDay: 80000,  perPerson: true  },
};
const hotelCosts = {
    homestay:       300000,
    standard_hotel: 500000,
    camping:        75000,
    none:           0,
};
const mealCosts = {
    budget:   60000,
    standard: 120000,
    seafood:  200000,
};

function calculateBudget() {
    const travelers = parseInt(document.getElementById('budgetTravelers')?.value) || 2;
    const days      = parseInt(document.getElementById('budgetDays')?.value) || 2;
    const transportVal = document.querySelector('input[name="budgetTransport"]:checked')?.value || 'car_rental';
    const hotelVal     = document.querySelector('input[name="budgetHotel"]:checked')?.value || 'homestay';
    const mealVal      = document.querySelector('input[name="budgetMeal"]:checked')?.value || 'standard';

    const checkedDests = document.querySelectorAll('.budget-dest-check input:checked');
    let totalTickets = 0;
    const destNames = [];
    checkedDests.forEach(ch => {
        const ticketPrice = parseInt(ch.dataset.price) || 0;
        totalTickets += ticketPrice * travelers;
        if (ch.dataset.name) destNames.push(ch.dataset.name);
    });

    const destsCountElem = document.getElementById('receiptDestCount');
    if (destsCountElem) {
        destsCountElem.textContent = `${checkedDests.length} Destinasi Dipilih:`;
    }

    const destsWrapElem = document.getElementById('receiptSelectedDests');
    if (destsWrapElem) {
        if (destNames.length === 0) {
            destsWrapElem.innerHTML = '<span class="rdest-pill-empty">Belum memilih destinasi</span>';
        } else {
            destsWrapElem.innerHTML = destNames.map(n => `<span class="rdest-pill"><i class="fa-solid fa-location-dot"></i> ${n}</span>`).join('');
        }
    }

    const tc = transportCosts[transportVal];
    let transportTotal = tc.perPerson
        ? tc.perDay * travelers * (days > 1 ? 1 : 1)
        : tc.perDay * (days > 1 ? Math.ceil(days / 1) : 1);
    transportTotal = transportTotal * Math.ceil(days);

    const hotelTotal = hotelCosts[hotelVal] * (days - 1 < 1 ? (days < 2 ? 0 : days - 1) : days - 1);
    const mealTotal  = mealCosts[mealVal] * travelers * days;
    const total      = totalTickets + transportTotal + hotelTotal + mealTotal;
    const perPerson  = travelers > 0 ? Math.round(total / travelers) : total;

    const fmt = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('receiptTickets',   `${fmt(totalTickets)} (${checkedDests.length} Wisata)`);
    setEl('receiptTransport', fmt(transportTotal));
    setEl('receiptHotel',     fmt(hotelTotal));
    setEl('receiptMeal',      fmt(mealTotal));
    setEl('receiptTotalPrice', fmt(total));
    setEl('receiptPerPerson',  `${fmt(perPerson)} / orang`);
}

function initBudgetPlanner() {
    const selectorContainer = document.getElementById('budgetDestSelector');
    if (!selectorContainer) return;

    // Populate destination checkboxes
    function buildDestCheckboxes() {
        selectorContainer.innerHTML = '';
        dataWisataGlobal.forEach((dest, idx) => {
            const label = document.createElement('label');
            const isDefaultChecked = idx < 2;
            label.className = `budget-dest-check ${isDefaultChecked ? 'checked' : ''}`;
            const priceText = dest.harga_tiket === 0 ? 'Gratis' : `Rp ${dest.harga_tiket.toLocaleString('id-ID')}`;
            label.innerHTML = `
                <input type="checkbox" data-price="${dest.harga_tiket}" data-name="${dest.nama}" value="${dest.id}" ${isDefaultChecked ? 'checked' : ''}>
                <div class="bdest-info">
                    <span class="bdest-title">${dest.nama}</span>
                    <span class="bdest-sub">${priceText} / org</span>
                </div>`;
            const cb = label.querySelector('input');
            cb.addEventListener('change', () => {
                label.classList.toggle('checked', cb.checked);
                calculateBudget();
            });
            selectorContainer.appendChild(label);
        });
        calculateBudget();
    }

    buildDestCheckboxes();

    // Counter buttons
    const btnMinusTravelers = document.getElementById('btnMinusTravelers');
    const btnPlusTravelers  = document.getElementById('btnPlusTravelers');
    const btnMinusDays      = document.getElementById('btnMinusDays');
    const btnPlusDays       = document.getElementById('btnPlusDays');
    const travelerInput     = document.getElementById('budgetTravelers');
    const daysInput         = document.getElementById('budgetDays');

    if (btnMinusTravelers) btnMinusTravelers.addEventListener('click', () => { if (parseInt(travelerInput.value) > 1) { travelerInput.value = parseInt(travelerInput.value) - 1; calculateBudget(); } });
    if (btnPlusTravelers)  btnPlusTravelers.addEventListener('click',  () => { if (parseInt(travelerInput.value) < 50) { travelerInput.value = parseInt(travelerInput.value) + 1; calculateBudget(); } });
    if (btnMinusDays)      btnMinusDays.addEventListener('click',      () => { if (parseInt(daysInput.value) > 1) { daysInput.value = parseInt(daysInput.value) - 1; calculateBudget(); } });
    if (btnPlusDays)       btnPlusDays.addEventListener('click',       () => { if (parseInt(daysInput.value) < 14) { daysInput.value = parseInt(daysInput.value) + 1; calculateBudget(); } });

    document.querySelectorAll('input[name="budgetTransport"], input[name="budgetHotel"], input[name="budgetMeal"]').forEach(r => {
        r.addEventListener('change', () => {
            r.closest('.budget-radio-cards')?.querySelectorAll('.budget-radio-card').forEach(card => card.classList.remove('active'));
            r.closest('.budget-radio-card')?.classList.add('active');
            calculateBudget();
        });
    });

    const btnPrint = document.getElementById('btnPrintBudget');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    const btnShareWA = document.getElementById('btnShareBudgetWA');
    if (btnShareWA) {
        btnShareWA.addEventListener('click', () => {
            const total = document.getElementById('receiptTotalPrice')?.textContent || '';
            const travelers = document.getElementById('budgetTravelers')?.value || '2';
            const days = document.getElementById('budgetDays')?.value || '2';
            const destCount = document.querySelectorAll('.budget-dest-check input:checked').length;
            const currentUrl = window.location.href;
            const text = `🏖️ Rencana Wisata Tanggamus\n👥 ${travelers} orang | 📅 ${days} hari | 🗺️ ${destCount} Destinasi\n💰 Total Estimasi Biaya: ${total}\n\nInfo lebih lanjut: ${currentUrl}`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    const btnSaveDB = document.getElementById('btnSaveBudgetDB');
    if (btnSaveDB) {
        btnSaveDB.addEventListener('click', async () => {
            try {
                btnSaveDB.disabled = true;
                btnSaveDB.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
                
                const travelers = parseInt(document.getElementById('budgetTravelers')?.value) || 2;
                const days = parseInt(document.getElementById('budgetDays')?.value) || 2;
                const transportType = document.querySelector('input[name="budgetTransport"]:checked')?.value || 'car_rental';
                const accommodationType = document.querySelector('input[name="budgetHotel"]:checked')?.value || 'homestay';
                const mealTier = document.querySelector('input[name="budgetMeal"]:checked')?.value || 'standard';
                
                const checkedDests = Array.from(document.querySelectorAll('.budget-dest-check input:checked')).map(cb => {
                    const item = dataWisataGlobal.find(d => d.id === parseInt(cb.value));
                    return item ? item.nama : ('Destinasi #' + cb.value);
                });

                const parseRp = (txt) => parseInt((txt || '0').replace(/[^0-9]/g, '')) || 0;
                const totalCost = parseRp(document.getElementById('receiptTotalPrice')?.textContent);
                const costPerPerson = parseRp(document.getElementById('receiptPerPerson')?.textContent);
                const ticketCost = parseRp(document.getElementById('receiptTickets')?.textContent);
                const transportCost = parseRp(document.getElementById('receiptTransport')?.textContent);
                const accommodationCost = parseRp(document.getElementById('receiptHotel')?.textContent);
                const mealCost = parseRp(document.getElementById('receiptMeal')?.textContent);

                const res = await fetch('/api/budget-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        travelerName: 'Wisatawan',
                        travelersCount: travelers,
                        durationDays: days,
                        transportType,
                        accommodationType,
                        mealTier,
                        selectedDestinations: checkedDests,
                        ticketCost,
                        transportCost,
                        accommodationCost,
                        mealCost,
                        totalCost,
                        costPerPerson
                    })
                });

                const data = await res.json();
                if (data.success) {
                    showToast(`🎉 Rencana tersimpan di Database! Kode: ${data.data.planCode}`, 'fa-circle-check');
                    btnSaveDB.innerHTML = `<i class="fa-solid fa-check"></i> Tersimpan (${data.data.planCode})`;
                    if (typeof triggerConfetti === 'function') triggerConfetti();
                } else {
                    showToast('Gagal menyimpan rencana ke database', 'fa-triangle-exclamation');
                    btnSaveDB.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan ke Database';
                }
            } catch(e) {
                console.error('Save plan error:', e);
                showToast('Gagal terhubung ke server database', 'fa-triangle-exclamation');
                btnSaveDB.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan ke Database';
            } finally {
                btnSaveDB.disabled = false;
            }
        });
    }

    // Also update when destinations load
    return buildDestCheckboxes;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPARE DESTINATIONS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function initCompareModal() {
    const modal       = document.getElementById('compareModal');
    const closeBtn    = document.getElementById('compareCloseBtn');
    const btnNav      = document.getElementById('btnCompareNav');
    const selectA     = document.getElementById('compareSelectA');
    const selectB     = document.getElementById('compareSelectB');
    const tableWrap   = document.getElementById('compareTableContainer');

    if (!modal) return;

    function populateSelects() {
        if (!selectA || !selectB) return;
        const opts = dataWisataGlobal.map(d => `<option value="${d.id}">${d.nama}</option>`).join('');
        selectA.innerHTML = opts;
        selectB.innerHTML = opts;
        // Default: choose different ones
        if (dataWisataGlobal.length > 1) selectB.value = String(dataWisataGlobal[1].id);
        renderCompareTable();
    }

    function renderCompareTable() {
        if (!tableWrap || !selectA || !selectB) return;
        const idA = parseInt(selectA.value);
        const idB = parseInt(selectB.value);
        if (idA === idB) {
            tableWrap.innerHTML = '<div class="compare-empty">⚠️ Pilih dua destinasi yang berbeda untuk membandingkan.</div>';
            return;
        }
        const a = dataWisataGlobal.find(d => d.id === idA);
        const b = dataWisataGlobal.find(d => d.id === idB);
        if (!a || !b) return;

        const fmt = v => v === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
        const star = r => '⭐'.repeat(Math.round(r)) + ` (${r})`;
        const fac  = f => f ? f.join(', ') : '-';

        tableWrap.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th class="comp-label">Kriteria</th>
                    <th>${a.nama}</th>
                    <th>${b.nama}</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="comp-label">Kategori</td><td>${a.kategori}</td><td>${b.kategori}</td></tr>
                <tr><td class="comp-label">Lokasi</td><td>${a.lokasi}</td><td>${b.lokasi}</td></tr>
                <tr><td class="comp-label">Harga Tiket</td><td>${fmt(a.harga_tiket)}</td><td>${fmt(b.harga_tiket)}</td></tr>
                <tr><td class="comp-label">Rating</td><td>${star(a.rating)}</td><td>${star(b.rating)}</td></tr>
                <tr><td class="comp-label">Rekomendasi</td><td>${a.rekomendasi ? '🔥 Ya' : '—'}</td><td>${b.rekomendasi ? '🔥 Ya' : '—'}</td></tr>
                <tr><td class="comp-label">Fasilitas</td><td>${fac(a.fasilitas)}</td><td>${fac(b.fasilitas)}</td></tr>
            </tbody>
        </table>`;
    }

    if (selectA) selectA.addEventListener('change', renderCompareTable);
    if (selectB) selectB.addEventListener('change', renderCompareTable);
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; });
    window.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; } });
    if (btnNav) btnNav.addEventListener('click', bukaCompare);

    // Populate after data loads (called externally)
    window._populateCompareSelects = populateSelects;
}

function bukaCompare() {
    const modal = document.getElementById('compareModal');
    if (!modal) return;
    if (window._populateCompareSelects) window._populateCompareSelects();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EMERGENCY SOS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
let dataEmergencyGlobal = [];

function renderEmergencyGrid(list) {
    const grid = document.getElementById('emergencyGrid');
    if (!grid || !list || !list.length) return;
    grid.innerHTML = '';
    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'emergency-item';
        div.innerHTML = `
            <div class="emergency-item-info">
                <h4>${item.instansi}</h4>
                <p>${item.layanan}</p>
            </div>
            <a href="tel:${item.nomor.replace(/[^0-9+]/g,'')}" class="btn-call-emergency">
                <i class="fa-solid fa-phone"></i> ${item.nomor}
            </a>`;
        grid.appendChild(div);
    });
}

function initEmergencyModal() {
    const modal    = document.getElementById('emergencyModal');
    const closeBtn = document.getElementById('emergencyCloseBtn');
    const btnSOS   = document.getElementById('btnEmergencySOS');

    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; });
    window.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; } });
    if (btnSOS) btnSOS.addEventListener('click', bukaEmergency);
}

function bukaEmergency() {
    const modal = document.getElementById('emergencyModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NAV TOOLS OVERFLOW DROPDOWN (< 380px)
// ═══════════════════════════════════════════════════════════════════════════════
function initNavToolsOverflow() {
    const btn   = document.getElementById('btnNavToolsOverflow');
    const panel = document.getElementById('navToolsOverflowPanel');
    if (!btn || !panel) return;

    function togglePanel() {
        const isOpen = panel.classList.toggle('show');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    function closePanel() {
        panel.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
    document.addEventListener('click', e => { if (!panel.contains(e.target) && e.target !== btn) closePanel(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

    // Wire up each item to trigger the real button
    const wire = (itemId, targetId) => {
        const item = document.getElementById(itemId);
        const target = document.getElementById(targetId);
        if (item && target) {
            item.addEventListener('click', () => { closePanel(); target.click(); });
            item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closePanel(); target.click(); } });
        }
    };

    wire('ntop-lang',    'btnLangToggle');
    wire('ntop-compare', 'btnCompareNav');
    wire('ntop-sos',     'btnEmergencySOS');
    wire('ntop-game',    'btnGameLauncher');
    wire('ntop-fav',     'btnFavoritesTab');
    wire('ntop-theme',   'themeToggleBtn');

    // Keep lang flag in sync inside panel
    const mainFlag = document.getElementById('langFlag');
    const ntopFlag = document.getElementById('ntopLangFlag');
    if (mainFlag && ntopFlag) {
        const observer = new MutationObserver(() => { ntopFlag.textContent = mainFlag.textContent; });
        observer.observe(mainFlag, { childList: true, characterData: true, subtree: true });
    }

    // Keep theme icon in sync inside panel
    const mainThemeBtn = document.getElementById('themeToggleBtn');
    const ntopThemeIcon = document.getElementById('ntopThemeIcon');
    if (mainThemeBtn && ntopThemeIcon) {
        const syncThemeIcon = () => {
            const ic = mainThemeBtn.querySelector('i');
            if (ic) ntopThemeIcon.className = ic.className;
        };
        mainThemeBtn.addEventListener('click', () => setTimeout(syncThemeIcon, 50));
        syncThemeIcon();
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
let lightboxImages = [];
let lightboxIndex  = 0;
let _lightboxCaption = '';

function updateLightboxState() {
    const img   = document.getElementById('lightboxImg');
    const cap   = document.getElementById('lightboxCaption');
    const strip = document.getElementById('lightboxThumbStrip');

    if (img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.97)';
        setTimeout(() => {
            img.src = lightboxImages[lightboxIndex];
            img.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 120);
    }
    if (cap) cap.textContent = `${_lightboxCaption ? _lightboxCaption + ' — ' : ''}${lightboxIndex + 1} / ${lightboxImages.length}`;

    // Sync thumbnail active state & scroll into view
    if (strip) {
        strip.querySelectorAll('.lb-thumb').forEach((btn, i) => {
            btn.classList.toggle('lb-thumb-active', i === lightboxIndex);
        });
        const activeThumb = strip.querySelector('.lb-thumb-active');
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function bukaLightbox(images, startIndex, caption) {
    lightboxImages = images;
    lightboxIndex  = startIndex || 0;
    _lightboxCaption = caption || '';
    const lb    = document.getElementById('lightboxModal');
    const img   = document.getElementById('lightboxImg');
    const cap   = document.getElementById('lightboxCaption');
    if (!lb || !img) return;
    img.src = lightboxImages[lightboxIndex];
    if (cap) cap.textContent = `${_lightboxCaption ? _lightboxCaption + ' — ' : ''}${lightboxIndex + 1} / ${lightboxImages.length}`;

    // Build thumbnail strip
    const strip = document.getElementById('lightboxThumbStrip');
    if (strip) {
        strip.innerHTML = lightboxImages.map((src, i) => `
            <button class="lb-thumb ${i === lightboxIndex ? 'lb-thumb-active' : ''}" data-idx="${i}" role="listitem" aria-label="Foto ${i + 1}" title="Foto ${i + 1}">
                <img src="${src}" alt="Thumbnail ${i + 1}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=50'">
                <div class="lb-thumb-num">${i + 1}</div>
            </button>`).join('');
        strip.querySelectorAll('.lb-thumb').forEach(btn => {
            btn.addEventListener('click', () => {
                lightboxIndex = parseInt(btn.dataset.idx);
                updateLightboxState();
            });
        });
        // Show strip only when there are multiple images
        strip.style.display = lightboxImages.length > 1 ? 'flex' : 'none';
    }

    lb.classList.add('active');
}

function initLightbox() {
    const lb       = document.getElementById('lightboxModal');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn  = document.getElementById('lightboxPrev');
    const nextBtn  = document.getElementById('lightboxNext');
    const img      = document.getElementById('lightboxImg');
    const cap      = document.getElementById('lightboxCaption');

    if (!lb) return;

    function updateLightbox() {
        if (img) img.src = lightboxImages[lightboxIndex];
        if (cap) cap.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }

    if (closeBtn) closeBtn.addEventListener('click', () => lb.classList.remove('active'));
    if (prevBtn)  prevBtn.addEventListener('click',  () => { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightboxState(); });
    if (nextBtn)  nextBtn.addEventListener('click',  () => { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightboxState(); });
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('active'); });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'ArrowLeft')  { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightboxState(); }
        if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightboxState(); }
        if (e.key === 'Escape')     lb.classList.remove('active');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ENHANCED DETAIL MODAL (Gallery + Audio + Reviews)
// ═══════════════════════════════════════════════════════════════════════════════
function bukaDetail(id) {
    const item = dataWisataGlobal.find(d => d.id === id);
    if (!item || !modal || !modalBody) return;
    modal.dataset.activeId = id;
    const isFav = favoriteIds.includes(item.id);
    const rp    = item.harga_tiket === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga_tiket);
    const fac   = item.fasilitas ? item.fasilitas.map(f => `<span class="modal-facility-badge"><i class="fa-solid fa-circle-check"></i> ${f}</span>`).join('') : '<span>Tidak tercantum</span>';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.nama + ' ' + item.lokasi + ' Tanggamus')}`;
    const waUrl   = `https://api.whatsapp.com/send?text=${encodeURIComponent('Yuk jalan-jalan ke ' + item.nama + ' di Tanggamus!')}`;

    const lang = currentLang;
    const nama      = (lang === 'en' && item.nama_en)      ? item.nama_en      : item.nama;
    const deskripsi = (lang === 'en' && item.deskripsi_en) ? item.deskripsi_en : item.deskripsi;
    const audioDeskripsi = (lang === 'en' && item.audio_deskripsi_en) ? item.audio_deskripsi_en : (item.audio_deskripsi_id || item.deskripsi);

    // Gallery thumbnails
    const galeri = item.galeri && item.galeri.length > 0 ? item.galeri : [`Gambar/${item.gambar}`];
    const mainImg = galeri[0].startsWith('http') ? galeri[0] : galeri[0];
    const thumbsHtml = galeri.map((src, i) => `
        <div class="detail-gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" style="cursor:pointer;">
            <img src="${src}" alt="Foto ${i + 1}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=60'">
        </div>`).join('');

    // Visitor Reviews from localStorage
    const reviewKey = `tanggamus_reviews_${id}`;
    const reviews   = JSON.parse(localStorage.getItem(reviewKey)) || [];
    const reviewListHtml = reviews.length === 0
        ? `<div class="review-empty">✍️ Belum ada ulasan. Jadilah yang pertama!</div>`
        : reviews.map(r => `
            <div class="review-item">
                <div class="review-item-header">
                    <div class="review-avatar">${(r.name || 'A')[0].toUpperCase()}</div>
                    <strong>${r.name || 'Anonim'}</strong>
                    <span class="review-date">${r.date || ''}</span>
                </div>
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <div class="review-text">${r.text}</div>
                ${r.photo ? `<img src="${r.photo}" class="review-card-photo" alt="Foto Ulasan" onclick="bukaLightbox(['${r.photo}'], 0, 'Foto ulasan oleh ${r.name}')">` : ''}
            </div>`).join('');

    modalBody.innerHTML = `
        <div style="position:relative;">
            <img class="modal-hero-img" id="modalHeroImg" src="${mainImg}" alt="Foto ${nama}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';" style="cursor:pointer;" onclick="bukaLightbox(${JSON.stringify(galeri)}, 0, '${nama}')">
            <button onclick="bukaLightbox(${JSON.stringify(galeri)}, 0, '${nama}')" style="position:absolute;bottom:14px;right:14px;background:rgba(0,0,0,0.6);border:none;color:white;padding:6px 12px;border-radius:20px;cursor:pointer;font-size:0.8rem;"><i class="fa-solid fa-expand"></i> Lihat Galeri</button>
        </div>
        <div class="detail-gallery-row" id="detailGalleryRow">${thumbsHtml}</div>
        <div class="modal-body">
            <div class="modal-header-meta">
                <span class="badge-category" style="background:var(--primary);font-size:0.82rem;">${item.kategori}</span>
                <span class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating} / 5.0</span>
            </div>
            <h2 class="modal-title" id="modalTitle">${nama}</h2>
            <p class="modal-location-text"><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${item.lokasi}, Kab. Tanggamus</p>

            <!-- Audio Tour Guide Bar & Voice Customizer -->
            <div class="audio-guide-bar">
                <button class="btn-audio-play" id="btnAudioPlay" title="Dengarkan Audio Pemandu">
                    <i class="fa-solid fa-play" id="audioPlayIcon"></i>
                </button>
                <div class="audio-guide-info">
                    <span>${lang === 'en' ? 'Audio Tour Guide' : 'Audio Pemandu Wisata'}</span>
                    <strong>${nama}</strong>
                </div>
                <div class="audio-wave-bars" id="audioWaveBars">
                    <div class="audio-wave-bar"></div>
                    <div class="audio-wave-bar"></div>
                    <div class="audio-wave-bar"></div>
                    <div class="audio-wave-bar"></div>
                    <div class="audio-wave-bar"></div>
                </div>
                <button class="rate-btn" id="btnAudioSettings" title="Pengaturan Suara & Kecepatan" style="margin-left:auto;color:white;background:rgba(255,255,255,0.15);border:none;">
                    <i class="fa-solid fa-sliders"></i>
                </button>
            </div>
            <div class="audio-settings-panel" id="audioSettingsPanel">
                <span>Pilih Suara:</span>
                <select id="audioVoiceSelect" class="audio-select-mini"></select>
                <span style="margin-left:8px;">Kecepatan:</span>
                <div class="rate-btn-group" id="audioRateGroup">
                    <button class="rate-btn" data-rate="0.85">0.85x</button>
                    <button class="rate-btn active" data-rate="1.0">1.0x</button>
                    <button class="rate-btn" data-rate="1.25">1.25x</button>
                </div>
            </div>

            <div class="modal-grid-info">
                <div class="info-box"><i class="fa-solid fa-ticket"></i><div><label>Tiket Masuk</label><span>${rp}</span></div></div>
                <div class="info-box"><i class="fa-solid fa-shield-halved"></i><div><label>Status</label><span>${item.rekomendasi ? '🔥 Populer' : '📌 Destinasi Alam'}</span></div></div>
            </div>
            <h4 class="modal-section-title">Deskripsi Destinasi</h4>
            <p class="modal-desc-text">${deskripsi}</p>
            <h4 class="modal-section-title">Fasilitas Tersedia</h4>
            <div class="modal-facilities-list">${fac}</div>
            <div class="modal-actions">
                <a href="${mapsUrl}" target="_blank" class="btn-action-primary"><i class="fa-solid fa-diamond-turn-right"></i> Petunjuk Arah</a>
                <a href="${waUrl}" target="_blank" class="btn-action-secondary"><i class="fa-brands fa-whatsapp" style="color:#25D366;font-size:1.2rem;"></i> Bagikan</a>
                <button class="btn-action-secondary" onclick="toggleFavorite(event,${item.id})">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart" style="color:#ef4444;"></i> ${isFav ? 'Tersimpan' : 'Simpan'}
                </button>
            </div>

            <!-- Visitor Reviews Section -->
            <div class="review-section-wrap">
                <div class="review-section-title"><i class="fa-solid fa-comments" style="color:var(--primary);"></i> ${lang === 'en' ? 'Visitor Reviews' : 'Ulasan Pengunjung'}</div>
                <div class="review-form-mini">
                    <div class="star-rating-input" id="starRatingInput" data-rating="0">
                        ${[1,2,3,4,5].map(n => `<button class="star-btn" data-val="${n}" type="button">☆</button>`).join('')}
                    </div>
                    <input type="text" class="review-name-input" id="reviewName" placeholder="Nama Anda (opsional)">
                    <textarea class="review-textarea" id="reviewText" placeholder="Ceritakan pengalaman Anda berkunjung ke sini..."></textarea>
                    
                    <!-- Upload Photo Attachment -->
                    <label for="reviewPhotoInput" class="btn-upload-photo" id="btnUploadPhotoLabel">
                        <i class="fa-solid fa-camera"></i> Tambah Foto Pengalaman
                    </label>
                    <input type="file" id="reviewPhotoInput" accept="image/*" style="display:none;">
                    <div id="reviewPhotoPreview" class="review-photo-preview"></div>

                    <button class="btn-submit-review" id="btnSubmitReview">
                        <i class="fa-solid fa-paper-plane"></i> Kirim Ulasan
                    </button>
                </div>
                <div class="review-list" id="reviewList">${reviewListHtml}</div>
            </div>
        </div>`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Thumbnail click handlers
    document.querySelectorAll('.detail-gallery-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.detail-gallery-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const idx = parseInt(thumb.dataset.index);
            const heroImg = document.getElementById('modalHeroImg');
            if (heroImg) {
                heroImg.src = galeri[idx];
                heroImg.onclick = () => bukaLightbox(galeri, idx, nama);
            }
        });
    });

    // Audio Tour Guide & Voice Customizer Logic
    let isSpeaking = false;
    let selectedAudioRate = 1.0;
    let selectedVoice = null;
    const btnPlay = document.getElementById('btnAudioPlay');
    const playIcon = document.getElementById('audioPlayIcon');
    const waveBars = document.getElementById('audioWaveBars');
    const btnSettings = document.getElementById('btnAudioSettings');
    const settingsPanel = document.getElementById('audioSettingsPanel');
    const voiceSelect = document.getElementById('audioVoiceSelect');
    const rateButtons = document.querySelectorAll('#audioRateGroup .rate-btn');

    if (btnSettings && settingsPanel) {
        btnSettings.addEventListener('click', () => {
            settingsPanel.classList.toggle('show');
        });
    }

    if (voiceSelect && window.speechSynthesis) {
        function populateVoices() {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || !voices.length) return;
            voiceSelect.innerHTML = '';
            const targetLang = lang === 'en' ? 'en' : 'id';
            const filtered = voices.filter(v => v.lang.startsWith(targetLang) || v.lang.startsWith('id') || v.lang.startsWith('en'));
            const listToUse = filtered.length > 0 ? filtered : voices;
            listToUse.forEach((v, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = `${v.name} (${v.lang})`;
                voiceSelect.appendChild(opt);
            });
            selectedVoice = listToUse[0] || null;
        }
        populateVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoices;
        }
        voiceSelect.addEventListener('change', (e) => {
            const voices = window.speechSynthesis.getVoices();
            selectedVoice = voices[parseInt(e.target.value)] || null;
        });
    }

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            rateButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAudioRate = parseFloat(btn.dataset.rate) || 1.0;
        });
    });

    if (btnPlay && window.speechSynthesis) {
        btnPlay.addEventListener('click', () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                if (playIcon) { playIcon.className = 'fa-solid fa-play'; btnPlay.classList.remove('playing'); }
                if (waveBars) waveBars.classList.remove('playing');
            } else {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(audioDeskripsi);
                utter.lang = lang === 'en' ? 'en-US' : 'id-ID';
                utter.rate = selectedAudioRate;
                utter.pitch = 1.0;
                if (selectedVoice) utter.voice = selectedVoice;
                utter.onstart = () => {
                    isSpeaking = true;
                    if (playIcon) { playIcon.className = 'fa-solid fa-pause'; btnPlay.classList.add('playing'); }
                    if (waveBars) waveBars.classList.add('playing');
                };
                utter.onend = utter.onerror = () => {
                    isSpeaking = false;
                    if (playIcon) { playIcon.className = 'fa-solid fa-play'; btnPlay.classList.remove('playing'); }
                    if (waveBars) waveBars.classList.remove('playing');
                };
                window.speechSynthesis.speak(utter);
            }
        });
    } else if (btnPlay) {
        btnPlay.title = 'Audio tidak didukung browser ini';
        btnPlay.style.opacity = '0.4';
    }

    // Review Photo Attachment Handler
    let attachedPhotoBase64 = null;
    const photoInput = document.getElementById('reviewPhotoInput');
    const photoPreview = document.getElementById('reviewPhotoPreview');

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                showToast('⚠️ Ukuran foto maksimal 5MB.', 'fa-image');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image using canvas max 600px
                    const canvas = document.createElement('canvas');
                    const maxDim = 600;
                    let w = img.width, h = img.height;
                    if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
                    else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    attachedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.7);

                    if (photoPreview) {
                        photoPreview.innerHTML = `
                            <div class="review-photo-item">
                                <img src="${attachedPhotoBase64}" alt="Pratinjau Foto">
                                <button type="button" class="review-photo-remove" id="btnRemoveReviewPhoto"><i class="fa-solid fa-xmark"></i></button>
                            </div>`;
                        document.getElementById('btnRemoveReviewPhoto')?.addEventListener('click', () => {
                            attachedPhotoBase64 = null;
                            photoPreview.innerHTML = '';
                            photoInput.value = '';
                        });
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Star Rating
    const starInput = document.getElementById('starRatingInput');
    if (starInput) {
        let selectedRating = 0;
        const stars = starInput.querySelectorAll('.star-btn');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach((s, i) => s.textContent = i < val ? '★' : '☆');
                stars.forEach((s, i) => s.classList.toggle('active', i < val));
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                    s.classList.toggle('active', i < selectedRating);
                });
            });
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.val);
                starInput.dataset.rating = selectedRating;
            });
        });
    }

    // Submit Review
    const btnSubmit = document.getElementById('btnSubmitReview');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            const rating = parseInt(document.getElementById('starRatingInput')?.dataset.rating) || 0;
            const text   = document.getElementById('reviewText')?.value.trim() || '';
            const name   = document.getElementById('reviewName')?.value.trim() || 'Wisatawan';

            if (!text || rating === 0) {
                showToast('⚠️ Mohon berikan bintang dan tulis ulasan terlebih dahulu.', 'fa-star');
                return;
            }

            const reviews = JSON.parse(localStorage.getItem(reviewKey)) || [];
            const newReviewObj = {
                name, rating, text,
                photo: attachedPhotoBase64 || null,
                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
            };
            reviews.unshift(newReviewObj);

            // Limit to 50 latest reviews per destination to keep localStorage manageable
            if (reviews.length > 50) reviews.splice(50);
            localStorage.setItem(reviewKey, JSON.stringify(reviews));

            // Simpan ke SQLite Database via API
            if (modal && modal.dataset.activeId) {
                fetch(`/api/destinasi/${modal.dataset.activeId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, text, origin: 'Wisatawan' })
                }).then(r => r.json()).then(res => {
                    if (res && res.success) {
                        showToast('✅ Ulasan tersimpan di SQLite Database!', 'fa-database');
                    }
                }).catch(e => console.warn('Sync review error:', e));
            }

            const reviewList = document.getElementById('reviewList');
            if (reviewList) {
                const item = document.createElement('div');
                item.className = 'review-item';
                item.style.animation = 'correctPop 0.35s ease';
                item.innerHTML = `
                    <div class="review-item-header">
                        <div class="review-avatar">${name[0].toUpperCase()}</div>
                        <strong>${name}</strong>
                        <span class="review-date">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="review-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
                    <div class="review-text">${text}</div>
                    ${newReviewObj.photo ? `<img src="${newReviewObj.photo}" class="review-card-photo" alt="Foto Ulasan" onclick="bukaLightbox(['${newReviewObj.photo}'], 0, 'Foto ulasan oleh ${name}')">` : ''}`;
                const emptyDiv = reviewList.querySelector('.review-empty');
                if (emptyDiv) emptyDiv.remove();
                reviewList.prepend(item);
            }

            if (document.getElementById('reviewText'))   document.getElementById('reviewText').value = '';
            if (document.getElementById('reviewName'))   document.getElementById('reviewName').value = '';
            if (document.getElementById('starRatingInput')) document.getElementById('starRatingInput').dataset.rating = '0';
            document.querySelectorAll('.star-btn').forEach(s => { s.textContent = '☆'; s.classList.remove('active'); });

            attachedPhotoBase64 = null;
            if (photoPreview) photoPreview.innerHTML = '';
            if (photoInput) photoInput.value = '';

            showToast(`⭐ Ulasan tersimpan permanen di perangkat ini! Terima kasih, ${name}!`, 'fa-floppy-disk');
        });
    }

    // Stop audio when modal closes
    const originalTutupModal = window.tutupModal;
    window.tutupModal = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (originalTutupModal) originalTutupModal();
        else {
            if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
        }
    };
}



// ═══════════════════════════════════════════════════════════════════════════════
//  REAL-TIME WEATHER SYSTEM (Open-Meteo API — Tanggamus, Lampung)
// ═══════════════════════════════════════════════════════════════════════════════
function initWeatherSystem() {
    const weatherDistricts = {
        kota_agung: { nama_id: 'Kota Agung', nama_en: 'Kota Agung', lat: -5.4647, lon: 104.4533 },
        gisting: { nama_id: 'Gisting', nama_en: 'Gisting', lat: -5.4294, lon: 104.7214 },
        kelumbayan: { nama_id: 'Kelumbayan', nama_en: 'Kelumbayan', lat: -5.7725, lon: 105.0864 },
        ulubelu: { nama_id: 'Ulubelu', nama_en: 'Ulubelu', lat: -5.3022, lon: 104.5768 },
        air_naningan: { nama_id: 'Air Naningan', nama_en: 'Air Naningan', lat: -5.3188, lon: 104.6475 }
    };

    let currentDistrictKey = localStorage.getItem('tanggamus_weather_district') || 'kota_agung';
    const districtSelect = document.getElementById('weatherDistrictSelect');

    const heroMini       = document.getElementById('heroWeatherMini');
    const loadingElem    = document.getElementById('weatherLoading');
    const contentElem    = document.getElementById('weatherContent');
    const errorElem      = document.getElementById('weatherError');
    const errorMsg       = document.getElementById('weatherErrorMsg');
    const btnRefresh     = document.getElementById('btnRefreshWeather');
    const btnRetry       = document.getElementById('btnRetryWeather');

    const tempElem       = document.getElementById('wTemp');
    const condElem       = document.getElementById('wCondition');
    const feelsElem      = document.getElementById('wFeels');
    const iconBigElem    = document.getElementById('wIconBig');
    const updateTimeElem = document.getElementById('wUpdateTime');
    const humidityElem   = document.getElementById('wHumidity');
    const windElem       = document.getElementById('wWind');
    const rainElem       = document.getElementById('wRain');
    const visElem        = document.getElementById('wVisibility');
    const uvElem         = document.getElementById('wUV');
    const pressureElem   = document.getElementById('wPressure');
    const rekomCard      = document.getElementById('wRekomendasi');
    const rekomText      = document.getElementById('wRekomendasiText');
    const forecastItems  = document.getElementById('forecastItems');

    if (districtSelect) {
        districtSelect.value = currentDistrictKey;
        districtSelect.addEventListener('change', (e) => {
            currentDistrictKey = e.target.value;
            localStorage.setItem('tanggamus_weather_district', currentDistrictKey);
            const dist = weatherDistricts[currentDistrictKey] || weatherDistricts['kota_agung'];
            const name = currentLang === 'en' ? dist.nama_en : dist.nama_id;
            showToast(`Mengambil cuaca kecamatan ${name}...`, 'info');
            fetchWeather();
        });
    }

    function interpretWeather(code, isDay = 1) {
        switch (code) {
            case 0:  return { label: "Cerah", icon: isDay ? "☀️" : "🌙", type: "good" };
            case 1:  return { label: "Cerah Berawan", icon: isDay ? "🌤️" : "☁️", type: "good" };
            case 2:  return { label: "Berawan Sebagian", icon: "⛅", type: "good" };
            case 3:  return { label: "Berawan Tebal / Mendung", icon: "☁️", type: "good" };
            case 45:
            case 48: return { label: "Berkabut", icon: "🌫️", type: "warn" };
            case 51:
            case 53:
            case 55: return { label: "Gerimis Ringan", icon: "🌦️", type: "warn" };
            case 61: return { label: "Hujan Ringan", icon: "🌧️", type: "warn" };
            case 63: return { label: "Hujan Sedang", icon: "🌧️", type: "bad" };
            case 65: return { label: "Hujan Lebat", icon: "🌧️", type: "bad" };
            case 80: return { label: "Hujan Lokal Ringan", icon: "🌦️", type: "warn" };
            case 81:
            case 82: return { label: "Hujan Lebat Berselang", icon: "🌧️", type: "bad" };
            case 95:
            case 96:
            case 99: return { label: "Badai Petir", icon: "⛈️", type: "bad" };
            default: return { label: "Cerah Berawan", icon: "🌤️", type: "good" };
        }
    }

    function getRecommendation(type, temp, rain) {
        if (type === "bad" || rain > 2.0) {
            return {
                cls: "bad",
                text: "⛈️ Cuaca kurang bersahabat (Hujan/Petir). Hindari aktivitas laut atau berenang di air terjun demi keselamatan."
            };
        } else if (type === "warn" || rain > 0.1) {
            return {
                cls: "warn",
                text: "🌦️ Terjadi gerimis/hujan ringan. Disarankan membawa payung dan berhati-hati saat berkendara di jalur wisata pegunungan."
            };
        } else if (temp >= 32) {
            return {
                cls: "good",
                text: "☀️ Cuaca cerah dan terik! Sangat cocok untuk wisata pantai & snorkeling di Teluk Kiluan. Jangan lupa gunakan tabir surya (sunscreen)."
            };
        } else {
            return {
                cls: "good",
                text: "✨ Cuaca sangat nyaman & bersahabat! Waktu ideal untuk tracking ke Air Terjun Way Lalaan, mendaki Gunung Tanggamus, atau foto di Pantai Gigi Hiu."
            };
        }
    }

    async function fetchWeather() {
        const district = weatherDistricts[currentDistrictKey] || weatherDistricts['kota_agung'];
        const LAT = district.lat;
        const LON = district.lon;
        const districtName = currentLang === 'en' ? district.nama_en : district.nama_id;
        const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FJakarta&forecast_hours=12`;

        if (loadingElem) loadingElem.style.display = 'flex';
        if (contentElem) contentElem.style.display = 'none';
        if (errorElem)   errorElem.style.display   = 'none';

        if (heroMini) {
            heroMini.innerHTML = `<span class="hwm-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memperbarui cuaca...</span>`;
        }

        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const data = await res.json();

            const cur = data.current;
            if (!cur) throw new Error("Data cuaca tidak lengkap.");

            const now = new Date();
            const hour = now.getHours();
            const isDay = (hour >= 6 && hour < 18) ? 1 : 0;

            const temp = Math.round(cur.temperature_2m);
            const feels = Math.round(cur.apparent_temperature);
            const weather = interpretWeather(cur.weather_code, isDay);
            const humidity = Math.round(cur.relative_humidity_2m);
            const wind = Math.round(cur.wind_speed_10m);
            const rain = cur.precipitation !== undefined ? cur.precipitation : 0;
            const pressure = Math.round(cur.surface_pressure);
            const uv = cur.uv_index !== undefined ? cur.uv_index.toFixed(1) : "N/A";
            const visibility = (rain > 1.0) ? "4 - 7" : "10+";

            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

            // 1. Update Hero Mini Badge
            if (heroMini) {
                heroMini.innerHTML = `
                    <span class="hwm-icon">${weather.icon}</span>
                    <span class="hwm-temp">${temp}°C</span>
                    <span class="hwm-cond">${weather.label}</span>
                    <span class="hwm-divider"></span>
                    <span style="font-size:0.82rem; opacity:0.85;"><i class="fa-solid fa-location-dot" style="color:#38bdf8;"></i> ${districtName}</span>
                `;
            }

            // 2. Update Main Weather Section
            if (tempElem)       tempElem.textContent       = `${temp}°C`;
            if (condElem)       condElem.textContent       = weather.label;
            if (feelsElem)      feelsElem.textContent      = `Terasa seperti ${feels}°C`;
            if (iconBigElem)    iconBigElem.textContent    = weather.icon;
            if (updateTimeElem) updateTimeElem.textContent = `Diperbarui pukul ${timeStr}`;

            if (humidityElem)   humidityElem.textContent   = `${humidity}%`;
            if (windElem)       windElem.textContent       = `${wind} km/j`;
            if (rainElem)       rainElem.textContent       = `${rain} mm`;
            if (visElem)        visElem.textContent        = `${visibility} km`;
            if (uvElem)         uvElem.textContent         = uv;
            if (pressureElem)   pressureElem.textContent   = `${pressure} hPa`;

            // 3. Update Tourism Recommendation
            const recom = getRecommendation(weather.type, temp, rain);
            if (rekomCard && rekomText) {
                rekomCard.className = `weather-rekomendasi ${recom.cls}`;
                rekomText.textContent = recom.text;
            }

            // 4. Update Hourly Forecast (next 6 hours)
            if (forecastItems && data.hourly && data.hourly.time) {
                forecastItems.innerHTML = '';
                const hourlyTimes = data.hourly.time;
                const hourlyTemps = data.hourly.temperature_2m;
                const hourlyCodes = data.hourly.weather_code;
                const hourlyProbs = data.hourly.precipitation_probability;

                const currentISO = now.toISOString().slice(0, 13);
                let startIdx = hourlyTimes.findIndex(t => t.startsWith(currentISO));
                if (startIdx === -1) startIdx = 0;

                const count = Math.min(6, hourlyTimes.length - startIdx);
                for (let i = 0; i < count; i++) {
                    const idx = startIdx + i;
                    const dateObj = new Date(hourlyTimes[idx]);
                    const timeLabel = (i === 0) ? 'Sekarang' : dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    const fTemp = Math.round(hourlyTemps[idx]);
                    const fHour = dateObj.getHours();
                    const fIsDay = (fHour >= 6 && fHour < 18) ? 1 : 0;
                    const fWeather = interpretWeather(hourlyCodes[idx], fIsDay);
                    const fProb = hourlyProbs ? hourlyProbs[idx] : 0;

                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'forecast-item';
                    itemDiv.innerHTML = `
                        <span class="fc-time">${timeLabel}</span>
                        <span class="fc-icon">${fWeather.icon}</span>
                        <span class="fc-temp">${fTemp}°C</span>
                        <span class="fc-rain"><i class="fa-solid fa-umbrella"></i> ${fProb}%</span>
                    `;
                    forecastItems.appendChild(itemDiv);
                }
            }

            if (loadingElem) loadingElem.style.display = 'none';
            if (contentElem) contentElem.style.display = 'grid';

        } catch (err) {
            console.warn("Gagal memuat cuaca Tanggamus:", err);
            if (loadingElem) loadingElem.style.display = 'none';
            if (errorElem) {
                errorElem.style.display = 'flex';
                if (errorMsg) errorMsg.textContent = "Gagal memuat data cuaca real-time. Periksa koneksi internet Anda.";
            }
            if (heroMini) {
                heroMini.innerHTML = `<span style="opacity:0.8;"><i class="fa-solid fa-cloud-sun"></i> Cuaca Tanggamus</span>`;
            }
        }
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            const icon = btnRefresh.querySelector('i');
            if (icon) icon.classList.add('spin-once');
            setTimeout(() => { if (icon) icon.classList.remove('spin-once'); }, 600);
            fetchWeather();
            showToast('Memperbarui cuaca Tanggamus...', 'fa-rotate-right');
        });
    }

    if (btnRetry) {
        btnRetry.addEventListener('click', fetchWeather);
    }

    fetchWeather();
    setInterval(fetchWeather, 10 * 60 * 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LEAFLET INTERACTIVE MAP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
let leafletMapInstance = null;
let leafletMarkersGroup = null;

function initInteractiveMap() {
    const mapDiv = document.getElementById('interactiveMap');
    if (!mapDiv || typeof L === 'undefined') return;

    if (!leafletMapInstance) {
        // Center of Tanggamus Regency
        leafletMapInstance = L.map('interactiveMap', {
            center: [-5.4647, 104.6533],
            zoom: 10,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Eksplor Tanggamus'
        }).addTo(leafletMapInstance);

        leafletMarkersGroup = L.layerGroup().addTo(leafletMapInstance);
    }

    const iconMap = {
        'Pantai':      { icon: 'fa-umbrella-beach', cls: 'marker-pantai' },
        'Air Terjun':  { icon: 'fa-water',          cls: 'marker-air-terjun' },
        'Alam':        { icon: 'fa-mountain-sun',   cls: 'marker-alam' },
        'Edukasi':     { icon: 'fa-graduation-cap', cls: 'marker-edukasi' },
        'Taman Kota':  { icon: 'fa-tree',           cls: 'marker-taman-kota' },
        'Petualangan': { icon: 'fa-person-hiking',  cls: 'marker-petualangan' },
        'Kuliner':     { icon: 'fa-utensils',       cls: 'marker-kuliner' }
    };

    function renderMapMarkers(filterCat = 'all') {
        if (!leafletMarkersGroup) return;
        leafletMarkersGroup.clearLayers();

        // Combine destinations + culinary items
        const allItems = [
            ...dataWisataGlobal.map(d => ({ ...d, isCulinary: false })),
            ...dataCulinaryGlobal.map(c => ({
                id: c.id + 1000,
                nama: c.nama,
                kategori: 'Kuliner',
                lokasi: c.lokasi_rekomendasi,
                gambar: c.gambar,
                rating: 4.8,
                lat: c.lat || -5.46,
                lng: c.lng || 104.65,
                isCulinary: true,
                originalId: c.id
            }))
        ];

        allItems.forEach(item => {
            if (!item.lat || !item.lng) return;
            if (filterCat !== 'all' && item.kategori !== filterCat) return;

            const iconInfo = iconMap[item.kategori] || { icon: 'fa-location-dot', cls: 'marker-pantai' };
            const customIcon = L.divIcon({
                className: '',
                html: `<div class="custom-leaflet-marker ${iconInfo.cls}"><i class="fa-solid ${iconInfo.icon}"></i></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -18]
            });

            const imgSrc = item.gambar.startsWith('Gambar/') || item.gambar.startsWith('http') ? item.gambar : `Gambar/${item.gambar}`;
            const clickAction = item.isCulinary ? `bukaDetailKuliner(${item.originalId})` : `bukaDetail(${item.id})`;

            const popupContent = `
                <div class="map-popup-card">
                    <img src="${imgSrc}" class="map-popup-img" alt="${item.nama}" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60'">
                    <span class="map-popup-badge">${item.kategori}</span>
                    <div class="map-popup-title">${item.nama}</div>
                    <div class="map-popup-meta">
                        <span><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${item.lokasi}</span>
                        <span><i class="fa-solid fa-star" style="color:var(--accent);"></i> ${item.rating}</span>
                    </div>
                    <button class="map-popup-btn" onclick="${clickAction}"><i class="fa-solid fa-circle-info"></i> Lihat Detail</button>
                </div>`;

            const marker = L.marker([item.lat, item.lng], { icon: customIcon }).bindPopup(popupContent);
            leafletMarkersGroup.addLayer(marker);
        });
    }

    renderMapMarkers('all');
    setTimeout(() => { if (leafletMapInstance) leafletMapInstance.invalidateSize(); }, 300);

    // Filter Buttons logic
    const filterBtns = document.querySelectorAll('#mapFilterBar .map-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.mapcat;
            renderMapMarkers(cat);
            if (leafletMapInstance) leafletMapInstance.invalidateSize();
        });
    });

    window.addEventListener('resize', () => {
        if (leafletMapInstance) leafletMapInstance.invalidateSize();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PRINTABLE ITINERARY PDF GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function cetakItinerary() {
    window.print();
}

// ─── Run & Preloader Safeguard ────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('load', () => {
    setTimeout(sembunyikanPreloader, 300);
});
setTimeout(sembunyikanPreloader, 1200);

