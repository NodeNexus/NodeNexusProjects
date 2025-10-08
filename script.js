// --- Global Variables ---
const githubUsername = 'NodeNexus';

// --- Theme Toggling Logic ---
const themeToggleButton = document.getElementById('theme-toggle');
if (themeToggleButton) {
    const sunIcon = '☀️';
    const moonIcon = '🌙';
    function applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        themeToggleButton.textContent = savedTheme === 'light' ? moonIcon : sunIcon;
    }
    themeToggleButton.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        const newTheme = isLight ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        themeToggleButton.textContent = isLight ? moonIcon : sunIcon;
    });
    document.addEventListener('DOMContentLoaded', applyInitialTheme);
}

// --- Modal Logic ---
const modal = document.getElementById('project-modal');
const overlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function openModal() {
    if (!modal || !overlay) return;
    document.body.classList.add('modal-open');
    overlay.classList.add('active');
    modal.classList.add('active');
}

function closeModal() {
    if (!modal || !overlay) return;
    document.body.classList.remove('modal-open');
    overlay.classList.remove('active');
    modal.classList.remove('active');
}

if (modalCloseBtn && overlay) {
    modalCloseBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}


// --- GitHub Project & README Fetching Logic ---
async function fetchGithubProjects() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    projectGrid.innerHTML = `<p style="text-align: center; color: var(--secondary-text);">Fetching projects...</p>`;

    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const repos = await response.json();
        projectGrid.innerHTML = '';
        if (repos.length === 0) {
            projectGrid.innerHTML = `<p>No public repositories found.</p>`;
            return;
        }

        repos.forEach(repo => {
            if (repo.fork) return;
            const tags = repo.language ? [repo.language, ...repo.topics] : repo.topics;
            const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <h3>${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description provided.'}</p>
                <div class="tech-tags">${tagsHTML || ''}</div>
                <div class="project-links">
                    <button class="btn btn-secondary view-details-btn">View Details</button>
                    <a href="${repo.html_url}" class="project-link" target="_blank">On GitHub &rarr;</a>
                </div>`;

            projectCard.querySelector('.view-details-btn').addEventListener('click', () => {
                showProjectDetails(repo);
            });
            projectGrid.appendChild(projectCard);
        });
        
        init3DGlassmorphism(); // Re-initialize effects for new cards

    } catch (error) {
        projectGrid.innerHTML = `<p style="text-align: center; color: #ff6b6b;">Failed to load projects. GitHub API rate limit may have been exceeded.</p>`;
        console.error("Error fetching GitHub projects:", error);
    }
}

async function showProjectDetails(repo) {
    if (!modalTitle || !modalBody) return;
    modalTitle.textContent = repo.name;
    modalBody.innerHTML = '<p>Loading README...</p>';
    openModal();

    try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${githubUsername}/${repo.name}/readme`);
        if (!readmeResponse.ok) throw new Error('README not found.');

        const readmeData = await readmeResponse.json();
        const markdownContent = atob(readmeData.content);
        modalBody.innerHTML = marked.parse(markdownContent);
    } catch (error) {
        modalBody.innerHTML = `<p>Could not load README. The repository might not have one.</p><p style="color: var(--secondary-text);">${error.message}</p>`;
        console.error('Error fetching README:', error);
    }
}


// --- 3D Glassmorphism Tilt & Glare Effect ---
function init3DGlassmorphism() {
    const cards = document.querySelectorAll('.welcome-card, .project-card');
    const TILT_STRENGTH = 12;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const rotateY = TILT_STRENGTH * ((mouseX / rect.width) - 0.5);
            const rotateX = -TILT_STRENGTH * ((mouseY / rect.height) - 0.5);
            
            card.style.setProperty('--mouse-x', `${mouseX}px`);
            card.style.setProperty('--mouse-y', `${mouseY}px`);
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// --- Dynamic Particle Background ---
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray;

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color, type) {
            this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color; this.type = type;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width + this.size) this.x = -this.size;
            if (this.x < -this.size) this.x = canvas.width + this.size;
            if (this.y > canvas.height + this.size) this.y = -this.size;
            if (this.y < -this.size) this.y = canvas.height + this.size;

            if (this.type === 'node') {
                let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 2; }
                    if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 2; }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 2; }
                    if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 2; }
                }
            }
            this.x += this.directionX; this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfNodes = (canvas.height * canvas.width) / 15000;
        for (let i = 0; i < numberOfNodes; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.2) + 0.1;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = `rgba(88, 166, 255, ${Math.random() * 0.6 + 0.2})`;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color, 'node'));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            if (particlesArray[a].type !== 'node') continue;
            for (let b = a; b < particlesArray.length; b++) {
                if (particlesArray[b].type !== 'node') continue;
                let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                if (distance < (canvas.width / 9) * (canvas.height / 9)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(88, 166, 255, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
