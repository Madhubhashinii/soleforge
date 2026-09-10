import { useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }

  .hp-root {
    width: 100vw; height: 100vh;
    position: relative; overflow: hidden;
    font-family: 'Space Mono', monospace;
  }

  .hp-nav {
    position: absolute; top: 0; left: 0; right: 0;
    height: 72px; display: flex; align-items: center;
    padding: 0 28px; z-index: 50;
  }
  .hp-nav-brand {
    display: flex; align-items: center; gap: 7px;
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 700; color: #1a1208;
    min-width: 130px;
  }
  .hp-nav-center { flex: 1; display: flex; justify-content: center; }
  .hp-nav-pill {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.40);
    backdrop-filter: blur(12px);
    border-radius: 50px; padding: 5px 6px; gap: 2px;
    border: 1px solid rgba(255,255,255,0.55);
  }
  .hp-nav-link {
    font-family: 'Space Mono', monospace; font-size: 11px;
    color: #1a1208; text-decoration: none;
    padding: 9px 24px; border-radius: 50px;
    transition: all 0.3s ease; cursor: pointer; white-space: nowrap;
  }
  .hp-nav-link.active { background: #1a1208; color: #f5f0e8; }
  .hp-nav-link:hover:not(.active) { background: rgba(0,0,0,0.07); }
  .hp-nav-right { min-width: 130px; display: flex; justify-content: flex-end; }
  .hp-globe-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.30);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 18px; transition: background 0.3s;
  }
  .hp-globe-btn:hover { background: rgba(255,255,255,0.5); }

  .hp-heading {
    position: absolute; top: 88px;
    left: 4%; right: 0; z-index: 30;
    pointer-events: none; text-align: left; padding: 0 0 0 5%;
  }
  .hp-heading h1 {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: clamp(28px, 3.8vw, 62px);
    line-height: 1; letter-spacing: -0.02em;
    color: #1a1208; white-space: nowrap; width: 100%;
  }
  .hp-heading h1 .sole { color: #A66B00; }

  .hp-shoes {
    position: absolute; left: 2%; bottom: 8%;
    width: 50%; z-index: 20;
    display: flex; align-items: flex-end;
    justify-content: flex-start; padding-left: 3%;
  }
  .hp-shoe1 {
    width: 52%;
    transform: rotate(-12deg) translateY(10px);
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.22));
    z-index: 22;
  }
  .hp-shoe2 {
    width: 40%;
    transform: scaleX(-1) rotate(15deg) translateY(-20%);
    margin-left: -3%;
    filter: drop-shadow(0 14px 28px rgba(0,0,0,0.18));
    z-index: 21;
  }
  .hp-shoe-shadow {
    position: absolute; left: 5%; bottom: 6%;
    width: 42%; height: 22px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.20) 0%, transparent 70%);
    border-radius: 50%; z-index: 15;
  }

  .hp-right {
    position: absolute; right: 2%; top: 50%;
    transform: translateY(-46%);
    width: 42%; z-index: 20;
    display: flex; flex-direction: column;
    gap: 16px; align-items: flex-start;
  }
  .hp-card {
    background: rgba(140, 85, 0, 0.45);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 22px; padding: 24px 26px; width: 100%;
  }
  .hp-card p {
    font-size: clamp(10px, 1vw, 13px);
    line-height: 1.9; color: #fff;
  }
  .hp-cta {
    display: inline-flex; align-items: center; gap: 12px;
    background: #1a1208;
    backdrop-filter: blur(10px); color: #f5f0e8;
    font-family: 'Space Mono', monospace; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.12em;
    padding: 13px 22px; border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.55);
    cursor: pointer; font-weight: 700; transition: all 0.3s ease;
  }
  .hp-cta:hover { background: #3a2e1a; }
  .hp-cta-arrow {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; background: #fff;
    border-radius: 50%; color: #1a1208; font-size: 13px;
    transition: transform 0.3s;
  }
  .hp-cta:hover .hp-cta-arrow { transform: translateX(3px); }
  .hp-stats { display: flex; gap: 12px; width: 100%; }
  .hp-stat {
    background: rgba(140, 85, 0, 0.45);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 18px; padding: 16px 20px;
    flex: 1; color: #fff;
  }
  .hp-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 2vw, 28px);
    font-weight: 900; line-height: 1;
  }
  .hp-stat-label {
    font-size: 9px; text-transform: uppercase;
    letter-spacing: 0.1em; opacity: 0.7; margin-top: 4px;
  }

  @media (max-width: 1024px) {
    .hp-nav-link { padding: 8px 14px; font-size: 10px; }
    .hp-heading h1 { font-size: clamp(32px, 5vw, 64px); }
    .hp-right { width: 45%; }
  }
  @media (max-width: 768px) {
    .hp-nav-link { padding: 7px 10px; font-size: 9px; }
    .hp-heading { left: 0; right: 0; padding: 0 16px; }
    .hp-heading h1 { font-size: clamp(22px, 6vw, 38px); white-space: normal; }
    .hp-shoes { width: 90%; left: 5%; bottom: 52%; }
    .hp-right { top: auto; bottom: 3%; right: 4%; left: 4%; width: 92%; transform: none; }
  }
  @media (max-width: 480px) {
    .hp-nav-pill { display: none; }
    .hp-heading h1 { font-size: 21px; }
    .hp-card { padding: 16px 18px; }
    .hp-stat { padding: 12px 14px; }
  }
`;

// Nav → page index map
const NAV_MAP = {
  "Home":      1,
  "About":     2,
  "Contact":   "summary",
  "Customize": 3,
};

export default function HomePage({ goTo,goToSummary  }) {
  const [activeNav, setActiveNav] = useState("Home");
  const links = ["Home", "About", "Contact", "Customize"];

  const handleNav = (link) => {
  setActiveNav(link);

  const target = NAV_MAP[link];

  if (target === "summary") {
    goToSummary?.();   // ✅ open SummaryPage
  } else {
    goTo?.(target);
  }
};

  return (
    <>
      <style>{CSS}</style>
      <div className="hp-root">

        {/* Left white */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#FFFFFF",
          clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
          zIndex: 0,
        }} />

        {/* Right ochre */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#A66B00",
          clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
          zIndex: 0,
        }} />

        {/* Bottom floor left */}
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: "50%", height: "100%",
          background: "#F5EBD0",
          clipPath: "polygon(0 100%, 100% 75%, 100% 100%)",
          zIndex: 2,
        }} />

        {/* Bottom floor right */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: "50%", height: "100%",
          background: "#D9B981",
          clipPath: "polygon(0 75%, 100% 100%, 0 100%)",
          zIndex: 2,
        }} />

        {/* Grey lightning bolt */}
        <svg style={{
          position: "absolute", left: 0, top: 0,
          height: "60%", width: "12%", zIndex: 3,
        }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,0 85,12 50,35 75,35 0,95" fill="#D3D3D3" />
        </svg>

        {/* NAV */}
        <nav className="hp-nav">
          <div className="hp-nav-brand">
            <img src="images/logoo.png" alt="logo"
                 style={{ width: 26, filter: "brightness(0)" }} />
            SoleForge
          </div>
          <div className="hp-nav-center">
            <div className="hp-nav-pill">
              {links.map(l => (
                <a
                  key={l}
                  className={`hp-nav-link ${activeNav === l ? "active" : ""}`}
                  onClick={() => handleNav(l)}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="hp-nav-right">
            <div className="hp-globe-btn">🌐</div>
          </div>
        </nav>

        {/* HEADING */}
        <div className="hp-heading">
          <h1>Craft Your <span className="sole">Sole</span></h1>
        </div>

        {/* SHOES */}
        <div className="hp-shoe-shadow" />
        <div className="hp-shoes">
          <img src="/images/sh1.png" alt="shoe" className="hp-shoe1" />
          <img src="/images/sh1.png" alt="shoe" className="hp-shoe2" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="hp-right">
          <div className="hp-card">
            <p>
              Every pair tells a story. SoleForge lets you design
              custom sneakers from the ground up — choose materials,
              colors, and silhouettes that are entirely yours.
              Built for creators, worn by the bold.
            </p>
          </div>

          {/* START DESIGNING → goes to Main1 (page 3) */}
          <button className="hp-cta" onClick={() => goTo && goTo(3)}>
            START DESIGNING
            <span className="hp-cta-arrow">→</span>
          </button>

          <div className="hp-stats">
            <div className="hp-stat">
              <div className="hp-stat-num">98%</div>
              <div className="hp-stat-label">Satisfaction</div>
            </div>
            <div className="hp-stat">
              <div className="hp-stat-num">48h</div>
              <div className="hp-stat-label">Delivery</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}