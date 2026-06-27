// Interactive AI Community Assistant (Agentic Partner)
// Handles local NLP simulation, onboarding state machines, and dynamic card generation.

export class CommunityAssistant {
  constructor(onStateUpdate) {
    this.onStateUpdate = onStateUpdate; // Callback to update parent application state
    this.sessionState = {
      stage: "idle", // idle, onboarding, brainstorming
      onboardingData: {
        name: "",
        chapter: "",
        role: "",
        framework: ""
      },
      brainstormCount: 0
    };
  }

  // Handle incoming message and generate response object
  handleMessage(messageText) {
    const text = messageText.trim().toLowerCase();

    // Reset escape command
    if (text === "exit" || text === "cancel" || text === "restart") {
      this.sessionState.stage = "idle";
      return {
        text: "Cancelled current action. How else can I assist you with Agent{A}thon or the Collective?",
        html: null
      };
    }

    // Onboarding State Machine
    if (this.sessionState.stage === "onboarding") {
      return this.handleOnboarding(messageText);
    }

    // Check basic commands
    if (text.includes("onboard") || text.includes("join collective") || text.includes("sign up")) {
      this.sessionState.stage = "onboarding";
      this.sessionState.onboardingStep = 1;
      return {
        text: "Excellent! Let's get you set up as a member of the Agentic Devs Collective. To start, what is your full name?",
        html: null
      };
    }

    if (text.includes("ticket") || text.includes("register") || text.includes("agentathon") || text.includes("agent{a}thon")) {
      return this.generateAgentathonTicket("Hacker Dev");
    }

    if (text.includes("bonus") || text.includes("points") || text.includes("agentfield") || text.includes("how to integrate")) {
      return {
        text: "To qualify for the **20 bonus points** at Agent{A}thon NCR 2026, you must integrate AgentField.ai into your project. Here is what the jury looks for:",
        html: `
          <div class="chat-card assistant-card">
            <h4>💡 AgentField.ai Integration Guide</h4>
            <ul style="padding-left: 18px; margin: 8px 0; font-size: 13px; line-height: 1.5;">
              <li><strong>Framework Hook:</strong> Initialize the AgentField platform and declare multi-agent roles.</li>
              <li><strong>Agent Interactions:</strong> Show active communication or collaborative handoffs between at least 2 agents.</li>
              <li><strong>Real Tools:</strong> Bind at least one external tool (web search, data parser, file writer) to your agents.</li>
              <li><strong>Scalability:</strong> Explain how AgentField.ai helps your application manage agent state.</li>
            </ul>
            <div style="margin-top: 10px;">
              <button class="btn btn-sm btn-outline btn-block" onclick="app.switchTab('resources')">Explore Boilerplate Templates</button>
            </div>
          </div>
        `
      };
    }

    if (text.includes("brainstorm") || text.includes("idea") || text.includes("project") || text.includes("hackathon project")) {
      return this.getBrainstormIdeas();
    }

    // Default response
    return {
      text: "Hello! I am your AgentField-powered assistant. I can help you register for Agent{A}thon NCR 2026, guide your onboarding to the collective, brainstorm project ideas, or explain how to earn the 20 bonus integration points. What would you like to do?",
      html: `
        <div class="chat-quick-actions">
          <button onclick="app.sendAssistantMessage('Register me for Agentathon')">🎟️ Get Hackathon Ticket</button>
          <button onclick="app.sendAssistantMessage('Onboard me')">⚡ Join Collective</button>
          <button onclick="app.sendAssistantMessage('Brainstorm project ideas')">💡 Project Brainstorm</button>
          <button onclick="app.sendAssistantMessage('How do I get bonus points?')">🔥 Bonus Points Info</button>
        </div>
      `
    };
  }

  handleOnboarding(inputText) {
    const step = this.sessionState.onboardingStep;

    if (step === 1) {
      this.sessionState.onboardingData.name = inputText.trim();
      this.sessionState.onboardingStep = 2;
      return {
        text: `Nice to meet you, ${this.sessionState.onboardingData.name}! Which chapter are you closest to? (e.g., Delhi NCR, Bengaluru, Mumbai, San Francisco, Tokyo)`,
        html: null
      };
    }

    if (step === 2) {
      this.sessionState.onboardingData.chapter = inputText.trim();
      this.sessionState.onboardingStep = 3;
      return {
        text: `Got it, ${this.sessionState.onboardingData.chapter}! What is your primary profile? (e.g. Student, Developer, Founder, Hobbyist)`,
        html: null
      };
    }

    if (step === 3) {
      this.sessionState.onboardingData.role = inputText.trim();
      this.sessionState.onboardingStep = 4;
      return {
        text: "Last question: What is your primary AI Framework of interest? (e.g., AgentField.ai, CrewAI, LangGraph, AutoGen)",
        html: null
      };
    }

    if (step === 4) {
      this.sessionState.onboardingData.framework = inputText.trim();
      this.sessionState.stage = "idle"; // Complete

      // Trigger state change in parent app
      if (this.onStateUpdate) {
        this.onStateUpdate("onboard_complete", this.sessionState.onboardingData);
      }

      const cardId = "member-pass-" + Math.floor(Math.random() * 10000);
      const passHtml = this.generateMemberCardHTML(this.sessionState.onboardingData, cardId);

      return {
        text: `Congratulations! You are officially onboarded to the Agentic Devs Collective. Here is your exclusive Developer Pass:`,
        html: passHtml
      };
    }
  }

  generateMemberCardHTML(data, cardId) {
    return `
      <div class="chat-card member-pass-card" id="${cardId}">
        <div class="pass-header">
          <span class="pass-title">AGENTIC DEVS COLLECTIVE</span>
          <span class="pass-chip">MEMBER PASS</span>
        </div>
        <div class="pass-body">
          <div class="pass-avatar-placeholder">
             <span>${data.name.split(" ").map(n => n[0]).join("").toUpperCase() || "DEV"}</span>
          </div>
          <div class="pass-info">
            <h3>${data.name}</h3>
            <p><strong>Role:</strong> ${data.role}</p>
            <p><strong>Chapter:</strong> ${data.chapter}</p>
            <p><strong>Focus:</strong> ${data.framework}</p>
          </div>
        </div>
        <div class="pass-footer">
          <span>UID: ADC-${Math.floor(100000 + Math.random() * 900000)}</span>
          <span class="badge badge-cyan">Verified Member</span>
        </div>
      </div>
    `;
  }

  generateAgentathonTicket(userName) {
    const ticketId = "TICKET-ATHN-" + Math.floor(1000 + Math.random() * 9000);
    
    // Register user inside the app
    if (this.onStateUpdate) {
      this.onStateUpdate("register_agentathon", { name: userName, ticketId });
    }

    const ticketSvg = `
      <svg width="340" height="180" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg" style="background:#fafaf9; border-radius:12px; border:2px solid #d97706; overflow:hidden; font-family:'Outfit', sans-serif;">
        <!-- Glowing accents -->
        <rect x="0" y="0" width="340" height="180" fill="#fafaf9" />
        <path d="M 0 0 L 100 0 L 0 100 Z" fill="#b45309" opacity="0.08" />
        <circle cx="340" cy="180" r="80" fill="#d97706" opacity="0.08" />
        
        <!-- Header -->
        <text x="20" y="30" fill="#d97706" font-size="12" font-weight="bold" letter-spacing="1.5">AGENT{A}THON NCR 2026</text>
        <text x="20" y="45" fill="#57534e" font-size="9">POWERED BY AGENTFIELD.AI</text>

        <line x1="20" y1="58" x2="320" y2="58" stroke="rgba(28, 25, 23, 0.08)" stroke-width="1" />

        <!-- Attendee info -->
        <text x="20" y="85" fill="#78716c" font-size="9">ATTENDEE</text>
        <text x="20" y="102" fill="#1c1917" font-size="14" font-weight="bold">${userName}</text>

        <text x="20" y="132" fill="#78716c" font-size="9">DATE & VENUE</text>
        <text x="20" y="146" fill="#1c1917" font-size="9" font-weight="bold">JULY 18, 2026 - DELHI NCR</text>

        <!-- QR Mock / Side Info -->
        <g transform="translate(230, 75)">
          <!-- Border -->
          <rect x="0" y="0" width="80" height="80" fill="none" stroke="#b45309" stroke-width="1.5" rx="4" />
          <!-- Mock QR lines -->
          <rect x="10" y="10" width="20" height="20" fill="#d97706" />
          <rect x="50" y="10" width="20" height="20" fill="#d97706" />
          <rect x="10" y="50" width="20" height="20" fill="#d97706" />
          <rect x="40" y="40" width="10" height="10" fill="#b45309" />
          <rect x="50" y="50" width="10" height="10" fill="#d97706" />
          <rect x="35" y="25" width="15" height="10" fill="#1c1917" />
          <rect x="25" y="45" width="10" height="15" fill="#1c1917" />
        </g>
        
        <!-- Ticket ID -->
        <text x="320" y="30" fill="#c2410c" font-size="10" font-weight="bold" text-anchor="end">${ticketId}</text>
        <text x="320" y="45" fill="#78716c" font-size="8" text-anchor="end">STATUS: ACTIVE</text>
      </svg>
    `;

    const ticketBlobUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(ticketSvg);

    return {
      text: `🎉 You have been registered successfully for Agent{A}thon NCR 2026! Here is your custom access ticket. Download it below:`,
      html: `
        <div class="chat-card ticket-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            ${ticketSvg}
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="${ticketBlobUrl}" download="Agentathon_Ticket_${ticketId}.svg" class="btn btn-sm btn-cyan btn-block" style="text-align: center; text-decoration: none;">⬇️ Download Ticket SVG</a>
          </div>
        </div>
      `
    };
  }

  getBrainstormIdeas() {
    this.sessionState.brainstormCount++;
    const setA = [
      {
        title: "🛡️ SafeContract Agent Framework",
        desc: "Build an autonomous legal/compliance audit system. Agent A parses contracts for liabilities, Agent B acts as a tax advisor looking at standard tax codes, and Agent C checks constraints against AgentField.ai environment security rules."
      },
      {
        title: "🏪 AutoStore Customer Support Team",
        desc: "A multi-agent e-commerce team. Agent A greets users and matches their questions. Agent B queries a mock database via customized tool calls, and Agent C handles return logic or refund ticket formatting."
      },
      {
        title: "📰 Agentic Research Desk",
        desc: "Input a technical topic. Agent A searches the web (using Google Search tools), Agent B extracts key features/statistics, and Agent C aggregates results into formatted PDFs and sends email reports."
      }
    ];

    const setB = [
      {
        title: "✈️ TravelPilot AI Agent",
        desc: "A flight, weather, and lodging coordinator. An itinerary agent compiles hotel lists, an expense agent runs budgets, and a booking assistant triggers simulated API queries, compiling a beautiful complete schedule."
      },
      {
        title: "🚜 AgriSense Localized Crop Planner",
        desc: "Helps regional farmers optimize crops. Agent A queries weather forecasts, Agent B checks soil type matrices, and Agent C drafts recommendations translated into Hindi/local languages using regional APIs."
      },
      {
        title: "🏥 MedOrchestrate Patient Onboarding",
        desc: "Triage patient intake. Agent A asks questions to compile medical logs, Agent B references treatment tables to flag urgent issues, and Agent C outputs doctor summaries with scheduling templates."
      }
    ];

    const chosenIdeas = this.sessionState.brainstormCount % 2 === 0 ? setA : setB;

    return {
      text: "Here are 3 unique project templates leveraging **AgentField.ai** workflow architectures. Pick one as inspiration for your Agent{A}thon team!",
      html: `
        <div class="chat-card brainstorm-card">
          ${chosenIdeas.map((idea, idx) => `
            <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border-glass);">
              <h5 style="margin: 0 0 4px 0; color: var(--cyan); font-size: 13px;">${idea.title}</h5>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: var(--text-muted);">${idea.desc}</p>
            </div>
          `).join("")}
          <button class="btn btn-sm btn-outline btn-block" onclick="app.sendAssistantMessage('Brainstorm project ideas')">🔄 Get More Ideas</button>
        </div>
      `
    };
  }
}
