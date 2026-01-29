// Import document classes.
import { VnVActor } from './documents/actor.mjs';
import { VnVItem } from './documents/item.mjs';
// Import sheet classes.
import { VnVActorSheet } from './sheets/actor-sheet.mjs';
import { VnVItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { VNV } from './helpers/config.mjs';
// Import DataModel classes
import * as models from '../src/datamodels/module/data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Log immediately to verify the hook is running
  console.log('VnV System: Init hook running');
  console.log('VnV System: Models import check:', {
    modelsExists: !!models,
    modelKeys: models ? Object.keys(models) : 'models is null/undefined'
  });
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.vnv = {
    VnVActor,
    VnVItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.VNV = VNV;

  /**
   * Set an initiative formula for the system
   * Uses the initiativeDie from VNV.rules config (defaults to "d6")
   * @type {String}
   */
  const initiativeDie = CONFIG.VNV?.rules?.initiativeDie || "d6";
  CONFIG.Combat.initiative = {
    formula: `${initiativeDie} + @abilities.guts.mod`,
    decimals: 2,
  };

  // CRITICAL: Define valid actor types and their labels FIRST (before document class)
  // This ensures FoundryVTT knows what types are valid during validation
  // The typeLabels must be set before the documentClass for the dropdown to appear
  CONFIG.Actor.typeLabels = {
    character: 'TYPES.Actor.character',
    npc: 'TYPES.Actor.npc'
  };
  
  // Verify that models were imported correctly BEFORE setting document class
  if (!models) {
    console.error('VnV System: Models import failed completely. Check import path.');
    ui.notifications.error('VnV System: Failed to import data models. Check console.');
  } else {
    console.log('VnV System: Models imported:', Object.keys(models));
    
    if (!models.VnVCharacter || !models.VnVNPC) {
      console.error('VnV System: Missing data model classes. Available:', Object.keys(models));
      console.error('VnV System: Expected VnVCharacter and VnVNPC');
      ui.notifications.error('VnV System: Missing actor data models. Check console.');
    } else {
      // Note that you don't need to declare a DataModel
      // for the base actor/item classes - they are included
      // with the Character/NPC as part of super.defineSchema()
      CONFIG.Actor.dataModels = {
        character: models.VnVCharacter,
        npc: models.VnVNPC
      };
      console.log('VnV System: Actor data models registered successfully', {
        typeLabels: CONFIG.Actor.typeLabels,
        dataModels: Object.keys(CONFIG.Actor.dataModels),
        characterClass: models.VnVCharacter?.name,
        npcClass: models.VnVNPC?.name
      });
      
      // Verify the configuration is correct
      console.log('VnV System: Final CONFIG.Actor check:', {
        hasTypeLabels: !!CONFIG.Actor.typeLabels,
        typeLabelKeys: Object.keys(CONFIG.Actor.typeLabels || {}),
        hasDataModels: !!CONFIG.Actor.dataModels,
        dataModelKeys: Object.keys(CONFIG.Actor.dataModels || {})
      });
    }
  }
  
  // Define custom Document class AFTER typeLabels and dataModels are set
  CONFIG.Actor.documentClass = VnVActor;
  
  // Final verification that everything is set correctly
  console.log('VnV System: Actor configuration complete:', {
    documentClass: CONFIG.Actor.documentClass?.name,
    typeLabels: CONFIG.Actor.typeLabels,
    dataModels: CONFIG.Actor.dataModels ? Object.keys(CONFIG.Actor.dataModels) : 'NOT SET'
  });
  
  // Define valid item types and their labels FIRST (before document class)
  CONFIG.Item.typeLabels = {
    item: 'TYPES.Item.item',
    feature: 'TYPES.Item.feature',
    spell: 'TYPES.Item.spell',
    class: 'TYPES.Item.class',
    ability: 'TYPES.Item.ability',
    kin: 'TYPES.Item.kin'
  };
  
  // Verify that item models were imported correctly BEFORE setting document class
  if (models && models.VnVItem && models.VnVFeature && models.VnVSpell && models.VnVClass && models.VnVAbility && models.VnVKin) {
    CONFIG.Item.dataModels = {
      item: models.VnVItem,
      feature: models.VnVFeature,
      spell: models.VnVSpell,
      class: models.VnVClass,
      ability: models.VnVAbility,
      kin: models.VnVKin
    };
    console.log('VnV System: Item data models registered successfully', {
      typeLabels: CONFIG.Item.typeLabels,
      dataModels: Object.keys(CONFIG.Item.dataModels)
    });
  } else {
    console.error('VnV System: Failed to import item data models.', {
      models: models ? Object.keys(models) : 'null',
      hasVnVItem: models?.VnVItem,
      hasVnVFeature: models?.VnVFeature,
      hasVnVSpell: models?.VnVSpell,
      hasVnVClass: models?.VnVClass,
      hasVnVAbility: models?.VnVAbility,
      hasVnVKin: models?.VnVKin
    });
  }
  
  // Define custom Document class AFTER typeLabels and dataModels are set
  CONFIG.Item.documentClass = VnVItem;

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('VnV', VnVActorSheet, {
    makeDefault: true,
    label: 'VNV.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('VnV', VnVItemSheet, {
    makeDefault: true,
    label: 'VNV.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

// Greater than or equal helper for comparisons
Handlebars.registerHelper('gte', function (a, b) {
  return a >= b;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.vnv.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'vnv.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
