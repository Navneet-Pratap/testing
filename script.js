const skills = [
  {name:'Python',desc:'Scripting, data pipelines, automation, REST APIs'},
  {name:'Test Automation',desc:'pytest, Robot Framework, coverage, flakiness detection'},
  {name:'CI/CD',desc:'GitHub Actions, GitLab CI, Jenkins, deployment workflows'},
  {name:'Infrastructure',desc:'Terraform, cloud SDKs, Docker, IaC patterns'},
  {name:'Observability',desc:'logging, metrics, alerts, Sentry, Prometheus'}
];

async function loadProfile() {
  const res = await fetch('./data/profile.json');
  if (!res.ok) throw new Error('Could not load profile data');
  return res.json();
}

function populateProfile(profile) {
  const heroName = document.getElementById('heroName');
  const heroTag = document.getElementById('heroTag');
  const heroTools = document.getElementById('heroTools');
  const emailEl = document.getElementById('email');
  const locationEl = document.getElementById('location');
  const phoneEl = document.getElementById('phone');
  const linkedinEl = document.getElementById('linkedin');

  if (heroName) heroName.textContent = `${profile.name} — ${profile.title}`;
  if (heroTag) heroTag.textContent = profile.tagline;
  if (emailEl) emailEl.textContent = profile.email;
  if (locationEl) locationEl.textContent = profile.location;
  if (phoneEl) phoneEl.textContent = profile.phone;
  if (linkedinEl) linkedinEl.textContent = profile.linkedin;

  if (heroTools && Array.isArray(profile.tools)) {
    heroTools.innerHTML = '';
    profile.tools.forEach(tool => {
      const pill = document.createElement('div');
      pill.className = 'tool-pill';
      pill.textContent = tool;
      heroTools.appendChild(pill);
    });
  }

  const downloadCV = document.getElementById('downloadCV');
  if (downloadCV && profile.cv) {
    downloadCV.addEventListener('click', () => {
      window.open(profile.cv, '_blank');
    });
  }
}

function setupOrbMotion() {
  const orb = document.querySelector('.orb');
  if (!orb) return;

  document.addEventListener('mousemove', e => {
    const rect = orb.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.04;
    const dy = (e.clientY - cy) * 0.04;
    orb.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
  });

  document.addEventListener('mouseleave', () => {
    orb.style.transform = 'translate(0, 0) scale(1)';
  });
}

// Add 3D effect to elements based on mouse position
function add3DEffect(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const rotateX = ((y / rect.height) - 0.5) * 15;
  const rotateY = ((x / rect.width) - 0.5) * -15;
  
  el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
}

// Reset 3D effect when mouse leaves
function reset3DEffect(e) {
  e.currentTarget.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.18});

function registerReveal() {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('visible');
    revealObserver.observe(el);
  });
}

function renderSkills() {
  const skillsGrid = document.getElementById('skillsGrid');
  if (!skillsGrid) return;
  skillsGrid.innerHTML = '';

  skills.forEach((skill, index) => {
    const card = document.createElement('div');
    card.className = 'skill';
    card.innerHTML = `
      <h3>${skill.name}</h3>
      <p>${skill.desc}</p>
      <span class="skill-badge">${skill.name.split(' ')[0]}</span>
    `;
    card.style.animation = `popUp 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards ${index * 0.1}s`;
    card.addEventListener('mousemove', add3DEffect);
    card.addEventListener('mouseleave', reset3DEffect);
    skillsGrid.appendChild(card);
  });
}

function renderProjectCards(projects) {
  const grid = document.getElementById('projectsGrid');
  const tpl = document.getElementById('projectCardTpl');
  if (!grid || !tpl) return;

  grid.innerHTML = '';
  projects.forEach((project, index) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.project-card');
    const inner = node.querySelector('.card-inner');

    card.querySelector('.proj-title').textContent = project.title;
    card.querySelector('.proj-tags').textContent = project.tags.join(' • ');
    card.querySelector('.proj-desc').textContent = project.short;

    const linksDiv = card.querySelector('.proj-links');
    linksDiv.innerHTML = '';
    if (Array.isArray(project.links) && project.links.length > 0) {
      project.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noreferrer';
        a.textContent = link.label;
        linksDiv.appendChild(a);
      });
    } else {
      linksDiv.innerHTML = '<span class="proj-tags">No links available</span>';
    }

    card.addEventListener('click', () => openProjectModal(project));
    card.addEventListener('mousemove', add3DEffect);
    card.addEventListener('mouseleave', reset3DEffect);
    card.style.animation = `depthBounce 1.2s ease-out forwards ${index * 0.12}s`;
    card.style.setProperty('--index', index);
    grid.appendChild(node);
  });
}

async function loadProjects() {
  try {
    const res = await fetch('./data/projects.json');
    if (!res.ok) throw new Error('Could not load projects');
    const projects = await res.json();
    renderProjectCards(projects);
  } catch (err) {
    console.error('Project load failed', err);
  }
}

function openProjectModal(project) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal-box';

  box.innerHTML = `
    <div class="modal-header">
      <div>
        <h3>${project.title}</h3>
        <div class="proj-tags">${project.tags.join(' • ')}</div>
      </div>
      <button class="modal-close" aria-label="Close">×</button>
    </div>
    <p class="proj-desc">${project.description}</p>
    <div class="modal-links"></div>
  `;

  const links = box.querySelector('.modal-links');
  if (!links) return;

  if (!Array.isArray(project.links) || project.links.length === 0) {
    links.innerHTML = '<span class="proj-tags">No external links provided yet.</span>';
  } else {
    project.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.textContent = link.label;
      links.appendChild(a);
    });
  }

  const closeButton = box.querySelector('.modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => document.body.removeChild(modal));
  }

  modal.addEventListener('click', event => {
    if (event.target === modal) document.body.removeChild(modal);
  });

  modal.appendChild(box);
  document.body.appendChild(modal);
}

function setupInteractions() {
  const filterInput = document.getElementById('projectFilter');
  if (filterInput) {
    filterInput.addEventListener('input', async (event) => {
      const q = event.target.value.trim().toLowerCase();
      const res = await fetch('./data/projects.json');
      if (!res.ok) return;
      const projects = await res.json();
      const filtered = projects.filter(project => {
        return project.tags.join(' ').toLowerCase().includes(q) || project.title.toLowerCase().includes(q);
      });
      renderProjectCards(filtered);
    });
  }

  const viewProjects = document.getElementById('viewProjects');
  if (viewProjects) {
    viewProjects.addEventListener('click', () => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) projectsSection.scrollIntoView({behavior: 'smooth'});
    });
  }

  // Add 3D effect to contact cards
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mousemove', add3DEffect);
    card.addEventListener('mouseleave', reset3DEffect);
  });

  // Add 3D effect to tool pills
  document.querySelectorAll('.tool-pill').forEach(pill => {
    pill.addEventListener('mousemove', add3DEffect);
    pill.addEventListener('mouseleave', reset3DEffect);
  });

  // Add 3D effect to metric cards
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('mousemove', add3DEffect);
    card.addEventListener('mouseleave', reset3DEffect);
  });
}

function setupReload() {
  let __lr_last = null;
  async function __lr_check() {
    try {
      const r = await fetch('/__reload', {cache:'no-store'});
      if (!r.ok) return;
      const ts = await r.text();
      if (__lr_last === null) __lr_last = ts;
      else if (ts !== __lr_last) {
        location.reload();
      }
    } catch (err) {
      // ignore reload errors
    }
  }
  setInterval(__lr_check, 1200);
}

window.addEventListener('DOMContentLoaded', async () => {
  renderSkills();
  setupOrbMotion();
  registerReveal();
  setupInteractions();
  setupReload();

  try {
    const profile = await loadProfile();
    if (profile) populateProfile(profile);
  } catch (err) {
    console.error('Profile load failed', err);
  }

  loadProjects();
});
