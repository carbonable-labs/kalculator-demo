import { carbonBaseline, existingSupply, carbonToOffset } from '@/constants/user';

test('User Information constants', () => {
  expect(carbonBaseline).toBeGreaterThan(0);
  expect(existingSupply).toBeGreaterThanOrEqual(0);
  expect(existingSupply).toBeLessThan(carbonBaseline);
  expect(carbonToOffset).toBe(carbonBaseline - existingSupply);
});
