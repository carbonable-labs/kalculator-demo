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
import { UserPreferences, Typology } from '@/types/types';
import { computeFinalDistribution } from '@/utils/calculations';

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
    pricing: 3,
    reputation: 3,
    removal: 0, // TODO Valeur par défaut pour "I don't care"
  });


  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    setUserPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const calculateTypologyFromPreferences = () => {
    const normalized: Typology = computeFinalDistribution(userPreferences);
    if (!normalized || Object.values(normalized).some((val) => isNaN(val))) {
      setErrorMessage('No suitable distribution or invalid values in calculation.');
      return;
    }
    console.log("normalized:", normalized)
    setErrorMessage('');
    setTypology(normalized);
    setNbsRemoval(normalized.nbsRemoval * 100 || 0); // todo
    setNbsAvoidance(normalized.nbsAvoidance * 100 || 0);
    setDac(normalized.dac * 100 || 0);
    setBiochar(normalized.biochar * 100 || 0);
    setRenewableEnergy(normalized.renewableEnergy * 100 || 0);
  };


  // Sync local state with context when "I don't know" is selected
  useEffect(() => {
    if (isDontKnowSelected) {
      calculateTypologyFromPreferences();
    }
  }, [isDontKnowSelected, userPreferences]);

  // Update typology in context when sliders change and "I don't know" is not selected
  useEffect(() => {
    if (!isDontKnowSelected) {
      setTypology({
        nbsRemoval: nbsRemoval as number / 100,
        nbsAvoidance: nbsAvoidance as number / 100,
        dac: dac as number / 100,
        biochar: biochar as number / 100,
        renewableEnergy: renewableEnergy as number / 100,
      });
    }
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy]);

  // Ensure the sum of typology percentages is 100%
  useEffect(() => {
    if (!isDontKnowSelected) {
      const total = (nbsRemoval as number) + (nbsAvoidance as number) + (dac as number) + (biochar as number) + (renewableEnergy as number);
      setIsTypologyFull(Math.round(total) === 100);
    }
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy, isDontKnowSelected]);

  return (
    <>
      <Title
        title="3. Project Typologies Deep Dive"
        subtitle="Which project typology mix are you aiming for?"
      />
      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm">
          {errorMessage}
        </div>
      )}
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
        <Biochar isDontKnowSelected={isDontKnowSelected} biochar={biochar} setBiochar={setBiochar} />
      </div>
      <div className="mt-8 w-full">
        <RenewableEnergy
          isDontKnowSelected={isDontKnowSelected}
          renewableEnergy={renewableEnergy}
          setRenewableEnergy={setRenewableEnergy}
        />
      </div>
      {!isTypologyFull && !isDontKnowSelected && (
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
          <h3 className="mb-4 text-lg font-semibold">Please allocate exactly 12 points across these criteria:</h3>
          <PreferenceQuestion
            question="How important is biodiversity improvement in shaping your portfolio?"
            value={userPreferences.biodiversity}
            onChange={(value) => handlePreferenceChange('biodiversity', value)}
            hint={
              userPreferences.biodiversity === 5
                ? 'Projects with low biodiversity scores will be excluded.'
                : userPreferences.biodiversity === 4
                  ? 'Projects with very low biodiversity scores will have less weight.'
                  : undefined
            }
          />
          <PreferenceQuestion
            question="How important is the durability of climate impact in your project selection?"
            value={userPreferences.durability}
            onChange={(value) => handlePreferenceChange('durability', value)}
            hint={
              userPreferences.durability === 5
                ? 'Projects with low durability scores will be excluded.'
                : userPreferences.durability === 4
                  ? 'Projects with very low durability scores will have less weight.'
                  : undefined
            }
          />
          <PreferenceQuestion
            question="How important is pricing in driving your choices?"
            value={userPreferences.pricing}
            onChange={(value) => handlePreferenceChange('pricing', value)}
            hint={
              userPreferences.pricing === 5
                ? 'Projects with high costs will be excluded.'
                : userPreferences.pricing === 4
                  ? 'Projects with very high costs will have less weight.'
                  : undefined
            }
          />
          <PreferenceQuestion
            question="How important is reputation in influencing your choices?"
            value={userPreferences.reputation}
            onChange={(value) => handlePreferenceChange('reputation', value)}
            hint={
              userPreferences.reputation === 5
                ? 'Projects with low reputation will be excluded.'
                : userPreferences.reputation === 4
                  ? 'Projects with very low reputation scores will have less weight.'
                  : undefined
            }
          />
          <PreferenceQuestion
            question="How do you prioritize removal vs. avoidance?"
            value={userPreferences.removal}
            onChange={(value) => handlePreferenceChange('removal', value)}
            hint={
              userPreferences.removal === 5
                ? 'Projects focused on removal will be prioritized.'
                : userPreferences.removal === 1
                  ? 'Projects focused on avoidance will be prioritized.'
                  : 'No specific preference for removal vs. avoidance.'
            }
          />

        </div>
      )}
    </>
  );
}
