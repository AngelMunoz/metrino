import { assert } from "chai";
import "../input/rating.ts";
import { MetroRating } from "../input/rating.ts";

suite("metro-rating", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createRating(attrs: Record<string, string> = {}): Promise<MetroRating> {
    const el = document.createElement("metro-rating") as MetroRating;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders rating stars", async () => {
    const el = await createRating();
    const stars = el.shadowRoot?.querySelectorAll(".star");
    assert.equal(stars?.length, 5);
  });

  test("default max is 5", async () => {
    const el = await createRating();
    assert.equal(el.max, 5);
  });

  test("default value is 0", async () => {
    const el = await createRating();
    assert.equal(el.value, 0);
  });

  test("clicking star sets value", async () => {
    const el = await createRating();
    const stars = el.shadowRoot?.querySelectorAll(".star");
    
    stars?.[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, 3);
  });

  test("max attribute changes star count", async () => {
    const el = await createRating({ max: "10" });
    const stars = el.shadowRoot?.querySelectorAll(".star");
    assert.equal(stars?.length, 10);
  });

  test("value attribute sets initial rating", async () => {
    const el = await createRating({ value: "4" });
    assert.equal(el.value, 4);
  });

  test("dispatches change event", async () => {
    const el = await createRating();
    let eventDetail: { value: number } | null = null;
    
    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const stars = el.shadowRoot?.querySelectorAll(".star");
    stars?.[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { value: 4 });
  });

  test("readonly prevents changes", async () => {
    const el = await createRating({ readonly: "", value: "3" });
    
    const stars = el.shadowRoot?.querySelectorAll(".star");
    stars?.[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, 3);
  });

  test("disabled prevents changes", async () => {
    const el = await createRating({ disabled: "", value: "2" });
    
    const stars = el.shadowRoot?.querySelectorAll(".star");
    stars?.[4].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, 2);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-rating") as MetroRating;
    el.setAttribute("name", "score");
    el.value = 4;
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("score"), "4");
    
    form.remove();
  });
});
