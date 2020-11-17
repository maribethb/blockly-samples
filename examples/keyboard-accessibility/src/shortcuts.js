/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 */
'use strict';

import {speaker} from './speaker';
import Blockly from 'blockly/core';
import MicroModal from 'micromodal';

/**
 * A class for a modal that welcomes the users and helps them get oriented.
 */
export class Shortcuts {
  /**
   * Constructor for the welcome modal.
   * @constructor
   */
  constructor() {
    this.modalId = 'shortcutModal';
    this.init();
  }

  /**
   * Initializes the welcome modal.
   */
  init() {
    this.createDom();
    MicroModal.show(this.modalId);

    this.registerDoneButton();
  }


  /**
   * Close the modal when done.
   */
  registerDoneButton() {
    document.getElementById('shortcutsDoneButton').addEventListener('click', () => {
      MicroModal.close(this.modalId);
    });
  }

  /**
   * Does stuff.
   */
  getModalContents() {
    const contents = Blockly.ShortcutRegistry.registry.getRegistry();
    let html = '<table>';
    Object.keys(contents).forEach((shortcut) => {
      html += `<tr><td>${contents[shortcut].name}</td><td>key</td></tr>`;
    });
    html += '</table>';
    console.log(contents);
    document.getElementById('shortcut-modal-content').innerHTML = html;
  }

  /**
   * Creates the dom for the modal.
   */
  createDom() {
    /* eslint-disable max-len */
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="shortcut-modal-title">
        <header class="modal__header">
          <h2 class="modal__title" id="shortcut-modal-title">
            Keyboard Shortcuts
          </h2>
          <button class="modal__close" aria-label="Close modal" id="shortcutCloseButton" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="shortcut-modal-content">
          <p>
            all your shortcuts are belong to here
          </p>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" id="shortcutsDoneButton">Done</button>
        </footer>
      </div>
    </div>`;
    /* eslint-enable max-len */
    this.getModalContents();
  }
}
