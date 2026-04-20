import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Star, Target, Info } from 'lucide-react';

export default function ThreeSkillTree({ roadmap, activeWeek, onSelectWeek }) {
  const containerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!roadmap || !roadmap.weeks) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; // Transparent

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4f46e5, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // --- Content: Skill Nodes ---
    const nodes = [];
    const weekCount = roadmap.weeks.length;
    const radius = 8;

    roadmap.weeks.forEach((week, i) => {
      // Calculate position in 3D DNA-style spiral
      const phi = Math.acos(-1 + (2 * i) / weekCount);
      const theta = Math.sqrt(weekCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Sphere Geometry
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const color = i === activeWeek ? 0x4f46e5 : 0x1f2937;
      const material = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color,
        emissiveIntensity: i === activeWeek ? 0.5 : 0.1,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = { ...week, index: i };
      
      scene.add(sphere);
      nodes.push(sphere);

      // Connecting Lines to next node
      if (i < weekCount - 1) {
        const nextPhi = Math.acos(-1 + (2 * (i+1)) / weekCount);
        const nextTheta = Math.sqrt(weekCount * Math.PI) * nextPhi;
        const nx = radius * Math.cos(nextTheta) * Math.sin(nextPhi);
        const ny = radius * Math.sin(nextTheta) * Math.sin(nextPhi);
        const nz = radius * Math.cos(nextPhi);

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(nx, ny, nz)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    });

    // --- Raycasting for Interactivity ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0) {
        const node = intersects[0].object.userData;
        setSelectedNode(node);
        onSelectWeek(node.index);
      }
    };

    window.addEventListener('click', onMouseClick);

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Subtle rotation
      scene.rotation.y += 0.002;
      
      nodes.forEach((node, i) => {
        const pulse = Math.sin(Date.now() * 0.002 + i) * 0.1;
        node.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('click', onMouseClick);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [roadmap, activeWeek, onSelectWeek]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-card/30 to-background rounded-3xl border border-border overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Legend & Info Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl">
           <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
             <Brain size={14} /> 3D Skill DNA
           </h4>
           <p className="text-[10px] text-muted-foreground leading-tight max-w-[140px]">
             Drag to rotate. Click nodes to explore curriculum milestones in depth.
           </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute top-6 right-6 w-64 bg-card/90 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-6 pointer-events-auto"
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-tighter">Week {selectedNode.week}</p>
                 <h3 className="text-sm font-bold text-foreground leading-tight">{selectedNode.title}</h3>
               </div>
               <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-muted rounded-md transition-colors font-bold text-xs">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.skills?.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full">{s}</span>
                ))}
              </div>
              
              <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                 <p className="text-[10px] text-muted-foreground flex items-center gap-2 mb-2 font-bold uppercase"><Target size={12} className="text-primary"/> Main Goal</p>
                 <p className="text-[11px] text-foreground font-medium leading-relaxed">
                   {selectedNode.objectives?.[0] || 'Mastering core architectural patterns and performance optimizations.'}
                 </p>
              </div>

              <button 
                onClick={() => onSelectWeek(selectedNode.index)}
                className="w-full py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
              >
                Go to Details <Star size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}