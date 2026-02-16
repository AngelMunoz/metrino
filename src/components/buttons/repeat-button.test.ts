import { assert } from "chai";
import "./repeat-button.ts";
import { MetroRepeatButton } from "./repeat-button.ts";

suite("metro-repeat-button", () => {
  let button: MetroRepeatButton;

  setup(async () => {
    button = document.createElement("metro-repeat-button") as MetroRepeatButton;
    document.body.appendChild(button);
    await button.updateComplete;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroRepeatButton);
  });

  test("has default role of button", () => {
    assert.equal(button.getAttribute("role"), "button");
  });

  test("has default tabindex of 0", () => {
    assert.equal(button.getAttribute("tabindex"), "0");
  });

  test("has default delay of 500ms", () => {
    assert.equal(button.delay, 500);
  });

  test("has default interval of 100ms", () => {
    assert.equal(button.interval, 100);
  });

  test("disabled property sets attribute", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.isTrue(button.hasAttribute("disabled"));
    assert.equal(button.getAttribute("aria-disabled"), "true");
  });

  test("click is prevented when disabled", async () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    button.disabled = true;
    await button.updateComplete;
    button.click();
    assert.isFalse(clicked);
  });

  test("click fires once immediately on mousedown", (done) => {
    let clickCount = 0;
    button.addEventListener("click", () => { clickCount++; });
    
    const event = new MouseEvent("mousedown", { bubbles: true });
    button.dispatchEvent(event);
    
    setTimeout(() => {
      assert.equal(clickCount, 1);
      button.dispatchEvent(new MouseEvent("mouseup"));
      done();
    }, 50);
  });

  test("click repeats after delay", (done) => {
    let clickCount = 0;
    button.delay = 50;
    button.interval = 20;
    button.addEventListener("click", () => { clickCount++; });
    
    const event = new MouseEvent("mousedown", { bubbles: true });
    button.dispatchEvent(event);
    
    setTimeout(() => {
      assert.isAtLeast(clickCount, 3);
      button.dispatchEvent(new MouseEvent("mouseup"));
      done();
    }, 150);
  });

  test("repeat stops on mouseup", (done) => {
    let clickCount = 0;
    button.delay = 20;
    button.interval = 10;
    button.addEventListener("click", () => { clickCount++; });
    
    button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    
    setTimeout(() => {
      button.dispatchEvent(new MouseEvent("mouseup"));
      const countAfterUp = clickCount;
      
      setTimeout(() => {
        assert.equal(clickCount, countAfterUp);
        done();
      }, 100);
    }, 80);
  });
});
