const API_BASE_URL = 'http://localhost:5000/api';

const MOCK_DATA = {
    "vortex": {
        "id": "33333333-3333-3333-3333-333333333333",
        "fullName": "v0rteX Software Engineer",
        "title": "Senior Backend Architect",
        "bio": "Passionate about .NET 9, Clean Architecture, and microservices in PostgreSQL ecosystems. King of backend setups.",
        "email": "vortex@portfolify.com",
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        "blogUrl": "https://blog.vortex.dev",
        "followerCount": 154,
        "isFollowing": false,
        "socialLinks": [
            { "id": "1", "platformName": "GitHub", "url": "https://github.com/vortex", "iconName": "fa-brands fa-github" },
            { "id": "2", "platformName": "LinkedIn", "url": "https://linkedin.com/in/vortex-dev", "iconName": "fa-brands fa-linkedin-in" },
            { "id": "3", "platformName": "Medium", "url": "https://medium.com/@vortex", "iconName": "fa-brands fa-medium" }
        ],
        "projects": [
            {
                "id": "p1",
                "title": "Portfolify Backend Engine",
                "description": "Clean Architecture, CQRS (MediatR), and multi-tenant SaaS backend foundation mapped to PostgreSQL.",
                "githubUrl": "https://github.com/vortex/portfolify-backend",
                "projectUrl": null,
                "isFeatured": true,
                "displayOrder": 1
            },
            {
                "id": "p2",
                "title": "Antigravity IDE Assistant",
                "description": "A highly intelligent, agentic coding assistant automating multi-layer architectural migrations.",
                "githubUrl": "https://github.com/vortex/antigravity",
                "projectUrl": "https://antigravity.dev",
                "isFeatured": true,
                "displayOrder": 2
            }
        ],
        "skills": [
            {
                "id": "55555555-5555-5555-5555-555555555555",
                "name": ".NET 9 / ASP.NET Core",
                "proficiencyLevel": 95,
                "displayOrder": 1,
                "endorsements": [
                    {
                        "id": "e1",
                        "endorsedById": "44444444-4444-4444-4444-444444444444",
                        "endorsedByName": "John Doe",
                        "comment": "Absolutely brilliant at Clean Architecture and C# optimizations!"
                    }
                ]
            },
            {
                "id": "66666666-6666-6666-6666-666666666666",
                "name": "PostgreSQL & Database Design",
                "proficiencyLevel": 90,
                "displayOrder": 2,
                "endorsements": []
            }
        ]
    },
    "johndoe": {
        "id": "44444444-4444-4444-4444-444444444444",
        "fullName": "John Doe",
        "title": "Full Stack Engineer",
        "bio": "Building elegant mobile cards and SaaS platforms. Tech enthusiast, gamer, open-source contributor.",
        "email": "john.doe@portfolify.com",
        "avatarUrl": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
        "blogUrl": "https://john.dev",
        "followerCount": 42,
        "isFollowing": false,
        "socialLinks": [
            { "id": "4", "platformName": "GitHub", "url": "https://github.com/johndoe", "iconName": "fa-brands fa-github" },
            { "id": "5", "platformName": "Twitter", "url": "https://twitter.com/johndoe", "iconName": "fa-brands fa-twitter" }
        ],
        "projects": [
            {
                "id": "p3",
                "title": "Personal Linktree Card",
                "description": "A glassmorphism personal business card template designed with HTML and CSS.",
                "githubUrl": "https://github.com/johndoe/card",
                "projectUrl": "https://johndoe.card",
                "isFeatured": true,
                "displayOrder": 1
            }
        ],
        "skills": [
            {
                "id": "s3",
                "name": "React & Tailwind CSS",
                "proficiencyLevel": 88,
                "displayOrder": 1,
                "endorsements": [
                    {
                        "id": "e2",
                        "endorsedById": "33333333-3333-3333-3333-333333333333",
                        "endorsedByName": "v0rteX Software Engineer",
                        "comment": "Super clean CSS components and great design eye!"
                    }
                ]
            }
        ]
    }
};

let currentTenant = 'vortex';
let activeData = null;
let isMockMode = true;

function resolveTenant() {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    if (tenantParam && MOCK_DATA[tenantParam.toLowerCase()]) {
        currentTenant = tenantParam.toLowerCase();
        return;
    }

    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
        const subdomain = parts[0].toLowerCase();
        if (MOCK_DATA[subdomain]) {
            currentTenant = subdomain;
        }
    }
}

async function loadProfile() {
    resolveTenant();
    
    const badge = document.getElementById('status-badge');
    const badgeText = badge.querySelector('.badge-text');

    try {
        const response = await fetch(`${API_BASE_URL}/DeveloperProfile/details`, {
            method: 'GET',
            headers: {
                'X-Tenant': currentTenant
            }
        });

        if (response.ok) {
            const data = await response.json();
            activeData = data;
            activeData.followerCount = activeData.followerCount || (currentTenant === 'vortex' ? 154 : 42);
            activeData.isFollowing = false;
            
            isMockMode = false;
            badge.className = "badge badge-live";
            badgeText.textContent = "Live API Connected";
        } else {
            throw new Error("Backend resolved, but profile not found.");
        }
    } catch (error) {
        console.warn("Backend API not reachable. Falling back to Mock Mode.", error);
        activeData = JSON.parse(JSON.stringify(MOCK_DATA[currentTenant]));
        isMockMode = true;
        badge.className = "badge badge-mock";
        badgeText.textContent = "Offline Mock Mode";
    }

    renderProfile();
}

function renderProfile() {
    if (!activeData) return;

    document.getElementById('dev-avatar').src = activeData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde';
    document.getElementById('dev-name').textContent = activeData.fullName;
    document.getElementById('dev-title').textContent = activeData.title;
    document.getElementById('dev-bio').textContent = activeData.bio;
    document.getElementById('follower-count').textContent = activeData.followerCount;

    const blogBtn = document.getElementById('btn-blog');
    if (activeData.blogUrl) {
        blogBtn.href = activeData.blogUrl;
        blogBtn.style.display = 'inline-flex';
    } else {
        blogBtn.style.display = 'none';
    }

    updateFollowButtonUI();

    const socialWrap = document.getElementById('social-links');
    socialWrap.innerHTML = '';
    const links = activeData.socialLinks || [];
    links.forEach(link => {
        const iconClass = getPlatformIcon(link.platformName);
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.className = 'social-icon';
        a.title = link.platformName;
        a.innerHTML = `<i class="${iconClass}"></i>`;
        socialWrap.appendChild(a);
    });

    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    const projects = activeData.projects || [];
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<p class="bio">No projects uploaded yet.</p>';
    } else {
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            let linksHtml = '';
            if (project.githubUrl) {
                linksHtml += `<a href="${project.githubUrl}" target="_blank" class="project-link"><i class="fa-brands fa-github"></i> GitHub</a>`;
            }
            if (project.projectUrl) {
                linksHtml += `<a href="${project.projectUrl}" target="_blank" class="project-link"><i class="fa-solid fa-link"></i> Live Demo</a>`;
            }

            const featuredBadge = project.isFeatured ? '<span class="project-featured-badge">Featured</span>' : '';

            card.innerHTML = `
                ${featuredBadge}
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <div class="project-links">${linksHtml}</div>
            `;
            projectsGrid.appendChild(card);
        });
    }

    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    const skills = activeData.skills || [];
    if (skills.length === 0) {
        skillsList.innerHTML = '<p class="bio">No skills added yet.</p>';
    } else {
        skills.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'skill-item';
            
            const endorsements = skill.endorsements || [];
            let endorsementsHtml = '';

            if (endorsements.length > 0) {
                endorsementsHtml = `
                    <div class="endorsements-wrap">
                        <div class="endorsements-title">Endorsements (${endorsements.length})</div>
                        <div class="endorsements-scroller">
                            ${endorsements.map(e => `
                                <div class="endorsement-bubble">
                                    <div class="endorsement-author">${e.endorsedByName}</div>
                                    <div class="endorsement-comment">"${e.comment}"</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            item.innerHTML = `
                <div class="skill-info">
                    <span class="skill-name">${skill.name}</span>
                    <button class="btn-endorse" onclick="openEndorseModal('${skill.id}', '${skill.name}')">
                        <i class="fa-regular fa-heart"></i> Endorse <span class="endorse-count">${endorsements.length}</span>
                    </button>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${skill.proficiencyLevel}%"></div>
                </div>
                ${endorsementsHtml}
            `;
            skillsList.appendChild(item);
        });
    }
}

function getPlatformIcon(platform) {
    const p = platform.toLowerCase();
    if (p.includes('github')) return 'fa-brands fa-github';
    if (p.includes('linkedin')) return 'fa-brands fa-linkedin-in';
    if (p.includes('twitter')) return 'fa-brands fa-twitter';
    if (p.includes('medium')) return 'fa-brands fa-medium';
    if (p.includes('blog') || p.includes('website')) return 'fa-solid fa-globe';
    return 'fa-solid fa-link';
}

function switchTab(evt, tabId) {
    const tabcontents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].className = tabcontents[i].className.replace(" active-content", "");
    }

    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabId).className += " active-content";
    evt.currentTarget.className += " active";
}

document.getElementById('btn-follow').addEventListener('click', async () => {
    if (!activeData) return;

    activeData.isFollowing = !activeData.isFollowing;
    if (activeData.isFollowing) {
        activeData.followerCount++;
    } else {
        activeData.followerCount--;
    }
    document.getElementById('follower-count').textContent = activeData.followerCount;
    updateFollowButtonUI();

    if (!isMockMode) {
        try {
            const followerProfileId = currentTenant === 'vortex' 
                ? '44444444-4444-4444-4444-444444444444' 
                : '33333333-3333-3333-3333-333333333333';

            const endpoint = activeData.isFollowing ? '/Follow' : '/Follow/unfollow';
            await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    followerId: followerProfileId,
                    followedId: activeData.id
                })
            });
        } catch (err) {
            console.error("API follow failed:", err);
        }
    }
});

function updateFollowButtonUI() {
    const btn = document.getElementById('btn-follow');
    if (activeData.isFollowing) {
        btn.innerHTML = `<i class="fa-solid fa-user-minus"></i> Unfollow <span id="follower-count" class="count-badge">${activeData.followerCount}</span>`;
        btn.style.background = "rgba(220, 38, 38, 0.2)";
        btn.style.border = "1px solid rgba(220, 38, 38, 0.4)";
        btn.style.color = "#fca5a5";
    } else {
        btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Follow <span id="follower-count" class="count-badge">${activeData.followerCount}</span>`;
        btn.style.background = "linear-gradient(135deg, var(--primary) 0%, hsl(263, 85%, 50%) 100%)";
        btn.style.border = "none";
        btn.style.color = "white";
    }
}

function openEndorseModal(skillId, skillName) {
    document.getElementById('endorse-skill-id').value = skillId;
    document.getElementById('endorse-skill-name').textContent = skillName;
    
    const select = document.getElementById('endorser-profile-select');
    select.innerHTML = '';
    
    Object.keys(MOCK_DATA).forEach(key => {
        if (key !== currentTenant) {
            const p = MOCK_DATA[key];
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.fullName} (${p.title})`;
            select.appendChild(opt);
        }
    });

    document.getElementById('endorse-modal').classList.add('open');
}

function closeEndorseModal() {
    document.getElementById('endorse-modal').classList.remove('open');
    document.getElementById('endorse-form').reset();
}

async function submitEndorsement(event) {
    event.preventDefault();
    if (!activeData) return;

    const skillId = document.getElementById('endorse-skill-id').value;
    const endorserId = document.getElementById('endorser-profile-select').value;
    const comment = document.getElementById('endorse-comment').value;

    const endorserProfile = Object.values(MOCK_DATA).find(p => p.id === endorserId);
    const endorserName = endorserProfile ? endorserProfile.fullName : 'Developer Reviewer';

    const skill = activeData.skills.find(s => s.id === skillId);
    if (skill) {
        skill.endorsements.push({
            id: 'temp-' + Date.now(),
            endorsedById: endorserId,
            endorsedByName: endorserName,
            comment: comment
        });
        renderProfile();
    }

    closeEndorseModal();

    if (!isMockMode) {
        try {
            await fetch(`${API_BASE_URL}/Skill/endorse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant': currentTenant
                },
                body: JSON.stringify({
                    skillId: skillId,
                    endorsedById: endorserId,
                    comment: comment
                })
            });
        } catch (err) {
            console.error("API endorsement submit failed:", err);
        }
    }
}

window.onload = loadProfile;
