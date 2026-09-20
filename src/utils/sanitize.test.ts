import { assert } from "chai";
import { sanitizeHtmlFragment, isSafeUrl } from "./sanitize.ts";

suite("sanitize", () => {
  function sanitize(html: string): HTMLElement {
    const container = document.createElement("div");
    container.appendChild(sanitizeHtmlFragment(html));
    return container;
  }

  test("keeps allowlisted formatting elements", () => {
    const container = sanitize(
      "<strong>Bold</strong> <em>Italic</em> <u>Underline</u> <ul><li>Item</li></ul>",
    );

    assert.exists(container.querySelector("strong"));
    assert.exists(container.querySelector("em"));
    assert.exists(container.querySelector("u"));
    assert.exists(container.querySelector("li"));
  });

  test("drops script, style and executable containers", () => {
    const container = sanitize(
      "<script>window.__xss = true</script><style>*{}</style>" +
        "<iframe srcdoc='<script>1</script>'></iframe><svg><script>1</script></svg>",
    );

    assert.notExists(container.querySelector("script"));
    assert.notExists(container.querySelector("style"));
    assert.notExists(container.querySelector("iframe"));
    assert.notExists(container.querySelector("svg"));
    assert.equal(container.textContent, "");
  });

  test("removes event handler attributes", () => {
    const container = sanitize('<b onclick="window.__xss = true">Bold</b>');

    assert.notExists(container.querySelector("b")?.getAttribute("onclick"));
  });

  test("unwraps unknown elements but keeps their text", () => {
    const container = sanitize("<foo>hello <b>there</b></foo>");

    assert.equal(container.querySelector("foo"), null);
    assert.equal(container.textContent, "hello there");
    assert.exists(container.querySelector("b"));
  });

  test("keeps safe links and adds rel for _blank targets", () => {
    const container = sanitize(
      '<a href="https://example.com" target="_blank">safe</a>',
    );
    const link = container.querySelector("a");

    assert.equal(link?.getAttribute("href"), "https://example.com");
    assert.equal(link?.getAttribute("target"), "_blank");
    assert.equal(link?.getAttribute("rel"), "noopener noreferrer");
  });

  test("drops executable link schemes", () => {
    const container = sanitize(
      '<a href="javascript:alert(1)">a</a>' +
        '<a href=" JaVaScRiPt:alert(1)">b</a>' +
        '<a href="data:text/html,<script>1</script>">c</a>',
    );

    for (const link of Array.from(container.querySelectorAll("a"))) {
      assert.notExists(link.getAttribute("href"));
    }
  });

  test("keeps relative links", () => {
    const container = sanitize('<a href="#/route">route</a>');

    assert.equal(container.querySelector("a")?.getAttribute("href"), "#/route");
  });

  test("isSafeUrl accepts relative and safe schemes only", () => {
    assert.isTrue(isSafeUrl("https://example.com"));
    assert.isTrue(isSafeUrl("/relative"));
    assert.isTrue(isSafeUrl("mailto:a@b.c"));
    assert.isTrue(isSafeUrl("tel:+123"));
    assert.isFalse(isSafeUrl("javascript:alert(1)"));
    assert.isFalse(isSafeUrl("data:text/html,<script>1</script>"));
  });
});
