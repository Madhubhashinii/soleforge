import { useEffect, useRef, useState } from "react";
import useResponsive from "./useResponsive";


const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const ease  = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Space+Mono&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  .lp-outer {
    width: 100vw; height: 100vh;
    overflow: hidden; position: relative;
    background: #1C1C1C;
  }
  .lp-nav {
    position: absolute; top:0; left:0; right:0; height: 80px;
    padding: 0 60px; display: flex; align-items: center;
    justify-content: space-between; z-index: 100;
  }
  .lp-nav-brand {
    font-family: 'Playfair Display', serif; font-weight: 700;
    font-size: 22px; color: #1a1208; display: flex;
    align-items: center; gap: 10px; opacity: 0; transition: opacity 0.8s ease;
  }
  .lp-nav-brand.active { opacity: 1; }
  .lp-nav-links { display: flex; gap: 40px; opacity: 0; transition: opacity 0.8s ease; }
  .lp-nav-links.active { opacity: 1; }
  .lp-nav-links a {
    font-family: 'Space Mono', monospace; font-size: 11px;
    text-transform: uppercase; color: #1a1208; text-decoration: none; letter-spacing: 0.12em;
  }
  .lp-shoe {
    position: absolute; pointer-events: none;
    object-fit: contain; transform-origin: center center;
  }
  .lp-shadow {
    position: absolute;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.30) 0%, transparent 70%);
    border-radius: 50%;
  }
  .lp-decoration {
    position: absolute;
    right: -300px; top: 50%;
    transform: translateY(-50%);
    width: 750px; height: 750px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%,
      #2a2a2a 0%,
      #111111 60%,
      #0a0a0a 100%);
    border: 1px solid rgba(255,255,255,0.07);
    z-index: 1;
    box-shadow: inset 0 0 80px rgba(0,0,0,0.5);
  }

  /* ── TABLET ── */
  @media (max-width: 1024px) {
    .lp-nav {
      padding: 0 30px;
      height: 70px;
    }
    .lp-nav-brand { font-size: 18px; }
    .lp-nav-links { gap: 20px; }
    .lp-nav-links a { font-size: 10px; }
    .lp-decoration {
      width: 500px;
      height: 500px;
      right: -250px;
    }
  }

  /* ── MOBILE ── */
  @media (max-width: 480px) {
    .lp-nav {
      padding: 0 16px;
      height: 55px;
    }
    .lp-nav-brand { font-size: 14px; }
    .lp-nav-links { gap: 10px; }
    .lp-nav-links a { font-size: 7px; letter-spacing: 0.04em; }
    .lp-decoration {
      width: 250px;
      height: 250px;
      right: -120px;
      top: auto;
      bottom: -60px;
      transform: none;
    }
  }

  /* animated gradient orbs */
  .lp-orb-1 {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(80,80,80,0.4) 0%, transparent 70%);
    top: -100px; left: -100px;
    z-index: 0;
    animation: orbFloat1 8s ease-in-out infinite;
  }
  .lp-orb-2 {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(60,60,60,0.35) 0%, transparent 70%);
    bottom: -80px; left: 30%;
    z-index: 0;
    animation: orbFloat2 10s ease-in-out infinite;
  }
  @keyframes orbFloat1 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(40px, 30px); }
  }
  @keyframes orbFloat2 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(-30px, -20px); }
  }

  /* subtle grid */
  .lp-grid {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* top accent line */
  .lp-accent-line {
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px; z-index: 10;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.15) 30%,
      rgba(255,255,255,0.4) 50%,
      rgba(255,255,255,0.15) 70%,
      transparent 100%);
  }

  /* floating ring shapes */
  .lp-ring-1 {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06);
    top: 10%; left: 5%;
    z-index: 0;
    animation: ringPulse 6s ease-in-out infinite;
  }
  .lp-ring-2 {
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.04);
    top: 15%; left: 8%;
    z-index: 0;
    animation: ringPulse 6s ease-in-out infinite 1s;
  }
  @keyframes ringPulse {
    0%,100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 1; }
  }

  /* diagonal line accents */
  .lp-diag {
    position: absolute; z-index: 0;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
  }

  /* bottom left corner accent */
  .lp-corner {
    position: absolute;
    bottom: 30px; left: 40px;
    z-index: 10;
    opacity: 0.25;
  }
  .lp-corner-line {
    width: 40px; height: 1px;
    background: #fff; margin-bottom: 6px;
  }
  .lp-corner-line:nth-child(2) { width: 25px; }
  .lp-corner-line:nth-child(3) { width: 15px; }

  /* nav bottom border */
  .lp-nav {
    position: absolute; top:0; left:0; right:0; height: 80px;
    padding: 0 60px; display: flex; align-items: center;
    justify-content: space-between; z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .lp-nav-brand {
    font-family: 'Playfair Display', serif; font-weight: 700;
    font-size: 22px; color: #ffffff; display: flex;
    align-items: center; gap: 10px;
    opacity: 0; transition: opacity 0.8s ease;
  }
  .lp-nav-brand.active { opacity: 1; }

  .lp-nav-links { display: flex; gap: 8px; opacity: 0; transition: opacity 0.8s ease; }
  .lp-nav-links.active { opacity: 1; }
  .lp-nav-links a {
    font-family: 'Space Mono', monospace; font-size: 10px;
    text-transform: uppercase; color: rgba(255,255,255,0.45);
    text-decoration: none; letter-spacing: 0.14em;
    padding: 8px 16px; border-radius: 50px;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }
  .lp-nav-links a:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
  }

  /* ── TABLET ── */
  @media (max-width: 1024px) {
    .lp-nav { padding: 0 30px; height: 70px; }
    .lp-nav-brand { font-size: 18px; }
    .lp-nav-links { gap: 6px; }
    .lp-nav-links a { font-size: 9px; padding: 7px 12px; }
    .lp-decoration { width: 500px; height: 500px; right: -250px; }
    .lp-ring-1 { width: 200px; height: 200px; }
    .lp-ring-2 { width: 140px; height: 140px; }
  }

  /* ── MOBILE ── */
  @media (max-width: 480px) {
    .lp-nav { padding: 0 16px; height: 55px; }
    .lp-nav-brand { font-size: 14px; }
    .lp-nav-links { display: none; }
    .lp-decoration { width: 250px; height: 250px; right: -120px; top: auto; bottom: -60px; transform: none; }
    .lp-orb-1 { width: 250px; height: 250px; }
    .lp-orb-2 { width: 200px; height: 200px; }
  }




`;

export default function LandingPage() {
  const [navActive, setNavActive] = useState(false);
  const shoe1Ref  = useRef(null);
  const shoe2Ref  = useRef(null);
  const shadowRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    let startTime = null;
    const DURATION = 2600;

    const getF = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const isMobile = W < 480;
      const isTablet = W >= 480 && W < 1024;

      const s1w    = isMobile ? W * 0.55 : isTablet ? W * 0.40 : W * 0.26;
      const s1Left = isMobile ? W * 0.08 : isTablet ? W * 0.15 : W * 0.5 - s1w * 1.0;
      const s1Top  = isMobile ? H * 0.42 : isTablet ? H * 0.38 : H * 0.5 - s1w * 0.45;
      const s1Rot  = -18;

      const s2w    = s1w * 0.80;
      const s2Left = isMobile ? W * 0.32 : isTablet ? W * 0.38 : s1Left - s1w * 0.25;
      const s2Top  = isMobile ? H * 0.25 : isTablet ? H * 0.20 : s1Top + s1w * 0.30;
      const s2Rot  = 20;

      const shW    = s1w * 1.1;
      const shH    = shW * 0.13;
      const shLeft = isMobile ? W * 0.08 : isTablet ? W * 0.18 : s1Left + s1w * 0.01;
      const shTop  = s1Top + s1w * 0.85;

      return { s1w, s1Left, s1Top, s1Rot,
               s2w, s2Left, s2Top, s2Rot,
               shW, shH, shLeft, shTop };
    };

    const animate = (now) => {
      if (!startTime) startTime = now;
      const p = clamp((now - startTime) / DURATION, 0, 1);
      const e = ease(p);
      const f = getF();
      const H = window.innerHeight;

      if (shoe1Ref.current) {
        const y  = lerp(H + 100, f.s1Top, e);
        const r  = lerp(-40, f.s1Rot, e);
        const sz = lerp(f.s1w * 0.4, f.s1w, e);
        shoe1Ref.current.style.width     = `${sz}px`;
        shoe1Ref.current.style.height    = `${sz}px`;
        shoe1Ref.current.style.left      = `${f.s1Left}px`;
        shoe1Ref.current.style.top       = `${y}px`;
        shoe1Ref.current.style.transform = `rotate(${r}deg)`;
        shoe1Ref.current.style.opacity   = `${Math.min(p * 4, 1)}`;
        shoe1Ref.current.style.zIndex    = 62;
      }

      const p2 = clamp((p - 0.18) / 0.82, 0, 1);
      const e2  = ease(p2);
      if (shoe2Ref.current) {
        const y  = lerp(-150, f.s2Top, e2);
        const r  = lerp(55, f.s2Rot, e2);
        const sz = lerp(f.s2w * 0.3, f.s2w, e2);
        shoe2Ref.current.style.width     = `${sz}px`;
        shoe2Ref.current.style.height    = `${sz}px`;
        shoe2Ref.current.style.left      = `${f.s2Left}px`;
        shoe2Ref.current.style.top       = `${y}px`;
        shoe2Ref.current.style.transform = `scaleX(-1) rotate(${r}deg)`;
        shoe2Ref.current.style.opacity   = `${Math.min(p2 * 3, 1)}`;
        shoe2Ref.current.style.zIndex    = 63;
      }

      if (shadowRef.current) {
        shadowRef.current.style.width   = `${f.shW}px`;
        shadowRef.current.style.height  = `${f.shH}px`;
        shadowRef.current.style.left    = `${f.shLeft}px`;
        shadowRef.current.style.top     = `${f.shTop}px`;
        shadowRef.current.style.opacity = `${e * 0.88}`;
        shadowRef.current.style.zIndex  = 55;
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setNavActive(true);
        startFloat();
      }
    };

    const startFloat = () => {
      const loop = () => {
        const t = Date.now() * 0.0016;
        const f = getF();

        if (shoe1Ref.current) {
          const dy = Math.sin(t) * 6;
          const dr = Math.sin(t * 0.55) * 1.2;
          shoe1Ref.current.style.width     = `${f.s1w}px`;
          shoe1Ref.current.style.height    = `${f.s1w}px`;
          shoe1Ref.current.style.left      = `${f.s1Left}px`;
          shoe1Ref.current.style.top       = `${f.s1Top + dy}px`;
          shoe1Ref.current.style.transform = `rotate(${f.s1Rot + dr}deg)`;
        }

        if (shoe2Ref.current) {
          const dy = Math.cos(t * 1.2) * 6;
          const dr = Math.cos(t * 0.7) * 1.2;
          shoe2Ref.current.style.width     = `${f.s2w}px`;
          shoe2Ref.current.style.height    = `${f.s2w}px`;
          shoe2Ref.current.style.left      = `${f.s2Left}px`;
          shoe2Ref.current.style.top       = `${f.s2Top + dy}px`;
          shoe2Ref.current.style.transform = `scaleX(-1) rotate(${f.s2Rot + dr}deg)`;
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    };

    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      startTime = null;
      rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener("resize", handleResize);

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-outer">
        <div className="lp-decoration" />
        <nav className="lp-nav">
          <div className={`lp-nav-brand ${navActive ? "active" : ""}`}>
            <img src="images/logoo.png" alt="" style={{ width: 24, filter: "brightness(0)" }} />
            SoleForge
          </div>
        </nav>
        <div ref={shadowRef} className="lp-shadow" style={{ opacity: 0 }} />
        <img ref={shoe1Ref} className="lp-shoe" src="/images/sh1.png"
             alt="hero shoe" style={{ opacity: 0 }} />
        <img ref={shoe2Ref} className="lp-shoe" src="/images/sh1.png"
             alt="floating shoe" style={{ opacity: 0 }} />
      </div>
    </>
  );
}