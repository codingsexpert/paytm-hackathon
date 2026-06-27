// Main Controller Module (app.js)
// Orchestrates navigation routing, interactive DOM rendering, form handlers, and states.

import { initialChapters, initialEvents, initialMembers, initialResources, statisticsData } from './components/data.js';
import { renderLineChart, renderDonutChart, renderBarChart } from './components/charts.js';
import { CommunityAssistant } from './components/assistant.js';

class PlatformController {
  constructor() {
    this.chapters = [];
    this.events = [];
    this.members = [];
    this.resources = [];
    this.stats = {};
    
    this.currentUser = null;
    this.assistant = null;
    this.activeEventForRegistration = null;

    this.init();
  }

  async init() {
    // Load local storage states or fallback to defaults
    this.chapters = JSON.parse(localStorage.getItem('adc_chapters')) || initialChapters;
    this.events = JSON.parse(localStorage.getItem('adc_events')) || initialEvents;
    this.members = JSON.parse(localStorage.getItem('adc_members')) || initialMembers;
    this.resources = JSON.parse(localStorage.getItem('adc_resources')) || initialResources;
    this.stats = JSON.parse(localStorage.getItem('adc_stats')) || statisticsData;
    this.currentUser = JSON.parse(localStorage.getItem('adc_user')) || null;

    // Initialize Assistant
    this.assistant = new CommunityAssistant((action, payload) => this.handleAssistantCallback(action, payload));

    // Bind event handlers
    this.bindEvents();

    // Check user onboarding state
    this.updateUserSessionUI();

    // Load URL Hash Routing
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());

    // Initial Dashboard renders
    this.renderAllViews();
  }

  // --- STATE CONTROLLERS ---
  saveState() {
    localStorage.setItem('adc_chapters', JSON.stringify(this.chapters));
    localStorage.setItem('adc_events', JSON.stringify(this.events));
    localStorage.setItem('adc_members', JSON.stringify(this.members));
    localStorage.setItem('adc_resources', JSON.stringify(this.resources));
    localStorage.setItem('adc_stats', JSON.stringify(this.stats));
    localStorage.setItem('adc_user', JSON.stringify(this.currentUser));
  }

  updateUserSessionUI() {
    const banner = document.getElementById('onboarding-nag-banner');
    const avatar = document.getElementById('header-user-avatar');
    const nameDisplay = document.getElementById('user-display-name');
    const roleDisplay = document.getElementById('user-display-role');

    if (this.currentUser) {
      if (banner) banner.style.display = 'none';
      if (nameDisplay) nameDisplay.textContent = this.currentUser.name;
      if (roleDisplay) roleDisplay.textContent = this.currentUser.role;
      if (avatar) {
        avatar.innerHTML = `<span>${this.currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>`;
      }
    } else {
      if (banner) banner.style.display = 'flex';
      if (nameDisplay) nameDisplay.textContent = 'Guest Developer';
      if (roleDisplay) roleDisplay.textContent = 'Chapter Seeker';
      if (avatar) avatar.innerHTML = `<span>U</span>`;
    }
  }

  handleAssistantCallback(action, payload) {
    if (action === "onboard_complete") {
      this.currentUser = {
        name: payload.name,
        role: payload.role,
        chapter: payload.chapter,
        framework: payload.framework
      };
      
      // Add user to the members array if not already present
      if (!this.members.some(m => m.name === payload.name)) {
        this.members.unshift({
          name: payload.name,
          role: payload.role,
          chapter: payload.chapter,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
          skills: [payload.framework, "Python"],
          projects: 0,
          github: "https://github.com",
          badge: "New Builder"
        });
      }

      this.saveState();
      this.updateUserSessionUI();
      this.renderMembers();
      this.updateStatsCounters();
    } else if (action === "register_agentathon") {
      // Find Agentathon event
      const agentathon = this.events.find(e => e.id === "agentathon-ncr-2026");
      if (agentathon && !agentathon.registered) {
        agentathon.registered = true;
        agentathon.attendees += 1;
        this.stats.registrationsByChapter[0].registrations += 1; // Add to Delhi NCR
        this.saveState();
        this.renderEvents();
        this.updateStatsCounters();
        this.renderCharts();
      }
    }
  }

  // --- NAVIGATION ROUTER ---
  handleRouting() {
    const hash = window.location.hash.substring(1) || 'home';
    this.switchTab(hash);
  }

  switchTab(tabId) {
    // Hide all view sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(s => s.classList.remove('active'));

    // Deactivate all sidebar items
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected view
    const targetSection = document.getElementById(`view-${tabId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Activate selected navigation menu item
    const targetNavItem = document.querySelector(`.nav-menu [data-tab="${tabId}"]`);
    if (targetNavItem) {
      targetNavItem.classList.add('active');
    }

    // Auto load charts when stats page becomes active
    if (tabId === 'stats' || tabId === 'home') {
      // Brief delay to ensure container width calculations are correct
      setTimeout(() => this.renderCharts(), 50);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- RENDER FUNCTIONS ---
  renderAllViews() {
    this.renderChapters();
    this.renderEvents();
    this.renderMembers();
    this.renderResources();
    this.updateStatsCounters();
  }

  // Render Chapter Cards & Map pins
  renderChapters(query = '', status = 'all') {
    const grid = document.getElementById('chapters-list-grid');
    const pinsLayer = document.getElementById('map-pins-layer');
    if (!grid || !pinsLayer) return;

    let filtered = this.chapters;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(c => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }

    if (status === 'featured') {
      filtered = filtered.filter(c => c.featured);
    } else if (status === 'active') {
      filtered = filtered.filter(c => c.status === 'Active');
    }

    // Render Cards
    grid.innerHTML = filtered.map(c => `
      <div class="card ${c.featured ? 'event-card featured' : ''}">
        <span class="card-badge ${c.featured ? 'badge-cyan' : 'badge-purple'}">
          ${c.featured ? 'Featured Hub' : 'Chapter'}
        </span>
        <h3 class="card-title" style="margin-top: 10px;">${c.name}</h3>
        <p class="card-desc">${c.description}</p>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
          <p><strong>Chapter Lead:</strong> ${c.lead}</p>
          <p><strong>Members:</strong> ${c.members} builders</p>
        </div>
        <div class="card-meta">
          <span>📍 ${c.city}, ${c.country}</span>
          <button class="btn btn-sm btn-outline" onclick="app.joinLocalChapter('${c.id}')">Join Chapter</button>
        </div>
      </div>
    `).join("");

    // Render Pins on Map panel
    pinsLayer.innerHTML = filtered.map(c => `
      <div class="map-pin" 
           style="left: ${c.coordinates.x}%; top: ${c.coordinates.y}%;"
           onmouseover="app.showMapPopup(event, '${c.name}', '${c.lead}', ${c.members})"
           onmouseout="app.hideMapPopup()">
      </div>
    `).join("");
  }

  joinLocalChapter(chapterId) {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    if (!this.currentUser) {
      this.openChatWithText(`Onboard me to join the ${chapter.name}`);
      return;
    }

    chapter.members += 1;
    this.saveState();
    this.renderChapters();
    this.updateStatsCounters();
    this.showToast(`🎉 Successfully joined the ${chapter.name}! Welcome to the local developer circle.`);
  }

  showMapPopup(event, name, lead, members) {
    const popup = document.getElementById('map-info-popup');
    if (!popup) return;

    popup.innerHTML = `
      <h4>${name}</h4>
      <p style="color:var(--text-muted); margin: 2px 0;">Lead: ${lead}</p>
      <p style="color:var(--cyan); font-weight:bold;">${members} Members</p>
    `;

    const pinRect = event.target.getBoundingClientRect();
    const mapRect = document.getElementById('chapters-map-panel').getBoundingClientRect();

    const x = pinRect.left - mapRect.left + pinRect.width / 2;
    const y = pinRect.top - mapRect.top;

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.opacity = '1';
  }

  hideMapPopup() {
    const popup = document.getElementById('map-info-popup');
    if (popup) popup.style.opacity = '0';
  }

  // Render Event Cards
  renderEvents(query = '', type = 'all') {
    const grid = document.getElementById('events-list-grid');
    if (!grid) return;

    let filtered = this.events;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }

    if (type !== 'all') {
      filtered = filtered.filter(e => e.type === type);
    }

    grid.innerHTML = filtered.map(e => {
      const isAgentathon = e.id === "agentathon-ncr-2026";
      const isPast = new Date(e.date) < new Date();
      const statusText = isPast ? "Completed" : (e.registered ? "Registered" : "Registration Open");
      const badgeClass = isAgentathon ? "badge-pink" : (isPast ? "badge-purple" : "badge-cyan");

      let actionButton = '';
      if (isPast) {
        actionButton = `<button class="btn btn-sm btn-outline btn-block" disabled>Completed</button>`;
      } else if (e.registered) {
        // Find local ticket downloadable SVG trigger
        actionButton = `
          <div style="display:flex; gap:8px; width:100%;">
            <button class="btn btn-sm btn-outline" style="flex:1;" onclick="app.showRegistrationTicket('${e.id}')">🎟️ View Pass</button>
            <button class="btn btn-sm btn-cyan" style="flex:1;" disabled>Registered</button>
          </div>
        `;
      } else {
        actionButton = `<button class="btn btn-sm btn-cyan btn-block" onclick="app.openRegistrationModal('${e.id}')">Register for Event</button>`;
      }

      return `
        <div class="card event-card ${isAgentathon ? 'featured' : ''}">
          <span class="card-badge ${badgeClass}">${statusText}</span>
          <h3 class="card-title" style="margin-top: 10px;">${e.title}</h3>
          <p class="card-desc">${e.description}</p>
          <ul class="event-details-list">
            <li><span>📍</span> ${e.location}</li>
            <li><span>📅</span> ${e.date} (${e.time})</li>
            <li><span>👥</span> ${e.attendees} Registered Attendees</li>
            ${e.bonusPoints ? `<li style="color:var(--cyan); font-weight:bold;">🔥 Earn +${e.bonusPoints} AgentField.ai Integration Bonus</li>` : ''}
          </ul>
          <div class="card-meta" style="margin-top:16px;">
            <span>Hosted by: <strong>${e.host}</strong></span>
            ${actionButton}
          </div>
        </div>
      `;
    }).join("");
  }

  // Render Members List
  renderMembers(query = '', skill = 'all') {
    const grid = document.getElementById('members-list-grid');
    if (!grid) return;

    let filtered = this.members;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.chapter.toLowerCase().includes(q) || m.skills.some(s => s.toLowerCase().includes(q)));
    }

    if (skill !== 'all') {
      filtered = filtered.filter(m => m.skills.includes(skill));
    }

    grid.innerHTML = filtered.map(m => `
      <div class="card member-card">
        <div class="member-card-avatar">
          <img src="${m.avatar}" alt="${m.name}">
        </div>
        <span class="badge ${m.badge === 'Organizer' ? 'badge-pink' : 'badge-cyan'}" style="font-size:9px; display:inline-block; margin-bottom:8px;">${m.badge}</span>
        <h4>${m.name}</h4>
        <p>${m.role}</p>
        <p style="color:var(--text-muted); font-size:11px; margin-bottom:8px;">📍 ${m.chapter} Chapter</p>
        <div class="member-tags">
          ${m.skills.map(s => `<span class="member-tag">${s}</span>`).join("")}
        </div>
        <div style="display:flex; gap:6px; margin-top:12px;">
          <a href="${m.github}" target="_blank" class="btn btn-sm btn-outline" style="flex:1;">GitHub</a>
          <button class="btn btn-sm btn-cyan" style="flex:1;" onclick="app.connectWithMember('${m.name}')">Connect</button>
        </div>
      </div>
    `).join("");
  }

  connectWithMember(name) {
    this.showToast(`✉️ Connection request sent to ${name}! They will receive your notification.`);
  }

  // Render Resource List
  renderResources(query = '', tag = 'all') {
    const list = document.getElementById('resources-list-container');
    if (!list) return;

    let filtered = this.resources;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
    }

    if (tag !== 'all') {
      filtered = filtered.filter(r => r.tags.includes(tag));
    }

    list.innerHTML = filtered.map(r => `
      <div class="card resource-card">
        <div>
          <span class="badge badge-purple" style="font-size:10px;">${r.category}</span>
          <h3 class="card-title" style="margin-top: 10px; padding-right:0;">${r.title}</h3>
          <p class="card-desc" style="margin-bottom:12px;">${r.description}</p>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            ${r.tags.map(t => `<span class="member-tag" style="background:rgba(0,242,254,0.05); color:var(--cyan); border-color:rgba(0,242,254,0.15);">${t}</span>`).join("")}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end; min-width:140px;">
          <span style="font-size:11px; color:var(--text-muted);">🕒 ${r.duration}</span>
          <div style="display:flex; gap:8px; margin-top:10px; width:100%;">
            <button class="btn btn-sm btn-outline" style="flex:1;" onclick="app.upvoteResource('${r.id}')">👍 ${r.likes}</button>
            <a href="${r.link}" class="btn btn-sm btn-cyan" style="flex:1;">Access</a>
          </div>
        </div>
      </div>
    `).join("");
  }

  upvoteResource(resourceId) {
    const res = this.resources.find(r => r.id === resourceId);
    if (res) {
      res.likes += 1;
      this.saveState();
      this.renderResources();
    }
  }

  // --- STATS HANDLER ---
  updateStatsCounters() {
    const totalMembersEl = document.getElementById('stat-total-members');
    const activeChaptersEl = document.getElementById('stat-active-chapters');
    const signupsEl = document.getElementById('stat-agentathon-signups');
    const projectsEl = document.getElementById('stat-agentfield-projects');

    if (totalMembersEl) {
      // Custom sum
      const baseMembersCount = 1320; 
      const addedMembers = this.members.length - initialMembers.length;
      totalMembersEl.textContent = (baseMembersCount + addedMembers).toLocaleString();
    }

    if (activeChaptersEl) {
      activeChaptersEl.textContent = this.chapters.length;
    }

    if (signupsEl) {
      const agentathon = this.events.find(e => e.id === "agentathon-ncr-2026");
      if (agentathon) {
        signupsEl.textContent = agentathon.attendees.toLocaleString();
      }
    }

    if (projectsEl) {
      projectsEl.textContent = this.stats.registrationsByChapter.reduce((acc, c) => acc + c.registrations, 0) - 1200; // Mock calculation matching our values
    }
  }

  renderCharts() {
    renderLineChart('stats-line-chart', this.stats.monthlyGrowth);
    renderLineChart('home-growth-chart', this.stats.monthlyGrowth);
    renderDonutChart('stats-donut-chart', this.stats.frameworkDistribution);
    renderBarChart('stats-bar-chart', this.stats.registrationsByChapter);
  }

  // --- EVENT BINDINGS & REGISTRATION MODAL ---
  bindEvents() {
    // Sidebar Tab selection links
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        window.location.hash = tab;
        
        // Auto close mobile sidebar
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });

    // Mobile menu toggle button
    const menuToggle = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Landing Page buttons
    const heroJoinBtn = document.getElementById('hero-join-btn');
    if (heroJoinBtn) {
      heroJoinBtn.addEventListener('click', () => this.openChatWithText('Onboard me'));
    }

    const exploreEventsBtn = document.getElementById('hero-explore-events-btn');
    if (exploreEventsBtn) {
      exploreEventsBtn.addEventListener('click', () => { window.location.hash = 'events'; });
    }

    const bonusInfoBtn = document.getElementById('home-bonus-info-btn');
    if (bonusInfoBtn) {
      bonusInfoBtn.addEventListener('click', () => this.openChatWithText('How do I get bonus points?'));
    }

    const nagOnboardBtn = document.getElementById('nag-onboard-btn');
    if (nagOnboardBtn) {
      nagOnboardBtn.addEventListener('click', () => this.openChatWithText('Onboard me'));
    }

    const headerTicketBtn = document.getElementById('quick-ticket-btn');
    if (headerTicketBtn) {
      headerTicketBtn.addEventListener('click', () => {
        const agentathon = this.events.find(e => e.id === "agentathon-ncr-2026");
        if (agentathon && agentathon.registered) {
          this.showRegistrationTicket("agentathon-ncr-2026");
        } else {
          this.openRegistrationModal("agentathon-ncr-2026");
        }
      });
    }

    const tickerRegisterBtn = document.getElementById('ticker-register-btn');
    if (tickerRegisterBtn) {
      tickerRegisterBtn.addEventListener('click', () => this.openRegistrationModal("agentathon-ncr-2026"));
    }

    // Modal close hooks
    const modalClose = document.getElementById('modal-close-btn');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeRegistrationModal());
    }

    // Event Registration form submit
    const regForm = document.getElementById('modal-registration-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
    }

    // Create Local Event form submit (Management Dashboard)
    const createEventForm = document.getElementById('create-event-form');
    if (createEventForm) {
      createEventForm.addEventListener('submit', (e) => this.handleCreateEvent(e));
    }

    // Submit Hackathon project
    const projForm = document.getElementById('project-submission-form');
    if (projForm) {
      projForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
    }

    // Evaluate Checklist Points live calculation
    const checklists = ['check-sdk', 'check-agents', 'check-tools'];
    checklists.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.calculateBonusScore());
      }
    });

    // Searches & Filters (Debounced simple filters)
    this.setupFilters();

    // Floating Chat overlay drawer hooks
    this.setupChatUI();
  }

  setupFilters() {
    const handleInput = (id, callback) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', (e) => callback(e.target.value));
    };

    handleInput('chapter-search', (v) => this.renderChapters(v, document.getElementById('chapter-status-filter').value));
    const chFilter = document.getElementById('chapter-status-filter');
    if (chFilter) {
      chFilter.addEventListener('change', (e) => this.renderChapters(document.getElementById('chapter-search').value, e.target.value));
    }

    handleInput('event-search', (v) => this.renderEvents(v, document.getElementById('event-type-filter').value));
    const evFilter = document.getElementById('event-type-filter');
    if (evFilter) {
      evFilter.addEventListener('change', (e) => this.renderEvents(document.getElementById('event-search').value, e.target.value));
    }

    handleInput('member-search', (v) => this.renderMembers(v, document.getElementById('member-skill-filter').value));
    const memFilter = document.getElementById('member-skill-filter');
    if (memFilter) {
      memFilter.addEventListener('change', (e) => this.renderMembers(document.getElementById('member-search').value, e.target.value));
    }

    handleInput('resource-search', (v) => this.renderResources(v, document.getElementById('resource-tag-filter').value));
    const resFilter = document.getElementById('resource-tag-filter');
    if (resFilter) {
      resFilter.addEventListener('change', (e) => this.renderResources(document.getElementById('resource-search').value, e.target.value));
    }

    // Global Top Search box
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const hash = window.location.hash.substring(1) || 'home';
        const v = e.target.value;
        if (hash === 'chapters') this.renderChapters(v);
        else if (hash === 'events') this.renderEvents(v);
        else if (hash === 'members') this.renderMembers(v);
        else if (hash === 'resources') this.renderResources(v);
      });
    }
  }

  // --- EVENT REGISTRATION MODAL ---
  openRegistrationModal(eventId) {
    this.activeEventForRegistration = this.events.find(e => e.id === eventId);
    if (!this.activeEventForRegistration) return;

    const modal = document.getElementById('registration-modal');
    const title = document.getElementById('modal-event-title');
    const desc = document.getElementById('modal-event-desc');

    if (modal && title && desc) {
      title.textContent = `Register for ${this.activeEventForRegistration.title}`;
      desc.textContent = `Confirm your developer details to secure your ticket pass for ${this.activeEventForRegistration.title}. Powered by AgentField.ai.`;
      
      // Auto fill if logged in
      if (this.currentUser) {
        document.getElementById('reg-name').value = this.currentUser.name;
        document.getElementById('reg-role').value = this.currentUser.role.toLowerCase().includes('student') ? 'student' : 'developer';
      }

      modal.classList.add('active');
    }
  }

  closeRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    if (modal) modal.classList.remove('active');
    this.activeEventForRegistration = null;
  }

  handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!this.activeEventForRegistration) return;

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;

    this.activeEventForRegistration.registered = true;
    this.activeEventForRegistration.attendees += 1;

    // Increment Stats for chart
    if (this.activeEventForRegistration.id === "agentathon-ncr-2026") {
      this.stats.registrationsByChapter[0].registrations += 1;
    }

    this.saveState();
    this.closeRegistrationModal();
    this.renderEvents();
    this.updateStatsCounters();

    // Trigger Assistant response to output a beautiful ticket
    this.openChatWithText(`Register me for ${this.activeEventForRegistration.title}`);
  }

  showRegistrationTicket(eventId) {
    const ev = this.events.find(e => e.id === eventId);
    if (ev) {
      this.openChatWithText(`Show my ticket for ${ev.title}`);
    }
  }

  // --- LEADS MANAGEMENT HANDLERS ---
  handleCreateEvent(e) {
    e.preventDefault();

    const title = document.getElementById('new-event-title').value;
    const date = document.getElementById('new-event-date').value;
    const type = document.getElementById('new-event-type').value;
    const location = document.getElementById('new-event-location').value;
    const description = document.getElementById('new-event-desc').value;

    const newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newEvent = {
      id: newId,
      title,
      host: this.currentUser ? this.currentUser.name : "Delhi Chapter Lead",
      sponsor: "AgentField.ai Partner",
      type,
      date,
      time: "06:00 PM IST",
      location,
      description,
      bonusPoints: 0,
      registrationOpen: true,
      registered: false,
      attendees: 1,
      image: "meetup_banner"
    };

    this.events.unshift(newEvent);
    this.saveState();
    this.renderEvents();

    this.showToast(`🎉 Successfully created event: ${title}! Published to the global collective directory.`);
    document.getElementById('create-event-form').reset();
    
    // Switch to events to show it
    window.location.hash = 'events';
  }

  calculateBonusScore() {
    const check1 = document.getElementById('check-sdk').checked;
    const check2 = document.getElementById('check-agents').checked;
    const check3 = document.getElementById('check-tools').checked;

    let score = 0;
    if (check1 && check2 && check3) score = 20;

    const scoreDisplay = document.getElementById('bonus-points-score');
    if (scoreDisplay) {
      scoreDisplay.textContent = `+${score} Points`;
      if (score === 20) {
        scoreDisplay.style.color = 'var(--cyan)';
      } else {
        scoreDisplay.style.color = 'var(--pink)';
      }
    }
    return score;
  }

  handleProjectSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('proj-title').value;
    const score = this.calculateBonusScore();

    // Increment submissions metric in stats data
    this.stats.registrationsByChapter[0].registrations += 1;
    this.saveState();

    this.showToast(`🚀 Project "${title}" successfully submitted! Total evaluated bonus points: +${score}. Your application is locked in.`);
    
    document.getElementById('project-submission-form').reset();
    this.calculateBonusScore();
    this.updateStatsCounters();
  }

  // --- AI ASSISTANT CHAT ENGINE UI ---
  setupChatUI() {
    const fab = document.getElementById('chat-fab-btn');
    const drawer = document.getElementById('assistant-drawer');
    const closeBtn = document.getElementById('close-chat-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');

    if (fab && drawer && closeBtn) {
      fab.addEventListener('click', () => {
        drawer.classList.add('active');
        fab.classList.add('hidden');
      });

      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
        fab.classList.remove('hidden');
      });
    }

    // Send Message hooks
    const handleSend = () => {
      const text = chatInput.value;
      if (text.trim()) {
        this.appendChatMessage(text, 'user');
        chatInput.value = '';

        // Simulate Agent response typing
        setTimeout(() => {
          const response = this.assistant.handleMessage(text);
          this.appendChatMessage(response.text, 'assistant', response.html);
        }, 600);
      }
    };

    if (sendBtn && chatInput) {
      sendBtn.addEventListener('click', handleSend);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Bind Quick Action buttons
    const qaActions = [
      { id: 'qa-register', text: 'Register Agentathon' },
      { id: 'qa-onboard', text: 'Onboard me' },
      { id: 'qa-brainstorm', text: 'Brainstorm project ideas' },
      { id: 'qa-bonus', text: 'How do I get bonus points?' }
    ];

    qaActions.forEach(action => {
      const el = document.getElementById(action.id);
      if (el) {
        el.addEventListener('click', () => this.sendAssistantMessage(action.text));
      }
    });
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    if (message.includes('Success') || message.includes('successfully') || message.includes('🎉') || message.includes('🚀')) {
      toast.style.borderLeftColor = 'var(--cyan)';
    } else {
      toast.style.borderLeftColor = 'var(--pink)';
    }

    toast.innerHTML = `
      <span>${message}</span>
      <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:16px; font-weight:bold;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  openChatWithText(text) {
    const fab = document.getElementById('chat-fab-btn');
    const drawer = document.getElementById('assistant-drawer');
    if (drawer && fab) {
      drawer.classList.add('active');
      fab.classList.add('hidden');
      this.sendAssistantMessage(text);
    }
  }

  sendAssistantMessage(text) {
    this.appendChatMessage(text, 'user');
    
    // Process response
    setTimeout(() => {
      const response = this.assistant.handleMessage(text);
      this.appendChatMessage(response.text, 'assistant', response.html);
    }, 600);
  }

  appendChatMessage(text, sender, htmlContent = null) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    // Remove old quick actions if any
    const oldActions = container.querySelector('.chat-quick-actions');
    if (oldActions) oldActions.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);

    if (htmlContent) {
      const cardDiv = document.createElement('div');
      cardDiv.innerHTML = htmlContent;
      container.appendChild(cardDiv);
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
}

// Instantiate globally to allow onclick handlers
window.app = new PlatformController();
