// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 1200, height: 1000 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

function findCollectionByName(name: string) {
  return figma.variables
    .getLocalVariableCollections()
    .find((collection) => collection.name === name);
}

function findVariableByName(name: string, cachedVariables?: Variable[]) {
  return (cachedVariables || figma.variables.getLocalVariables()).find(
    (variable) => variable.name === name
  );
}

function findOrCreateCollection(name: string) {
  const collection = findCollectionByName(name);
  if (!collection) {
    return figma.variables.createVariableCollection(name);
  }
  return collection;
}

function findOrCreateVariable(
  name: string,
  collection: string,
  type: VariableResolvedDataType,
  cachedVariables?: Variable[]
) {
  const variable = findVariableByName(name, cachedVariables);
  if (!variable) {
    return figma.variables.createVariable(name, collection, type);
  }
  return variable;
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "loadProgram") {
    // Load the program into the variables
    const cachedVariables = figma.variables.getLocalVariables();
    const pgmemcollection = findCollectionByName("Program Memory");
    const dispatchcollection = findCollectionByName("Dispatch Memory");
    const datacollection = findCollectionByName("Data Memory");

    if (!pgmemcollection || !dispatchcollection || !datacollection) {
      console.log(
        "Could not find one of the collections - have they been created properly?"
      );

      return;
    }

    const pgmemMode = pgmemcollection.modes[0].modeId;
    const dataMode = datacollection.modes[0].modeId;
    const dispatchMode = dispatchcollection.modes[0].modeId;

    // Data mem
    for (let i = 0; i < msg.compiled.data.length; i++) {
      const dataMemVar = cachedVariables.find(
        (variable) => variable.name === `datamem_${i}`
      );
      if (!dataMemVar) {
        console.log(
          `Could not find variable datamem_${i} - is the program too large?`
        );
        break;
      }

      dataMemVar.setValueForMode(dataMode, msg.compiled.data[i]);
    }

    // Clear rest of data mem
    for (
      let i = msg.compiled.data.length;
      i < datacollection.variableIds.length;
      i++
    ) {
      const dataMemVar = cachedVariables.find(
        (variable) => variable.name === `datamem_${i}`
      );
      if (!dataMemVar) {
        break;
      }

      dataMemVar.setValueForMode(dataMode, 0);
    }

    // Dispatch mem
    for (let i = 0; i < msg.compiled.dispatch.length; i++) {
      const dispatchMemVar = cachedVariables.find(
        (variable) => variable.name === `dispatchmem_${i}`
      );
      if (!dispatchMemVar) {
        console.log(
          `Could not find variable dispatchmem_${i} - is the program too large?`
        );
        break;
      }

      dispatchMemVar.setValueForMode(dispatchMode, msg.compiled.dispatch[i]);
    }

    // clear rest of dispatch mem
    for (
      let i = msg.compiled.dispatch.length;
      i < dispatchcollection.variableIds.length;
      i++
    ) {
      const dispatchMemVar = cachedVariables.find(
        (variable) => variable.name === `dispatchmem_${i}`
      );
      if (!dispatchMemVar) {
        break;
      }

      dispatchMemVar.setValueForMode(dispatchMode, 0);
    }

    // Program mem
    for (let i = 0; i < msg.compiled.pgm.length; i++) {
      const programMemVarOp = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_op`
      );
      const programMemVarArg1 = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_arg1`
      );
      const programMemVarArg2 = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_arg2`
      );

      if (!programMemVarOp || !programMemVarArg1 || !programMemVarArg2) {
        console.log(
          `Could not find variable pgmem_${i}_xxx - is the program too large or variables set up correctly?`
        );
        break;
      }

      programMemVarOp.setValueForMode(pgmemMode, msg.compiled.pgm[i][0]);
      programMemVarArg1.setValueForMode(pgmemMode, msg.compiled.pgm[i][1]);
      programMemVarArg2.setValueForMode(pgmemMode, msg.compiled.pgm[i][2]);
    }

    // Clear rest of program mem
    for (
      let i = msg.compiled.pgm.length;
      i < pgmemcollection.variableIds.length / 3;
      i++
    ) {
      const programMemVarOp = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_op`
      );
      const programMemVarArg1 = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_arg1`
      );
      const programMemVarArg2 = cachedVariables.find(
        (variable) => variable.name === `pgmem_${i}_arg2`
      );

      if (!programMemVarOp || !programMemVarArg1 || !programMemVarArg2) {
        break;
      }

      programMemVarOp.setValueForMode(pgmemMode, 0);
      programMemVarArg1.setValueForMode(pgmemMode, 0);
      programMemVarArg2.setValueForMode(pgmemMode, 0);
    }
  }

  if (msg.type === "buildVarSets") {
    const cachedVariables = figma.variables.getLocalVariables();

    const pgmemcollection = findOrCreateCollection("Program Memory");

    for (let i = 0; i < msg.pgmemcount; i++) {
      console.log("Creating variable pgmem_" + i);
      findOrCreateVariable(
        `pgmem_${i}_op`,
        pgmemcollection.id,
        "FLOAT",
        cachedVariables
      );
      findOrCreateVariable(
        `pgmem_${i}_arg1`,
        pgmemcollection.id,
        "FLOAT",
        cachedVariables
      );
      findOrCreateVariable(
        `pgmem_${i}_arg2`,
        pgmemcollection.id,
        "FLOAT",
        cachedVariables
      );
    }

    const dispatchcollection = findOrCreateCollection("Dispatch Memory");
    for (let i = 0; i < msg.dispatchmemcount; i++) {
      console.log("Creating variable dispatchmem_" + i);
      findOrCreateVariable(
        `dispatchmem_${i}`,
        dispatchcollection.id,
        "FLOAT",
        cachedVariables
      );
    }

    const datacollection = findOrCreateCollection("Data Memory");
    for (let i = 0; i < msg.datamemcount; i++) {
      console.log("Creating variable datamem_" + i);
      findOrCreateVariable(
        `datamem_${i}`,
        datacollection.id,
        "FLOAT",
        cachedVariables
      );
    }
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
