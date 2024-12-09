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
import { getHint, HINTS } from '@/constants/hint';
import RemovalAvoidanceQuestion from './typologies/RemovalAvoidanceQuestion';

export default function ProjectTypology() {
  const [isTypologyFull, setIsTypologyFull] = useState(true);
  const [currentSum, setCurrentSum] = useState(100);
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

  // State for "I don't mind" checkboxes
  const [dontMindStates, setDontMindStates] = useState({
    biodiversity: false,
    durability: false,
    pricing: false,
    reputation: false,
    removal: false,
  });

  // State for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    biodiversity: 3,
    durability: 3,
    pricing: 3,
    reputation: 3,
    removal: 0,
  });
  // Todo after untick I don't mind hint doesn't reappear automatically

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    setUserPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleDontMindChange = (key: keyof UserPreferences, value: boolean) => {
    setDontMindStates((prev) => ({ ...prev, [key]: value }));
    if (value) {
      setUserPreferences((prev) => ({ ...prev, [key]: 0 }));
    }
  };

  const calculateTypologyFromPreferences = () => {
    const normalized: Typology = computeFinalDistribution(userPreferences);
    if (!normalized || Object.values(normalized).some((val) => isNaN(val))) {
      setErrorMessage('No suitable distribution or invalid values in calculation.');
      return;
    }
    setErrorMessage('');
    setTypology(normalized);
    setNbsRemoval(normalized.nbsRemoval * 100 || 0);
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
        nbsRemoval: (nbsRemoval as number) / 100,
        nbsAvoidance: (nbsAvoidance as number) / 100,
        dac: (dac as number) / 100,
        biochar: (biochar as number) / 100,
        renewableEnergy: (renewableEnergy as number) / 100,
      });
    }
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy]);

  // Ensure the sum of typology percentages is 100%
  useEffect(() => {
    if (!isDontKnowSelected) {
      const total =
        (nbsRemoval as number) +
        (nbsAvoidance as number) +
        (dac as number) +
        (biochar as number) +
        (renewableEnergy as number);
      setIsTypologyFull(Math.round(total) === 100);
      setCurrentSum(Math.round(total));
    }
  }, [nbsRemoval, nbsAvoidance, dac, biochar, renewableEnergy, isDontKnowSelected]);

  return (
    <>
      <Title
        title="3. Project Typologies Deep Dive"
        subtitle="Which project typology mix are you aiming for?"
      />
      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm">{errorMessage}</div>
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
      {!isTypologyFull && !isDontKnowSelected && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the typology values must be equal to 100%, not {currentSum}%
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
          <h3 className="mb-4 text-lg font-semibold">
            Please allocate exactly 12 points across these criteria:
          </h3>

          {Object.keys(userPreferences).map((key) =>
            key === 'removal' ? (
              <RemovalAvoidanceQuestion
                key={key}
                question="How do you prioritize removal vs. avoidance?"
                value={
                  dontMindStates.removal
                    ? 'dontMind'
                    : userPreferences.removal === 5
                      ? 'removal'
                      : userPreferences.removal === 1
                        ? 'avoidance'
                        : 'dontMind'
                }
                onChange={(value) => {
                  setDontMindStates((prev) => ({ ...prev, removal: value === 'dontMind' }));
                  setUserPreferences((prev) => ({
                    ...prev,
                    removal: value === 'removal' ? 5 : value === 'avoidance' ? 1 : 0,
                  }));
                }}
                hint={getHint('removal', userPreferences.removal, dontMindStates.removal)}
              />
            ) : (
              <PreferenceQuestion
                key={key}
                question={`How important is ${key} in shaping your portfolio?`}
                value={userPreferences[key as keyof UserPreferences]}
                onChange={(value) => handlePreferenceChange(key as keyof UserPreferences, value)}
                dontMind={dontMindStates[key as keyof UserPreferences]}
                onDontMindChange={(value) =>
                  handleDontMindChange(key as keyof UserPreferences, value)
                }
                hint={getHint(
                  key as keyof typeof HINTS,
                  userPreferences[key as keyof UserPreferences],
                  dontMindStates[key as keyof UserPreferences],
                )}
              />
            ),
          )}
        </div>
      )}
    </>
  );
}
