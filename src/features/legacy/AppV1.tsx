import React from 'react';
import '../../styles/legacy-fonts.css';

import { Navbar } from '../../components/layout/Navbar';
import { Hero } from '../landing/components/Hero';
import { MissionVisionValues } from '../landing/components/MissionVisionValues';
import { AboutSportsGroup } from '../landing/components/AboutSportsGroup';
import { ServicesGrid } from '../landing/components/ServicesGrid';
import { ProjectsScroll } from '../landing/components/ProjectsScroll';
import { Manifesto } from '../landing/components/Manifesto';
import { ContactForm } from '../../components/layout/ContactForm';
import { Footer } from '../../components/layout/Footer';

interface Props {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const AppV1: React.FC<Props> = ({ theme, toggleTheme }) => (
  <div className="min-h-screen bg-white dark:bg-[#050505] text-neutral-900 dark:text-white transition-colors duration-300">
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <main>
      <Hero />
      <MissionVisionValues />
      <AboutSportsGroup />
      <ServicesGrid />
      <ProjectsScroll />
      <Manifesto />
      <ContactForm />
    </main>
    <Footer theme={theme} />
  </div>
);

export default AppV1;
