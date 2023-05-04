import * as Blockly from 'blockly';

/**
 * Subclass of dropdown that can read config attributes.
 */
export class ConfigDropdown extends Blockly.FieldDropdown {
  /**
   * Converts xml element into dropdown field
   * @param element xml
   */
  fromXml(element) {
    // call super so value is set
    super.fromXml(element);
    // options must be an array of arrays
    // assume config = "a,b,c"
    // options should be [[aVal, a], [bVal, b], [cVal, c]]
    // where aVal is either the value from the original
    // options included in the block definition, or
    // just 'a' itself if it wasn't present
    // see also https://github.com/code-dot-org/blockly/blob/main/core/ui/fields/field_dropdown.js#L305
    const originalOptions = Array.isArray(this.menuGenerator_) ? this.menuGenerator_.reduce((prev, curr, i, arr) => {
      prev[curr[1]] = curr[0];
      return prev;
    }, {}) : {};
    const config = element.getAttribute('config');
    const options = config?.split(',').map((val) => {
      return [originalOptions[val] ?? val, val];
    });

    // If the config attribute is present in XML, set the options to that
    if (options) {
      this.menuGenerator_ = options;
    }
  }

  /**
   * Converts dropdown field into xml element
   * @param element xml
   * @return element
   */
  toXml(element) {
    super.toXml(element);
    if (Array.isArray(this.menuGenerator_)) {
      // convert array of options back into string config
      const config = this.menuGenerator_.map((val) => {
        return val[1];
      }).join();
      element.setAttribute('config', config);
    }
    return element;
  }
}

Blockly.fieldRegistry.register('config_dropdown', ConfigDropdown);
