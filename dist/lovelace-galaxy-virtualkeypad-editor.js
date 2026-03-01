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

const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
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
    return this._config.audio !== false;
  }

  get _unique_id() {
    return this._config.unique_id || "";
  }

  get _scale() {
    return this._config.scale || "";
  }

  get _display_bg_color() {
    return this._config.display_bg_color || "#35758c";
  }

  get _display_text_color() {
    return this._config.display_text_color || "#000000";
  }

  firstUpdated() {
    HELPERS.then((help) => {
      if (help.importMoreInfoControl) {
        help.importMoreInfoControl("fan");
      }
    });
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div>
          <ha-textfield
            label="Name"
            .value="${this._title}"
            .configValue="${"title"}"
            @change="${this._valueChanged}"
            style="width:100%"
          ></ha-textfield>
          <div class="switches">
            <div class="switch">
              <ha-switch
                .checked=${this._display}
                .configValue="${"display"}"
                @change="${this._valueChanged}"
              ></ha-switch>
              <span>Show display</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._keypad}
                .configValue="${"keypad"}"
                @change="${this._valueChanged}"
              ></ha-switch>
              <span>Show keypad</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._audio}
                .configValue="${"audio"}"
                @change="${this._valueChanged}"
              ></ha-switch>
              <span>Use audio feedback</span>
            </div>
          </div>
          <ha-textfield
            label="Unique module ID"
            .value="${this._unique_id}"
            .configValue="${"unique_id"}"
            @change="${this._valueChanged}"
            style="width:100%"
          ></ha-textfield>


          <div class="color-row">
            <div class="color-field">
              <label>Display background</label>
              <div class="color-preview-row">
                <input
                  type="color"
                  value="${this._display_bg_color}"
                  data-config-key="display_bg_color"
                  @input="${this._colorChanged}"
                  class="color-input"
                />
                <span class="color-value">${this._display_bg_color}</span>
              </div>
            </div>
            <div class="color-field">
              <label>Display text</label>
              <div class="color-preview-row">
                <input
                  type="color"
                  value="${this._display_text_color}"
                  data-config-key="display_text_color"
                  @input="${this._colorChanged}"
                  class="color-input"
                />
                <span class="color-value">${this._display_text_color}</span>
              </div>
            </div>
          </div>

          <div
            class="display-preview"
            style="background:${this._display_bg_color}; color:${this._display_text_color}"
          >
            <div class="preview-line">SYSTEM READY</div>
            <div class="preview-line">ZONE 1 OK   </div>
          </div>

        </div>
      </div>
    `;
  }

  // Separate handler for colour inputs — uses data-config-key attribute
  // and fires on every `input` event so the preview updates while dragging.
  _colorChanged(ev) {
    if (!this._config || !this.hass) return;
    const key = ev.target.dataset.configKey;
    const value = ev.target.value;
    if (!key || !value) return;
    this._config = { ...this._config, [key]: value };
    this.requestUpdate();
    fireEvent(this, "config-changed", { config: this._config });
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const value = target.checked !== undefined ? target.checked : target.value;
    if (!target.configValue || this[`_${target.configValue}`] === value) {
      return;
    }
    if (value === "" || value === undefined) {
      const config = { ...this._config };
      delete config[target.configValue];
      this._config = config;
    } else {
      this._config = { ...this._config, [target.configValue]: value };
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
      .color-row {
        display: flex;
        gap: 16px;
        margin-top: 16px;
      }
      .color-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }
      .color-field label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .color-preview-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input {
        width: 48px;
        height: 36px;
        border: none;
        border-radius: 6px;
        padding: 2px;
        cursor: pointer;
        background: none;
      }
      .color-value {
        font-size: 12px;
        font-family: monospace;
        color: var(--primary-text-color);
      }
      .display-preview {
        margin-top: 12px;
        border-radius: 8px;
        padding: 10px 16px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.6;
      }
      .preview-line {
        white-space: pre;
      }
    `;
  }
}

customElements.define("lovelace-galaxy-virtualkeypad-editor", AlarmKeypadEditor);
