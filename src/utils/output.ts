export const formatLargeNumber = (num: number | undefined): string => {
  if (!num) return '-';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
};
