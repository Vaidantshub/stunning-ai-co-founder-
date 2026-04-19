import { useState, useRef, useEffect } from "react";

// ── Fonts via Google Fonts ──────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

// ── Global Styles ───────────────────────────────────────────────────────────
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #050508;
    --surface: #0d0d14;
    --surface2: #13131e;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6dfa;
    --accent2: #fa6d8a;
    --accent3: #6dfacc;
    --text: #f0eff8;
    --muted: #6e6d85;
    --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(255,255,255,0.09);
  }
  html { scroll-behavior: smooth; }
  body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: 'DM Sans', sans-serif; 
    font-size: 15px; 
    line-height: 1.6;
    overflow-x: hidden;
  }
  h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; letter-spacing: -0.02em; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(124,109,250,0.3); } 50% { box-shadow: 0 0 40px rgba(124,109,250,0.6); } }
  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .glass {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #9b6dfa);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    letter-spacing: 0.01em;
    animation: glow 3s ease infinite;
  }
  .btn-primary:hover { transform: translateY(-2px); opacity: 0.92; }
  .btn-ghost {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 22px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
  }
  .btn-ghost:hover { background: var(--glass); border-color: rgba(255,255,255,0.15); }
  .gradient-text {
    background: linear-gradient(135deg, #fff 0%, var(--accent) 50%, var(--accent2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  pre, code { font-family: 'JetBrains Mono', monospace; }
`;

const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);

// ── Markdown renderer (simple) ───────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-family:Syne;font-size:15px;font-weight:700;margin:14px 0 6px;color:#fff">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Syne;font-size:17px;font-weight:700;margin:16px 0 8px;color:#fff">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Syne;font-size:20px;font-weight:800;margin:16px 0 10px;color:#fff">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0eff8;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(124,109,250,0.15);color:#a99dfc;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0 4px 16px;list-style:disc;color:#d0cfe8">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0 4px 16px;list-style:decimal;color:#d0cfe8">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin:8px 0">')
    .replace(/\n/g, '<br/>');
}

// ── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are VentureMind AI, an elite startup strategist and AI co-founder with 10+ years of experience advising founders, building SaaS companies, and helping businesses scale from zero to millions in revenue.

You ONLY answer topics related to:
- Startups & entrepreneurship
- SaaS businesses
- E-commerce
- Business ideas & validation
- Marketing & growth hacking
- Sales strategies
- Pricing strategy
- Product development
- Fundraising & investor pitching
- Revenue growth & monetization
- Founder mindset & execution
- Business strategy & scaling

RULES:
1. If asked about unrelated topics (relationships, movies, jokes, random trivia), respond: "I'm your AI Co-Founder — I only help with startup, business, growth, and founder decisions. Ask me something about your startup! 🚀"
2. Ask smart clarifying questions when you need more context before giving advice.
3. Give practical, actionable frameworks and step-by-step plans.
4. Be brutally honest — if an idea is weak, say so with reasoning and alternatives.
5. Focus on speed, leverage, profit, and traction.
6. Speak like a senior advisor who has seen it all.
7. Use clear formatting with headings and bullets when helpful.
8. Keep responses focused and dense with value — no filler.`;

// ── Pages ────────────────────────────────────────────────────────────────────
const PAGES = { LANDING: "landing", APP: "app" };
const VIEWS = { CHAT: "chat", IDEA: "idea", GROWTH: "growth", REVENUE: "revenue", PITCH: "pitch", REVIEW: "review" };

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onStart }) {
  const [activeTab, setActiveTab] = useState("monthly");

  const features = [
    { icon: "🧠", title: "Idea Validator", desc: "Score your startup idea across market demand, risks, and monetization potential." },
    { icon: "📈", title: "Growth Planner", desc: "Get a custom 30-day growth roadmap tailored to your niche and stage." },
    { icon: "💰", title: "Revenue Architect", desc: "Build subscription, upsell, and service models that actually convert." },
    { icon: "🎯", title: "Investor Pitch", desc: "Craft a compelling pitch with problem, TAM, model, and ask — ready for VCs." },
    { icon: "📊", title: "CEO Weekly Review", desc: "Weekly accountability check-ins that keep you focused on what matters." },
    { icon: "⚡", title: "Brutal Honesty", desc: "No sugarcoating. Real feedback on what's working and what's killing your growth." },
  ];

  const testimonials = [
    { name: "Arjun Sharma", role: "SaaS Founder, Bangalore", text: "VentureMind helped me pivot from a failing idea to ₹2L MRR in 60 days. It's like having a YC partner on speed dial.", avatar: "AS" },
    { name: "Priya Nair", role: "E-commerce, Mumbai", text: "The pricing strategy module alone saved my business. I was leaving 40% revenue on the table.", avatar: "PN" },
    { name: "Vikram Mehta", role: "B2B SaaS, Hyderabad", text: "Got funded after using the investor pitch tool. My deck went from a 2 to a 9 in one session.", avatar: "VM" },
  ];

  const faqs = [
    { q: "Is this just another chatbot?", a: "No. VentureMind is purpose-built for founders. Every response is calibrated for startup strategy, not generic advice. It knows frameworks like Jobs-to-be-Done, AARRR, and SaaS unit economics." },
    { q: "How is this different from ChatGPT?", a: "ChatGPT is a generalist. VentureMind is your co-founder — it only operates in startup mode, asks the right questions, and gives brutally practical output." },
    { q: "Can I use it for idea validation?", a: "Yes — the Idea Validator module scores your concept across 5 dimensions and gives you a go/no-go with a reasoning breakdown." },
    { q: "Is there a free plan?", a: "Yes. 10 AI conversations per day, no credit card required. Upgrade when you need deeper tools." },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(5,5,8,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, var(--accent), var(--accent2))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>VentureMind <span style={{ color: "var(--accent)" }}>AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "Pricing", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "var(--muted)", textDecoration: "none", fontSize: 14, transition: "color 0.2s", fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = "var(--text)"}
              onMouseLeave={e => e.target.style.color = "var(--muted)"}>{item}</a>
          ))}
          <button className="btn-primary" onClick={onStart} style={{ padding: "9px 20px", fontSize: 13, animation: "none" }}>Start Free →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        {/* BG orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "15%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(124,109,250,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 350, height: 350, background: "radial-gradient(circle, rgba(250,109,138,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(109,250,204,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
        </div>

        <div style={{ animation: "fadeUp 0.8s ease forwards", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,109,250,0.1)", border: "1px solid rgba(124,109,250,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, fontSize: 13, color: "var(--accent)" }}>
            <span style={{ width: 6, height: 6, background: "var(--accent3)", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            AI Co-Founder Platform — Built for Serious Founders
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 76px)", fontWeight: 800, lineHeight: 1.08, maxWidth: 800, margin: "0 auto 24px", letterSpacing: "-0.04em" }}>
            Your AI Co-Founder for<br />
            <span className="gradient-text">Building Real Startups</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 19px)", color: "var(--muted)", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 300 }}>
            Get expert guidance on ideas, growth, pricing, sales, funding & execution — from an AI trained to think like a top-tier startup advisor.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={onStart} style={{ fontSize: 16, padding: "14px 32px" }}>
              Start Free — No Card Needed
            </button>
            <button className="btn-ghost" style={{ fontSize: 15, padding: "14px 28px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>▶</span> Watch Demo
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: "var(--muted)" }}>10 free chats/day · No credit card · Cancel anytime</p>
        </div>

        {/* Hero stats */}
        <div style={{ display: "flex", gap: 48, marginTop: 72, animation: "fadeUp 0.8s ease 0.2s forwards", opacity: 0 }}>
          {[["2,400+", "Founders"], ["₹14Cr+", "Revenue Generated"], ["4.9★", "Avg Rating"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{num}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Founder-Grade Tools</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800 }}>Everything you need to<br /><span className="gradient-text">build and scale</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="glass" style={{ padding: "28px 28px", transition: "transform 0.25s, border-color 0.25s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(124,109,250,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--glass-border)"; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 48px", background: "linear-gradient(180deg, transparent, rgba(124,109,250,0.03), transparent)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800 }}>Founders love it</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass" style={{ padding: "28px" }}>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "Syne" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, marginBottom: 8 }}>Simple, founder pricing</h2>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>Pay for value, not fluff.</p>
          <div style={{ display: "flex", gap: 0, marginTop: 24, justifyContent: "center" }}>
            {["monthly", "annual"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 22px", fontFamily: "Syne", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: activeTab === t ? "var(--accent)" : "transparent", color: activeTab === t ? "white" : "var(--muted)", borderRadius: t === "monthly" ? "8px 0 0 8px" : "0 8px 8px 0", transition: "all 0.2s" }}>
                {t === "monthly" ? "Monthly" : "Annual (-20%)"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {[
            { name: "Free", price: "₹0", period: "", features: ["10 AI chats/day", "Basic idea validator", "Suggested prompts", "Core advice only"], cta: "Start Free", highlight: false },
            { name: "Pro", price: activeTab === "monthly" ? "₹499" : "₹399", period: "/mo", features: ["Unlimited AI chats", "All 5 modules", "Chat history & memory", "Growth planner access", "Priority responses"], cta: "Start Pro", highlight: true },
            { name: "Founder", price: activeTab === "monthly" ? "₹1,499" : "₹1,199", period: "/mo", features: ["Everything in Pro", "Investor pitch builder", "Deep startup analysis", "CEO weekly review", "Priority speed + model"], cta: "Go Founder", highlight: false },
          ].map((plan, i) => (
            <div key={i} className="glass" style={{ padding: "32px 28px", border: plan.highlight ? "1px solid rgba(124,109,250,0.5)" : "1px solid var(--glass-border)", position: "relative", transition: "transform 0.25s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {plan.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "Syne", padding: "4px 14px", borderRadius: 100, letterSpacing: "0.05em" }}>POPULAR</div>}
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: "Syne", fontSize: 38, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: "var(--muted)", fontSize: 14 }}>{plan.period}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ color: "var(--accent3)", fontSize: 16 }}>✓</span>
                    <span style={{ color: "var(--muted)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onStart} className={plan.highlight ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center" }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "80px 48px", maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Syne", fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Frequently asked</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>
            Ready to build something <span className="gradient-text">real?</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 40 }}>Join 2,400+ founders who use VentureMind as their unfair advantage.</p>
          <button className="btn-primary" onClick={onStart} style={{ fontSize: 17, padding: "16px 40px" }}>Launch Your Startup Journey →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", fontSize: 13 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--text)" }}>VentureMind AI</div>
        <div>© 2025 VentureMind AI. Built for founders.</div>
      </footer>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass" style={{ overflow: "hidden", transition: "all 0.3s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", color: "var(--text)", padding: "20px 24px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>
        {q}
        <span style={{ transition: "transform 0.3s", transform: open ? "rotate(45deg)" : "none", fontSize: 20, color: "var(--accent)" }}>+</span>
      </button>
      {open && <div style={{ padding: "0 24px 20px", color: "var(--muted)", fontSize: 14, lineHeight: 1.7, animation: "fadeIn 0.25s ease" }}>{a}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD APP
// ══════════════════════════════════════════════════════════════════════════════
function AppDashboard({ onBack }) {
  const [view, setView] = useState(VIEWS.CHAT);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { icon: "💬", label: "AI Chat", view: VIEWS.CHAT },
    { icon: "🔍", label: "Idea Validator", view: VIEWS.IDEA },
    { icon: "📈", label: "Growth Planner", view: VIEWS.GROWTH },
    { icon: "💰", label: "Revenue Builder", view: VIEWS.REVENUE },
    { icon: "🎯", label: "Investor Pitch", view: VIEWS.PITCH },
    { icon: "📋", label: "CEO Review", view: VIEWS.REVIEW },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "0", background: "var(--surface)", animation: "fadeIn 0.2s ease" }}>
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,var(--accent),var(--accent2))", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15 }}>VentureMind</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>‹</button>
          </div>

          <div style={{ padding: "12px 12px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 8px 6px" }}>Navigation</div>
            {navItems.map(item => (
              <button key={item.view} onClick={() => setView(item.view)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: view === item.view ? "rgba(124,109,250,0.12)" : "transparent", border: "none", borderRadius: 9, color: view === item.view ? "var(--accent)" : "var(--muted)", cursor: "pointer", fontSize: 14, textAlign: "left", fontFamily: "DM Sans", transition: "all 0.15s", marginBottom: 2 }}
                onMouseEnter={e => { if (view !== item.view) { e.currentTarget.style.background = "var(--glass)"; e.currentTarget.style.color = "var(--text)"; } }}
                onMouseLeave={e => { if (view !== item.view) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; } }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(124,109,250,0.15), rgba(250,109,138,0.1))", border: "1px solid rgba(124,109,250,0.2)", borderRadius: 10, padding: "14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Pro Plan</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Upgrade for unlimited chats</div>
              <button className="btn-primary" style={{ width: "100%", padding: "8px 12px", fontSize: 12, animation: "none" }}>Upgrade ↗</button>
            </div>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
              ← Back to home
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 56, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, background: "var(--surface)", flexShrink: 0 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 20 }}>☰</button>
          )}
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
            {navItems.find(n => n.view === view)?.icon} {navItems.find(n => n.view === view)?.label}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>F</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Founder</span>
          </div>
        </div>

        {/* View content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {view === VIEWS.CHAT && <ChatView />}
          {view === VIEWS.IDEA && <IdeaValidator />}
          {view === VIEWS.GROWTH && <GrowthPlanner />}
          {view === VIEWS.REVENUE && <RevenueBuilder />}
          {view === VIEWS.PITCH && <PitchHelper />}
          {view === VIEWS.REVIEW && <CEOReview />}
        </div>
      </div>
    </div>
  );
}

// ── CHAT VIEW ────────────────────────────────────────────────────────────────
function ChatView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm **VentureMind AI** — your AI co-founder. 👋\n\nI help founders like you validate ideas, build growth plans, nail investor pitches, and make smart strategic decisions.\n\nWhat startup challenge can I help you crush today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const prompts = [
    "Validate my startup idea",
    "Get my first 10 customers",
    "Best SaaS under ₹10k budget",
    "Pricing strategy for my product",
    "30-day growth plan",
    "Help me pitch to investors",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    try {
const history = [...messages, { role: "user", content: userText }];
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyABjoZLAoAei1lsRglLJexduhk8s1w_Xzo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: SYSTEM_PROMPT + "\n\nUser: " + userText
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await res.json();

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, something went wrong. Please try again.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please check your connection and try again." }]);
    }
    setLoading(false);
  }
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}
  const showPrompts = messages.length <= 1;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 20, animation: "fadeUp 0.3s ease" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 12, marginTop: 2 }}>⚡</div>
              )}
              <div style={{ maxWidth: "78%", padding: "14px 18px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", background: msg.role === "user" ? "linear-gradient(135deg,var(--accent),#9b6dfa)" : "var(--surface2)", color: "var(--text)", fontSize: 14, lineHeight: 1.7, border: msg.role === "user" ? "none" : "1px solid var(--border)" }}>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <div style={{ padding: "14px 18px", background: "var(--surface2)", borderRadius: "4px 16px 16px 16px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Prompt suggestions */}
      {showPrompts && (
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "0 24px 16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {prompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)} style={{ padding: "8px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, color: "var(--muted)", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", background: "var(--surface)", flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask your co-founder anything about your startup..." rows={1} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14, resize: "none", outline: "none", fontFamily: "DM Sans", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(124,109,250,0.5)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: "12px 20px", animation: "none", flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>
            {loading ? "..." : "→"}
          </button>
        </div>
        <div style={{ maxWidth: 760, margin: "6px auto 0", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>VentureMind only answers startup, growth & business questions · Press Enter to send</div>
      </div>
    </div>
  );
}

// ── MODULE TEMPLATE ──────────────────────────────────────────────────────────
function AIModule({ title, description, fields, buildPrompt, resultLabel = "Analysis" }) {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const prompt = buildPrompt(values);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setResult(data.content?.map(b => b.text || "").join("") || "Could not generate analysis.");
    } catch {
      setResult("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 40px", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: "var(--muted)", marginBottom: 36, fontSize: 15 }}>{description}</p>

        <div className="glass" style={{ padding: "28px 28px", marginBottom: 24 }}>
          {fields.map(field => (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "Syne", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "var(--text)" }}>{field.label}</label>
              {field.type === "textarea" ? (
                <textarea value={values[field.key] || ""} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} placeholder={field.placeholder} rows={3} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "DM Sans" }}
                  onFocus={e => e.target.style.borderColor = "rgba(124,109,250,0.5)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              ) : (
                <input type="text" value={values[field.key] || ""} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} placeholder={field.placeholder} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "DM Sans" }}
                  onFocus={e => e.target.style.borderColor = "rgba(124,109,250,0.5)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              )}
            </div>
          ))}
          <button className="btn-primary" onClick={run} disabled={loading} style={{ marginTop: 8, animation: "none", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Analyzing..." : "Generate →"}
          </button>
        </div>

        {loading && (
          <div className="glass" style={{ padding: "28px", textAlign: "center" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease ${d}s infinite` }} />)}
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>VentureMind is analyzing your input...</p>
          </div>
        )}

        {result && (
          <div className="glass" style={{ padding: "28px", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>{resultLabel}</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── MODULES ──────────────────────────────────────────────────────────────────
function IdeaValidator() {
  return (
    <AIModule
      title="💡 Idea Validator"
      description="Score your startup idea across market demand, risks, monetization, and viability. Get a brutal honest assessment."
      fields={[
        { key: "idea", label: "Describe your startup idea", type: "textarea", placeholder: "e.g., An AI tool that helps local restaurants automate WhatsApp orders and track inventory..." },
        { key: "target", label: "Who is your target customer?", type: "text", placeholder: "e.g., Small restaurant owners in Tier 2 Indian cities" },
        { key: "revenue", label: "How do you plan to make money?", type: "text", placeholder: "e.g., ₹999/month SaaS subscription" },
      ]}
      buildPrompt={v => `Validate this startup idea like a brutally honest YC partner:\n\nIdea: ${v.idea || "Not provided"}\nTarget Customer: ${v.target || "Not defined"}\nRevenue Model: ${v.revenue || "Not defined"}\n\nGive me:\n1. VIABILITY SCORE: X/10 with reasoning\n2. MARKET DEMAND: Is this a real, growing problem?\n3. COMPETITION: Key players and how to differentiate\n4. RISKS: Top 3 risks that could kill this\n5. MONETIZATION: Best revenue approach\n6. VERDICT: Go / Pivot / Kill — with specific next steps\n\nBe brutally honest. No sugarcoating.`}
      resultLabel="Idea Validation Report"
    />
  );
}

function GrowthPlanner() {
  return (
    <AIModule
      title="📈 Growth Planner"
      description="Get a custom 30-day growth roadmap for your specific niche, stage, and resources."
      fields={[
        { key: "business", label: "What's your business?", type: "text", placeholder: "e.g., B2B SaaS for HR teams in mid-size companies" },
        { key: "stage", label: "Current stage", type: "text", placeholder: "e.g., Pre-revenue, 3 beta users, solo founder" },
        { key: "budget", label: "Monthly growth budget", type: "text", placeholder: "e.g., ₹15,000/month" },
        { key: "goal", label: "30-day goal", type: "text", placeholder: "e.g., Get 10 paying customers" },
      ]}
      buildPrompt={v => `Create a detailed 30-day growth roadmap:\n\nBusiness: ${v.business || "Not provided"}\nCurrent Stage: ${v.stage || "Early"}\nBudget: ${v.budget || "Minimal"}\nGoal: ${v.goal || "Get first customers"}\n\nProvide:\n- Week 1: Foundation & Quick Wins (Day 1-7)\n- Week 2: Outreach & Distribution (Day 8-14)\n- Week 3: Conversion & Iteration (Day 15-21)\n- Week 4: Scale What's Working (Day 22-30)\n\nFor each week: specific tasks, channels, tools, and success metrics. Focus on what moves the needle fastest with the least resources.`}
      resultLabel="30-Day Growth Roadmap"
    />
  );
}

function RevenueBuilder() {
  return (
    <AIModule
      title="💰 Revenue Model Builder"
      description="Design a monetization strategy that maximizes revenue with subscriptions, upsells, and services."
      fields={[
        { key: "product", label: "What do you sell?", type: "textarea", placeholder: "e.g., Software tool that helps freelancers track time and send invoices automatically" },
        { key: "users", label: "Current users / customers", type: "text", placeholder: "e.g., 200 free users, 8 paying" },
        { key: "mrr", label: "Current MRR (if any)", type: "text", placeholder: "e.g., ₹12,000/month" },
      ]}
      buildPrompt={v => `Design a complete revenue model for:\n\nProduct: ${v.product || "Not provided"}\nUsers: ${v.users || "Early stage"}\nCurrent MRR: ${v.mrr || "₹0"}\n\nProvide:\n1. PRICING TIERS: 3 tiers with features and price points (justify each price)\n2. UPSELL OPPORTUNITIES: What premium features or services can command 3-5x more?\n3. EXPANSION REVENUE: How to grow revenue from existing customers\n4. QUICK WINS: 3 things they can implement this week to increase revenue\n5. 90-DAY REVENUE PROJECTION: Conservative, realistic, optimistic scenarios\n\nThink like a SaaS pricing consultant who has helped companies 10x their ARPU.`}
      resultLabel="Revenue Strategy"
    />
  );
}

function PitchHelper() {
  return (
    <AIModule
      title="🎯 Investor Pitch Builder"
      description="Craft a compelling investor pitch covering problem, solution, TAM, business model, traction, and ask."
      fields={[
        { key: "problem", label: "What problem do you solve?", type: "textarea", placeholder: "e.g., Small businesses in India waste 3+ hours/day on manual accounting" },
        { key: "solution", label: "Your solution", type: "text", placeholder: "e.g., AI-powered bookkeeping that does it automatically" },
        { key: "traction", label: "Traction / metrics", type: "text", placeholder: "e.g., 45 paying customers, ₹1.8L ARR, 22% MoM growth" },
        { key: "ask", label: "Funding ask", type: "text", placeholder: "e.g., ₹50L seed round for 12% equity" },
      ]}
      buildPrompt={v => `Write a compelling investor pitch deck narrative:\n\nProblem: ${v.problem || "Not provided"}\nSolution: ${v.solution || "Not provided"}\nTraction: ${v.traction || "Early stage"}\nAsk: ${v.ask || "Seed round"}\n\nStructure it as:\n1. HOOK: One sentence that makes investors lean forward\n2. PROBLEM: Size of pain, who suffers, why now\n3. SOLUTION: What you built, why it's 10x better\n4. MARKET SIZE: TAM/SAM/SOM with sources\n5. BUSINESS MODEL: How you make money, unit economics\n6. TRACTION: Evidence of product-market fit\n7. THE ASK: Amount, use of funds, milestones\n8. THE TEAM: Why you win\n\nMake it crisp, compelling, and VC-ready. Flag anything weak that needs strengthening.`}
      resultLabel="Investor Pitch Script"
    />
  );
}

function CEOReview() {
  return (
    <AIModule
      title="📋 CEO Weekly Review"
      description="A structured weekly accountability check-in to keep you focused on what drives growth."
      fields={[
        { key: "revenue", label: "Revenue this week", type: "text", placeholder: "e.g., ₹28,000 (up ₹4,000 from last week)" },
        { key: "wins", label: "Top 3 wins this week", type: "textarea", placeholder: "e.g., Closed 2 enterprise deals, launched new feature, got 3 referrals" },
        { key: "problems", label: "Top blockers / problems", type: "textarea", placeholder: "e.g., Churn spiked to 8%, co-founder conflict, outbound not converting" },
        { key: "focus", label: "What do you want to focus on next week?", type: "text", placeholder: "e.g., Retention, hiring first engineer, reaching 100 users" },
      ]}
      buildPrompt={v => `Act as my business coach doing a weekly CEO review:\n\nRevenue: ${v.revenue || "Not tracked"}\nWins: ${v.wins || "None listed"}\nProblems: ${v.problems || "None listed"}\nNext Week Focus: ${v.focus || "Growth"}\n\nGive me:\n1. PERFORMANCE ASSESSMENT: Honest read on where I am\n2. WIN ANALYSIS: What drove the wins? How to repeat?\n3. PROBLEM BREAKDOWN: Root cause of each problem + fix\n4. PRIORITY RESET: The ONE thing that will move the needle most next week\n5. WEEKLY TARGETS: 3 concrete goals with measurable outcomes\n6. MINDSET NOTE: One thing to remember as a founder this week\n\nBe direct. I don't need cheerleading, I need clarity.`}
      resultLabel="CEO Weekly Report"
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState(PAGES.LANDING);

  return (
    <>
      <StyleTag />
      {page === PAGES.LANDING && <LandingPage onStart={() => setPage(PAGES.APP)} />}
      {page === PAGES.APP && <AppDashboard onBack={() => setPage(PAGES.LANDING)} />}
    </>
  );
}
