import React, { Suspense, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Wanderer } from './components/Wanderer';
import { ProjectsRing } from './components/ProjectsRing';
import { SceneControls } from './components/Controls';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#bdd1e3] p-8 text-black">
          <div className="max-w-md bg-white/80 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-xs text-red-600 mb-4">{String(this.state.error?.message || this.state.error)}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white text-xs rounded hover:bg-black/80"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loader() {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-4 rounded-xl shadow-sm border border-white/50">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        <span className="font-vercetti text-xs tracking-widest text-black/80 uppercase">
          Loading 3D Wanderer...
        </span>
      </div>
    </div>
  );
}

export function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [panOffset, setPanOffset] = useState(-0.16);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#bdd1e3]">
        <Suspense fallback={<Loader />}>
          <Canvas
            camera={{
              fov: 70,
              position: [0, 1.38, 2.45],
              near: 0.1,
              far: 3500,
            }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <color attach="background" args={['#bdd1e3']} />

            <ambientLight intensity={0.95} />
            <directionalLight position={[10, 20, 15]} intensity={0.7} />
            <directionalLight position={[-10, 15, -10]} intensity={0.45} />
            <hemisphereLight args={['#ffffff', '#8faec7', 0.5]} />

            <group position={[0, 0, 0]}>
              {/* The 3D Wanderer standing on the rocky crag */}
              <Wanderer
                position={[0, -1.05, -0.6]}
                rotation={[0, Math.PI / 6, 0]}
                scale={[1.5, 1.5, 1.5]}
              />

              {/* The 3D Curved Cylindrical Project Timeline */}
              <ProjectsRing isMobile={isMobile} />
            </group>

            {/* Interactive Camera & Pan Controls */}
            <SceneControls
              isMobile={isMobile}
              panOffset={panOffset}
              setPanOffset={setPanOffset}
            />
          </Canvas>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
