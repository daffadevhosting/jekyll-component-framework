import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { initAccordion } from "../assets/js/components/accordion.js";
import { initTabs } from "../assets/js/components/tabs.js";

describe("JavaScript component interactions", () => {
  it("updates tab selection and panel visibility on keyboard navigation", () => {
    const dom = new JSDOM(`
      <div data-tabs>
        <div role="tablist">
          <button data-tabs-tab aria-selected="true" tabindex="0">One</button>
          <button data-tabs-tab aria-selected="false" tabindex="-1">Two</button>
        </div>
        <section data-tabs-panel>Panel one</section>
        <section data-tabs-panel hidden>Panel two</section>
      </div>
    `);
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    try {
      initTabs();
      const tablist = document.querySelector('[role="tablist"]');
      tablist.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true
      }));

      const tabs = [...document.querySelectorAll("[data-tabs-tab]")];
      const panels = [...document.querySelectorAll("[data-tabs-panel]")];
      assert.equal(tabs[1].getAttribute("aria-selected"), "true");
      assert.equal(tabs[1].getAttribute("tabindex"), "0");
      assert.equal(panels[0].hidden, true);
      assert.equal(panels[1].hidden, false);
    } finally {
      globalThis.document = previousDocument;
      dom.window.close();
    }
  });

  it("keeps a single-open accordion synchronized with panel visibility", () => {
    const dom = new JSDOM(`
      <div data-accordion>
        <button data-accordion-trigger aria-expanded="false" aria-controls="panel-a">A</button>
        <div id="panel-a" data-accordion-panel hidden>Panel A</div>
        <button data-accordion-trigger aria-expanded="true" aria-controls="panel-b">B</button>
        <div id="panel-b" data-accordion-panel>Panel B</div>
      </div>
    `);
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    try {
      initAccordion();
      document.querySelector('[aria-controls="panel-a"]').click();

      assert.equal(document.querySelector('[aria-controls="panel-a"]').getAttribute("aria-expanded"), "true");
      assert.equal(document.querySelector("#panel-a").hidden, false);
      assert.equal(document.querySelector('[aria-controls="panel-b"]').getAttribute("aria-expanded"), "false");
      assert.equal(document.querySelector("#panel-b").hidden, true);
    } finally {
      globalThis.document = previousDocument;
      dom.window.close();
    }
  });
});
