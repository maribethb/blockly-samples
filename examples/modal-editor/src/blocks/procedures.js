import * as Blockly from 'blockly';
// import for side effects of registering extensions
import '@blockly/block-shareable-procedures';
import {editButtonHandler} from '../procedures';

const editExtension = function() {
  const button = new Blockly.FieldImage(
      'https://www.gstatic.com/codesite/ph/images/star_on.gif',
      15,
      15,
      '' // Alt text is also used when block is collapsed
  );
  button.setOnClickHandler(editButtonHandler);
  this.inputList[0].insertFieldAt(0, button, 'EDIT');
};

Blockly.Extensions.register('procedures_edit_button', editExtension);


// The blocks below are copied from the block-shareable-procedures plugin.
// I only changed the names instead of the default block names, and
// added the extension above to add the edit button.
// These could be further customized by removing the mutator, etc.

export const procedureBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    'type': 'modal_procedures_defnoreturn',
    'message0': '%{BKY_PROCEDURES_DEFNORETURN_TITLE} %1 %2 %3',
    'message1': '%{BKY_PROCEDURES_DEFNORETURN_DO} %1',
    'args0': [
      {
        'type': 'field_input',
        'name': 'NAME',
        'text': '',
        'spellcheck': false,
        // todo: make this field not editable by creating a mixin that sets this field's EDITABLE property to false
      },
      {
        'type': 'field_label',
        'name': 'PARAMS',
        'text': '',
      },
      {
        'type': 'input_dummy',
        'name': 'TOP',
      },
    ],
    'args1': [
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
    'tooltip': '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
    'extensions': [
      'procedures_edit_button',
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_defnoreturn_set_comment_helper',
      'procedure_def_set_no_return_helper',
      'modal_procedures_no_destroy',
      'modal_procedures_name_not_editable',
    ],
    'mutator': 'procedure_def_mutator',
  },
  {
    'type': 'modal_procedures_callnoreturn',
    'message0': '%1 %2',
    'args0': [
      {'type': 'field_label', 'name': 'NAME', 'text': '%{BKY_UNNAMED_KEY}'},
      {
        'type': 'input_dummy',
        'name': 'TOPROW',
      },
    ],
    'nextStatement': null,
    'previousStatement': null,
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_CALLNORETURN_HELPURL}',
    'extensions': [
      'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'procedure_callernoreturn_get_def_block_mixin',
    ],
    'mutator': 'procedure_caller_mutator',
  },
  {
    'type': 'modal_procedures_defreturn',
    'message0': '%{BKY_PROCEDURES_DEFRETURN_TITLE} %1 %2 %3',
    'message1': '%{BKY_PROCEDURES_DEFRETURN_DO} %1',
    'message2': '%{BKY_PROCEDURES_DEFRETURN_RETURN} %1',
    'args0': [
      {
        'type': 'field_input',
        'name': 'NAME',
        'text': '',
        'spellcheck': false,
      },
      {
        'type': 'field_label',
        'name': 'PARAMS',
        'text': '',
      },
      {
        'type': 'input_dummy',
        'name': 'TOP',
      },
    ],
    'args1': [
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'args2': [
      {
        'type': 'input_value',
        'align': 'right',
        'name': 'RETURN',
      },
    ],
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_DEFRETURN_HELPURL}',
    'tooltip': '%{BKY_PROCEDURES_DEFRETURN_TOOLTIP}',
    'extensions': [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defreturn_get_caller_block_mixin',
      'procedure_defreturn_set_comment_helper',
      'procedure_def_set_return_helper',
      'modal_procedures_no_destroy',
      'modal_procedures_name_not_editable',
    ],
    'mutator': 'procedure_def_mutator',
  },
  {
    'type': 'modal_procedures_callreturn',
    'message0': '%1 %2',
    'args0': [
      {'type': 'field_label', 'name': 'NAME', 'text': '%{BKY_UNNAMED_KEY}'},
      {
        'type': 'input_dummy',
        'name': 'TOPROW',
      },
    ],
    'output': null,
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_CALLRETURN_HELPURL}',
    'extensions': [
      'procedure_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'procedure_callerreturn_get_def_block_mixin',
    ],
    'mutator': 'procedure_caller_mutator',
  },
]);

Blockly.Extensions.register('modal_procedures_no_destroy', function() {
  const mixin = {
    destroy: function() {
    // no-op
    // this overrides the destroy hook registered
    // in the procedure_def_get_def_mixin
    },
  };
  // We can't register this as a mixin since we're overwriting existing methods
  Object.assign(this, mixin);
});

Blockly.Extensions.register('modal_procedures_name_not_editable', function() {
  // do something here to make the field not editable
});
