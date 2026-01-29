import VnVItemBase from "./base-item.mjs";

export default class VnVAbility extends VnVItemBase {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Store the parent class ID to link abilities to their class
    schema.parentClassId = new fields.StringField({ 
      required: false, 
      blank: true, 
      initial: "" 
    });

    return schema;
  }
}
