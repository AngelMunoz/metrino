import { assert } from "chai";
import "./progress-bar.ts";
import { MetroProgressBar } from "./progress-bar.ts";

suite("metro-progress-bar", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createProgress(attrs: Record<string, string> = {}): Promise<MetroProgressBar> {
    const el = document.createElement("metro-progress-bar") as MetroProgressBar;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders progress container", async () => {
    const el = await createProgress();
    const progressContainer = el.shadowRoot?.querySelector(".progress-container");
    assert.exists(progressContainer);
  });

  test("default value is 0", async () => {
    const el = await createProgress();
    assert.equal(el.value, 0);
  });

  test("default maximum is 100", async () => {
    const el = await createProgress();
    assert.equal(el.maximum, 100);
  });

  test("value attribute sets progress", async () => {
    const el = await createProgress({ value: "50" });
    assert.equal(el.value, 50);
  });

  test("fill width reflects value percentage", async () => {
    const el = await createProgress({ value: "75" });
    await el.updateComplete;
    
    const fill = el.shadowRoot?.querySelector(".progress-fill") as HTMLElement;
    assert.include(fill.style.width, "75");
  });

  test("indeterminate mode renders dots", async () => {
    const el = await createProgress({ indeterminate: "" });
    const container = el.shadowRoot?.querySelector(".progress-container.indeterminate");
    assert.exists(container);
    
    const dots = el.shadowRoot?.querySelectorAll(".indeterminate-dot");
    assert.equal(dots?.length, 5);
  });

  test("showLabel displays percentage", async () => {
    const el = await createProgress({ value: "50", showLabel: "" });
    const label = el.shadowRoot?.querySelector(".progress-label");
    assert.exists(label);
    assert.equal(label?.textContent, "50%");
  });

  test("respects maximum attribute", async () => {
    const el = await createProgress({ value: "5", maximum: "10" });
    await el.updateComplete;
    
    const fill = el.shadowRoot?.querySelector(".progress-fill") as HTMLElement;
    assert.include(fill.style.width, "50");
  });

  test("has progressbar role", async () => {
    const el = await createProgress();
    const progressContainer = el.shadowRoot?.querySelector('[role="progressbar"]');
    assert.exists(progressContainer);
  });

  test("has aria-valuenow attribute", async () => {
    const el = await createProgress({ value: "30" });
    const progressContainer = el.shadowRoot?.querySelector(".progress-container");
    assert.equal(progressContainer?.getAttribute("aria-valuenow"), "30");
  });
});
