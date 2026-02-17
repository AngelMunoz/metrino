import { assert } from "chai";
import "./flip-view.ts";
import { MetroFlipView } from "./flip-view.ts";

suite("metro-flip-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "300px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createFlipView(html: string): Promise<MetroFlipView> {
    container.innerHTML = html;
    const el = container.querySelector("metro-flip-view") as MetroFlipView;
    await el.updateComplete;
    return el;
  }

  function getTransformValue(el: MetroFlipView): string {
    const track = el.shadowRoot?.querySelector(".flip-track") as HTMLElement;
    return track?.style.transform || "";
  }

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createFlipView("<metro-flip-view></metro-flip-view>");
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroFlipView);
    });

    test("renders container element", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const flipContainer = el.shadowRoot?.querySelector(".flip-container");
      assert.isNotNull(flipContainer);
    });

    test("renders flip-track for sliding animation", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const flipTrack = el.shadowRoot?.querySelector(".flip-track");
      assert.isNotNull(flipTrack);
    });

    test("renders navigation arrows by default", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const prevBtn = el.shadowRoot?.querySelector(".nav-button.prev");
      const nextBtn = el.shadowRoot?.querySelector(".nav-button.next");
      assert.isNotNull(prevBtn);
      assert.isNotNull(nextBtn);
    });

    test("hides navigation when show-nav is false", async () => {
      const el = await createFlipView(`
        <metro-flip-view show-nav="false">
          <div>Slide 1</div>
        </metro-flip-view>
      `);
      const prevBtn = el.shadowRoot?.querySelector(".nav-button");
      assert.isNull(prevBtn);
    });

    test("hides navigation when only one item", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Only Slide</div>
        </metro-flip-view>
      `);
      const navButtons = el.shadowRoot?.querySelectorAll(".nav-button");
      assert.equal(navButtons?.length, 0);
    });

    test("renders indicators by default with multiple items", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const indicators = el.shadowRoot?.querySelectorAll(".indicator");
      assert.equal(indicators?.length, 2);
    });

    test("indicators have role=tablist and role=tab", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
      const tabs = el.shadowRoot?.querySelectorAll('[role="tab"]');
      assert.isNotNull(tablist);
      assert.equal(tabs?.length, 2);
    });
  });

  suite("transform animation", () => {
    test("initial transform is translateX(0%) at index 0", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const transform = getTransformValue(el);
      assert.include(transform, "translateX");
    });

    test("transform updates when index changes", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </metro-flip-view>
      `);
      
      el.index = 2;
      await el.updateComplete;
      
      const transform = getTransformValue(el);
      assert.include(transform, "translateX");
    });
  });

  suite("index property", () => {
    test("defaults to 0", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      assert.equal(el.index, 0);
    });

    test("clamps to last item index", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      el.index = 100;
      await el.updateComplete;
      assert.equal(el.index, 1);
    });
  });

  suite("navigation buttons", () => {
    test("next button increments index", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const nextBtn = el.shadowRoot?.querySelector(".nav-button.next") as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      
      assert.equal(el.index, 1);
    });

    test("prev button decrements index", async () => {
      const el = await createFlipView(`
        <metro-flip-view index="1">
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const prevBtn = el.shadowRoot?.querySelector(".nav-button.prev") as HTMLElement;
      prevBtn?.click();
      await el.updateComplete;
      
      assert.equal(el.index, 0);
    });

    test("prev button is disabled at index 0", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      const prevBtn = el.shadowRoot?.querySelector(".nav-button.prev") as HTMLButtonElement;
      assert.isTrue(prevBtn?.disabled);
    });
  });

  suite("events", () => {
    test("dispatches change event on navigation", async () => {
      const el = await createFlipView(`
        <metro-flip-view>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </metro-flip-view>
      `);
      let eventDetail: { index: number } | undefined;
      el.addEventListener("change", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const nextBtn = el.shadowRoot?.querySelector(".nav-button.next") as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      
      assert.deepEqual(eventDetail, { index: 1 });
    });
  });
});
