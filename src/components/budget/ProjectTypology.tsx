'use client';

import { useEffect, useState } from 'react';
import Title from '../form/Title';
import { useBudget } from '@/context/BudgetContext';
import DontKnowCheckbox from '../form/DontKnowCheckbox';
import NbSRemoval from './typologies/NbSRemoval';
import NbSAvoidance from './typologies/NbSAvoidance';
import DAC from './typologies/DAC';
import Biochar from './typologies/Biochar';
import ImpactPreference from './typologies/ImpactPreference';
import NbSPreference from './typologies/NbSPreference';
import { BIODIVERSITY_AVOIDANCE_TYPOLGY, BIODIVERSITY_NO_IDEA_TYPOLGY, BIODIVERSITY_REMOVAL_TYPOLGY, CLIMATE_AVOIDANCE_TYPOLGY, CLIMATE_NO_IDEA_TYPOLGY, CLIMATE_REMOVAL_TYPOLGY, DEFAULT_TYPOLGY, TYPOLOGY_PREFERENCE } from '@/utils/configuration';
import { Typology } from '@/types';

export default function ProjectTypology() {
  const [isTypologyFull, setIsTypologyFull] = useState(true);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const [impactPreference, setImpactPreference] = useState<string>('');
  const [nbSPreference, setNbSPreference] = useState<string>('');
  const { typology, setTypology } = useBudget();

  const reset = () => {
    setTypology(DEFAULT_TYPOLGY);
  }

  useEffect(() => {
    const typologyValues = Object.values(typology);
    const sum = typologyValues.reduce((acc, value) => acc + value, 0);
    setIsTypologyFull(parseFloat(sum).toFixed(2) === '1.00');
  }, [typology]);

  useEffect(() => {
    if (!isDontKnowSelected || !impactPreference || !nbSPreference) return;

    const typologyMap: Record<string, Record<string, Typology>>= {
      [TYPOLOGY_PREFERENCE.CLIMATE_IMPACT]: {
        [TYPOLOGY_PREFERENCE.NBS_AVOIDANCE]: CLIMATE_AVOIDANCE_TYPOLGY,
        [TYPOLOGY_PREFERENCE.NBS_REMOVAL]: CLIMATE_REMOVAL_TYPOLGY,
        [TYPOLOGY_PREFERENCE.NO_IDEA]: CLIMATE_NO_IDEA_TYPOLGY,
      },
      [TYPOLOGY_PREFERENCE.BIODIVERSITY_IMPACT]: {
        [TYPOLOGY_PREFERENCE.NBS_AVOIDANCE]: BIODIVERSITY_AVOIDANCE_TYPOLGY,
        [TYPOLOGY_PREFERENCE.NBS_REMOVAL]: BIODIVERSITY_REMOVAL_TYPOLGY,
        [TYPOLOGY_PREFERENCE.NO_IDEA]: BIODIVERSITY_NO_IDEA_TYPOLGY,
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
        title="3. Project Typologies Deep Dive"
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
      { !isTypologyFull && (
        <div className="mt-6 bg-red-800 text-sm px-4 py-2 rounded-lg">
          The sum of the typology values must be equal to 100%
          <span onClick={reset} className="ml-4 border border-opacityLight-30 rounded-lg px-2 py-1 uppercase cursor-pointer hover:bg-opacityLight-10">Reset</span>
        </div>
      )}
      <div className="mt-12 flex items-center ml-2">
        <DontKnowCheckbox isSelected={isDontKnowSelected} setIsSelected={setIsDontKnowSelected} />
        {isDontKnowSelected && (
          <div className="ml-8 text-sm font-light italic">
            Let Carbonable guide you
          </div>
        )}
      </div>
      { isDontKnowSelected && (
        <div className="border-2 border-opacityLight-10 mt-8 px-8 py-6 rounded-lg">
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
