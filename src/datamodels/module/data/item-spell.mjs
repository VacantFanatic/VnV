import VnVItemBase from "./base-item.mjs";

export default class VnVSpell extends VnVItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    const requiredInteger = { required: true, nullable: false, integer: true };

    // Spell type: basic or advanced
    schema.type = new fields.StringField({ 
      required: true, 
      choices: ['basic', 'advanced'], 
      initial: 'basic' 
    });

    // Motes cost to cast the spell
    schema.motesCost = new fields.NumberField({ 
      ...requiredInteger, 
      initial: 1, 
      min: 0 
    });

    // Spell effect description
    schema.effect = new fields.StringField({ 
      required: true, 
      blank: true, 
      initial: "" 
    });

    // Optional damage (only some spells have damage)
    schema.damage = new fields.StringField({ 
      required: false, 
      blank: true, 
      initial: "" 
    });

    // Number of targets (one or more)
    schema.targets = new fields.NumberField({ 
      ...requiredInteger, 
      initial: 1, 
      min: 1 
    });

    // Description is already in base-item via description field

    return schema;
  }
}