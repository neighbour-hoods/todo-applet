import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { SensemakerStore } from "@neighbourhoods/nh-we-applet";
import { TodoApp, TodoStore } from "@neighbourhoods/todo-applet";
import appletConfig from './appletConfig';

export class TodoApplet extends ScopedElementsMixin(LitElement) {
  @property()
  todoStore!: TodoStore;

  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  loaded = false;

  async firstUpdated() {
    const maybeAppletConfig = await this.sensemakerStore.checkIfAppletConfigExists(appletConfig.name)
    if (!maybeAppletConfig) {
      await this.sensemakerStore.registerApplet(appletConfig)
    }
    this.loaded = true;
  }
  static styles = css`
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
  `;

  render() {
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    return html`
      <todo-app .sensemakerStore=${this.sensemakerStore} .todoStore=${this.todoStore}></todo-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "todo-app": TodoApp,
      // TODO: add any elements that you have in your applet
    };
  }
}