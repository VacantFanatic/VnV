import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class VnVItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['vnv', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/VnV/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.VNV
    context.config = CONFIG.VNV;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    // Kin-specific handlers
    if (this.item.type === 'kin') {
      // Add ability bonus
      html.on('click', '.ability-bonus-add', this._onAddAbilityBonus.bind(this));
      // Remove ability bonus
      html.on('click', '.ability-bonus-delete', this._onRemoveAbilityBonus.bind(this));
      // Add trait
      html.on('click', '.trait-add', this._onAddTrait.bind(this));
      // Remove trait
      html.on('click', '.trait-delete', this._onRemoveTrait.bind(this));
    }
  }

  /**
   * Handle adding a new ability bonus to a kin item
   * @param {Event} event
   * @private
   */
  async _onAddAbilityBonus(event) {
    event.preventDefault();
    const bonuses = this.item.system.abilityBonuses || [];
    bonuses.push({ ability: 'smarts', value: 0 });
    await this.item.update({ 'system.abilityBonuses': bonuses });
  }

  /**
   * Handle removing an ability bonus from a kin item
   * @param {Event} event
   * @private
   */
  async _onRemoveAbilityBonus(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const bonuses = this.item.system.abilityBonuses || [];
    bonuses.splice(index, 1);
    await this.item.update({ 'system.abilityBonuses': bonuses });
  }

  /**
   * Handle adding a new trait to a kin item
   * @param {Event} event
   * @private
   */
  async _onAddTrait(event) {
    event.preventDefault();
    const traits = this.item.system.traitList || [];
    traits.push('');
    await this.item.update({ 'system.traitList': traits });
  }

  /**
   * Handle removing a trait from a kin item
   * @param {Event} event
   * @private
   */
  async _onRemoveTrait(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const traits = this.item.system.traitList || [];
    traits.splice(index, 1);
    await this.item.update({ 'system.traitList': traits });
  }
}
