'use client';

import { useEffect, useState } from 'react';
import Title from '../../form/Title';
import DontKnowCheckbox from '../../form/DontKnowCheckbox';
import NbSRemoval from './typologies/NbSRemoval';
import NbSAvoidance from './typologies/NbSAvoidance';
import DAC from './typologies/DAC';
import Biochar from './typologies/Biochar';
import ImpactPreference from './typologies/ImpactPreference';
import NbSPreference from './typologies/NbSPreference';
import {
  BIODIVERSITY_AVOIDANCE_TYPOLOGY,
  BIODIVERSITY_NO_IDEA_TYPOLOGY,
  BIODIVERSITY_REMOVAL_TYPOLOGY,
  CLIMATE_AVOIDANCE_TYPOLOGY,
  CLIMATE_NO_IDEA_TYPOLOGY,
  CLIMATE_REMOVAL_TYPOLOGY,
  TYPOLOGY_PREFERENCE,
} from '@/utils/configuration';
import { Typology } from '@/types/types';
import { useStrategy } from '@/context/StrategyContext';

export default function ProjectTypology() {
  const [isTypologyFull, setIsTypologyFull] = useState(true);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const [impactPreference, setImpactPreference] = useState<string>('');
  const [nbSPreference, setNbSPreference] = useState<string>('');
  const { typology, setTypology } = useStrategy();

  useEffect(() => {
    const typologyValues = Object.values(typology);
    const sum = typologyValues.reduce((acc, value) => acc + value, 0);
    setIsTypologyFull(parseFloat(sum).toFixed(2) === '1.00');
  }, [typology]);

  useEffect(() => {
    if (!isDontKnowSelected || !impactPreference || !nbSPreference) return;

    const typologyMap: Record<string, Record<string, Typology>> = {
      [TYPOLOGY_PREFERENCE.CLIMATE_IMPACT]: {
        [TYPOLOGY_PREFERENCE.NBS_AVOIDANCE]: CLIMATE_AVOIDANCE_TYPOLOGY,
        [TYPOLOGY_PREFERENCE.NBS_REMOVAL]: CLIMATE_REMOVAL_TYPOLOGY,
        [TYPOLOGY_PREFERENCE.NO_IDEA]: CLIMATE_NO_IDEA_TYPOLOGY,
      },
      [TYPOLOGY_PREFERENCE.BIODIVERSITY_IMPACT]: {
        [TYPOLOGY_PREFERENCE.NBS_AVOIDANCE]: BIODIVERSITY_AVOIDANCE_TYPOLOGY,
        [TYPOLOGY_PREFERENCE.NBS_REMOVAL]: BIODIVERSITY_REMOVAL_TYPOLOGY,
        [TYPOLOGY_PREFERENCE.NO_IDEA]: BIODIVERSITY_NO_IDEA_TYPOLOGY,
      },
    };

    const selectedTypology: Typology = typologyMap[impactPreference]?.[nbSPreference];
    if (selectedTypology) {
      setTypology(selectedTypology);
    }
  }, [isDontKnowSelected, impactPreference, nbSPreference, setTypology]);

  return (
    <>
      <Title
        title="4. Project Typologies Deep Dive"
        subtitle="Which project typology mix are you aiming for?"
      />
      <div className="mt-8 w-full">
        <NbSRemoval isDontKnowSelected={isDontKnowSelected} />
      </div>
      <div className="mt-8 w-full">
        <NbSAvoidance isDontKnowSelected={isDontKnowSelected} />
      </div>
      <div className="mt-8 w-full">
        <DAC isDontKnowSelected={isDontKnowSelected} />
      </div>
      <div className="mt-8 w-full">
        <Biochar isDontKnowSelected={isDontKnowSelected} />
      </div>
      {!isTypologyFull && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the typology values must be equal to 100%
        </div>
      )}
      <div className="ml-2 mt-12 flex items-center">
        <DontKnowCheckbox isSelected={isDontKnowSelected} setIsSelected={setIsDontKnowSelected} />
        {isDontKnowSelected && (
          <div className="ml-8 text-sm font-light italic">Let Carbonable guide you</div>
        )}
      </div>
      {isDontKnowSelected && (
        <div className="mt-8 rounded-lg border-2 border-opacityLight-10 px-8 py-6">
          <div>
            <ImpactPreference setImpactPreference={setImpactPreference} />
          </div>
          <div className="mt-4">
            <NbSPreference setNbSPreference={setNbSPreference} />
          </div>
        </div>
      )}
    </>
  );
}
