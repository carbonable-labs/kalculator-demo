export const HINTS = {
  biodiversity: {
    dontMind: 'This criterion is ignored.',
    1: 'Biodiversity is not a priority in your portfolio.',
    2: 'You are slightly concerned about biodiversity in your projects.',
    3: 'Biodiversity is somewhat important, but not a key factor.',
    4: 'You value biodiversity and want to prioritize projects with a strong focus on it.',
    5: 'Biodiversity is critical; projects with low scores will be excluded.',
  },
  durability: {
    dontMind: 'This criterion is ignored.',
    1: 'Durability is not a priority for your project selection.',
    2: 'You prefer projects with some durability but are flexible.',
    3: 'Durability is moderately important for you.',
    4: 'You prefer durable projects that ensure long-term climate impact.',
    5: 'Durability is essential; projects with low durability scores will be excluded.',
  },
  pricing: {
    dontMind: 'This criterion is ignored.',
    1: 'Pricing is not a priority; you are willing to pay a premium.',
    2: 'You have some preference for cost-effective projects.',
    3: 'Pricing is moderately important; you balance cost with other factors.',
    4: 'You prioritize projects with competitive pricing.',
    5: 'Pricing is critical; expensive projects will be excluded.',
  },
  reputation: {
    dontMind: 'This criterion is ignored.',
    1: 'Reputation is not a priority in your project selection.',
    2: 'You consider reputation somewhat, but it&apos;s not a key factor.',
    3: 'Reputation is moderately important to your portfolio.',
    4: 'You prioritize reputable projects with solid track records.',
    5: 'Reputation is critical; projects with poor reputation will be excluded.',
  },
  removal: {
    dontMind: 'This criterion is ignored.',
    1: 'Avoidance is critical; projects focused on removal will be excluded.',
    2: 'You strongly favor avoidance, but might consider some removal projects.',
    3: 'You balance removal and avoidance in your portfolio.',
    4: 'You strongly favor removal, but might consider some avoidance projects.',
    5: 'Removal is critical; projects focused on avoidance will be excluded.',
  },
};

export const getHint = (key: keyof typeof HINTS, value: number, dontMind: boolean) => {
  if (dontMind) return HINTS[key].dontMind;
  return HINTS[key][value as 1 | 2 | 3 | 4 | 5];
};
