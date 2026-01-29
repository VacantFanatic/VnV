import BoilerplateActorBase from "./base-actor.mjs";

export default class BoilerplateCharacter extends BoilerplateActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Character creation fields
    schema.kin = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.trait = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.trinket = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.background = new fields.StringField({ required: true, blank: true, initial: "" });

    // Attributes
    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 })
      }),
    });

    // Classes - characters can have multiple classes (level is independent)
    schema.classes = new fields.ArrayField(
      new fields.StringField({ required: true, blank: true, initial: "" }),
      { initial: [] }
    );

    // Iterate over ability names and create a new SchemaField for each.
    // Using VNV abilities: Smarts, Brawn, Guts, Charm
    const vnvAbilities = ['smarts', 'brawn', 'guts', 'charm'];
    schema.abilities = new fields.SchemaField(vnvAbilities.reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: -9, max: 9 }),
      });
      return obj;
    }, {}));

    // Kin Bonuses - array of bonuses that can apply to one or multiple abilities
    // Supports positive and negative values, and allows humans to select any attribute
    schema.kinBonuses = new fields.ArrayField(
      new fields.SchemaField({
        ability: new fields.StringField({ required: true, choices: vnvAbilities }),
        value: new fields.NumberField({ ...requiredInteger, initial: 0 })
      }),
      { initial: [] }
    );

    // Refractory Period - time before character can have Sex again (in minutes)
    schema.refractoryPeriod = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    // Currency/Money
    schema.currency = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    // Exertion Points - resource pool for special actions (regain on Long Rest)
    schema.exertion = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 })
    });

    // Status Effects - array of active conditions
    schema.statusEffects = new fields.ArrayField(
      new fields.StringField({ required: true, blank: true }),
      { initial: [] }
    );

    // Combat Actions - tracking actions per turn
    schema.actions = new fields.SchemaField({
      combatActions: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      tacticalActions: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 }),
      usedCombatActions: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      usedTacticalActions: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    // Rest/Sleep Tracking
    schema.rest = new fields.SchemaField({
      lastLongRest: new fields.StringField({ required: true, blank: true, initial: "" }),
      hoursSinceSleep: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
      exertionRegained: new fields.BooleanField({ initial: false })
    });

    return schema;
  }

  prepareDerivedData() {
    // Clamp level between 0 and 10
    const level = Math.max(0, Math.min(10, this.attributes.level.value || 0));
    this.attributes.level.value = level;

    // Check for Exhausted status based on sleep tracking
    const requiredSleepHours = CONFIG.VNV?.rules?.requiredSleepHours || 6;
    const sleepCheckInterval = CONFIG.VNV?.rules?.sleepCheckInterval || 24;
    const hoursSinceSleep = this.rest?.hoursSinceSleep || 0;
    
    // Apply Exhausted status if character hasn't slept 6 hours in the last 24 hours
    if (hoursSinceSleep >= sleepCheckInterval) {
      const statusEffects = this.statusEffects || [];
      if (!statusEffects.includes('Exhausted')) {
        statusEffects.push('Exhausted');
      }
    }

    // Initialize bonus totals for each ability
    const bonusTotals = {};
    for (const key in this.abilities) {
      bonusTotals[key] = 0;
    }

    // Sum up kin bonuses for each ability
    if (this.kinBonuses && Array.isArray(this.kinBonuses)) {
      for (const bonus of this.kinBonuses) {
        if (bonus.ability && bonusTotals.hasOwnProperty(bonus.ability)) {
          bonusTotals[bonus.ability] += (bonus.value || 0);
        }
      }
    }

    // Apply status effect penalties
    const statusEffects = this.statusEffects || [];
    if (statusEffects.includes('Exhausted')) {
      const exhaustedPenalty = CONFIG.VNV?.rules?.exhaustedPenalty || { smarts: -1, brawn: -1 };
      if (exhaustedPenalty.smarts && bonusTotals.hasOwnProperty('smarts')) {
        bonusTotals.smarts += exhaustedPenalty.smarts;
      }
      if (exhaustedPenalty.brawn && bonusTotals.hasOwnProperty('brawn')) {
        bonusTotals.brawn += exhaustedPenalty.brawn;
      }
    }

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate total value (base value + sum of kin bonuses + status effects)
      const totalValue = this.abilities[key].value + bonusTotals[key];
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((totalValue - 10) / 2);
      this.abilities[key].total = totalValue;
      this.abilities[key].bonus = bonusTotals[key]; // Store total bonus for reference
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.VNV?.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@smarts.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    // Add action tracking for macros if needed
    if (this.actions) {
      data.actions = {
        combat: this.actions.combatActions || 1,
        tactical: this.actions.tacticalActions || 2,
        usedCombat: this.actions.usedCombatActions || 0,
        usedTactical: this.actions.usedTacticalActions || 0
      };
    }

    return data
  }
}