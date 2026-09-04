import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { META } from '../../../lib/metaRutas';
import { HeroV3 } from '../components/HeroV3';
import { AdnOffcourtV3 } from '../components/AdnOffcourtV3';
import { IdealClientV3 } from '../components/IdealClientV3';

import { ProjectsScrollV3 } from '../components/ProjectsScrollV3';
import { TextManifestoV3 } from '../components/TextManifestoV3';
import { ManifestoV3 } from '../components/ManifestoV3';
import { ContactFormV3 } from '../components/ContactFormV3';

export const HomeV3: React.FC = () => {
  useSeo(META.home.title, META.home.description);
  return (
    <>
      <HeroV3 />
      <AdnOffcourtV3 />
      <IdealClientV3 />

      <ProjectsScrollV3 />
      <TextManifestoV3 />
      <ManifestoV3 />
      <ContactFormV3 />
    </>
  );
};
