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
import { tooltip } from '@/components/common/tootips/TypologiesQuestionTooltip';

export default function ProjectTypology() {
  const [isTypologyFull, setIsTypologyFull] = useState(true);
  const [currentSum, setCurrentSum] = useState(100);
  const [isDontKnowSelected, setIsDontKnowSelected] = useState<boolean>(false);
  const { typology, setTypology, optimizeTypology, setOptimizeTypology } = useBudget();

  const [nbsRemoval, setNbsRemoval] = useState<number | number[]>(typology.nbsRemoval * 100);
  const [nbsAvoidance, setNbsAvoidance] = useState<number | number[]>(typology.nbsAvoidance * 100);
  const [dac, setDac] = useState<number | number[]>(typology.dac * 100);
  const [biochar, setBiochar] = useState<number | number[]>(typology.biochar * 100);
  const [renewableEnergy, setRenewableEnergy] = useState<number | number[]>(
    typology.renewableEnergy * 100,
  );

  const [dontMindStates, setDontMindStates] = useState({
    biodiversity: false,
    durability: false,
    pricing: false,
    reputation: false,
    removal: false,
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    biodiversity: 3,
    durability: 3,
    pricing: 3,
    reputation: 3,
    removal: 0,
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>(''); // Nouvel état pour le warning

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
    const normalized = computeFinalDistribution(userPreferences);
    if (!normalized) {
      setErrorMessage('It seems the constraints are too strong. Please revise your preferences.');
      setWarningMessage(''); // Effacer le message d'avertissement
      setTypology({
        biochar: 0,
        dac: 0,
        nbsAvoidance: 0,
        nbsRemoval: 0,
        renewableEnergy: 0,
      });
      setNbsRemoval(0);
      setNbsAvoidance(0);
      setDac(0);
      setBiochar(0);
      setRenewableEnergy(0);
      return;
    }

    const nonZeroCount = Object.values(normalized).filter((val) => val > 0).length;
    if (nonZeroCount === 1) {
      setWarningMessage(
        'It seems the constraints are too restrictive, resulting in only one typology being selected. Please revise your preferences.',
      );
      setErrorMessage(''); // Effacer le message d'erreur
    } else {
      setWarningMessage('');
      setErrorMessage('');
    }

    setTypology(normalized);
    setNbsRemoval(normalized.nbsRemoval * 100 || 0);
    setNbsAvoidance(normalized.nbsAvoidance * 100 || 0);
    setDac(normalized.dac * 100 || 0);
    setBiochar(normalized.biochar * 100 || 0);
    setRenewableEnergy(normalized.renewableEnergy * 100 || 0);
  };

  useEffect(() => {
    if (isDontKnowSelected) {
      calculateTypologyFromPreferences();
    }
  }, [isDontKnowSelected, userPreferences]);

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
        tooltip={tooltip}
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
      {!isTypologyFull && !isDontKnowSelected && (
        <div className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm">
          The sum of the typology values must be equal to 100%, not {currentSum}%
        </div>
      )}
      <div className="ml-2 mt-12 flex items-center">
        <DontKnowCheckbox
          isSelected={isDontKnowSelected}
          setIsSelected={(value) => {
            setIsDontKnowSelected(value);
            setOptimizeTypology(value);
          }}
        />
        {isDontKnowSelected && (
          <div className="ml-8 text-sm font-light italic">Let Carbonable guide you</div>
        )}
      </div>
      {isDontKnowSelected && (
        <>
          <div className="mt-8 rounded-lg border-2 border-opacityLight-10 px-8 py-6">
            {Object.keys(userPreferences).map((key) =>
              key === 'removal' ? (
                <RemovalAvoidanceQuestion
                  key={`removal-${key}`}
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
                  key={`preference-${key}`}
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
            {errorMessage && (
              <div className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm">{errorMessage}</div>
            )}
            {warningMessage && (
              <div className="mt-4 rounded-lg bg-yellow-700 px-4 py-2 text-sm">
                {warningMessage}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
