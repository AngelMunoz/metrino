import { expect, test } from "@playwright/test";

type SanitizeModule = typeof import("../../src/utils/sanitize.ts");

test.describe("sanitize", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("keeps allowlisted formatting elements", async ({ page }) => {
    const present = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment(
          "<strong>Bold</strong> <em>Italic</em> <u>Underline</u> <ul><li>Item</li></ul>",
        ),
      );
      return {
        strong: container.querySelector("strong") !== null,
        em: container.querySelector("em") !== null,
        u: container.querySelector("u") !== null,
        li: container.querySelector("li") !== null,
      };
    });

    expect(present).toEqual({ strong: true, em: true, u: true, li: true });
  });

  test("drops script, style and executable containers", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment(
          "<script>window.__xss = true</script><style>*{}</style>" +
            "<iframe srcdoc='<script>1</script>'></iframe><svg><script>1</script></svg>",
        ),
      );
      return {
        script: container.querySelector("script") !== null,
        style: container.querySelector("style") !== null,
        iframe: container.querySelector("iframe") !== null,
        svg: container.querySelector("svg") !== null,
        text: container.textContent,
      };
    });

    expect(result.script).toBe(false);
    expect(result.style).toBe(false);
    expect(result.iframe).toBe(false);
    expect(result.svg).toBe(false);
    expect(result.text).toBe("");
  });

  test("removes event handler attributes", async ({ page }) => {
    const onclick = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment('<b onclick="window.__xss = true">Bold</b>'),
      );
      return container.querySelector("b")?.getAttribute("onclick") ?? null;
    });

    expect(onclick).toBeNull();
  });

  test("unwraps unknown elements but keeps their text", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment("<foo>hello <b>there</b></foo>"),
      );
      return {
        foo: container.querySelector("foo") !== null,
        text: container.textContent,
        b: container.querySelector("b") !== null,
      };
    });

    expect(result.foo).toBe(false);
    expect(result.text).toBe("hello there");
    expect(result.b).toBe(true);
  });

  test("keeps safe links and adds rel for _blank targets", async ({
    page,
  }) => {
    const link = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment(
          '<a href="https://example.com" target="_blank">safe</a>',
        ),
      );
      const anchor = container.querySelector("a");
      return {
        href: anchor?.getAttribute("href") ?? null,
        target: anchor?.getAttribute("target") ?? null,
        rel: anchor?.getAttribute("rel") ?? null,
      };
    });

    expect(link.href).toBe("https://example.com");
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
  });

  test("drops executable link schemes", async ({ page }) => {
    const hrefs = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment(
          '<a href="javascript:alert(1)">a</a>' +
            '<a href=" JaVaScRiPt:alert(1)">b</a>' +
            '<a href="data:text/html,<script>1</script>">c</a>',
        ),
      );
      return Array.from(container.querySelectorAll("a")).map((anchor) =>
        anchor.getAttribute("href"),
      );
    });

    expect(hrefs).toEqual([null, null, null]);
  });

  test("keeps relative links", async ({ page }) => {
    const href = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      const container = document.createElement("div");
      container.appendChild(
        mod.sanitizeHtmlFragment('<a href="#/route">route</a>'),
      );
      return container.querySelector("a")?.getAttribute("href") ?? null;
    });

    expect(href).toBe("#/route");
  });

  test("isSafeUrl accepts relative and safe schemes only", async ({
    page,
  }) => {
    const verdicts = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/sanitize.ts" as string
      )) as SanitizeModule;
      return {
        https: mod.isSafeUrl("https://example.com"),
        relative: mod.isSafeUrl("/relative"),
        mailto: mod.isSafeUrl("mailto:a@b.c"),
        tel: mod.isSafeUrl("tel:+123"),
        javascript: mod.isSafeUrl("javascript:alert(1)"),
        data: mod.isSafeUrl("data:text/html,<script>1</script>"),
      };
    });

    // document.baseURI in the page is the demo origin, so relative links
    // resolve exactly as they do for the shipped components.
    expect(verdicts).toEqual({
      https: true,
      relative: true,
      mailto: true,
      tel: true,
      javascript: false,
      data: false,
    });
  });
});
