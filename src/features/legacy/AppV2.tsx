import React from 'react';
import '../../styles/legacy-fonts.css';

import { Navbar } from '../../components/layout/Navbar';
import { HeroV2 } from '../v2/components/HeroV2';
import { MissionVisionValuesV2 } from '../v2/components/MissionVisionValuesV2';
import { AboutSportsGroup } from '../landing/components/AboutSportsGroup';
import { ServicesGridV2 } from '../v2/components/ServicesGridV2';
import { ProjectsScrollV2 } from '../v2/components/ProjectsScrollV2';
import { ManifestoV2 } from '../v2/components/ManifestoV2';
import { ContactFormV2 } from '../../components/layout/ContactFormV2';
import { Footer } from '../../components/layout/Footer';

interface Props {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const AppV2: React.FC<Props> = ({ theme, toggleTheme }) => (
  <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#111111] text-neutral-900 dark:text-white transition-colors duration-300">
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <main>
      <HeroV2 />
      <MissionVisionValuesV2 />
      <AboutSportsGroup />
      <ServicesGridV2 />
      <ProjectsScrollV2 />
      <ManifestoV2 />
      <ContactFormV2 />
    </main>
    <Footer theme={theme} />
  </div>
);

export default AppV2;
