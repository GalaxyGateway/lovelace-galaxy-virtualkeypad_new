const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

if (
  !customElements.get("ha-switch") &&
  customElements.get("paper-toggle-button")
) {
  customElements.define("ha-switch", customElements.get("paper-toggle-button"));
}

const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const HELPERS = window.loadCardHelpers();

export class AlarmKeypadEditor extends LitElement {
  setConfig(config) {
    this._config = { ...config };
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _title() {
    return this._config.title || "";
  }

  get _display() {
    return this._config.display !== false;
  }

  get _keypad() {
    return this._config.keypad !== false;
  }

  get _audio() {
    return this._config._audio !== false;
  }

  get _unique_id() {
    return this._config.unique_id || "";
  }

  get _scale() {
    return this._config.scale || "";
  }

  firstUpdated() {
    HELPERS.then(help => {
      if (help.importMoreInfoControl) {
        help.importMoreInfoControl("fan");
      }
    })
  }
  
  render() {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      (eid) => eid.substr(0, eid.indexOf(".")) === "AlarmKeypadCard"
    );

    return html`
      <div class="card-config">
        <div>
          <paper-input
            label="Name"
            .value="${this._title}"
            .configValue="${"title"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <div class="switches">
            <div class="switch">
              <ha-switch
                .checked=${this._display}
                .configValue="${"display"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show display</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._keypad}
                .configValue="${"keypad"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show keypad</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._audio}
                .configValue="${"audio"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Use audio feedback</span>
            </div>
          </div>
          <paper-input
            label="Unique module ID"
            type="text"
            value=${this._unique_id}
            .configValue="${"unique_id"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            label="Card scale"
            type="number"
            min="0.1"
            max="10"
            value=${this._scale}
            .configValue="${"scale"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles() {
    return css`
      .switches {
        margin: 8px 0;
        display: flex;
        justify-content: space-between;
      }
      .switch {
        display: flex;
        align-items: center;
        justify-items: center;
      }
      .switches span {
        padding: 0 16px;
      }
    `;
  }
}

customElements.define("lovelace-galaxy-virtualkeypad-editor", AlarmKeypadEditor);
