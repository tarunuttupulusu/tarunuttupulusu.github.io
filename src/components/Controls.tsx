import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface ControlsProps {
  isMobile: boolean;
  panOffset: number;
  setPanOffset: React.Dispatch<React.SetStateAction<number>>;
}

export const SceneControls: React.FC<ControlsProps> = ({
  isMobile,
  panOffset,
  setPanOffset,
}) => {
  const { camera } = useThree();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRot = useRef(0);
  const targetRot = useRef(-0.16); // Centered on DJ Gig & Focus Clock as in screenshot
  const targetCamZ = useRef(2.45);

  useEffect(() => {
    // Initial camera placement looking at Wanderer & DJ Gig center with smooth fly-in entrance
    camera.position.set(0, 0.8, 4.6);
    camera.rotation.set(0.04, -0.16, 0);

    gsap.to(camera.position, {
      x: 0,
      y: 1.38,
      z: 2.45,
      duration: 1.6,
      ease: 'power3.out',
    });
  }, [camera]);

  // Handle Mouse Drag for desktop panning
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button, a')) return;
      isDragging.current = true;
      startX.current = e.clientX;
      startRot.current = targetRot.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      const newRot = startRot.current + dx * 0.0035;
      const maxRot = Math.PI * 0.65;
      targetRot.current = Math.max(Math.min(newRot, maxRot), -maxRot);
      setPanOffset(targetRot.current);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        targetRot.current -= e.deltaX * 0.0015;
      } else {
        targetRot.current -= e.deltaY * 0.001;
      }
      const maxRot = Math.PI * 0.65;
      targetRot.current = Math.max(Math.min(targetRot.current, maxRot), -maxRot);
      setPanOffset(targetRot.current);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [setPanOffset]);

  // Handle Touch Drag for mobile panning
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        startX.current = e.touches[0].clientX;
        startRot.current = targetRot.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startX.current;
      const newRot = startRot.current + dx * 0.005;
      const maxRot = Math.PI * 0.65;
      targetRot.current = Math.max(Math.min(newRot, maxRot), -maxRot);
      setPanOffset(targetRot.current);
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setPanOffset]);

  useFrame((state, delta) => {
    if (!camera) return;

    if (!isMobile) {
      // Subtle parallax tracking when not dragging
      const pointerRotY = isDragging.current ? 0 : -(state.pointer.x * Math.PI) / 16;
      const targetY = targetRot.current + pointerRotY;

      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetY, 0.05);

      // Vertical slight pitch & elevation parallax
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        0.04 - state.pointer.y * 0.04,
        0.05
      );

      targetCamZ.current = 2.45 - state.pointer.y * 0.25;
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        targetCamZ.current,
        7,
        delta
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        1.38 + state.pointer.y * 0.1,
        0.05
      );
    } else {
      camera.rotation.y += (targetRot.current - camera.rotation.y) * 0.05;
    }

    camera.updateProjectionMatrix();
  });

  return null;
};
