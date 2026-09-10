import { useState } from "react";


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }

  .h2-root {
    width: 100vw; height: 100vh;
    position: relative; overflow: hidden;
    background: #E8D5A0;
    font-family: 'Space Mono', monospace;
    display: flex; align-items: center;
  }

  /* ── BACKGROUND SHAPES ── */
  .h2-shape-1 {
    position: absolute;
    right: -60px; top: -40px;
    width: 280px; height: 280px;
    background: rgba(180,140,60,0.25);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    z-index: 0;
  }
  .h2-shape-2 {
    position: absolute;
    right: 80px; bottom: -60px;
    width: 200px; height: 200px;
    background: rgba(180,140,60,0.20);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    z-index: 0;
  }
  .h2-shape-3 {
    position: absolute;
    left: -30px; bottom: 80px;
    width: 160px; height: 300px;
    background: rgba(180,140,60,0.15);
    clip-path: polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%);
    z-index: 0;
  }

  /* ── LEFT CONTENT ── */
  .h2-left {
    position: relative; z-index: 10;
    padding: 0 0 0 5%;
    width: 50%;
    display: flex; flex-direction: column;
    gap: 24px;
  }

  .h2-about-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 2.5vw, 36px);
    font-weight: 700; color: #1a1208;
    border-bottom: 2px solid rgba(180,140,60,0.4);
    padding-bottom: 8px;
    display: inline-block;
  }

  .h2-about-text {
    font-size: clamp(10px, 1.1vw, 13px);
    line-height: 1.9; color: #3a3020;
    max-width: 420px;
  }

  .h2-custom-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 2vw, 28px);
    font-weight: 700; color: #1a1208;
    margin-top: 8px;
  }

  .h2-choose-label {
    font-size: 11px; color: #6a5a30;
    font-style: italic; letter-spacing: 0.05em;
    margin-top: -12px;
  }

  /* size selector card */
  .h2-size-card {
    background: rgba(180,150,80,0.25);
    border-radius: 18px;
    padding: 22px 28px;
    max-width: 320px;
    border: 1px solid rgba(180,140,60,0.2);
  }
  .h2-size-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700;
    color: #1a1208; text-align: center;
    margin-bottom: 14px;
  }
  .h2-size-btns {
    display: flex; gap: 10px;
    justify-content: center;
  }
  .h2-size-btn {
    width: 52px; height: 44px;
    border-radius: 10px;
    background: #A66B00;
    border: none; cursor: pointer;
    font-family: 'Space Mono', monospace;
    font-size: 13px; font-weight: 700;
    color: #fff;
    transition: all 0.25s ease;
    display: flex; align-items: center; justify-content: center;
  }
  .h2-size-btn:hover {
    background: #C8901A;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(180,120,0,0.35);
  }
  .h2-size-btn.selected {
    background: #fff;
    color: #A66B00;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  /* ── RIGHT IMAGES ── */
  .h2-right {
    position: relative; z-index: 10;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

.h2-img-stack {
    position: relative;
    width: 420px; height: 420px;
  }

  .h2-img-card {
    position: absolute;
    border-radius: 24px;
    overflow: hidden;
    border: 3px solid rgba(255,255,255,0.9);
    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                z-index 0s,
                box-shadow 0.4s ease;
  }
  .h2-img-card img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  /* LEFT card — tilted left */
  .h2-img-card:nth-child(1) {
    width: 180px; height: 280px;
    left: 0px; top: 60px;
    transform: rotate(-12deg);
    z-index: 1;
  }
  .h2-img-card:nth-child(1):hover {
    transform: rotate(-12deg) scale(1.12) translateY(-20px);
    z-index: 10;
    box-shadow: 0 40px 80px rgba(0,0,0,0.35);
  }

  /* MIDDLE card — straight, front */
  .h2-img-card:nth-child(2) {
    width: 190px; height: 300px;
    left: 50%; top: 20px;
    transform: translateX(-50%) rotate(0deg);
    z-index: 3;
  }
  .h2-img-card:nth-child(2):hover {
    transform: translateX(-50%) rotate(0deg) scale(1.12) translateY(-20px);
    z-index: 10;
    box-shadow: 0 40px 80px rgba(0,0,0,0.35);
  }


  /* RIGHT card — tilted right */
  .h2-img-card:nth-child(3) {
    width: 180px; height: 280px;
    right: 0px; top: 60px;
    transform: rotate(12deg);
    z-index: 2;
  }
  .h2-img-card:nth-child(3):hover {
    transform: rotate(12deg) scale(1.12) translateY(-20px);
    z-index: 10;
    box-shadow: 0 40px 80px rgba(0,0,0,0.35);
  }
    /* just del */

  .h2-bg-tl {
    position: absolute;
    top: -120px; left: -120px;
    width: 420px; height: 420px;
    background: #D0CEC8;
    border-radius: 50%;
    z-index: 0;
  }

  .h2-bg-tr {
    position: absolute;
    top: -120px; right: -120px;
    width: 380px; height: 380px;
    background: #D0CEC8;
    border-radius: 50%;
    z-index: 0;
  }

  .h2-bg-br {
    position: absolute;
    bottom: -120px; right: -80px;
    width: 380px; height: 380px;
    background: #D0CEC8;
    border-radius: 50%;
    z-index: 0;
  }


  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .h2-left { padding: 0 0 0 4%; }
    .h2-img-stack { width: 220px; height: 340px; }
    .h2-img-card:nth-child(3) { width: 170px; height: 240px; }
  }

  @media (max-width: 768px) {
    .h2-root { flex-direction: column; padding-top: 60px; }
    .h2-left { width: 90%; padding: 0 5%; }
    .h2-right { width: 90%; height: 300px; }
    .h2-img-stack { width: 180px; height: 280px; }
    .h2-img-card:nth-child(1) { width: 120px; height: 180px; }
    .h2-img-card:nth-child(2) { width: 120px; height: 180px; }
    .h2-img-card:nth-child(3) { width: 150px; height: 210px; }
  }

  @media (max-width: 480px) {
    .h2-about-title { font-size: 20px; }
    .h2-custom-title { font-size: 18px; }
    .h2-size-card { max-width: 260px; }
    .h2-size-btn { width: 44px; height: 38px; font-size: 11px; }
  }
`;

export default function Home2() {
  const [selected, setSelected] = useState("M");
  const sizes = ["S", "M", "L", "XL"];

  return (
    <>
      <style>{CSS}</style>
      <div className="h2-root">

        {/* Background shapes */}
        <div className="h2-shape-1" />
        <div className="h2-shape-2" />
        <div className="h2-shape-3" />

        <div className="h2-bg-tl" />
        <div className="h2-bg-tr" />
        <div className="h2-bg-br" />

        {/* LEFT */}
        <div className="h2-left">
          <div>
            <div className="h2-about-title">About ,</div>
          </div>

          <p className="h2-about-text">
            Lorem Ipsum is simply dummy text of the printing and
            typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text ever since the 1500s.
          </p>

          <div className="h2-custom-title">Customization</div>
          <div className="h2-choose-label">Choose your shoe size :</div>

          <div className="h2-size-card">
            <div className="h2-size-card-title">Sizes</div>
            <div className="h2-size-btns">
              {sizes.map(s => (
                <button
                  key={s}
                  className={`h2-size-btn ${selected === s ? "selected" : ""}`}
                  onClick={() => setSelected(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — stacked image cards */}
        <div className="h2-right">
          <div className="h2-img-stack">
            {/* back */}
            <div className="h2-img-card">
              <img src="/images/sho5.webp" alt="shoe 3" />
            </div>
            {/* middle */}
            <div className="h2-img-card">
              <img src="/images/sho3.webp" alt="shoe 2" />
            </div>
            {/* front */}
            <div className="h2-img-card">
              <img src="/images/sho7.webp" alt="shoe 1" />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}