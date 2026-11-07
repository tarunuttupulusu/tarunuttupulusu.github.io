import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Text, Edges, Line } from '@react-three/drei';
import gsap from 'gsap';
import { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  onClick?: () => void;
  datePosition: 'top' | 'bottom';
  isMobile?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  position,
  rotation,
  activeId,
  onClick,
  datePosition,
  isMobile = false,
}) => {
  const cardGroupRef = useRef<any>(null);
  const cardBgRef = useRef<any>(null);
  const titleTextRef = useRef<any>(null);
  const dateGroupRef = useRef<any>(null);
  const subTextRef = useRef<any>(null);
  const viewButtonRef = useRef<any>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);

  const isActive = isMobile ? activeId === index : hovered;
  const isTop = datePosition === 'top';

  const titleFontProps = useMemo(
    () => ({
      font: '/soria-font.ttf',
      color: '#000000',
    }),
    []
  );

  const textFontProps = useMemo(
    () => ({
      font: '/Vercetti-Regular.woff',
      color: '#000000',
      anchorX: 'left' as const,
      anchorY: 'top' as const,
    }),
    []
  );

  // Stagger entrance animation on mount: cards rise up like the original clevir.li portal entrance
  useEffect(() => {
    if (cardGroupRef.current) {
      gsap.fromTo(
        cardGroupRef.current.position,
        { y: -11 },
        {
          y: 0,
          duration: 1.1,
          delay: 0.08 * index,
          ease: 'power3.out',
        }
      );
    }
  }, [index]);

  // Hover / Focus morph animation matching original clevir.li timeline
  useEffect(() => {
    if (!cardGroupRef.current) return;
    timelineRef.current?.kill();

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    timelineRef.current = tl;

    // Pop forward in Z & scale up 1.3x
    tl.to(cardGroupRef.current.position, { z: isActive ? 1 : 0, duration: 0.25 }, 0)
      .to(cardGroupRef.current.position, { y: isActive && isTop ? -2 : 0, duration: 0.25 }, 0)
      .to(
        cardGroupRef.current.scale,
        {
          x: isActive ? 1.3 : 1,
          y: isActive ? 1.3 : 1,
          z: isActive ? 1.3 : 1,
          duration: 0.25,
        },
        0
      );

    // Title repositioning
    if (titleTextRef.current?.position) {
      tl.to(titleTextRef.current.position, { y: isActive ? 0.7 : -0.8, duration: 0.25 }, 0);
    }

    // Subtext description appearance
    if (subTextRef.current?.position) {
      tl.to(subTextRef.current.position, { y: isActive ? 0.7 : 0, duration: 0.25 }, 0)
        .to(
          subTextRef.current,
          {
            fillOpacity: isActive ? 1 : 0,
            duration: 0.35,
            onUpdate: () => {
              if (typeof subTextRef.current?.sync === 'function') {
                subTextRef.current.sync();
              }
            },
          },
          0
        );
    }

    // Date outline badge movement
    if (dateGroupRef.current?.position) {
      tl.to(
        dateGroupRef.current.position,
        { y: isActive ? 2.6 : isTop ? 1.4 : -1.4, duration: 0.25 },
        0
      );
    }

    // Card background expansion & opacity
    if (cardBgRef.current?.scale) {
      tl.to(cardBgRef.current.scale, { y: isActive ? 2 : 1, duration: 0.25 }, 0)
        .to(cardBgRef.current.position, { y: isActive ? 1 : 0, duration: 0.25 }, 0);
      if (cardBgRef.current.material) {
        tl.to(cardBgRef.current.material, { opacity: isActive ? 0.95 : 0.3, duration: 0.25 }, 0);
      }
    }

    // "VIEW ↗" button reveal
    if (project.url && viewButtonRef.current) {
      tl.to(
        viewButtonRef.current.scale,
        { y: isActive ? 1 : 0, x: isActive ? 1 : 0, duration: 0.25 },
        0
      ).to(viewButtonRef.current.position, { z: isActive ? 0.3 : -1, duration: 0.25 }, 0);
    }
  }, [isActive, isTop, project.url]);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isMobile) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (!isMobile) {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }
      }}
    >
      <group ref={cardGroupRef}>
        {/* Card Background Plane */}
        <mesh ref={cardBgRef}>
          <planeGeometry args={[4.2, 2, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          {project.featured ? (
            <Edges color="#000000" lineWidth={2} />
          ) : (
            <Line
              points={[
                [-2.1, -1, 0.11],
                [2.1, -1, 0.11],
                [2.1, 1, 0.11],
                [-2.1, 1, 0.11],
                [-2.1, -1, 0.11],
              ]}
              color="#777777"
              lineWidth={1.5}
              dashed
              dashSize={0.12}
              gapSize={0.08}
            />
          )}
        </mesh>

        {/* Title Text */}
        <Text
          ref={titleTextRef}
          {...titleFontProps}
          position={[-1.9, -0.8, 0.101]}
          anchorX="left"
          anchorY="bottom"
          maxWidth={4}
          fontSize={0.8}
        >
          {project.title}
        </Text>

        {/* Date Outline Badge */}
        <group ref={dateGroupRef} position={[-1.25, isTop ? 1.4 : -1.4, 0.01]}>
          <mesh>
            <planeGeometry args={[1.7, 0.4, 1]} />
            <meshBasicMaterial color="#777777" opacity={0} wireframe />
            <Edges color="#000000" lineWidth={1} />
          </mesh>
          <Text
            {...textFontProps}
            position={[-0.7, 0.2, 0]}
            fontSize={0.3}
          >
            {project.date.toUpperCase()}
          </Text>
        </group>

        {/* Subtext description (fades in on hover) */}
        <Text
          ref={subTextRef}
          {...textFontProps}
          maxWidth={3.8}
          position={[-1.9, 2.3, 0.1]}
          fontSize={0.2}
          fillOpacity={0}
        >
          {project.subtext}
        </Text>

        {/* VIEW ↗ Action Button */}
        {project.url && (
          <group
            ref={viewButtonRef}
            position={[1.3, -0.6, -1]}
            scale={[0, 0, 1]}
            onClick={(e) => {
              e.stopPropagation();
              const obj = e.eventObject;
              gsap
                .to(obj.position, { z: 0, duration: 0.1 })
                .then(() => gsap.to(obj.position, { z: 0.3, duration: 0.3 }));
              setTimeout(() => {
                window.open(project.url, '_blank');
              }, 120);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh>
              <boxGeometry args={[1.1, 0.4, 0.2]} />
              <meshBasicMaterial color="#222222" />
              <Edges color="#ffffff" lineWidth={1} />
            </mesh>
            <Text
              {...textFontProps}
              color="#ffffff"
              position={[-0.4, 0.15, 0.2]}
              fontSize={0.25}
            >
              VIEW ↗
            </Text>
          </group>
        )}
      </group>
    </group>
  );
};
