import { assert } from "chai";
import {
  registerMetroHyperlinkButton,
  MetroHyperlinkButton,
  isSafeHyperlink,
} from "./hyperlink-button.ts";

suite("metro-hyperlink-button", () => {
  registerMetroHyperlinkButton();
  let button: MetroHyperlinkButton;
  let innerButton: HTMLElement | null;

  setup(async () => {
    button = document.createElement("metro-hyperlink-button") as MetroHyperlinkButton;
    document.body.appendChild(button);
    await button.updateComplete;
    innerButton = button.shadowRoot?.querySelector(".button") ?? null;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroHyperlinkButton);
  });

  test("inner element has role of button by default", () => {
    assert.equal(innerButton?.getAttribute("role"), "button");
  });

  test("inner element has tabindex 0 by default", () => {
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, 0);
  });

  test("inner element has tabindex -1 when disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, -1);
  });

  test("inner element has tabindex 0 when not disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    button.disabled = false;
    await button.updateComplete;
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, 0);
  });

  test("href property sets role to link", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("role"), "link");
  });

  test("has default tabindex of 0", () => {
    assert.equal(innerButton?.getAttribute("tabindex"), "0");
  });

  test("disabled property sets attribute", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.isTrue(button.hasAttribute("disabled"));
    assert.equal(button.getAttribute("aria-disabled"), "true");
    assert.equal(innerButton?.getAttribute("tabindex"), "-1");
  });

  test("href property sets role to link", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("role"), "link");
  });

  test("target property is stored", async () => {
    button.target = "_blank";
    await button.updateComplete;
    assert.equal(button.target, "_blank");
  });

  test("click is prevented when disabled", async () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    button.disabled = true;
    await button.updateComplete;
    innerButton?.click();
    assert.isFalse(clicked);
  });

  test("Space key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
    innerButton?.dispatchEvent(event);
    assert.isTrue(clicked);
  });

  test("Enter key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    innerButton?.dispatchEvent(event);
    assert.isTrue(clicked);
  });

  test("isSafeHyperlink allows relative, http, mailto and tel URLs", () => {
    assert.isTrue(isSafeHyperlink(""));
    assert.isTrue(isSafeHyperlink(undefined));
    assert.isTrue(isSafeHyperlink("https://example.com"));
    assert.isTrue(isSafeHyperlink("http://example.com"));
    assert.isTrue(isSafeHyperlink("#/route"));
    assert.isTrue(isSafeHyperlink("/relative/path"));
    assert.isTrue(isSafeHyperlink("mailto:user@example.com"));
    assert.isTrue(isSafeHyperlink("tel:+123456789"));
  });

  test("isSafeHyperlink rejects executable and data schemes", () => {
    assert.isFalse(isSafeHyperlink("javascript:alert(1)"));
    assert.isFalse(isSafeHyperlink("JaVaScRiPt:alert(1)"));
    assert.isFalse(isSafeHyperlink("java\nscript:alert(1)"));
    assert.isFalse(isSafeHyperlink("data:text/html,<script>alert(1)</script>"));
    assert.isFalse(isSafeHyperlink("vbscript:msgbox(1)"));
    assert.isFalse(isSafeHyperlink("blob:https://example.com/abc"));
  });

  test("unsafe href is not rendered on the anchor", async () => {
    button.href = "javascript:alert(1)";
    await button.updateComplete;
    assert.isFalse(innerButton?.hasAttribute("href") ?? false);
    assert.equal(innerButton?.getAttribute("role"), "button");
  });

  test("no href renders a placeholder anchor without href", async () => {
    assert.isFalse(innerButton?.hasAttribute("href") ?? false);
    assert.equal(innerButton?.getAttribute("role"), "button");

    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("href"), "https://example.com");
    assert.equal(innerButton?.getAttribute("role"), "link");

    button.href = undefined;
    await button.updateComplete;
    assert.isFalse(innerButton?.hasAttribute("href") ?? false);
    assert.equal(innerButton?.getAttribute("role"), "button");
  });

  test("clicking without href does not navigate", async () => {
    const before = window.location.href;
    innerButton?.click();
    await button.updateComplete;
    assert.equal(window.location.href, before);
  });

  test("target and rel are omitted without target", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.isFalse(innerButton?.hasAttribute("target") ?? false);
    assert.isFalse(innerButton?.hasAttribute("rel") ?? false);
  });

  test("target=_blank adds rel=noopener noreferrer", async () => {
    button.href = "https://example.com";
    button.target = "_blank";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("rel"), "noopener noreferrer");
  });

  test("javascript: href is not opened in a new tab", async () => {
    const originalOpen = window.open;
    let opened = false;
    window.open = () => {
      opened = true;
      return null;
    };
    try {
      button.href = "javascript:alert(1)";
      button.target = "_blank";
      await button.updateComplete;
      innerButton?.click();
      assert.isFalse(opened);
    } finally {
      window.open = originalOpen;
    }
  });
});
