import {
  nbsRemovalExPostLow,
  nbsRemovalExPostMedium,
  nbsRemovalExPostHigh,
  nbsAvoidanceExPostLow,
  nbsAvoidanceExPostMedium,
  nbsAvoidanceExPostHigh,
  biocharExPostLow,
  biocharExPostMedium,
  biocharExPostHigh,
  dacExPostLow,
  dacExPostMedium,
  dacExPostHigh,
  deltaExAnte,
} from '@/constants/forecasts';

const validateForecastObject = (forecastObject: Record<number, number>) => {
  expect(Object.keys(forecastObject)).toHaveLength(29);
  Object.entries(forecastObject).forEach(([year, value]) => {
    expect(Number(year)).toBeGreaterThanOrEqual(2022);
    expect(Number(year)).toBeLessThanOrEqual(2050);
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThan(0);
  });
};

test('Forecasts Ex Post', () => {
  // Validate NBS Removal forecasts
  validateForecastObject(nbsRemovalExPostLow);
  validateForecastObject(nbsRemovalExPostMedium);
  validateForecastObject(nbsRemovalExPostHigh);

  // Validate NBS Avoidance forecasts
  validateForecastObject(nbsAvoidanceExPostLow);
  validateForecastObject(nbsAvoidanceExPostMedium);
  validateForecastObject(nbsAvoidanceExPostHigh);

  // Validate Biochar forecasts
  validateForecastObject(biocharExPostLow);
  validateForecastObject(biocharExPostMedium);
  validateForecastObject(biocharExPostHigh);

  // Validate DAC forecasts
  validateForecastObject(dacExPostLow);
  validateForecastObject(dacExPostMedium);
  validateForecastObject(dacExPostHigh);
});

test('Forecasts Ex Ante', () => {
  expect(deltaExAnte).toBeGreaterThan(0);
  expect(deltaExAnte).toBeLessThan(1);
});
