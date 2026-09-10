import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { loadDesign } from "./designStore";
import useResponsive from "./useResponsive";

const texCache = {};

/* ─────────────────────────────────────────────────────────
   FIX 1+2+3: Store partName in userData BEFORE replacing
   material, then read from userData (not material.name)
───────────────────────────────────────────────────────── */
function applyDesignToScene(scene, design) {
  if (!design) return;
  scene.traverse((child) => {
    if (!child.isMesh) return;

    /* FIX 4: read from userData, not material.name */
    const partName = child.userData.partName || child.name;
    const state    = design[partName];
    if (!state) return;

    child.material.color.set(state.color || "#FFFFFF");

    if (state.pattern?.src) {
      if (!texCache[state.pattern.src]) {
        texCache[state.pattern.src] = new THREE.TextureLoader().load(state.pattern.src);
      }
      child.material.map = texCache[state.pattern.src];
    } else {
      child.material.map = null;
    }
    child.material.needsUpdate = true;
  });
}

/* ─────────────────────────────────────────────────────────
   ShoePreview — builds clone with partName saved FIRST
───────────────────────────────────────────────────────── */
function ShoePreview({ design }) {
  const { scene } = useGLTF("/models/unbranded_white_sneaker.glb");
  const cloneRef  = useRef(null);

  if (!cloneRef.current) {
    const clone = scene.clone(true);

    /* Normalize size */
    const box = new THREE.Box3().setFromObject(clone);
    const sz  = new THREE.Vector3();
    const ctr = new THREE.Vector3();
    box.getSize(sz);
    box.getCenter(ctr);
    const scale = 2 / Math.max(sz.x, sz.y, sz.z);
    clone.position.set(-ctr.x * scale, -ctr.y * scale, -ctr.z * scale);
    clone.scale.setScalar(scale);

    clone.traverse((child) => {
      if (!child.isMesh) return;

      /* FIX 3: capture partName BEFORE replacing material */
      const partName = child.material?.name || child.name;
      child.userData.partName = partName;   // ← save it

      /* NOW replace material (material.name is now gone, but userData has it) */
      child.material = new THREE.MeshStandardMaterial({
        color:     "#FFFFFF",
        roughness: 0.6,
        metalness: 0.05,
      });
    });

    cloneRef.current = clone;
  }

  /* Apply design colors after clone is ready */
  useEffect(() => {
    if (!cloneRef.current) return;
    applyDesignToScene(cloneRef.current, design);
  }, [design]);

  return <primitive object={cloneRef.current} />;
}

useGLTF.preload("/models/unbranded_white_sneaker.glb");

/* ─── PNG capture ── */
function Capture({ onReady }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onReady(() => {
      gl.render(scene, camera);
      const url = gl.domElement.toDataURL("image/png");
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "my-soleforge-design.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }, [gl, scene, camera, onReady]);
  return null;
}

/* ─────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────── */
export default function SummaryPage({ onBack }) {
  const { isMobile } = useResponsive();
  const [design, setDesign] = useState(null);
  const captureFn = useRef(null);

  useEffect(() => {
    const saved = loadDesign();
    if (saved) setDesign(saved);
  }, []);

  const handleCapture = useCallback((fn) => {
    captureFn.current = fn;
  }, []);

  const handleSave = () => {
    if (captureFn.current) captureFn.current();
  };

  return (
    <div style={{
      width:"100vw", height:"100dvh",
      display:"flex", flexDirection:"column",
      fontFamily:"'Space Mono', monospace",
      overflowY:isMobile?"auto":"hidden",
      overflowX:"hidden"
    }}>

      {/* ══ TOP golden ══ */}
      <div style={{
        flex:isMobile?"0 0 auto":"0 0 68%",
        background:"#C49A28",
        position:"relative",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        overflow:"hidden", padding:isMobile?"52px 14px 16px":"0 24px 20px"
      }}>
        {/* blobs */}
        <div style={{ position:"absolute",top:-80,left:-80,width:260,height:260,borderRadius:"50%",background:"rgba(200,200,195,0.55)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(160,120,30,0.45)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:-40,right:40,width:120,height:120,borderRadius:"50%",background:"rgba(160,120,30,0.35)",pointerEvents:"none" }}/>

        {onBack && (
          <button onClick={onBack} style={{
            position:"absolute",top:16,left:20,zIndex:10,
            padding:"7px 18px",borderRadius:99,
            border:"1.5px solid rgba(0,0,0,0.3)",
            background:"transparent",cursor:"pointer",
            fontFamily:"'Space Mono',monospace",
            fontSize:11,color:"#1a1208"
          }}>← Back</button>
        )}

        <div style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(16px,2vw,22px)",
          fontWeight:700,color:"#1a1208",
          marginBottom:16,zIndex:1
        }}>
          Design Summery Preview
        </div>

        {/* ── WHITE BOX ── */}
        <div style={{
          width:"min(520px, 80vw)",
          aspectRatio:"16/9",
          background:"#ffffff",
          borderRadius:18,
          overflow:"hidden",
          zIndex:1,
          boxShadow:"0 4px 24px rgba(0,0,0,0.18)",
          marginBottom:16
        }}>
          <Canvas
            style={{ width:"100%", height:"100%" }}
            camera={{ position:[0.3, 0.1, 3.2], fov:45, near:0.1, far:100 }}
            gl={{ antialias:true, preserveDrawingBuffer:true }}
          >
            <color attach="background" args={["#000000"]} />
            <ambientLight intensity={2.0} />
            <directionalLight position={[ 5,  8,  5]} intensity={2.5} />
            <directionalLight position={[-5,  3, -5]} intensity={1.0} />
            <pointLight       position={[ 0,  5,  4]} intensity={1.2} />

            <Suspense fallback={null}>
              {/* FIX BONUS: always render ShoePreview, pass design (even if null) */}
              <ShoePreview design={design} />
              <Environment preset="studio" />
            </Suspense>

            <OrbitControls
              enablePan={false}
              minDistance={1.5} maxDistance={8}
              autoRotate autoRotateSpeed={1.5}
              target={[0,0,0]}
            />

            <Capture onReady={handleCapture} />
          </Canvas>
        </div>

        {/* Save Image */}
        <button
          onClick={handleSave}
          style={{
            padding:isMobile?"12px 40px":"13px 60px",borderRadius:99,border:"none",cursor:"pointer",
            background:"#7a4f00",color:"#fff",
            fontFamily:"'Space Mono',monospace",
            fontSize:isMobile?13:15,fontWeight:700,letterSpacing:"0.04em",zIndex:1,
            boxShadow:"0 4px 16px rgba(80,40,0,0.35)"
          }}
          onMouseEnter={e=>e.currentTarget.style.background="#5a3800"}
          onMouseLeave={e=>e.currentTarget.style.background="#7a4f00"}
        >
          Save Image
        </button>
      </div>

      {/* ══ BOTTOM dark ══ */}
      <div style={{
        flex:isMobile?"0 0 auto":"0 0 32%",
        background:"#111111",
        display:"flex",alignItems:isMobile?"flex-start":"center",
        flexDirection:isMobile?"column":"row",
        justifyContent:"space-between",
        gap:isMobile?20:0,
        padding:isMobile?"22px 20px":"0 36px",
        position:"relative",overflow:"hidden"
      }}>
        <div style={{ position:"absolute",bottom:-50,right:20,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none" }}/>
        <div>
          <div style={{ color:"#fff",fontSize:14,fontWeight:700,letterSpacing:"0.04em",marginBottom:16 }}>
            Contact Information
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[
              {icon:"📞",text:"+1111111123"},
              {icon:"✉️",text:"SoleForge@gmail.com"},
              {icon:"📍",text:"144, Mountain Hill"},
            ].map(({icon,text})=>(
              <div key={text} style={{ display:"flex",alignItems:"center",gap:12 }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ color:"#ccc",fontSize:12 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",gap:14,alignSelf:"flex-start",paddingTop:8 }}>
          {[["𝕏","Twitter"],["◎","Instagram"]].map(([icon,label])=>(
            <div key={label} style={{
              width:34,height:34,borderRadius:"50%",
              background:"rgba(255,255,255,0.1)",
              border:"1px solid rgba(255,255,255,0.2)",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",fontSize:14,color:"#fff"
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            >{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );
}