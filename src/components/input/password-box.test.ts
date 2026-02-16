import { assert } from "chai";
import "../input/password-box.ts";
import { MetroPasswordBox } from "../input/password-box.ts";

suite("metro-password-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPasswordBox(attrs: Record<string, string> = {}): Promise<MetroPasswordBox> {
    const el = document.createElement("metro-password-box") as MetroPasswordBox;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders a password input", async () => {
    const el = await createPasswordBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.type, "password");
  });

  test("masks input by default", async () => {
    const el = await createPasswordBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "secret123";
    assert.equal(input.type, "password");
  });

  test("has reveal button", async () => {
    const el = await createPasswordBox();
    const revealBtn = el.shadowRoot?.querySelector(".reveal-btn");
    assert.exists(revealBtn);
  });

  test("clicking reveal toggles input type", async () => {
    const el = await createPasswordBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    const revealBtn = el.shadowRoot?.querySelector(".reveal-btn") as HTMLButtonElement;
    
    assert.equal(input.type, "password");
    
    revealBtn.click();
    await el.updateComplete;
    assert.equal(input.type, "text");
    
    revealBtn.click();
    await el.updateComplete;
    assert.equal(input.type, "password");
  });

  test("updates value on input", async () => {
    const el = await createPasswordBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.value = "mypassword";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, "mypassword");
  });

  test("disabled prevents reveal button", async () => {
    const el = await createPasswordBox({ disabled: "" });
    const revealBtn = el.shadowRoot?.querySelector(".reveal-btn") as HTMLButtonElement;
    assert.isTrue(revealBtn.disabled);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-password-box") as MetroPasswordBox;
    el.setAttribute("name", "password");
    el.value = "secret";
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("password"), "secret");
    
    form.remove();
  });

  test("label is displayed when provided", async () => {
    const el = await createPasswordBox({ label: "Password" });
    const label = el.shadowRoot?.querySelector("label");
    assert.equal(label?.textContent, "Password");
  });
});
