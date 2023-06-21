/* eslint-disable max-len */
import * as Blockly from 'blockly/core';
import {toolbox} from './toolbox';
import {save, load} from './serialization';
import {ObservableProcedureModel, ProcedureBase} from '@blockly/block-shareable-procedures';

const storageKey = 'allFunctions';

/**
 * Modal function editor that opens when edit button on procedure block is clicked.
 */
export class ModalEditor {
  /**
   *
   */
  constructor() {
    this.dom = document.getElementById('modalEditor');
    document.getElementById('closeModalEditor')
        .addEventListener('click', () => this.hide());
    this.nameInput = document.getElementById('functionName');

    // Set up the name input box
    this.nameInput.addEventListener('input', (e) => {
      this.block.getProcedureModel().setName(e.target.value);
    });

    // Set up the delete function button
    document.getElementById('deleteFunction').addEventListener('click', (e) => {
      // delete all caller blocks from the main workspace
      Blockly.procedures.getCallers(this.block.getProcedureModel().getName(), this.mainWorkspace).forEach((block) => {
        block.dispose();
      });

      // todo: also need to delete all the callers from all of the saved procedures
      // which is not easy to do in the current form unfortunately.

      // delete the block from the editor workspace's procedure map
      // this will also cause it to be deleted from the main workspace's map
      this.editorWorkspace.getProcedureMap().delete(this.block.getProcedureModel().getId());

      // delete the block from the workspace and hide the modal
      this.block.dispose();
      this.hide();
    });

    // The workspace we'll show to users for editing
    this.editorWorkspace = Blockly.inject('modalEditor', {toolbox});

    // Serialized data from all procedures
    this.allFunctions = JSON.parse(window.localStorage?.getItem(storageKey)) ?? {};

    // Add an event listener that saves the data for the given procedure whenever the procedure is saved
    this.editorWorkspace.addChangeListener((e) => {
      if (e.isUiEvent) return;
      // save the procedure block only, ignore other blocks
      if (!this.block) return;
      this.allFunctions[this.block.getProcedureModel().getId()] = Blockly.serialization.blocks.save(this.block);

      // save the all functions data to local storage
      window.localStorage?.setItem(storageKey, JSON.stringify(this.allFunctions));
    });

    // Add an event listener that listens for procedure-related events in the editor workspace
    // and runs them in the main workspace
    // This is used to propagate changes related to procedure signatures
    this.editorWorkspace.addChangeListener((e) => {
      // If the main workspace hasn't been initialized yet we can't do anything
      if (!this.mainWorkspace) return;

      // Skip procedure create events because we already added that procedure to the main workspace
      if (e instanceof ProcedureBase && e.type !== 'procedure_create') {
        let event;
        try {
          event = Blockly.Events.fromJson(e.toJson(), this.mainWorkspace);
        } catch (err) {
          // Could not deserialize event. This is expected to happen. E.g.
          // when round-tripping parameter deletes, the delete in the
          // secondary workspace cannot be deserialized into the original
          // workspace.
          console.log(err);
          return;
        }
        event.run(true);

        // update the toolbox in case this change is happening while the flyout is open
        this.mainWorkspace.getToolbox().refreshSelection();
      }
    });
  }

  /**
   * Sets the main workspace of the app. This is required because the main
   * workspace may not have been initialized yet when this class is created,
   * but we need to know what it is. Should be called after main workspace
   * is injected.
   * @param {*} workspace
   */
  setMainWorkspace(workspace) {
    this.mainWorkspace = workspace;

    // add all of the procedures from the main workspace map into the editor workspace map
    // this is required so that you can call functions from inside function definitions
    const editorProcedures = this.editorWorkspace.getProcedureMap();
    this.mainWorkspace.getProcedureMap().forEach((procedure) => {
      // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird. models were not intended to be added to multiple
    // workspaces. so make a new one with the same data.
      const editorProcedureModel = new ObservableProcedureModel(this.editorWorkspace, procedure.getName(), procedure.getId());
      this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    });
  }

  /**
   * @param procedure
   */
  showForFunction(procedure) {
    this.editorWorkspace.clear();
    this.nameInput.value = procedure.getName();

    this.dom.style.visibility = 'visible';
    Blockly.common.svgResize(this.editorWorkspace);

    const data = this.allFunctions[procedure.getId()];
    if (data) {
      // If we already have stored data about the procedure, use that
      this.block = Blockly.serialization.blocks.append(data, this.editorWorkspace);
    } else {
      // Otherwise, we need to create a new block from scratch.
      const newBlockData = {
        'type': 'modal_procedures_defnoreturn',
        'x': 20,
        'y': 20,
        'extraState': {
          'procedureId': procedure.getId(),
        },
        'icons': {
          'comment': {
            'text': 'Describe this function...',
            'pinned': false,
            'height': 80,
            'width': 160,
          },
        },
        'fields': {
          'NAME': procedure.getName(),
        },
      };
      this.block = Blockly.serialization.blocks.append(newBlockData, this.editorWorkspace);
    }
  }

  /**
   *
   */
  hide() {
    this.dom.style.visibility = 'hidden';
  }

  /**
   */
  newProcedureCallback() {
    const name = this.getNameForNewFunction();
    const procedure = new ObservableProcedureModel(
        this.mainWorkspace,
        name
    );
    // add the model to the main workspace so we know all procedures available there
    this.mainWorkspace.getProcedureMap().add(procedure);

    // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird. models were not intended to be added to multiple
    // workspaces. so make a new one with the same data.
    const editorProcedureModel = new ObservableProcedureModel(this.editorWorkspace, procedure.getName(), procedure.getId());
    this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    this.showForFunction(procedure);
  }

  /**
   * Gets a legal name for a brand new function definition.
   * @param mainWorkspace main workspace, to check for name collisions
   * @returns a legal name for a new function definition.
   */
  getNameForNewFunction() {
    let name = 'do something';
    // stole this from blockly core because findLegalName requires us to
    // have a block first.
    while (Blockly.Procedures.isNameUsed(name, this.mainWorkspace)) {
      // Collision with another procedure.
      const r = name.match(/^(.*?)(\d+)$/);
      if (!r) {
        name += '2';
      } else {
        name = r[1] + (parseInt(r[2]) + 1);
      }
    }
    return name;
  }
}
