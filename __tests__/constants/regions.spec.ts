import { biocharRegion, nbsRemovalRegion, nbsAvoidanceRegion, dacRegion } from '@/constants/regions';

test('Continental Factor constants', () => {
  expect(Object.keys(biocharRegion)).toHaveLength(6);
  Object.values(biocharRegion).forEach(value => {
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThan(0);
  });

  expect(Object.keys(nbsRemovalRegion)).toHaveLength(6);
  Object.values(nbsRemovalRegion).forEach(value => {
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThan(0);
  });

  expect(Object.keys(nbsAvoidanceRegion)).toHaveLength(6);
  Object.values(nbsAvoidanceRegion).forEach(value => {
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThan(0);
  });

  expect(Object.keys(dacRegion)).toHaveLength(6);
  Object.values(dacRegion).forEach(value => {
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThan(0);
  });
});
