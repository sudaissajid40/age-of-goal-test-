// --- Mock Data ---
const leaderboardData = [
    { rank: 1, player: "DarkLord_99", points: 4500 },
    { rank: 2, player: "HeadshotKing", points: 4120 },
    { rank: 3, player: "BooyahBeast", points: 3890 },
    { rank: 4, player: "SilentNinja", points: 3450 },
    { rank: 5, player: "ToxicViper", points: 3100 }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // --- State & LocalStorage ---
    let currentUser = localStorage.getItem('ff_user') || null;
    let userRegistrations = JSON.parse(localStorage.getItem('ff_regs') || '[]');

    const authContainer = document.getElementById('authContainer');

    function updateAuthUI() {
        if (currentUser) {
            authContainer.innerHTML = `
                <div class="user-profile">
                    <span class="user-name">Welcome, <strong>${currentUser}</strong></span>
                    <button class="btn btn-outline btn-sm" id="logoutBtn">Log Out</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('ff_user');
                currentUser = null;
                updateAuthUI();
                renderTournaments(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
            });
        } else {
            authContainer.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Log In</button>
                <button class="btn btn-primary" id="signupBtn">Sign Up</button>
            `;
            document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('Log In'));
            document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('Sign Up'));
        }
    }

    updateAuthUI();

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.glass-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(9, 9, 11, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(9, 9, 11, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- Render Tournaments ---
    const tournamentGrid = document.getElementById('tournamentGrid');

    function renderTournaments(filter = 'all') {
        tournamentGrid.innerHTML = '';
        
        const filtered = tournaments.filter(t => {
            if (filter === 'all') return true;
            return t.mode.toLowerCase() === filter.toLowerCase();
        });

        filtered.forEach(t => {
            const statusClass = t.status.toLowerCase() === 'live' ? 'status-live' : 'status-upcoming';
            const isRegistered = userRegistrations.includes(t.id);
            
            const card = document.createElement('div');
            card.className = 'tournament-card glass-panel';
            card.innerHTML = `
                <div class="t-image" style="background-image: ${t.image}">
                    <div class="t-status ${statusClass}">${t.status}</div>
                </div>
                <div class="t-content">
                    <h3 class="t-title">${t.title}</h3>
                    <div class="t-details">
                        <div class="t-detail-item">
                            <span>Mode</span>
                            <strong>${t.mode}</strong>
                        </div>
                        <div class="t-detail-item">
                            <span>Date</span>
                            <strong>${t.date}</strong>
                        </div>
                        <div class="t-detail-item">
                            <span>Slots Filled</span>
                            <strong>${t.slots}</strong>
                        </div>
                    </div>
                    <div class="t-footer">
                        <div class="prize-pool">
                            <span>Prize Pool</span>
                            <strong>${t.prize}</strong>
                        </div>
                        ${isRegistered 
                            ? `<button class="btn btn-secondary" disabled>Joined <ion-icon name="checkmark"></ion-icon></button>`
                            : `<button class="btn btn-primary register-btn" data-id="${t.id}">Join Now</button>`
                        }
                    </div>
                </div>
            `;
            tournamentGrid.appendChild(card);
        });

        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (!currentUser) {
                    openAuthModal('Log In to Register');
                } else {
                    openModal(id);
                }
            });
        });
    }

    renderTournaments();

    // --- Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTournaments(e.target.getAttribute('data-filter'));
        });
    });

    // --- Render Leaderboard ---
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardData.forEach(p => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        row.innerHTML = `
            <span class="rank ${p.rank <= 3 ? 'top-rank' : ''}">#${p.rank}</span>
            <span class="player">${p.player}</span>
            <span class="points">${p.points} PTS</span>
        `;
        leaderboardList.appendChild(row);
    });

    // --- Tournament Modal Logic ---
    const modal = document.getElementById('registrationModal');
    const closeModalBtn = document.getElementById('closeModal');
    const regForm = document.getElementById('registrationForm');
    const modalTitle = document.getElementById('modalTitle');
    const tournamentIdInput = document.getElementById('tournamentIdInput');

    function openModal(id) {
        const t = tournaments.find(x => x.id === id);
        if(t) {
            modalTitle.innerText = `Register: ${t.title}`;
            tournamentIdInput.value = id;
            modal.classList.add('active');
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        regForm.reset();
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = regForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Registering...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Registration Successful! Ready for Battle.');
            btn.innerText = originalText;
            btn.disabled = false;
            
            userRegistrations.push(tournamentIdInput.value);
            localStorage.setItem('ff_regs', JSON.stringify(userRegistrations));
            
            closeModal();
            renderTournaments(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
        }, 1200);
    });

    // --- Auth Modal Logic ---
    const authModal = document.getElementById('authModal');
    const closeAuthBtn = document.getElementById('closeAuthModal');
    const authForm = document.getElementById('authForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const authUsername = document.getElementById('authUsername');

    function openAuthModal(title) {
        authModalTitle.innerText = title;
        authModal.classList.add('active');
    }

    function closeAuth() {
        authModal.classList.remove('active');
        authForm.reset();
    }

    closeAuthBtn.addEventListener('click', closeAuth);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuth();
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = authUsername.value.trim();
        localStorage.setItem('ff_user', currentUser);
        closeAuth();
        updateAuthUI();
        renderTournaments(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
    });
});
