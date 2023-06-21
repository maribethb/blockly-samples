/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {procedureBlocks} from './blocks/procedures';
import {generator} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import {modalProceduresToolboxCallback, editor} from './procedures';
import './index.css';
import {registerProcedureSerializer} from '@blockly/block-shareable-procedures';

// Side effect of loading the generator functions
import './generators/procedures';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Blockly.common.defineBlocks(procedureBlocks);
Object.assign(javascriptGenerator, generator);

// Use the new serializer plugin for procedures
registerProcedureSerializer();

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const jsonDiv = document.getElementById('json').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});
editor.setMainWorkspace(ws);

// Set up the toolbox category callback for procedures.
ws.registerToolboxCategoryCallback('MODAL_PROCEDURE', () => {
  return modalProceduresToolboxCallback(ws, true);
});

editor.editorWorkspace.registerToolboxCategoryCallback('MODAL_PROCEDURE', () => {
  // we have to pass the main ws so that the correct procedures are populated
  // false to not show the new function button inside the modal editor
  return modalProceduresToolboxCallback(ws, false);
});

// Set up the "new procedure" button in the toolbox
ws.registerButtonCallback('newProcedureCallback', () => {
  editor.newProcedureCallback(ws);
  // refresh the flyout after the new procedure is created
  ws.getToolbox().refreshSelection();
});

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const mainWsJson = Blockly.serialization.workspaces.save(ws);

  // We probably shouldn't create a new workspace every time the main workspace is changed
  const codeWs = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(mainWsJson, codeWs);
  // add the data about the saved procedures
  for (const fn of Object.values(editor.allFunctions)) {
    Blockly.serialization.blocks.append(fn, codeWs);
  }

  const code = javascriptGenerator.workspaceToCode(codeWs);
  codeDiv.innerText = code;

  jsonDiv.innerText = JSON.stringify(mainWsJson, null, 2);

  outputDiv.innerHTML = '';

  eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});


