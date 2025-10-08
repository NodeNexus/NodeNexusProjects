// --- Theme Toggling Logic ---
const themeToggleButton = document.getElementById('theme-toggle');
const sunIcon = '☀️';
const moonIcon = '🌙';

// Function to apply the saved theme on page load
function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    themeToggleButton.textContent = savedTheme === 'light' ? moonIcon : sunIcon;
}

// Event listener for the toggle button
themeToggleButton.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    themeToggleButton.textContent = isLight ? moonIcon : sunIcon;
});

// Apply the theme when the DOM is loaded
document.addEventListener('DOMContentLoaded', applyInitialTheme);


// --- GitHub Project Fetching Logic ---
const githubUsername = 'NodeNexus';
const projectGrid = document.getElementById('project-grid');

async function fetchGithubProjects() {
    // Only run if the project grid exists on the current page
    if (!projectGrid) {
        return;
    }
    projectGrid.innerHTML = `<p style="text-align: center; font-family: var(--font-mono); color: var(--secondary-text);">Fetching projects...</p>`;

    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const repos = await response.json();
        
        projectGrid.innerHTML = '';
        if (repos.length === 0) {
            projectGrid.innerHTML = `<p style="text-align: center; color: var(--secondary-text);">No public repositories found.</p>`;
            return;
        }

        repos.forEach(repo => {
            if (repo.fork) {
                return;
            }
            const tags = repo.language ? [repo.language, ...repo.topics] : repo.topics;
            const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <h3>${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description provided.'}</p>
                <div class="tech-tags">${tagsHTML || '<span class="tag">No-Tags</span>'}</div>
                <a href="${repo.html_url}" class="project-link" target="_blank">View on GitHub &rarr;</a>`;
            projectGrid.appendChild(projectCard);
        });
    } catch (error) {
        projectGrid.innerHTML = `<p style="text-align: center; color: #ff6b6b;">Failed to load projects.</p>`;
        console.error('Error fetching GitHub projects:', error);
    }
}

// Run the project fetcher if the project grid is on the page
if (projectGrid) {
    fetchGithubProjects();
}


// --- Dynamic Background & Electrical Icons Logic ---
const body = document.body;
const electricalIcons = ['⚡', '📡', '🔌', '🧲', '🔬', '💡', '⚙️', '💻', '⚛️', '🛰️'];
const numIcons = 25;
let iconElements = [];
let mouse = { x: 0, y: 0 };

function initElectricalIcons() {
    for (let i = 0; i < numIcons; i++) {
        const icon = document.createElement('div');
        icon.className = 'electrical-icon';
        icon.textContent = electricalIcons[Math.floor(Math.random() * electricalIcons.length)];
        icon.style.left = `${Math.random() * 100}vw`;
        icon.style.top = `${Math.random() * 100}vh`;
        // Slowed down speed
        icon.dataset.speedX = (Math.random() - 0.5) * 0.2; 
        icon.dataset.speedY = (Math.random() - 0.5) * 0.2;
        icon.dataset.rotation = Math.random() * 360;
        icon.style.transform = `rotate(${icon.dataset.rotation}deg)`;
        iconElements.push(icon);
        body.appendChild(icon);
    }
}

function animateIcons() {
    const parallaxStrength = 0.05;
    // Slowed down rotation
    const rotateSpeed = 0.05; 

    iconElements.forEach(icon => {
        let currentX = parseFloat(icon.style.left);
        let currentY = parseFloat(icon.style.top);
        currentX += parseFloat(icon.dataset.speedX);
        currentY += parseFloat(icon.dataset.speedY);

        if (currentX < -5) currentX = 105; if (currentX > 105) currentX = -5;
        if (currentY < -5) currentY = 105; if (currentY > 105) currentY = -5;

        const dx = (mouse.x / window.innerWidth - 0.5) * parallaxStrength * 100;
        const dy = (mouse.y / window.innerHeight - 0.5) * parallaxStrength * 100;
        icon.style.left = `${currentX + dx}vw`;
        icon.style.top = `${currentY + dy}vh`;

        icon.dataset.rotation = (parseFloat(icon.dataset.rotation) + rotateSpeed) % 360;
        
        const rect = icon.getBoundingClientRect();
        const iconCenterX = rect.left + rect.width / 2;
        const iconCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(mouse.x - iconCenterX, 2) + Math.pow(mouse.y - iconCenterY, 2));
        const proximityThreshold = 150;

        if (distance < proximityThreshold) {
            const influence = 1 - (distance / proximityThreshold);
            icon.style.opacity = 0.1 + (0.5 * influence);
            icon.style.transform = `rotate(${icon.dataset.rotation}deg) scale(${1 + (0.3 * influence)})`;
        } else {
            icon.style.opacity = 0.1;
            icon.style.transform = `rotate(${icon.dataset.rotation}deg)`;
        }
    });
    requestAnimationFrame(animateIcons);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const xFactor = e.clientX / window.innerWidth;
    const colorStart = getComputedStyle(body).getPropertyValue('--bg-color-start').trim();
    const colorEnd = getComputedStyle(body).getPropertyValue('--bg-color-end').trim();
    
    // Hex to RGB conversion
    const hexToRgb = hex => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) { r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16); } 
        else if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
        return { r, g, b };
    };

    // Interpolate colors
    const rgb1 = hexToRgb(colorStart);
    const rgb2 = hexToRrb(colorEnd);
    const r = Math.round(rgb1.r + xFactor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + xFactor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + xFactor * (rgb2.b - rgb1.b));
    body.style.backgroundColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
});

// Initialize the background animation
initElectricalIcons();
animateIcons();