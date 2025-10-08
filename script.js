// --- Global Variables ---
const githubUsername = 'NodeNexus';

// --- GitHub Project Fetching Logic ---
async function fetchGithubProjects() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return; // Exit if not on the projects page

    projectGrid.innerHTML = `<p style="text-align: center; font-family: var(--font-mono); color: var(--secondary-text);">Fetching projects from GitHub API...</p>`;

    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const repos = await response.json();
        projectGrid.innerHTML = '';

        if (repos.length === 0) {
            projectGrid.innerHTML = `<p style="text-align: center; color: var(--secondary-text);">No public repositories found for this user.</p>`;
            return;
        }

        let delay = 0;
        repos.forEach(repo => {
            if (repo.fork) return;

            const tags = repo.language ? [repo.language, ...repo.topics] : repo.topics;
            const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.style.animationDelay = `${delay}s`;

            projectCard.innerHTML = `
                <h3>${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description provided.'}</p>
                <div class="tech-tags">${tagsHTML || '<span class="tag">No-Tags</span>'}</div>
                <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">View on GitHub &rarr;</a>`;

            projectGrid.appendChild(projectCard);
            delay += 0.1;
        });
        
        // Re-initialize 3D effects after projects have been rendered
        init3DGlassmorphism();

    } catch (error) {
        projectGrid.innerHTML = `<p style="text-align: center; color: #ff6b6b;">Failed to load projects. Please check the console for details.</p>`;
        console.error('Error fetching GitHub projects:', error);
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
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.type = type; // 'node' or 'dust'
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
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 2; }
                if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 2; }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 2; }
                if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 2; }
            }
        }

        this.x += this.directionX;
        this.y += this.directionY;
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

    let numberOfDust = 100;
    for (let i = 0; i < numberOfDust; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.1) + 0.05;
        let directionY = (Math.random() * 0.2) - 0.1;
        let color = `rgba(88, 166, 255, ${Math.random() * 0.2 + 0.05})`;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color, 'dust'));
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

            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width / 9) * (canvas.height / 9)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = `rgba(88, 166, 255, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize effects that run on every page
    init3DGlassmorphism();
    
    // Check if the canvas exists before trying to use it
    if (canvas) {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animateParticles();
    }
    
    // Page-specific logic: Only fetch projects if the project grid exists
    if (document.getElementById('project-grid')) {
        fetchGithubProjects();
    }
});
