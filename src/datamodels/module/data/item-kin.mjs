import VnVItemBase from "./base-item.mjs";

export default class VnVKin extends VnVItemBase {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Kin-specific fields
    // Ability bonuses - array of {ability, value} pairs
    schema.abilityBonuses = new fields.ArrayField(
      new fields.SchemaField({
        ability: new fields.StringField({ 
          required: true, 
          choices: ['smarts', 'brawn', 'guts', 'charm'],
          initial: 'smarts'
        }),
        value: new fields.NumberField({ 
          required: true, 
          nullable: false, 
          integer: true, 
          initial: 0 
        })
      }),
      { initial: [] }
    );

    // Trait generation - can be a list of traits or a description
    schema.traitList = new fields.ArrayField(
      new fields.StringField({ required: true, blank: true, initial: "" }),
      { required: false, initial: [] }
    );

    return schema;
  }
}
