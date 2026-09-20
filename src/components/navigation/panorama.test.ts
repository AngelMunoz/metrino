import { assert } from "chai";
import { registerMetroPanorama, MetroPanorama } from "./panorama.ts";

suite("metro-panorama", () => {
  registerMetroPanorama();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPanorama(attrs: Record<string, string> = {}): Promise<MetroPanorama> {
    const el = document.createElement("metro-panorama") as MetroPanorama;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("applies a safe background image URL", async () => {
    const el = await createPanorama({
      "background-image": "https://example.com/bg.png",
    });
    const background = el.shadowRoot?.querySelector<HTMLElement>(".parallax-bg");

    assert.exists(background);
    assert.equal(background?.style.backgroundImage, 'url("https://example.com/bg.png")');
  });

  test("ignores unsafe background image schemes", async () => {
    const el = await createPanorama({ "background-image": "javascript:alert(1)" });

    assert.notExists(el.shadowRoot?.querySelector(".parallax-bg"));
  });

  test("keeps injected declarations inside a single url() value", async () => {
    const el = await createPanorama({
      "background-image":
        'https://example.com/bg.png"); background-image: url(https://evil.test/x)',
    });
    const background = el.shadowRoot?.querySelector<HTMLElement>(".parallax-bg");

    assert.exists(background);
    assert.equal(background?.style.length, 1);
  });
});
