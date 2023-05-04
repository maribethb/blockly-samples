/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {generator} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';
// import for side effect of registering
import './configDropdown';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(javascriptGenerator, generator);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  // const code = javascriptGenerator.workspaceToCode(ws);
  // codeDiv.innerText = code;

  // outputDiv.innerHTML = '';

  // eval(code);

  const xml = Blockly.Xml.workspaceToDom(ws);
  codeDiv.innerText = Blockly.Xml.domToPrettyText(xml);

  const json = Blockly.serialization.workspaces.save(ws);
  outputDiv.innerText = JSON.stringify(json);
};

// Load the initial state from storage and run the code.
//load(ws);

// Load blocks with unique config attribute
const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="special" id="2QTe.ZISGboPqh4i|;.B" x="231" y="50">
    <field name="LETTERS" config="c,d,e,f,q">d</field>
  </block>
</xml>`;
Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), ws);
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


