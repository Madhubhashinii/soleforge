import { useEffect, useState } from "react";
import useResponsive from "./useResponsive";

const style = `
  .ls-root {
    position: fixed;
    inset: 0;
    background: #E8D5A0; 
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    /* This adds a smooth fade to the background at the very end */
    transition: opacity 0.3s ease-in-out;
  }

  .ls-root.bg-fade {
    opacity: 0;
    pointer-events: none;
  }

  .ls-content {
    display: flex;
    flex-direction: column; 
    align-items: center;
    gap: 8px; 
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ls-content.move-down {
    /* Moves exactly to the bottom as seen in your loading3 frame */
    transform: translateY(45vh); 
  }

  .ls-icon {
    width: 45px; 
    height: auto;
    /* Added a slight dark tint to match your black silhouette logo */
    filter: brightness(0);
  }

  .ls-text {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: #1a1a1a;
    opacity: 0.8;
  }
    


`;

export default function LoadingScreen({ onComplete }) {
  const [isMoving, setIsMoving] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setIsMoving(true), 200);
    const timer2 = setTimeout(() => setIsFading(true), 600);
    const timer3 = setTimeout(() => onComplete(), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <>
      <style>{style}</style>
      <div className={`ls-root ${isFading ? "bg-fade" : ""}`}>
        <div className={`ls-content ${isMoving ? "move-down" : ""}`}>
          <img src="images/logoo.png" alt="logo" className="ls-icon" />
          <span className="ls-text">LOADING</span>
        </div>
      </div>
    </>
  );
}