import { targetYear, currentYear, duration } from '@/app/constants/time';

test('Time constants', () => {
  expect(currentYear).toBe(new Date().getFullYear());
  expect(currentYear).toBeLessThanOrEqual(targetYear);
  expect(duration).toBe(targetYear - currentYear);
  expect(targetYear).toBeLessThanOrEqual(2050);
});