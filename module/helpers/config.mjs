export const VNV = {};

/**
 * The set of Ability Scores used within the Vice and Violence system.
 * @type {Object}
 */
VNV.abilities = {
  smarts: 'VNV.Ability.Smarts.long',
  brawn: 'VNV.Ability.Brawn.long',
  guts: 'VNV.Ability.Guts.long',
  charm: 'VNV.Ability.Charm.long',
};

VNV.abilityAbbreviations = {
  smarts: 'VNV.Ability.Smarts.abbr',
  brawn: 'VNV.Ability.Brawn.abbr',
  guts: 'VNV.Ability.Guts.abbr',
  charm: 'VNV.Ability.Charm.abbr',
};

/**
 * The list of Kin (races/species) available in the system.
 * @type {Object}
 */
VNV.kin = {
  humans: 'VNV.Kin.Humans',
  goblins: 'VNV.Kin.Goblins',
  elves: 'VNV.Kin.Elves',
  dwarfs: 'VNV.Kin.Dwarfs',
  orcs: 'VNV.Kin.Orcs',
  dragonkin: 'VNV.Kin.Dragonkin',
  centaurs: 'VNV.Kin.Centaurs',
  satyrs: 'VNV.Kin.Satyrs',
  relmers: 'VNV.Kin.Relmers',
  alloyans: 'VNV.Kin.Alloyans',
  dwellers: 'VNV.Kin.Dwellers',
  otherlings: 'VNV.Kin.Otherlings',
};

/**
 * Default ability bonuses for each Kin.
 * Humans have an empty array as they can select any attribute.
 * @type {Object}
 */
VNV.kinBonuses = {
  humans: [], // Humans can select any attribute
  goblins: [],
  elves: [],
  dwarfs: [],
  orcs: [],
  dragonkin: [],
  centaurs: [],
  satyrs: [],
  relmers: [],
  alloyans: [],
  dwellers: [],
  otherlings: [],
};

/**
 * Game rules configuration.
 * @type {Object}
 */
VNV.rules = {
  maxLevel: 10,
  exertionPointsPerLongRest: 3,
  exertionOveruseDamage: "2d6",
  requiredSleepHours: 6,
  sleepCheckInterval: 24, // hours
  exhaustedPenalty: { smarts: -1, brawn: -1 },
  shortRestDuration: 30, // minutes per die
  initiativeDie: "d6",
  actionsPerTurn: { combat: 1, tactical: 2 }
};

/**
 * Status effects configuration.
 * @type {Object}
 */
VNV.statusEffects = {
  exhausted: {
    label: 'VNV.Status.Exhausted',
    description: 'VNV.Status.Exhausted.Desc',
    penalties: { smarts: -1, brawn: -1 }
  },
  dehydrated: {
    label: 'VNV.Status.Dehydrated',
    description: 'VNV.Status.Dehydrated.Desc'
  },
  vice: {
    label: 'VNV.Status.Vice',
    description: 'VNV.Status.Vice.Desc'
  },
  downed: {
    label: 'VNV.Status.Downed',
    description: 'VNV.Status.Downed.Desc'
  },
  dead: {
    label: 'VNV.Status.Dead',
    description: 'VNV.Status.Dead.Desc'
  },
  ghost: {
    label: 'VNV.Status.Ghost',
    description: 'VNV.Status.Ghost.Desc'
  },
  zombie: {
    label: 'VNV.Status.Zombie',
    description: 'VNV.Status.Zombie.Desc'
  },
  prone: {
    label: 'VNV.Status.Prone',
    description: 'VNV.Status.Prone.Desc'
  },
  poisoned: {
    label: 'VNV.Status.Poisoned',
    description: 'VNV.Status.Poisoned.Desc'
  },
  drunk: {
    label: 'VNV.Status.Drunk',
    description: 'VNV.Status.Drunk.Desc'
  },
  filthy: {
    label: 'VNV.Status.Filthy',
    description: 'VNV.Status.Filthy.Desc'
  },
  burning: {
    label: 'VNV.Status.Burning',
    description: 'VNV.Status.Burning.Desc'
  },
  stunned: {
    label: 'VNV.Status.Stunned',
    description: 'VNV.Status.Stunned.Desc'
  },
  terrified: {
    label: 'VNV.Status.Terrified',
    description: 'VNV.Status.Terrified.Desc'
  },
  horny: {
    label: 'VNV.Status.Horny',
    description: 'VNV.Status.Horny.Desc'
  },
  blinded: {
    label: 'VNV.Status.Blinded',
    description: 'VNV.Status.Blinded.Desc'
  },
  charmed: {
    label: 'VNV.Status.Charmed',
    description: 'VNV.Status.Charmed.Desc'
  },
  restrained: {
    label: 'VNV.Status.Restrained',
    description: 'VNV.Status.Restrained.Desc'
  },
  berserk: {
    label: 'VNV.Status.Berserk',
    description: 'VNV.Status.Berserk.Desc'
  }
};

/**
 * Vices configuration - 20 vices from d20 table.
 * @type {Object}
 */
VNV.vices = {
  1: {
    name: 'Scaredy Cat',
    effect: '-2 Guts until I run away in the middle of combat.',
    label: 'VNV.Vice.ScaredyCat'
  },
  2: {
    name: 'Wuss',
    effect: '-2 Brawn until I drink a Health potion at full Health.',
    label: 'VNV.Vice.Wuss'
  },
  3: {
    name: 'Miserable Bastard',
    effect: '-5 Disposition until I see someone fall Prone.',
    label: 'VNV.Vice.MiserableBastard'
  },
  4: {
    name: 'Lazy',
    effect: '-3 Exertion until I take a Short Rest in a stupid place.',
    label: 'VNV.Vice.Lazy'
  },
  5: {
    name: 'Hothead',
    effect: 'Gain Berserk after a failed DC until I Down an enemy.',
    label: 'VNV.Vice.Hothead'
  },
  6: {
    name: 'Nervous',
    effect: '-2 Charm until I get Drunk.',
    label: 'VNV.Vice.Nervous'
  },
  7: {
    name: 'Giggly',
    effect: '-4 to Stealth Checks until I see someone Downed.',
    label: 'VNV.Vice.Giggly'
  },
  8: {
    name: 'Lustful',
    effect: 'Gain Horny after a failed DC until I have Sex.',
    label: 'VNV.Vice.Lustful'
  },
  9: {
    name: 'Daydreamer',
    effect: 'Start last in Combat Initiative until I succeed a Dice Challenge.',
    label: 'VNV.Vice.Daydreamer'
  },
  10: {
    name: 'Optimistic',
    effect: '-2 Smarts until I agree to a really dumb idea.',
    label: 'VNV.Vice.Optimistic'
  },
  11: {
    name: 'Pessimistic',
    effect: '-1 Smarts until someone disagrees with me.',
    label: 'VNV.Vice.Pessimistic'
  },
  12: {
    name: 'Overconfident',
    effect: '-1 Guts until I come up with a really dumb idea.',
    label: 'VNV.Vice.Overconfident'
  },
  13: {
    name: 'Exhibitionist',
    effect: '-1 Brawn until I wear Skimpy Armour for one hour.',
    label: 'VNV.Vice.Exhibitionist'
  },
  14: {
    name: 'Masochistic',
    effect: '-1 Charm until I\'m physically hurt by something.',
    label: 'VNV.Vice.Masochistic'
  },
  15: {
    name: 'Avaricious',
    effect: '-1 Guts until I earn money somehow.',
    label: 'VNV.Vice.Avaricious'
  },
  16: {
    name: 'Promiscuous',
    effect: '-1 Charm until I have Sex with someone.',
    label: 'VNV.Vice.Promiscuous'
  },
  17: {
    name: 'Greedy',
    effect: '-1 Guts until I eat three rations.',
    label: 'VNV.Vice.Greedy'
  },
  18: {
    name: 'Idiotic',
    effect: '-1 Smarts until I succeed a Dice Challenge.',
    label: 'VNV.Vice.Idiotic'
  },
  19: {
    name: 'Forgetful',
    effect: '-1 Brawn until I ask what we\'re supposed to be doing.',
    label: 'VNV.Vice.Forgetful'
  },
  20: {
    name: 'Contrarian',
    effect: '-1 Charm until I disagree with someone.',
    label: 'VNV.Vice.Contrarian'
  }
};
