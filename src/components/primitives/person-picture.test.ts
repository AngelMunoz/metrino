import { assert } from "chai";
import "./person-picture.ts";
import { MetroPersonPicture } from "./person-picture.ts";

suite("metro-person-picture", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPerson(attrs: Record<string, string> = {}): Promise<MetroPersonPicture> {
    const el = document.createElement("metro-person-picture") as MetroPersonPicture;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders person picture container", async () => {
    const el = await createPerson();
    const avatar = el.shadowRoot?.querySelector(".person-picture");
    assert.exists(avatar);
  });

  test("displays initials from display-name", async () => {
    const el = await createPerson({ "display-name": "John Doe" });
    const initials = el.shadowRoot?.querySelector(".person-initials");
    assert.equal(initials?.textContent, "JD");
  });

  test("displays initials from initials attribute", async () => {
    const el = await createPerson({ initials: "AB" });
    const initials = el.shadowRoot?.querySelector(".person-initials");
    assert.equal(initials?.textContent, "AB");
  });

  test("displays image when src provided", async () => {
    const el = await createPerson({ src: "test.jpg" });
    const img = el.shadowRoot?.querySelector("img");
    assert.exists(img);
    assert.equal(img?.getAttribute("src"), "test.jpg");
  });

  test("default size is normal", async () => {
    const el = await createPerson();
    assert.equal(el.size, "normal");
  });

  test("size attribute works", async () => {
    const el = await createPerson({ size: "large" });
    assert.equal(el.size, "large");
  });

  test("default presence is offline", async () => {
    const el = await createPerson();
    assert.equal(el.presence, "offline");
  });

  test("presence indicator shows when not offline", async () => {
    const el = await createPerson({ presence: "available" });
    const indicator = el.shadowRoot?.querySelector(".presence-indicator");
    assert.exists(indicator);
    assert.isTrue(indicator?.classList.contains("available"));
  });

  test("presence indicator hidden when offline", async () => {
    const el = await createPerson({ presence: "offline" });
    const indicator = el.shadowRoot?.querySelector(".presence-indicator");
    assert.notExists(indicator);
  });

  test("all presence states work", async () => {
    const states = ["available", "away", "busy"];
    for (const state of states) {
      const el = await createPerson({ presence: state });
      assert.equal(el.presence, state);
      const indicator = el.shadowRoot?.querySelector(".presence-indicator");
      assert.isTrue(indicator?.classList.contains(state));
    }
  });
});
