import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class VnVActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['vnv', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/VnV/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    // Use the actor's system data directly (which includes prepared derived data)
    context.system = this.actor.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.VNV, but create a copy to avoid mutating the original
    context.config = foundry.utils?.deepClone ? foundry.utils.deepClone(CONFIG.VNV) : JSON.parse(JSON.stringify(CONFIG.VNV));
    
    // Ensure game.i18n is available
    if (!game.i18n) {
      console.warn('VnV System: game.i18n not available during getData()');
      return context;
    }
    
    // Pre-localize ability labels for template use
    if (context.config && context.config.abilities) {
      const localizedAbilities = {};
      for (const [key, locKey] of Object.entries(context.config.abilities)) {
        // locKey is already a localization key string like 'VNV.Ability.Smarts.long'
        try {
          // Try direct translation first
          let localized = game.i18n.localize(locKey);
          
          // If localization returns the same key, manually traverse translations
          if (localized === locKey && game.i18n.translations) {
            const translations = game.i18n.translations;
            const keyParts = locKey.split('.');
            let value = translations;
            for (const part of keyParts) {
              if (value && typeof value === 'object' && part in value) {
                value = value[part];
              } else {
                value = null;
                break;
              }
            }
            localized = (typeof value === 'string') ? value : locKey;
          }
          
          localizedAbilities[key] = localized;
        } catch (e) {
          console.error(`VnV System: Failed to localize ${locKey}:`, e);
          localizedAbilities[key] = locKey;
        }
      }
      // Replace the abilities object with localized versions
      context.config.abilities = localizedAbilities;
    }
    
    // Pre-localize status effect labels
    if (context.config && context.config.statusEffects) {
      const localizedStatusEffects = {};
      for (const [key, status] of Object.entries(context.config.statusEffects)) {
        try {
          localizedStatusEffects[key] = {
            ...status,
            label: status.label ? game.i18n.localize(status.label) : status.label,
            description: status.description ? game.i18n.localize(status.description) : status.description
          };
        } catch (e) {
          console.warn(`VnV System: Failed to localize status ${key}:`, e);
          localizedStatusEffects[key] = status;
        }
      }
      context.config.statusEffects = localizedStatusEffects;
    }
    
    // Pre-localize vice names
    if (context.config && context.config.vices) {
      const localizedVices = {};
      for (const [key, vice] of Object.entries(context.config.vices)) {
        try {
          localizedVices[key] = {
            ...vice,
            name: vice.label ? game.i18n.localize(vice.label) : vice.name,
            label: vice.label ? game.i18n.localize(vice.label) : vice.label
          };
        } catch (e) {
          console.warn(`VnV System: Failed to localize vice ${key}:`, e);
          localizedVices[key] = vice;
        }
      }
      context.config.vices = localizedVices;
    }

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const classes = [];
    const spells = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to classes.
      else if (i.type === 'class') {
        classes.push(i);
      }
      // Append to spells (no longer organized by level).
      else if (i.type === 'spell') {
        // Add a display label for the spell type using localization
        const typeKey = i.system.type === 'basic' ? 'VNV.Item.Spell.TypeBasic' : 'VNV.Item.Spell.TypeAdvanced';
        i.typeLabel = game.i18n.localize(typeKey);
        spells.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.classes = classes;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Downed skull controls - clicking a skull sets rounds to that value
    html.on('click', '.downed-skull', async (ev) => {
      ev.preventDefault();
      const round = parseInt(ev.currentTarget.dataset.round);
      const currentRounds = this.actor.system.downed?.rounds || 0;
      // If clicking the same round, reset to 0; otherwise set to that round
      const newRounds = (currentRounds === round) ? 0 : round;
      await this.actor.update({ 'system.downed.rounds': newRounds });
      this.render(false);
    });

    // Chip delete buttons - remove kin or background
    html.on('click', '.chip-delete', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const field = ev.currentTarget.dataset.field;
      if (field === 'kin' || field === 'background') {
        await this.actor.update({ [`system.${field}`]: '' });
        this.render(false);
      }
    });

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // If creating an ability with a parent class, store the parent class ID
    if (type === 'ability' && header.dataset.parentId) {
      itemData.system.parentClassId = header.dataset.parentId;
    }

    // Finally, create the item! (Items are always owned by the actor)
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /**
   * Handle dropping an item on the actor sheet.
   * Special handling for kin items: update character's kin, apply bonuses, and generate trait.
   * @param {Event} event   The originating drop event
   * @param {Object} data   The dropped data
   * @private
   */
  async _onDropItemData(event, data) {
    // Only handle kin items for character actors
    if (this.actor.type !== 'character') {
      return super._onDropItemData(event, data);
    }

    // Get the item from the drop data
    const item = await Item.fromDropData(data);
    
    // Check if it's a kin item
    if (item && item.type === 'kin') {
      event.preventDefault();
      
      // Prepare update data
      const updateData = {};
      
      // Update the character's kin field
      updateData['system.kin'] = item.name;
      
      // Apply ability bonuses from the kin item
      if (item.system.abilityBonuses && item.system.abilityBonuses.length > 0) {
        updateData['system.kinBonuses'] = item.system.abilityBonuses.map(bonus => ({
          ability: bonus.ability,
          value: bonus.value
        }));
      }
      
      // Generate a random trait from the trait list
      if (item.system.traitList && item.system.traitList.length > 0) {
        const randomTrait = item.system.traitList[Math.floor(Math.random() * item.system.traitList.length)];
        updateData['system.trait'] = randomTrait;
      }
      
      // Update the actor
      await this.actor.update(updateData);
      
      // Show notification
      ui.notifications.info(`Applied ${item.name} kin: Updated abilities and generated trait.`);
      
      // Don't add the kin item to the actor's inventory (it's just a template)
      return false;
    }
    
    // Check if it's a background item (assuming there's a background item type)
    // For now, we'll check if the drop target is the background drop zone
    const dropTarget = event.target.closest('.drop-zone');
    if (dropTarget && dropTarget.dataset.dropType === 'background' && item) {
      event.preventDefault();
      await this.actor.update({ 'system.background': item.name });
      ui.notifications.info(`Set background to ${item.name}.`);
      return false;
    }
    
    // For all other items, use default behavior
    return super._onDropItemData(event, data);
  }
}
