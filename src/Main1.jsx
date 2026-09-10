import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { saveDesign } from "./designStore";
import useResponsive from "./useResponsive";

const localColors  = {};
const localPattern = {};
let   localSelected = "";
const texCache = {};

const COLORS = [
  "#FFFFFF","#111111","#FFE600","#FF2222",
  "#22CC44","#00CCFF","#FF6B00","#CC44FF",
  "#FF1493","#8B4513","#C0C0C0","#FFD700",
];
const PATTERNS = [
  {id:1,src:"/textures/d1.jpg"},{id:2,src:"/textures/d2.jpg"},
  {id:3,src:"/textures/d3.webp"},{id:4,src:"/textures/d4.jpg"},
  {id:5,src:"/textures/p1.png"},{id:6,src:"/textures/p2.png"},
  {id:7,src:"/textures/p3.png"},{id:8,src:"/textures/p4.png"},
  {id:9,src:"/textures/p5.png"},{id:10,src:"/textures/p6.png"},
];

function ShoeScene({ onPartClick, partColors, setParts }) {
  const { camera, gl } = useThree();
  const { scene }      = useGLTF("/models/unbranded_white_sneaker.glb");
  const rootRef   = useRef(null);
  const meshMap   = useRef({});
  const allMeshes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouseDown = useRef({ x:0, y:0 });

  useEffect(() => {
    const clone = scene.clone(true);
    const box   = new THREE.Box3().setFromObject(clone);
    const sz    = new THREE.Vector3();
    const ctr   = new THREE.Vector3();
    box.getSize(sz); box.getCenter(ctr);
    const scale = 2 / Math.max(sz.x, sz.y, sz.z);
    clone.position.set(-ctr.x*scale, -ctr.y*scale, -ctr.z*scale);
    clone.scale.setScalar(scale);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      const partName = child.material?.name || child.name;
      child.userData.partName = partName;
      child.material = new THREE.MeshStandardMaterial({ color:"#ffffff", roughness:0.65, metalness:0.1 });
      allMeshes.current.push(child);
      if (!meshMap.current[partName]) meshMap.current[partName] = [];
      meshMap.current[partName].push(child);
    });
    setParts(Object.keys(meshMap.current));
    rootRef.current = clone;
  }, [scene, setParts]);

  useFrame(() => {
    Object.entries(meshMap.current).forEach(([part, meshes]) => {
      const color    = localColors[part]  || "#FFFFFF";
      const pattern  = localPattern[part] || null;
      const selected = localSelected === part;
      meshes.forEach((mesh) => {
        mesh.material.color.set(color);
        if (pattern) {
          if (!texCache[pattern.src]) texCache[pattern.src] = new THREE.TextureLoader().load(pattern.src);
          mesh.material.map = texCache[pattern.src];
        } else {
          mesh.material.map = null;
        }
        mesh.material.emissive.set(selected ? "#3a2200" : "#000000");
        mesh.material.emissiveIntensity = selected ? 0.45 : 0;
        mesh.material.needsUpdate = true;
      });
    });
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e) => { mouseDown.current = { x:e.clientX, y:e.clientY }; };
    const onUp   = (e) => {
      if (Math.abs(e.clientX-mouseDown.current.x)>5||Math.abs(e.clientY-mouseDown.current.y)>5) return;
      const rect  = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX-rect.left)/rect.width)*2-1,
        ((e.clientY-rect.top)/rect.height)*-2+1
      );
      raycaster.current.setFromCamera(mouse, camera);
      const hits = raycaster.current.intersectObjects(allMeshes.current);
      if (hits.length > 0) {
        const part = hits[0].object.userData.partName;
        if (part) onPartClick(part);
      }
    };
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup",   onUp);
    return () => { canvas.removeEventListener("mousedown",onDown); canvas.removeEventListener("mouseup",onUp); };
  }, [camera, gl, onPartClick]);

  if (!rootRef.current) return null;
  return <primitive object={rootRef.current} />;
}

useGLTF.preload("/models/unbranded_white_sneaker.glb");

export default function Main1({ onFinish }) {
  const { isMobile }                   = useResponsive();
  const [parts,        setParts]        = useState([]);
  const [partColors,   setPartColors]   = useState({});
  const [selectedPart, setSelectedPart] = useState("");
  const [history,      setHistory]      = useState([]);
  const [histIdx,      setHistIdx]      = useState(-1);

  useEffect(() => {
    if (parts.length === 0) return;
    const init = {};
    parts.forEach(p => {
      init[p]           = { color:"#FFFFFF", pattern:null };
      localColors[p]    = "#FFFFFF";
      localPattern[p]   = null;
    });
    setPartColors(init);
    setSelectedPart(parts[0]);
    localSelected = parts[0];
  }, [parts]);

  const push = (s) => { const n=[...history.slice(0,histIdx+1),s]; setHistory(n); setHistIdx(n.length-1); };

  const handlePartClick = useCallback((part) => {
    setSelectedPart(part);
    localSelected = part;
  }, []);

  const applyColor = (color) => {
    push(JSON.parse(JSON.stringify(partColors)));
    localColors[selectedPart] = color;
    setPartColors(prev => ({ ...prev, [selectedPart]:{ ...prev[selectedPart], color } }));
  };

  const applyPattern = (pattern) => {
    push(JSON.parse(JSON.stringify(partColors)));
    localPattern[selectedPart] = pattern;
    setPartColors(prev => ({ ...prev, [selectedPart]:{ ...prev[selectedPart], pattern } }));
  };

  const undo = () => {
    if (histIdx<0) return;
    const prev = history[histIdx];
    Object.entries(prev).forEach(([p,v]) => { localColors[p]=v.color; localPattern[p]=v.pattern; });
    setPartColors(JSON.parse(JSON.stringify(prev))); setHistIdx(histIdx-1);
  };
  const redo = () => {
    if (histIdx>=history.length-1) return;
    const next = history[histIdx+1];
    Object.entries(next).forEach(([p,v]) => { localColors[p]=v.color; localPattern[p]=v.pattern; });
    setPartColors(JSON.parse(JSON.stringify(next))); setHistIdx(histIdx+1);
  };
  const reset = () => {
    push(JSON.parse(JSON.stringify(partColors)));
    const fresh = {};
    parts.forEach(p => {
      fresh[p]        = { color:"#FFFFFF", pattern:null };
      localColors[p]  = "#FFFFFF";
      localPattern[p] = null;
    });
    setPartColors(fresh);
  };

  /* ── Save to localStorage then navigate ── */
  const handleFinish = () => {
    saveDesign(partColors);   // ← persists to localStorage
    onFinish?.();
  };

  const currentColor   = partColors[selectedPart]?.color   || "#FFFFFF";
  const currentPattern = partColors[selectedPart]?.pattern || null;

  return (
    <div style={{ width:"100vw",height:"100dvh",display:"flex",flexDirection:isMobile?"column":"row",overflow:"hidden",fontFamily:"'Space Mono',monospace" }}>
      <div style={{ width:isMobile?"100%":"50%",height:isMobile?"46dvh":"100%",background:"#111",display:"flex",flexDirection:"column",position:"relative",flexShrink:0 }}>
        <div style={{ position:"absolute",top:isMobile?10:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:12,zIndex:10 }}>
          {[["↩",undo],["↪",redo]].map(([ic,fn])=>(
            <button key={ic} onClick={fn} style={{ width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{ic}</button>
          ))}
        </div>
        {selectedPart && (
          <div style={{ position:"absolute",bottom:isMobile?72:96,left:"50%",transform:"translateX(-50%)",background:"rgba(166,107,0,0.88)",borderRadius:99,padding:"5px 18px",fontSize:isMobile?9:11,color:"#fff",letterSpacing:"0.08em",zIndex:10,whiteSpace:"nowrap",maxWidth:"92vw",overflow:"hidden",textOverflow:"ellipsis",border:"1px solid rgba(255,200,80,0.4)" }}>
            ✦ {selectedPart} — {isMobile ? "tap" : "click"} shoe part to select
          </div>
        )}
        <div style={{ width:"100%",flex:1,minHeight:0,cursor:"crosshair",touchAction:"none" }}>
          <Canvas style={{ width:"100%",height:"100%" }} camera={{ position:[0,0.2,3.5],fov:45,near:0.1,far:100 }} gl={{ antialias:true }}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[4,6,4]}  intensity={2.0} />
            <directionalLight position={[-4,2,-4]} intensity={0.8} />
            <pointLight       position={[0,4,2]}   intensity={0.8} />
            <Suspense fallback={null}>
              <ShoeScene onPartClick={handlePartClick} partColors={partColors} setParts={setParts} />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} autoRotate autoRotateSpeed={0.6} target={[0,0,0]} />
          </Canvas>
        </div>
        <div style={{ height:isMobile?64:80,flexShrink:0,display:"flex",justifyContent:"space-around",alignItems:"center",padding:isMobile?"0 16px":"0 24px",background:"#111" }}>
          {[["Re-Set",reset],["Finish",handleFinish]].map(([lb,fn])=>(
            <button key={lb} onClick={fn} style={{ padding:isMobile?"10px 32px":"12px 44px",borderRadius:50,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:isMobile?13:15,fontWeight:700,background:"#A66B00",color:"#fff" }}>{lb}</button>
          ))}
        </div>
      </div>

      <div style={{ width:isMobile?"100%":"50%",height:isMobile?undefined:"100dvh",flex:isMobile?1:undefined,minHeight:0,background:"#E8D5A0",display:"flex",flexDirection:"column",padding:isMobile?"10px 12px":"14px 18px",overflowY:isMobile?"auto":"hidden",flexShrink:0 }}>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(15px,1.6vw,20px)",fontWeight:700,color:"#1a1208",textAlign:"center",marginBottom:10,flexShrink:0 }}>
          Customize as you wish ....
        </div>
        <div style={{ background:"rgba(200,180,120,0.30)",borderRadius:12,padding:"10px 12px",marginBottom:10,flexShrink:0,border:"1px solid rgba(180,140,60,0.2)" }}>
          <div style={{ fontSize:11,color:"#3a3020",marginBottom:8 }}>Select part to customize :</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {parts.map(part=>(
              <button key={part} onClick={()=>handlePartClick(part)} style={{ padding:"5px 12px",borderRadius:99,border:selectedPart===part?"2px solid #A66B00":"1.5px solid rgba(180,140,60,0.4)",background:selectedPart===part?"#A66B00":"rgba(255,255,255,0.5)",color:selectedPart===part?"#fff":"#3a2e0e",fontSize:11,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontWeight:selectedPart===part?700:400,transition:"all 0.15s" }}>{part}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10,flexShrink:0,padding:"8px 14px",background:"rgba(166,107,0,0.15)",borderRadius:10,border:"1px solid rgba(166,107,0,0.35)" }}>
          <div style={{ width:22,height:22,borderRadius:"50%",background:currentColor,border:"2px solid rgba(0,0,0,0.15)",flexShrink:0,boxShadow:currentColor==="#FFFFFF"?"inset 0 0 0 1px rgba(0,0,0,0.12)":"none" }}/>
          <div style={{ fontSize:12,color:"#1a1208",fontWeight:700 }}>Editing: <span style={{color:"#A66B00"}}>{selectedPart}</span></div>
          {currentPattern&&(<img src={currentPattern.src} alt="" style={{ width:22,height:22,borderRadius:4,objectFit:"cover",marginLeft:"auto",border:"1px solid rgba(0,0,0,0.15)" }}/>)}
        </div>
        <div style={{ background:"rgba(200,180,120,0.30)",borderRadius:12,padding:"10px 12px",marginBottom:10,flexShrink:0,border:"1px solid rgba(180,140,60,0.2)" }}>
          <div style={{ fontSize:11,color:"#3a3020",marginBottom:8 }}>Colour — <strong>{selectedPart}</strong> :</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
            {COLORS.map(hex=>(
              <div key={hex} onClick={()=>applyColor(hex)} style={{ width:32,height:32,borderRadius:"50%",background:hex,cursor:"pointer",border:`3px solid ${currentColor===hex?"#A66B00":"transparent"}`,transform:currentColor===hex?"scale(1.22)":"scale(1)",transition:"all 0.15s",boxShadow:hex==="#FFFFFF"?"inset 0 0 0 1px rgba(0,0,0,0.12),0 2px 6px rgba(0,0,0,0.15)":"0 2px 6px rgba(0,0,0,0.2)" }}/>
            ))}
          </div>
        </div>
        <div style={{ background:"rgba(200,180,120,0.30)",borderRadius:12,padding:"10px 12px",flex:isMobile?"0 0 auto":1,display:"flex",flexDirection:"column",border:"1px solid rgba(180,140,60,0.2)",minHeight:0 }}>
          <div style={{ fontSize:11,color:"#3a3020",marginBottom:8,flexShrink:0 }}>Pattern — <strong>{selectedPart}</strong> :</div>
          <div style={{ flex:1,minHeight:0,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gridTemplateRows:isMobile?"repeat(2,88px)":"repeat(2,1fr)",gap:6 }}>
            {PATTERNS.map(p=>(
              <div key={p.id} onClick={()=>applyPattern(p)} style={{ borderRadius:8,overflow:"hidden",cursor:"pointer",border:`3px solid ${currentPattern?.id===p.id?"#A66B00":"transparent"}`,transform:currentPattern?.id===p.id?"scale(1.05)":"scale(1)",transition:"all 0.15s",boxShadow:"0 2px 6px rgba(0,0,0,0.15)",minHeight:0 }}>
                <img src={p.src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}