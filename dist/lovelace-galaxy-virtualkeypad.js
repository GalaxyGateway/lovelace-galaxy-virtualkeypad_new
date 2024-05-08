console.info("%c  lovelace-galaxy-virtualkeypad  \n%c Version 0.0.4 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

const LitElement = customElements.get("ha-panel-lovelace") ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace")) : Object.getPrototypeOf(customElements.get("hc-lovelace"));
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

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  return true;
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
    if (!config.title) {
      throw new Error("Please setup keypad params");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-card header="${this._config.title}">
        <div id="zoom" style="${this._config.scale}">
          <div class='flex-container' @click="${this.stopPropagation}">
            <div class='keypad'>
              ${this._config.display !== false ? this._renderDisplay() : ""}
              ${this._config.keypad !== false ? this._renderKeypad() : ""}
              ${this._config.audio !== false ? this._renderAudio() : ""}
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

    // let line1 = "sensor.galaxy_gateway_"+this._config.unique_id+"_keypad_"+this._config.unique_id+"_display_1";
    // let line2 = "sensor.galaxy_gateway_"+this._config.unique_id+"_keypad_"+this._config.unique_id+"_display_2";

    let line1 = "sensor.keypad_"+this._config.unique_id+"_display_1";
    let line2 = "sensor.keypad_"+this._config.unique_id+"_display_2";

    let kpdline1 = this._updateLine(this.hass.states[line1].state);
    let kpdline2 = this._updateLine(this.hass.states[line2].state);

    return html`
      <div class="keypad_display">
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
    // if (c.match('à') !== null ) return '<span class="blink">' + c + '</span>';
    // if (c.match('á') !== null ) return '<span class="under">' + c + '</span>';
    if (c.match('è') !== null ) return '░';
    if (c.match('é') !== null ) return '▓';

    return c;
  }

  _renderKeypad() {
    return html`
      <div class="pad">
        <div>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="1"
            @click="${this.setState}"
            title='Unset'>1
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="4"
            @click="${this.setState}"
            title='Unset'>4
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="7"
            @click="${this.setState}"
            title='Unset'>7
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="*"
            @click="${this.setState}"
            title='Unset'>*
          </button>
        </div>

        <div>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="2"
            @click="${this.setState}"
            title='Unset'>2
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="5"
            @click="${this.setState}"
            title='Unset'>5
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="8"
            @click="${this.setState}"
            title='Unset'>8
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="0"
            @click="${this.setState}"
            title='Unset'>0
          </button>
        </div>

        <div>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="3"
            @click="${this.setState}"
            title='Unset'>3
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="6"
            @click="${this.setState}"
            title='Unset'>6
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="9"
            @click="${this.setState}"
            title='Unset'>9
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="#"
            @click="${this.setState}"
            title='Unset'>#
          </button>
        </div>

        <div>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="A"
            @click="${this.setState}"
            title='Unset'>A &gt;
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="B"
            @click="${this.setState}"
            title='Unset'>B &lt;
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="C"
            @click="${this.setState}"
            title='Unset'>ENT
          </button>
          <button
            class='mdc-button mdc-button--raised mdc-ripple-upgraded'
            toggles state="D"
            @click="${this.setState}"
            title='Unset'>ESC
          </button>
        </div>
      </div>
    `;
  }

  setState(e) {
    const newState = e.currentTarget.getAttribute('state');
    
    this.hass.callService('mqtt', 'publish', {
        topic: "galaxy/" + this._config.unique_id + "/keypad/key",
        payload: newState
    });
  }

  _renderAudio() {
    return html`
      <audio id="exitsound1" loop>
        <source src="/local/community/lovelace-galaxy-virtualkeypad/beep.mp3" type="audio/mpeg">
      </audio>
      <audio id="exitsound2" loop>
        <source src="/local/community/lovelace-galaxy-virtualkeypad/beep_fast.mp3" type="audio/mpeg">
      </audio>
      <audio id="chime">
        <source src="/local/community/lovelace-galaxy-virtualkeypad/ding_dong.mp3" type="audio/mpeg">
      </audio>
    `;    
  }

  updated() {
    
    if (this._config.audio !== false) { 
      // let beep = "sensor.galaxy_gateway_"+this._config.unique_id+"_keypad_" +this._config.unique_id+"_beep";
      let beep = "sensor.keypad_" +this._config.unique_id+"_beep";
      const beeper = this.hass.states[beep].state;

      if (beeper == "0") {
        var promise = this.shadowRoot.getElementById("exitsound1").pause();
        this.shadowRoot.getElementById("exitsound2").pause();
      } else if (beeper == "1") {
        var promise = this.shadowRoot.getElementById("exitsound1").play();
      } else if (beeper == "2") {
        var promise = this.shadowRoot.getElementById("exitsound2").play();
      } else if (beeper == "3") {
        var promise = this.shadowRoot.getElementById("chime").play();
      }

      if (promise !== undefined) {
        promise.then(_ => {
          // Autoplay started!
        }).catch(error => {
          console.warn('Sound auto play not enabled, check browser settings');
        });
      }
    }
  }

  getCardSize() {
    let size = 2;
    if (this._config.keypad) size += 4;     // 550px - 190px / 50
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

      @keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}
      @keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}
      @keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-ripple-surface--test-edge-var-bug{--mdc-ripple-surface-test-edge-var: 1px solid #000;visibility:hidden}.mdc-ripple-surface--test-edge-var-bug::before{border:var(--mdc-ripple-surface-test-edge-var)}.mdc-button{font-family:Roboto,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:2.25rem;font-weight:500;letter-spacing:.0892857143em;text-decoration:none;text-transform:uppercase;--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;padding:0 8px 0 8px;display:inline-flex;position:relative;align-items:center;justify-content:center;box-sizing:border-box;min-width:64px;height:36px;border:none;outline:none;line-height:inherit;user-select:none;-webkit-appearance:none;overflow:hidden;vertical-align:middle;border-radius:4px}.mdc-button::before,.mdc-button::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-button::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}.mdc-button.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-button.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-button.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-button.mdc-ripple-upgraded--foreground-activation::after{animation:225ms mdc-ripple-fg-radius-in forwards,75ms mdc-ripple-fg-opacity-in forwards}.mdc-button.mdc-ripple-upgraded--foreground-deactivation::after{animation:150ms mdc-ripple-fg-opacity-out;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-button::before,.mdc-button::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-button.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-button::-moz-focus-inner{padding:0;border:0}.mdc-button:active{outline:none}.mdc-button:hover{cursor:pointer}.mdc-button:disabled{background-color:transparent;color:rgba(0,0,0,.37);cursor:default;pointer-events:none}.mdc-button.mdc-button--dense{border-radius:4px}.mdc-button:not(:disabled){background-color:transparent}.mdc-button:not(:disabled){color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-button::before,.mdc-button::after{background-color:#6200ee}@supports not (-ms-ime-align: auto){.mdc-button::before,.mdc-button::after{background-color:var(--mdc-theme-primary, #6200ee)}}.mdc-button:hover::before{opacity:.04}.mdc-button:not(.mdc-ripple-upgraded):focus::before,.mdc-button.mdc-ripple-upgraded--background-focused::before{transition-duration:75ms;opacity:.12}.mdc-button:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-button:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.16}.mdc-button.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.16}.mdc-button .mdc-button__icon{margin-left:0;margin-right:8px;display:inline-block;width:18px;height:18px;font-size:18px;vertical-align:top}[dir=rtl] .mdc-button .mdc-button__icon,.mdc-button .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:0}.mdc-button svg.mdc-button__icon{fill:currentColor}.mdc-button--raised .mdc-button__icon,.mdc-button--unelevated .mdc-button__icon,.mdc-button--outlined .mdc-button__icon{margin-left:-4px;margin-right:8px}[dir=rtl] .mdc-button--raised .mdc-button__icon,.mdc-button--raised .mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--unelevated .mdc-button__icon,.mdc-button--unelevated .mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--outlined .mdc-button__icon,.mdc-button--outlined .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:-4px}.mdc-button--raised,.mdc-button--unelevated{padding:0 16px 0 16px}.mdc-button--raised:disabled,.mdc-button--unelevated:disabled{background-color:rgba(0,0,0,.12);color:rgba(0,0,0,.37)}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){background-color:#6200ee}@supports not (-ms-ime-align: auto){.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){background-color:var(--mdc-theme-primary, #6200ee)}}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-button--raised::before,.mdc-button--raised::after,.mdc-button--unelevated::before,.mdc-button--unelevated::after{background-color:#fff}@supports not (-ms-ime-align: auto){.mdc-button--raised::before,.mdc-button--raised::after,.mdc-button--unelevated::before,.mdc-button--unelevated::after{background-color:var(--mdc-theme-on-primary, #fff)}}.mdc-button--raised:hover::before,.mdc-button--unelevated:hover::before{opacity:.08}.mdc-button--raised:not(.mdc-ripple-upgraded):focus::before,.mdc-button--raised.mdc-ripple-upgraded--background-focused::before,.mdc-button--unelevated:not(.mdc-ripple-upgraded):focus::before,.mdc-button--unelevated.mdc-ripple-upgraded--background-focused::before{transition-duration:75ms;opacity:.24}.mdc-button--raised:not(.mdc-ripple-upgraded)::after,.mdc-button--unelevated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-button--raised:not(.mdc-ripple-upgraded):active::after,.mdc-button--unelevated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.32}.mdc-button--raised.mdc-ripple-upgraded,.mdc-button--unelevated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.32}.mdc-button--raised{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12);transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-button--raised:hover,.mdc-button--raised:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12)}.mdc-button--raised:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12)}.mdc-button--raised:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2),0px 0px 0px 0px rgba(0, 0, 0, 0.14),0px 0px 0px 0px rgba(0,0,0,.12)}.mdc-button--outlined{border-style:solid;padding:0 14px 0 14px;border-width:2px}.mdc-button--outlined:disabled{border-color:rgba(0,0,0,.37)}.mdc-button--outlined:not(:disabled){border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-button--dense{height:32px;font-size:.8125rem}.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:"liga";-webkit-font-smoothing:antialiased}:host{display:inline-flex;outline:none}.mdc-button{flex:1}

      .keypad_display {
        background: #35758c;
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
        color: black;
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

      .mdc-button {
        margin-right: 7px;
        margin-bottom: 9px;
      }

      .under {
        text-decoration: underline;
      }

      /* text blinking */
      .blink{
        animation:blinkingText 1.2s infinite;
      }

      @keyframes blinkingText{
          0%  { color: #000;        }
          49% { color: #000;        }
          60% { color: transparent; }
          99% { color:transparent;  }
          100%{ color: #000;        }
      }

    
    `;
  }
}

customElements.define('lovelace-galaxy-virtualkeypad', AlarmKeypad);
   
