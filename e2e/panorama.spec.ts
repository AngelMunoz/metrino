import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** `scroll-snap-type` of the panorama container, sampled once per frame. */
    __panoramaSnap?: string[];
    /** `scrollLeft` of the panorama container, sampled once per frame. */
    __panoramaScroll?: number[];
    /** One cycle of the wrap seam, sampled once per frame. */
    __seam?: SeamSample[];
  }
}

/**
 * What one frame of the wrap looks like: where the container is and which
 * item's header is painted 200 px into the scrollport. The text is what the
 * reader sees, so it is what a seam may not change.
 */
interface SeamSample {
  scroll: number;
  leading: string;
}

/** The seam positions the component measures from its own copies. */
interface WrapGeometry {
  firstReal: number;
  lastReal: number;
  seam: number;
  period: number;
  step: number;
  maxScroll: number;
}

/**
 * What one frame of the wrap looks like: where the container is, who owns the
 * snap points, and which item's header is painted 200 px into the scrollport.
 * The text is what the reader sees, so it is what crossing the seam may not
 * change.
 */
interface SeamSample {
  scroll: number;
  snap: string;
  leading: string;
}

/** The seam positions the component normalizes the scroll position against. */
interface WrapGeometry {
  firstReal: number;
  lastReal: number;
  offsets: number[];
  seam: number;
  period: number;
  step: number;
  maxScroll: number;
}

/**
 * Samples the panorama scroll state every frame. Recording the whole glide
 * instead of reading it once keeps the test free of timing races: a snap
 * takeover that lasts a single frame is still observed.
 */
async function recordGlide(container: Locator): Promise<void> {
  await container.evaluate((el) => {
    window.__panoramaSnap = [];
    window.__panoramaScroll = [];
    const sample = () => {
      window.__panoramaSnap?.push(getComputedStyle(el).scrollSnapType);
      window.__panoramaScroll?.push(el.scrollLeft);
      requestAnimationFrame(sample);
    };
    sample();
  });
}

/** Drags the panorama to the left and releases it with momentum. */
async function flingLeft(page: Page, container: Locator): Promise<void> {
  const box = await container.boundingBox();
  if (!box) throw new Error("panorama container has no bounding box");

  // The demo clips the host to 300px while the items keep their 400px
  // min-height, so the container's layout box reaches below the visible area.
  // Start the drag near its top edge, where hit-testing still resolves here.
  const y = box.y + 40;
  let x = box.x + box.width * 0.9;

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 0; step < 12; step++) {
    x -= 30;
    await page.mouse.move(x, y);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
}

/**
 * The seam the wrap normalizes against: the real items' offsets, the offset of
 * the first copy of the first item, and one cycle of the cycle.
 */
async function wrapGeometry(container: Locator): Promise<WrapGeometry> {
  const measured = await container.evaluate((el) => {
    const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
    const real = Array.from(
      host.querySelectorAll<HTMLElement>(
        "metro-panorama-item:not([data-panorama-clone])"
      )
    );
    const copy = host.querySelector<HTMLElement>(
      'metro-panorama-item[data-panorama-clone="end"]'
    );
    const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    return {
      offsets: real.map((item) => item.offsetLeft - padding),
      seam: copy ? copy.offsetLeft - padding : null,
      maxScroll: el.scrollWidth - el.clientWidth,
    };
  });

  const firstReal = measured.offsets[0];
  const lastReal = measured.offsets[measured.offsets.length - 1];
  if (firstReal === undefined || lastReal === undefined) {
    throw new Error("the panorama holds no items to wrap");
  }
  if (measured.seam === null) {
    throw new Error("the panorama has no seam copy of its first item");
  }

  return {
    firstReal,
    lastReal,
    offsets: measured.offsets,
    seam: measured.seam,
    period: measured.seam - firstReal,
    step:
      measured.offsets.length > 1
        ? measured.offsets[1] - firstReal
        : measured.seam - firstReal,
    maxScroll: measured.maxScroll,
  };
}

/**
 * The ends of a panorama with the wrap off: without copies the list simply
 * stops, and the last item can only be pulled to the end of the scroll range.
 */
async function wrapEnds(
  container: Locator
): Promise<{ firstReal: number; end: number }> {
  const measured = await container.evaluate((el) => {
    const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
    const real = Array.from(
      host.querySelectorAll<HTMLElement>(
        "metro-panorama-item:not([data-panorama-clone])"
      )
    );
    const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const offsets = real.map((item) => item.offsetLeft - padding);
    return {
      first: offsets[0],
      last: offsets[offsets.length - 1],
      maxScroll: el.scrollWidth - el.clientWidth,
    };
  });

  if (measured.first === undefined || measured.last === undefined) {
    throw new Error("the panorama holds no items");
  }
  return {
    firstReal: measured.first,
    end: Math.min(measured.last, measured.maxScroll),
  };
}

/** Records one position, its snap owner and its painted header every frame. */
async function recordSeam(container: Locator): Promise<void> {
  await container.evaluate((el) => {
    window.__seam = [];
    const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
    const items = Array.from(
      host.querySelectorAll<HTMLElement>("metro-panorama-item")
    );
    const sample = () => {
      const line = el.getBoundingClientRect().left + 200;
      const painted = items.find((item) => {
        const rect = item.getBoundingClientRect();
        return rect.left <= line && rect.right > line;
      });
      window.__seam?.push({
        scroll: el.scrollLeft,
        snap: getComputedStyle(el).scrollSnapType,
        leading: painted?.getAttribute("header") ?? "",
      });
      requestAnimationFrame(sample);
    };
    sample();
  });
}

/**
 * Drags the container sideways by `distance` pixels and lets go. The steps are
 * small so one frame of direct manipulation stays well under a cycle, and the
 * gesture decelerates at the end so the release settles where the finger left
 * the content instead of gliding on past it.
 */
async function dragBy(
  page: Page,
  container: Locator,
  distance: number
): Promise<void> {
  const box = await container.boundingBox();
  if (!box) throw new Error("panorama container has no bounding box");

  const direction = Math.sign(distance);
  const y = Math.round(box.y + 40);
  let x = Math.round(
    box.x + (direction < 0 ? box.width - 15 : 15)
  );
  const travel = Math.abs(distance);
  const stride = 20;
  const strides = Math.floor(travel / stride);

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 0; step < strides; step++) {
    x += direction * stride;
    await page.mouse.move(x, y);
    await page.waitForTimeout(20);
  }
  for (let left = travel - strides * stride; left > 0; left -= 4) {
    const move = Math.min(4, left);
    x += direction * move;
    await page.mouse.move(x, y);
    await page.waitForTimeout(20);
  }
  for (let step = 0; step < 6; step++) {
    x += direction * 2;
    await page.mouse.move(x, y);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
}

/** Waits until the panorama hands the snap points back to the browser. */
async function waitForSettle(container: Locator): Promise<void> {
  await expect
    .poll(
      () => container.evaluate((el) => getComputedStyle(el).scrollSnapType),
      { message: "the release never handed the snap points back", timeout: 15_000 }
    )
    .toContain("mandatory");
}

test.describe("panorama use cases", () => {
  test("user flings the panorama and it settles on an item boundary", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");
    await recordGlide(container);

    await flingLeft(page, container);

    // The scripted glide owns the scroll position, so it holds the snap points
    // off for its duration. Mandatory snap would re-snap every frame it writes.
    await expect
      .poll(
        () => container.evaluate((el) => getComputedStyle(el).scrollSnapType),
        { message: "the glide never finished", timeout: 15_000 }
      )
      .toContain("mandatory");

    const samples = await page.evaluate(() => ({
      snap: window.__panoramaSnap ?? [],
      scroll: window.__panoramaScroll ?? [],
    }));
    expect(
      samples.snap,
      "the glide must suppress the snap points while it runs"
    ).toContain("none");
    expect(
      Math.max(...samples.scroll),
      "the fling must actually scroll the panorama"
    ).toBeGreaterThan(100);

    const rest = await container.evaluate((el) => {
      const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const offsets = items.map((item) =>
        Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
      );
      const scrollLeft = el.scrollLeft;
      const nearest = offsets.reduce(
        (best, offset) =>
          Math.abs(offset - scrollLeft) < Math.abs(best - scrollLeft)
            ? offset
            : best,
        offsets[0] ?? 0
      );
      return {
        scrollLeft,
        nearest,
        snapType: getComputedStyle(el).scrollSnapType,
      };
    });

    expect(rest.snapType, "snap must be handed back to the browser").toContain(
      "x mandatory"
    );
    expect(
      Math.abs(rest.scrollLeft - rest.nearest),
      `settled at ${rest.scrollLeft}, nearest item boundary is ${rest.nearest}`
    ).toBeLessThanOrEqual(2);
  });

  test("user drags the panorama and the content follows", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    // 10 steps of 15px, then the pointer holds: the read below happens while
    // the gesture is still down, so only direct manipulation can pass it.
    const box = await container.boundingBox();
    if (!box) throw new Error("panorama container has no bounding box");
    const y = box.y + 40;
    let x = box.x + box.width * 0.9;

    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 0; step < 10; step++) {
      x -= 15;
      await page.mouse.move(x, y);
      await page.waitForTimeout(16);
    }

    const held = await container.evaluate((el) => ({
      scrollLeft: el.scrollLeft,
      snapType: getComputedStyle(el).scrollSnapType,
    }));
    expect(
      held.scrollLeft,
      `the drag stayed pinned at ${held.scrollLeft}`
    ).toBeGreaterThan(100);
    expect(
      held.snapType,
      "the drag must own the scroll position"
    ).toBe("none");

    await page.mouse.up();

    // The release runs inertia and hands the snap points back when it settles.
    await expect
      .poll(
        () => container.evaluate((el) => getComputedStyle(el).scrollSnapType),
        { message: "the release never handed the snap points back", timeout: 15_000 }
      )
      .toContain("mandatory");

    const rest = await container.evaluate((el) => {
      const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const offsets = items.map((item) =>
        Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
      );
      const scrollLeft = el.scrollLeft;
      const nearest = offsets.reduce(
        (best, offset) =>
          Math.abs(offset - scrollLeft) < Math.abs(best - scrollLeft)
            ? offset
            : best,
        offsets[0] ?? 0
      );
      return {
        scrollLeft,
        nearest,
        snapType: getComputedStyle(el).scrollSnapType,
      };
    });
    expect(
      Math.abs(rest.scrollLeft - rest.nearest),
      `settled at ${rest.scrollLeft}, nearest item boundary is ${rest.nearest}`
    ).toBeLessThanOrEqual(2);
    expect(
      rest.snapType,
      "snap must be handed back to the browser"
    ).toContain("x mandatory");
  });

  test("parallax background follows the scroll without transition lag", async ({
    page,
  }) => {
    await page.goto("/#/navigation");
    const panorama = page.locator("#metro-panorama metro-panorama");
    const parallax = panorama.locator(".parallax-bg");

    await expect(parallax).toHaveCount(1);
    await expect(parallax).toHaveCSS("transition-duration", "0s");
  });
});

test.describe("panorama circular wrap", () => {
  test("a fling past the last item arrives at the first", async ({ page }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    const geometry = await wrapGeometry(container);
    expect(
      geometry.seam,
      "the seam copy has to be inside the scrollable range, or the wrap can never trigger"
    ).toBeLessThanOrEqual(geometry.maxScroll);

    // Park on the last item, then keep dragging left: past the end the first
    // item has to come back around.
    await container.evaluate(
      (el, offset) => {
        el.scrollLeft = offset;
      },
      geometry.lastReal
    );
    await recordSeam(container);
    await dragBy(page, container, -(geometry.seam - geometry.lastReal + 60));
    await waitForSettle(container);

    const settled = await container.evaluate((el) => el.scrollLeft);
    expect(
      Math.abs(settled - geometry.firstReal),
      `settled at ${settled}, the first item starts at ${geometry.firstReal}`
    ).toBeLessThanOrEqual(2);

    const samples = await page.evaluate(() => window.__seam ?? []);
    expect(samples.length, "the sampler missed the gesture").toBeGreaterThan(10);

    const halfCycle = geometry.step / 2;
    let crossings = 0;
    for (let index = 1; index < samples.length; index++) {
      const before = samples[index - 1];
      const after = samples[index];
      if (!before || !after) continue;

      const delta = Math.abs(after.scroll - before.scroll);
      // Handing the snap points back lands the glide on the nearest item
      // start, which is the settle the assertion above already pins down.
      if (before.snap === "none" && after.snap !== "none") {
        expect(
          delta,
          `frame ${index} jumped ${delta} px to hand the snap points back`
        ).toBeLessThanOrEqual(halfCycle + 2);
        continue;
      }
      if (delta <= 120) continue;

      const cycles = Math.round(delta / geometry.period);
      expect(
        Math.abs(delta - cycles * geometry.period),
        `frame ${index} moved ${delta} px, which is no number of whole cycles (${geometry.period} px each) plus one frame of motion: the content was moved, not wrapped`
      ).toBeLessThanOrEqual(120);
      expect(
        after.leading,
        `the seam jump at frame ${index} changed what is painted 200 px into the scrollport`
      ).toBe(before.leading);
      crossings += 1;
    }

    expect(crossings, "the drag never crossed the seam").toBeGreaterThan(0);

    const painted = await panorama
      .locator("metro-panorama-item:not([data-panorama-clone])")
      .first()
      .evaluate((item) => {
        const host = item.parentElement as HTMLElement;
        const container = host.shadowRoot?.querySelector(".panorama-container");
        if (!container) throw new Error("the panorama has no container");
        const edge = container.getBoundingClientRect().left;
        const rect = item.getBoundingClientRect();
        return {
          header: item.getAttribute("header") ?? "",
          onTheLine: Math.abs(rect.left - edge),
          inView: rect.right > edge && rect.left < edge + container.clientWidth,
        };
      });
    expect(painted.header, "the first item is the one that should come back").toBe(
      "Item One"
    );
    expect(painted.inView, "the first item never came into view").toBe(true);
    expect(painted.onTheLine, "the first item is not aligned to the seam line").toBeLessThanOrEqual(
      2
    );
  });

  test("a wheel scroll across the seam settles on a real item", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    // Wrap is the demo default: without seam copies there is no seam to cross.
    await expect(
      panorama.locator("metro-panorama-item[data-panorama-clone]")
    ).not.toHaveCount(0);

    const geometry = await wrapGeometry(container);
    await container.evaluate((el, offset) => {
      el.scrollLeft = offset;
    }, geometry.lastReal);

    // Native wheel input, not a scripted drag: the pointer sits over the
    // container and horizontal ticks walk the position past the seam.
    const box = await container.boundingBox();
    if (!box) throw new Error("panorama container has no bounding box");
    await page.mouse.move(box.x + box.width / 2, box.y + 40);

    // One decisive tick onto the seam copy: a short tick ends near the parked
    // snap point and mandatory snap pulls it back, while overshooting past
    // the seam normalizes mid-flight and the rest of the gesture lands
    // nowhere. The exact distance arrives on the copy and the scroll handler
    // normalizes it back by one period.
    await page.mouse.wheel(geometry.seam - geometry.lastReal, 0);

    // A smooth-scrolling engine can rest just short of the integer seam on
    // the copy, or carry the crossing gesture past the first item onto the
    // next snap point: either way the position stays past the parked item
    // instead of normalizing home, so one corrective tick for the exact
    // remainder plus a pixel finishes the crossing through the same handler.
    await page.waitForTimeout(1000);
    const parked = await container.evaluate((el) => el.scrollLeft);
    if (parked > geometry.firstReal + geometry.step / 2) {
      await page.mouse.wheel(Math.ceil(geometry.seam - parked) + 8, 0);
    }

    // Whatever the engine's snap does with the crossing, the wrap must put a
    // real item boundary under the scroll position: the seam copy sits past
    // the last real item, so settling behind it proves the wrap fired.
    await expect
      .poll(
        async () => {
          const scroll = await container.evaluate((el) => el.scrollLeft);
          return Math.min(
            ...geometry.offsets.map((offset) => Math.abs(scroll - offset))
          );
        },
        {
          message: "the wheel never settled on a real item boundary",
          timeout: 15_000,
        }
      )
      .toBeLessThanOrEqual(2);
    const settled = await container.evaluate((el) => el.scrollLeft);
    expect(
      settled,
      `the wrap must bring the position back past the last item, stayed at ${settled}`
    ).toBeLessThan(geometry.lastReal);

    // The settled item must be real, not the seam copy: the header painted
    // at the scrollport edge decides, and clones are excluded.
    const leading = await panorama.evaluate((host) => {
      const scroller = host.shadowRoot?.querySelector<HTMLElement>(
        ".panorama-container"
      );
      if (!scroller) throw new Error("the panorama has no container");
      const line = scroller.getBoundingClientRect().left + 4;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const painted = items.find((item) => {
        const rect = item.getBoundingClientRect();
        return rect.left <= line && rect.right > line;
      });
      return {
        header: painted?.getAttribute("header") ?? "",
        clone: painted?.hasAttribute("data-panorama-clone") ?? null,
      };
    });
    expect(
      leading.header,
      "the seam crossing must land on a titled item, not empty space"
    ).not.toBe("");
    expect(
      leading.clone,
      "the seam left a clone in view instead of a real item"
    ).toBe(false);
  });

  test("dragging back from the first item wraps to the last", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    const geometry = await wrapGeometry(container);
    await container.evaluate(
      (el, offset) => {
        el.scrollLeft = offset;
      },
      geometry.firstReal
    );

    // Drag the content to the right, which scrolls the position backwards:
    // before the first item there is only its copy of the last one.
    await dragBy(page, container, 150);
    await waitForSettle(container);

    const settled = await container.evaluate((el) => el.scrollLeft);
    expect(
      Math.abs(settled - geometry.lastReal),
      `settled at ${settled}, the last item starts at ${geometry.lastReal}`
    ).toBeLessThanOrEqual(2);
  });

  test("wrap off keeps the bounded behavior", async ({ page }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    await panorama.evaluate((host) => {
      host.removeAttribute("wrap");
    });
    await expect(
      panorama.locator("metro-panorama-item[data-panorama-clone]")
    ).toHaveCount(0);

    const bounded = await wrapEnds(container);
    // Start from the first item, so the only way to the end is the fling.
    await container.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await recordGlide(container);

    // One fling is not always enough to cross the whole list; the point is that
    // the end stops it instead of wrapping it back round.
    await flingLeft(page, container);
    await waitForSettle(container);
    await flingLeft(page, container);
    await waitForSettle(container);

    const rest = await container.evaluate((el) => ({
      scrollLeft: el.scrollLeft,
      leading: (() => {
        const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
        const line = el.getBoundingClientRect().left + 200;
        const items = Array.from(
          host.querySelectorAll<HTMLElement>("metro-panorama-item")
        );
        const painted = items.find((item) => {
          const rect = item.getBoundingClientRect();
          return rect.left <= line && rect.right > line;
        });
        return painted?.getAttribute("header") ?? "";
      })(),
    }));
    const glide = await page.evaluate(() => window.__panoramaScroll ?? []);

    expect(
      Math.max(...glide),
      `the flings never ran the bounded list to its end (furthest ${Math.max(
        ...glide
      )}, end ${bounded.end})`
    ).toBeGreaterThanOrEqual(bounded.end - 2);
    expect(
      Math.max(...glide),
      "a bounded panorama must not scroll past the end of its list"
    ).toBeLessThanOrEqual(bounded.end + 2);
    expect(
      rest.scrollLeft,
      "a bounded panorama must not come back around to the first item"
    ).toBeGreaterThan(bounded.firstReal);
    expect(
      rest.leading,
      "the end of the list should still show the last items, not the first"
    ).not.toBe("Item One");
  });

  test("seam copies carry no identifiers or tab stops", async ({ page }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    // Seed identifiable and focusable content so the copies have something
    // to sanitize: the clone of the first item must not keep any of it.
    await panorama.evaluate((host) => {
      const first = host.querySelector(
        "metro-panorama-item:not([data-panorama-clone])"
      );
      if (!first) throw new Error("the panorama holds no items");
      first.setAttribute("id", "panorama-real-id");
      const probe = document.createElement("div");
      probe.setAttribute("id", "panorama-probe");
      probe.innerHTML =
        '<button id="panorama-probe-btn" type="button">Probe</button>' +
        '<a id="panorama-probe-link" href="#probe">probe link</a>' +
        '<input id="panorama-probe-input" type="text" />';
      first.appendChild(probe);
    });

    // Rebuild the seam copies from the seeded items.
    await panorama.evaluate((host) => {
      host.removeAttribute("wrap");
    });
    await expect(
      panorama.locator("metro-panorama-item[data-panorama-clone]")
    ).toHaveCount(0);
    await panorama.evaluate((host) => {
      host.setAttribute("wrap", "");
    });
    await expect(
      panorama.locator("metro-panorama-item[data-panorama-clone]")
    ).not.toHaveCount(0);

    const hygiene = await panorama.evaluate((host) => {
      const clones = Array.from(
        host.querySelectorAll<HTMLElement>(
          "metro-panorama-item[data-panorama-clone]"
        )
      );
      const withId = clones.filter(
        (clone) =>
          clone.hasAttribute("id") ||
          clone.querySelectorAll("[id]").length > 0
      ).length;
      const tabbable = clones.reduce((count, clone) => {
        const focusables = Array.from(
          clone.querySelectorAll<HTMLElement>(
            "a[href],button,input,select,textarea,[tabindex]"
          )
        );
        return (
          count +
          focusables.filter((el) => el.getAttribute("tabindex") !== "-1")
            .length
        );
      }, 0);
      const withoutHidden = clones.filter(
        (clone) => clone.getAttribute("aria-hidden") !== "true"
      ).length;
      const withoutInert = clones.filter((clone) => {
        if ("inert" in clone) {
          return !(clone as unknown as { inert: boolean }).inert;
        }
        return false;
      }).length;
      return {
        clones: clones.length,
        withId,
        tabbable,
        withoutHidden,
        withoutInert,
      };
    });

    expect(hygiene.clones, "wrap must build seam copies").toBeGreaterThan(0);
    expect(
      hygiene.withId,
      "seam copies must not duplicate identifiers"
    ).toBe(0);
    expect(hygiene.tabbable, "seam copies must not keep tab stops").toBe(0);
    expect(hygiene.withoutHidden, "seam copies must stay hidden").toBe(0);
    expect(hygiene.withoutInert, "seam copies must be inert").toBe(0);

    // The seam still bridges the cycle onto the real first item.
    const geometry = await wrapGeometry(container);
    await container.evaluate((el, offset) => {
      el.scrollLeft = offset;
    }, geometry.lastReal);
    await dragBy(page, container, -(geometry.seam - geometry.lastReal + 60));
    await waitForSettle(container);
    const settled = await container.evaluate((el) => el.scrollLeft);
    expect(
      Math.abs(settled - geometry.firstReal),
      `settled at ${settled}, the first item starts at ${geometry.firstReal}`
    ).toBeLessThanOrEqual(2);
  });
});
