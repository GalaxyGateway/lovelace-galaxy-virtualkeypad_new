console.info(
  "%c  lovelace-galaxy-virtualkeypad  \n%c Version 0.0.5 ",
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);

const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lovelace-galaxy-virtualkeypad",
  name: "Galaxy Keypad",
  description: "A virtual keypad for Honeywell Galaxy.",
  preview: true,
  documentationURL: "https://github.com/GalaxyGateway/lovelace-galaxy-virtualkeypad",
});

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

// Only re-render when the relevant sensors actually change.
function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) return true;
  const hass = changedProps.get("hass");
  if (!hass) return false;
  const uid = element._config?.unique_id;
  if (!uid) return false;
  const prefix = "sensor.galaxy_gateway_" + uid + "_keypad_" + uid + "_";
  return (
    hass.states[prefix + "display_1"] !== element.hass.states[prefix + "display_1"] ||
    hass.states[prefix + "display_2"] !== element.hass.states[prefix + "display_2"] ||
    hass.states[prefix + "beep"]      !== element.hass.states[prefix + "beep"]
  );
}

class AlarmKeypad extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
    };
  }

  static async getConfigElement() {
    await import("./lovelace-galaxy-virtualkeypad-editor.js");
    return document.createElement("lovelace-galaxy-virtualkeypad-editor");
  }

  static getStubConfig(hass, unusedEntities, allEntities) {
    let entity = unusedEntities.find((eid) => eid.split(".")[0] === "AlarmKeypadCard");
    if (!entity) {
      entity = allEntities.find((eid) => eid.split(".")[0] === "AlarmKeypadCard");
    }
    return { entity };
  }

  setConfig(config) {
    if (!config.unique_id) {
      throw new Error("unique_id is required — please set it in the card editor.");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  // Insert audio elements once so they are never recreated during updates.
  firstUpdated() {
    if (this._config.audio !== false) {
      const base = "/local/community/lovelace-galaxy-virtualkeypad/";
      const audioContainer = document.createElement("div");
      audioContainer.innerHTML = `
        <audio id="exitsound1" loop><source src="${base}beep.mp3" type="audio/mpeg"></audio>
        <audio id="exitsound2" loop><source src="${base}beep_fast.mp3" type="audio/mpeg"></audio>
        <audio id="chime"><source src="${base}ding_dong.mp3" type="audio/mpeg"></audio>
      `;
      if (this.shadowRoot) this.shadowRoot.appendChild(audioContainer);
    }
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const scale = Math.min(Math.max(parseFloat(this._config.scale) || 1, 0.1), 2);

    return html`
      <ha-card header="${this._config.title}">
        <div id="zoom" style="transform: scale(${scale}); transform-origin: top center;">
          <div class="flex-container" @click="${this.stopPropagation}">
            <div class="keypad">
              ${this._config.display !== false ? this._renderDisplay() : ""}
              ${this._config.keypad !== false ? this._renderKeypad() : ""}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  _renderDisplay() {
    const uid = this._config.unique_id;
    const line1Key = "sensor.galaxy_gateway_" + uid + "_keypad_" + uid + "_display_1";
    const line2Key = "sensor.galaxy_gateway_" + uid + "_keypad_" + uid + "_display_2";

    const s1 = this.hass.states[line1Key];
    const s2 = this.hass.states[line2Key];
    if (!s1 || !s2) {
      return html`<div class="keypad_display" style="color:red;padding:8px;">Sensors not found for ID: ${uid}</div>`;
    }

    const kpdline1 = this._updateLine(s1.state);
    const kpdline2 = this._updateLine(s2.state);

    const bgColor   = this._config.display_bg_color   || "#35758c";
    const textColor = this._config.display_text_color || "#000000";

    return html`
      <div class="keypad_display" style="background:${bgColor}; color:${textColor}">
        <div class="keypad_state" id="keypad_state1">${kpdline1}</div>
        <div class="keypad_state" id="keypad_state2">${kpdline2}</div>
      </div>
    `;
  }

  _updateLine(l) {
    let r = "";
    for (let i = 0; i < l.length; i++) r += this._translateChar(l[i]);
    return r;
  }

  _translateChar(c) {
    if (c === "è") return "░";
    if (c === "é") return "▓";
    return c;
  }

  _renderKeypad() {
    const btn = (state, label) => html`
      <button
        class="kpd-btn"
        state="${state}"
        @click="${this.setState}"
        @touchstart="${this._btnPress}"
        @touchend="${this._btnRelease}"
        @touchcancel="${this._btnRelease}"
      >${label}</button>
    `;
    return html`
      <div class="pad">
        <div>${btn("1","1")}${btn("4","4")}${btn("7","7")}${btn("*","*")}</div>
        <div>${btn("2","2")}${btn("5","5")}${btn("8","8")}${btn("0","0")}</div>
        <div>${btn("3","3")}${btn("6","6")}${btn("9","9")}${btn("#","#")}</div>
        <div>${btn("A","A >")}${btn("B","B <")}${btn("C","ENT")}${btn("D","ESC")}</div>
      </div>
    `;
  }

  _btnPress(e) {
    e.currentTarget.classList.add("pressed");
    if (navigator.vibrate) navigator.vibrate(30);
  }

  _btnRelease(e) {
    e.currentTarget.classList.remove("pressed");
  }

  setState(e) {
    const newState = e.currentTarget.getAttribute("state");
    this.hass.callService("mqtt", "publish", {
      topic: "galaxy/" + this._config.unique_id + "/keypad/key",
      payload: newState,
    });
  }

  updated() {
    // Adjust card height to match scaled content, since transform: scale()
    // does not affect layout space. We temporarily remove the transform to
    // measure the true natural height, then restore it.
    const zoom = this.shadowRoot.getElementById("zoom");
    const card = this.shadowRoot.querySelector("ha-card");
    if (zoom && card) {

    }

    if (this._config.audio === false) return;

    const uid = this._config.unique_id;
    const beepKey = "sensor.galaxy_gateway_" + uid + "_keypad_" + uid + "_beep";
    const beepState = this.hass.states[beepKey];
    if (!beepState) return;

    const beeper = beepState.state;
    const sound1 = this.shadowRoot.getElementById("exitsound1");
    const sound2 = this.shadowRoot.getElementById("exitsound2");
    const chime  = this.shadowRoot.getElementById("chime");

    if (!sound1) return;

    let promise;
    if (beeper === "0") {
      sound1.pause();
      sound2.pause();
    } else if (beeper === "1") {
      promise = sound1.play();
    } else if (beeper === "2") {
      promise = sound2.play();
    } else if (beeper === "3") {
      promise = chime.play();
    }

    if (promise !== undefined) {
      promise.catch(() => {
        console.warn("Sound autoplay blocked — check browser settings.");
      });
    }
  }

  getCardSize() {
    let size = 2;
    if (this._config.keypad !== false) size += 4;
    return size;
  }

  static get styles() {
    return css`
      ha-card {
        padding-bottom: 16px;
        position: relative;
        font-size: calc(var(--base-unit));
      }

      .flex-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .keypad_display {
        border-radius: 10px;
        width: 200px;
        height: 50px;
        margin: auto;
        padding-top: 15px;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .keypad_state {
        padding-left: 30px;
        font-size: calc(var(--base-unit) * 1);
        line-height: 1.1;
        color: inherit;
        font-family: monospace;
      }

      #keypad_state1 {
        padding-bottom: 10px;
        white-space: pre-wrap;
      }

      #keypad_state2 {
        white-space: pre-wrap;
      }

      .pad {
        display: flex;
        justify-content: center;
      }

      .pad div {
        display: flex;
        flex-direction: column;
      }

      /* Clean keypad buttons with enlarge-on-press animation */
      .kpd-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 36px;
        margin: 4px;
        border: none;
        border-radius: 6px;
        background-color: var(--mdc-theme-primary, #6200ee);
        color: #fff;
        font-family: Roboto, sans-serif;
        font-size: 0.875rem;
        font-weight: 500;
        letter-spacing: 0.089em;
        text-transform: uppercase;
        cursor: pointer;
        user-select: none;
        outline: none;
        box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2),
                    0px 2px 2px 0px rgba(0,0,0,0.14),
                    0px 1px 5px 0px rgba(0,0,0,0.12);
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
                    background-color 150ms;
        -webkit-tap-highlight-color: transparent;
      }

      .kpd-btn:hover {
        background-color: var(--mdc-theme-primary, #7722ff);
        box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2),
                    0px 4px 5px 0px rgba(0,0,0,0.14),
                    0px 1px 10px 0px rgba(0,0,0,0.12);
      }

      /* Enlarge on press — both :active (mouse) and .pressed (touch) */
      .kpd-btn:active,
      .kpd-btn.pressed {
        transform: scale(1.25);
        background-color: var(--mdc-theme-primary, #5500cc);
        box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2),
                    0px 8px 10px 1px rgba(0,0,0,0.14),
                    0px 3px 14px 2px rgba(0,0,0,0.12);
        transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 80ms cubic-bezier(0.4, 0, 0.2, 1),
                    background-color 80ms;
      }

      .under {
        text-decoration: underline;
      }

      .blink {
        animation: blinkingText 1.2s infinite;
      }

      @keyframes blinkingText {
        0%   { color: #000;        }
        49%  { color: #000;        }
        60%  { color: transparent; }
        99%  { color: transparent; }
        100% { color: #000;        }
      }
    `;
  }
}

customElements.define("lovelace-galaxy-virtualkeypad", AlarmKeypad);
