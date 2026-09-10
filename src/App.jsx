import { useState, useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';
import LandingPage   from './LandingPage';
import HomePage      from './HomePage';
import Home2         from './Home2';
import Main1         from './Main1';
import SummaryPage   from './SummaryPage';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Space+Mono&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root { width:100%; height:100%; overflow:hidden; overscroll-behavior:none; }
  .app-pages { width:100vw; width:100dvw; height:100vh; height:100dvh; overflow:hidden; position:relative; }
  .app-slide { position:absolute; width:100%; height:100%; transition:transform 0.8s cubic-bezier(0.77,0,0.175,1); will-change:transform; }
`;

const SCROLL_PAGES = [LandingPage, HomePage, Home2, Main1];
const TOTAL = SCROLL_PAGES.length;

export default function App() {
  const [isLoading,   setIsLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const isAnimating = useRef(false);
  const touchStartY = useRef(null);

  const goTo = (index) => {
    if (isAnimating.current)         return;
    if (index < 0 || index >= TOTAL) return;
    isAnimating.current = true;
    setCurrentPage(index);
    setTimeout(() => { isAnimating.current = false; }, 900);
  };

  const goToSummary    = () => setShowSummary(true);
  const backFromSummary = () => { setShowSummary(false); setCurrentPage(1); };

  useEffect(() => {
    const onWheel = (e) => {
      if (currentPage === 3 && e.deltaY > 0) return;
      e.preventDefault();
      if (e.deltaY >  30) goTo(currentPage + 1);
      if (e.deltaY < -30) goTo(currentPage - 1);
    };
    const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      // On the 3D customizer page, touch drags belong to OrbitControls —
      // never treat them as page swipes (use the on-screen Finish button).
      if (currentPage === 3) return;
      if (diff >  50) goTo(currentPage + 1);
      if (diff < -50) goTo(currentPage - 1);
    };
    const onKey = (e) => {
      if (currentPage === 3 && (e.key === "ArrowDown" || e.key === "PageDown")) return;
      if (e.key==="ArrowDown"||e.key==="PageDown") goTo(currentPage+1);
      if (e.key==="ArrowUp"  ||e.key==="PageUp")   goTo(currentPage-1);
    };
    window.addEventListener("wheel",      onWheel,      { passive:false });
    window.addEventListener("touchstart", onTouchStart, { passive:true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive:true  });
    window.addEventListener("keydown",    onKey);
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, [currentPage]);

  if (isLoading) return ( <><style>{CSS}</style><LoadingScreen onComplete={()=>setIsLoading(false)} /></> );

  if (showSummary) return ( <><style>{CSS}</style><SummaryPage onBack={backFromSummary} /></> );

  return (
    <>
      <style>{CSS}</style>
      <div className="app-pages">
        {SCROLL_PAGES.map((Page, i) => (
          <div key={i} className="app-slide" style={{ transform:`translateY(${(i-currentPage)*100}%)` }}>
            {i===3 
              ? <Page onFinish={goToSummary} goTo={goTo} goToSummary={goToSummary} /> 
              : <Page goTo={goTo} goToSummary={goToSummary} />
            }
          </div>
        ))}

        {currentPage !== 3 && (
          <div style={{ position:"fixed",right:20,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:8,zIndex:999 }}>
            {SCROLL_PAGES.map((_,i)=>(
              <div key={i} onClick={()=>goTo(i)} style={{ width:i===currentPage?10:7,height:i===currentPage?10:7,borderRadius:"50%",background:i===currentPage?"#1a1208":"rgba(0,0,0,0.3)",cursor:"pointer",transition:"all 0.3s ease" }}/>
            ))}
          </div>
        )}
      </div>
    </>
  );
}