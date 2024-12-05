'use client';

import { useEffect, useState } from 'react';
import Title from '../../form/Title';
import { useBudget } from '@/context/BudgetContext';
import DontKnowCheckbox from '../../form/DontKnowCheckbox';
import NbSRemoval from './typologies/NbSRemoval';
import NbSAvoidance from './typologies/NbSAvoidance';
import DAC from './typologies/DAC';
import Biochar from './typologies/Biochar';
import RenewableEnergy from './typologies/RenewableEnergy';
import PreferenceQuestion from './typologies/PreferenceQuestion';
import { UserPreferences } from '@/types/types';
import {
  calculateTypologyScores,
  // calculateTypologyScoresNonLinear,
  normalizeScoresToPercentages,
  // normalizeScoresToPercentagesNonLinear,
} from '@/utils/calculations';

export default function ProjectTypology() {
  const [isTypologyFull, setIsTypologyFull] = useState(true);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const { typology, setTypology } = useBudget();

  // State for each typology percentage
  const [nbsRemoval, setNbsRemoval] = useState<number | number[]>(typology.nbsRemoval * 100);
  const [nbsAvoidance, setNbsAvoidance] = useState<number | number[]>(typology.nbsAvoidance * 100);
  const [dac, setDac] = useState<number | number[]>(typology.dac * 100);
  const [biochar, setBiochar] = useState<number | number[]>(typology.biochar * 100);
  const [renewableEnergy, setRenewableEnergy] = useState<number | number[]>(
    typology.renewableEnergy * 100,
  );

  // State for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    biodiversity: 3,
    durability: 3,
    removal: 3,
    pricing: 3,
    reputation: 3,
  });

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    setUserPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const calculateTypologyFromPreferences = () => {
    const scores = calculateTypologyScores(userPreferences);
    const normalized = normalizeScoresToPercentages(scores);

    // Update context
    setTypology(normalized);

    // Update local state variables
    setNbsRemoval(normalized.nbsRemoval * 100);
    setNbsAvoidance(normalized.nbsAvoidance * 100);
    setDac(normalized.dac * 100);
    setBiochar(normalized.biochar * 100);
    setRenewableEnergy(normalized.renewableEnergy * 100);
  };

  // Sync local state with context when "I don't know" is selected
  useEffect(() => {
    if (isDontKnowSelected) {
      calculateTypologyFromPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDontKnowSelected, userPreferences]);

  // Update typology in context when sliders change and "I don't know" is not selected
  useEffect(() => {
    if (!isDontKnowSelected) {
      setTypology({
        nbsRemoval: (nbsRemoval as number) / 100,
        nbsAvoidance: (nbsAvoidance as number) / 100,
        dac: (dac as number) / 100,
        biochar: (biochar as number) / 100,
        renewableEnergy: (renewableEnergy as number) / 100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy]);

  // Ensure the sum of typology percentages is 100%
  useEffect(() => {
    const total =
      (nbsRemoval as number) +
      (nbsAvoidance as number) +
      (dac as number) +
      (biochar as number) +
      (renewableEnergy as number);
    setIsTypologyFull(Math.round(total) === 100);
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy]);

  return (
    <>
      <Title
        title="3. Project Typologies Deep Dive"
        subtitle="Which project typology mix are you aiming for?"
      />
      <div className="mt-8 w-full">
        <NbSRemoval
          isDontKnowSelected={isDontKnowSelected}
          nbs={nbsRemoval}
          setNbs={setNbsRemoval}
        />
      </div>
      <div className="mt-8 w-full">
        <NbSAvoidance
          isDontKnowSelected={isDontKnowSelected}
          nbs={nbsAvoidance}
          setNbs={setNbsAvoidance}
        />
      </div>
      <div className="mt-8 w-full">
        <DAC isDontKnowSelected={isDontKnowSelected} dac={dac} setDac={setDac} />
      </div>
      <div className="mt-8 w-full">
        <Biochar
          isDontKnowSelected={isDontKnowSelected}
          biochar={biochar}
          setBiochar={setBiochar}
        />
      </div>
      <div className="mt-8 w-full">
        <RenewableEnergy
          isDontKnowSelected={isDontKnowSelected}
          renewableEnergy={renewableEnergy}
          setRenewableEnergy={setRenewableEnergy}
        />
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
          <h3 className="mb-4 text-lg font-semibold">Please answer the following questions:</h3>
          <PreferenceQuestion
            question="How important is biodiversity improvement in shaping your portfolio?"
            value={userPreferences.biodiversity}
            onChange={(value) => handlePreferenceChange('biodiversity', value)}
            options={[
              { value: 1, label: 'Minimal Influence – Little to no impact on portfolio.' },
              { value: 2, label: 'Low Priority – Considered, but rarely influences portfolio.' },
              { value: 3, label: 'Moderate Priority – One of many factors considered.' },
              { value: 4, label: 'High Priority – Often shapes portfolio.' },
              { value: 5, label: 'Core Priority – Central to portfolio strategy.' },
            ]}
          />
          <PreferenceQuestion
            question="How important is the durability of climate impact in your project selection?"
            value={userPreferences.durability}
            onChange={(value) => handlePreferenceChange('durability', value)}
            options={[
              { value: 1, label: 'Uninfluential – Has little to no effect on project choices.' },
              { value: 2, label: 'Minor Influence – Considered, but seldom guides selection.' },
              { value: 3, label: 'Moderate Influence – One of several factors considered.' },
              { value: 4, label: 'Significant Influence – Frequently influences project choices.' },
              { value: 5, label: 'Primary Influence – Fundamental to project selection strategy.' },
            ]}
          />
          <PreferenceQuestion
            question="How important is a focus on carbon removal compared to avoidance?"
            value={userPreferences.removal}
            onChange={(value) => handlePreferenceChange('removal', value)}
            options={[
              { value: 1, label: 'Not Important – Little to no relevance in decision-making.' },
              { value: 2, label: 'Slightly Important – Considered, but rarely affects selection.' },
              {
                value: 3,
                label: 'Moderately Important – One of several factors taken into account.',
              },
              { value: 4, label: 'Very Important – Often influences decision-making.' },
              { value: 5, label: 'Extremely Important – Central to decision-making and strategy.' },
            ]}
          />
          <PreferenceQuestion
            question="How important is pricing in driving your choices?"
            value={userPreferences.pricing}
            onChange={(value) => handlePreferenceChange('pricing', value)}
            options={[
              { value: 1, label: 'Minimal Influence – Pricing is a minor consideration.' },
              {
                value: 2,
                label:
                  'Secondary Influence – Pricing matters, but other factors usually take priority.',
              },
              {
                value: 3,
                label: 'Balanced Influence – Pricing is considered equally with other factors.',
              },
              { value: 4, label: 'High Influence – Pricing is one of the main drivers.' },
              {
                value: 5,
                label: 'Critical Influence – Pricing is the top priority in decision-making.',
              },
            ]}
          />
          <PreferenceQuestion
            question="How important is reputation in influencing your choices?"
            value={userPreferences.reputation}
            onChange={(value) => handlePreferenceChange('reputation', value)}
            options={[
              { value: 1, label: 'Minimal Influence – Reputation is a minor consideration.' },
              {
                value: 2,
                label:
                  'Secondary Influence – Reputation matters, but other factors usually take priority.',
              },
              {
                value: 3,
                label: 'Balanced Influence – Reputation is considered equally with other factors.',
              },
              { value: 4, label: 'Significant Influence – Reputation is one of the main drivers.' },
              {
                value: 5,
                label: 'Primary Influence – Reputation is the top priority in decision-making.',
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
