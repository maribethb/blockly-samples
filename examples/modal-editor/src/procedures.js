import * as Blockly from 'blockly/core';
import {ModalEditor} from './modalEditor';

// Probably need to initialize this somewhere else
export const editor = new ModalEditor();

export const editButtonHandler = function() {
  editor.showForFunction(this.sourceBlock_.getProcedureModel());
};

const createCallBlock = function(procedure) {
  return {
    'kind': 'block',
    'type': procedure.getReturnTypes() ? 'modal_procedures_callreturn' : 'modal_procedures_callnoreturn',
    'extraState': {
      'name': procedure.getName(),
      'params': procedure.getParameters().map((param) => param.getName()),
    },
  };
};

export const modalProceduresToolboxCallback = function(workspace, includeNewButton) {
  const blockList = [];
  if (includeNewButton) {
    blockList.push({
      'kind': 'button',
      'text': 'New procedure',
      'callbackKey': 'newProcedureCallback',
    });
  }
  // Get all the procedures from the workspace and create call blocks for them
  workspace.getProcedureMap().getProcedures()
      .forEach((procedure) => blockList.push(createCallBlock(procedure)));
  return blockList;
};
