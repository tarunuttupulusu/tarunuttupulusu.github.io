import React, { useMemo, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { PROJECTS } from '../data/projects';

interface ProjectsRingProps {
  isMobile?: boolean;
}

export const ProjectsRing: React.FC<ProjectsRingProps> = ({ isMobile = false }) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const cards = useMemo(() => {
    const PI = Math.PI;
    const totalSlots = Math.ceil(PROJECTS.length / 2);
    return PROJECTS.map((proj, idx) => {
      const isEven = idx % 2 === 0;
      const angle = (PI / totalSlots) * Math.floor(idx / 2);
      const z = -11 * Math.sin(angle);
      const x = -11 * Math.cos(angle);
      const rotY = PI / 2 - angle;

      return (
        <ProjectCard
          key={idx}
          project={proj}
          index={idx}
          datePosition={isEven ? 'top' : 'bottom'}
          position={[x, isEven ? 3.25 : 1, z]}
          rotation={[0, rotY, 0]}
          activeId={activeId}
          isMobile={isMobile}
          onClick={() => {
            if (isMobile) {
              setActiveId((prev) => (prev === idx ? null : idx));
            }
          }}
        />
      );
    });
  }, [activeId, isMobile]);

  return <group rotation={[0, -Math.PI / 12, 0]}>{cards}</group>;
};
