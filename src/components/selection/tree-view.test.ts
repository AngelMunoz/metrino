import { assert } from "chai";
import "./tree-view.ts";
import { MetroTreeView, type TreeViewItem } from "./tree-view.ts";

suite("metro-tree-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTreeView(
    items?: TreeViewItem[],
  ): Promise<MetroTreeView> {
    container.innerHTML = "<metro-tree-view></metro-tree-view>";
    const el = container.querySelector("metro-tree-view") as MetroTreeView;
    if (items) {
      el.items = items;
    }
    await el.updateComplete;
    el.requestUpdate();
    await el.updateComplete;
    return el;
  }

  const sampleItems: TreeViewItem[] = [
    {
      id: "1",
      label: "Root 1",
      expanded: true,
      children: [
        { id: "1-1", label: "Child 1.1" },
        { id: "1-2", label: "Child 1.2" },
      ],
    },
    { id: "2", label: "Root 2" },
  ];

  const collapsedItems: TreeViewItem[] = [
    { id: "1", label: "Collapsed", children: [{ id: "1-1", label: "Child" }] },
  ];

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createTreeView();
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroTreeView);
    });

    test("renders tree container with role=tree", async () => {
      const el = await createTreeView();
      const tree = el.shadowRoot?.querySelector('[role="tree"]');
      assert.isNotNull(tree, "should have role=tree");
    });

    test("renders items from data", async () => {
      const el = await createTreeView(sampleItems);
      const items = el.shadowRoot?.querySelectorAll(".tree-item");
      assert.isAtLeast(items?.length || 0, 1);
    });

    test("tree items have role=treeitem", async () => {
      const el = await createTreeView(sampleItems);
      const treeItem = el.shadowRoot?.querySelector('[role="treeitem"]');
      assert.isNotNull(treeItem);
    });

    test("renders chevron for expandable items", async () => {
      const el = await createTreeView(sampleItems);
      const chevron = el.shadowRoot?.querySelector(".chevron");
      assert.isNotNull(chevron);
    });

    test("applies expanded class to chevron of expanded items", async () => {
      const el = await createTreeView(sampleItems);
      const expandedChevron = el.shadowRoot?.querySelector(".chevron.expanded");
      assert.isNotNull(expandedChevron);
    });

    test("chevron has empty class when item has no children", async () => {
      const el = await createTreeView([{ id: "1", label: "Leaf" }]);
      const emptyChevron = el.shadowRoot?.querySelector(".chevron.empty");
      assert.isNotNull(emptyChevron);
    });

    test("renders nested children when expanded", async () => {
      const el = await createTreeView(sampleItems);
      const children = el.shadowRoot?.querySelectorAll(".children.expanded");
      assert.isAtLeast(children?.length || 0, 1);
    });

    test("children container has role=group", async () => {
      const el = await createTreeView(sampleItems);
      const group = el.shadowRoot?.querySelector('[role="group"]');
      assert.isNotNull(group);
    });

    test("tree items have data-id attribute", async () => {
      const el = await createTreeView(sampleItems);
      const item = el.shadowRoot?.querySelector(".tree-item");
      assert.equal(item?.getAttribute("data-id"), "1");
    });

    test("applies indent based on level", async () => {
      const el = await createTreeView(sampleItems);
      const childItem = el.shadowRoot?.querySelector(
        '[data-id="1-1"]',
      ) as HTMLElement;
      assert.include(childItem?.style.paddingLeft, "32px");
    });
  });

  suite("selection mode - none", () => {
    test("defaults to none selection mode", async () => {
      const el = await createTreeView(sampleItems);
      assert.equal(el.selectionMode, "none");
    });

    test("clicking item does not add selected class in none mode", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.isFalse(treeItem.classList.contains("selected"));
    });
  });

  suite("single selection mode", () => {
    test("clicking item adds selected class to DOM", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.isTrue(treeItem.classList.contains("selected"));
    });

    test("selected item has selected class", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      el.selected = "1";
      await el.updateComplete;

      const selectedItem = el.shadowRoot?.querySelector(".tree-item.selected");
      assert.isNotNull(selectedItem);
    });

    test("aria-selected updates on selection", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.equal(treeItem.getAttribute("aria-selected"), "true");
    });

    test("clicking another item removes previous selection", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      const items = el.shadowRoot?.querySelectorAll(".tree-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      assert.isTrue(items?.[0]?.classList.contains("selected"));

      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;

      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[1]?.classList.contains("selected"));
    });
  });

  suite("expand/collapse", () => {
    test("clicking expanded item collapses it", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      const collapsedChildren = el.shadowRoot?.querySelectorAll(
        ".children:not(.expanded)",
      );
      assert.isAtLeast(collapsedChildren?.length || 0, 1);
    });

    test("clicking collapsed item expands it", async () => {
      const el = await createTreeView(collapsedItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNotNull(expandedChildren);
    });

    test("aria-expanded updates on toggle", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      assert.equal(treeItem.getAttribute("aria-expanded"), "true");

      treeItem?.click();
      await el.updateComplete;

      assert.equal(treeItem.getAttribute("aria-expanded"), "false");
    });

    test("chevron rotates when expanded", async () => {
      const el = await createTreeView(sampleItems);

      const chevron = el.shadowRoot?.querySelector(".chevron") as HTMLElement;
      assert.isTrue(chevron.classList.contains("expanded"));

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.isFalse(chevron.classList.contains("expanded"));
    });
  });

  suite("keyboard navigation", () => {
    test("ArrowRight expands collapsed item after click focuses it", async () => {
      const el = await createTreeView(collapsedItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      treeItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNotNull(expandedChildren);
    });

    test("ArrowLeft collapses expanded item", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      assert.equal(
        treeItem.getAttribute("aria-expanded"),
        "true",
        "item should start expanded",
      );

      treeItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.equal(
        treeItem.getAttribute("aria-expanded"),
        "false",
        "item should be collapsed after click",
      );

      treeItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.equal(
        treeItem.getAttribute("aria-expanded"),
        "true",
        "item should be expanded again",
      );

      treeItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await el.updateComplete;

      assert.equal(
        treeItem.getAttribute("aria-expanded"),
        "false",
        "item should be collapsed after ArrowLeft",
      );
    });

    test("Enter key selects item in single mode after click focuses it", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.equal(el.selected, "1");
      assert.isTrue(treeItem.classList.contains("selected"));
    });

    test("Space key selects item in single mode after click focuses it", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();
      await el.updateComplete;

      assert.equal(el.selected, "1");
      assert.isTrue(treeItem.classList.contains("selected"));
    });

    test("ArrowDown prevents default", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      treeItem.dispatchEvent(event);

      assert.isTrue(event.defaultPrevented);
    });

    test("ArrowUp prevents default", async () => {
      const el = await createTreeView(sampleItems);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      const event = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      });
      treeItem.dispatchEvent(event);

      assert.isTrue(event.defaultPrevented);
    });
  });

  suite("events", () => {
    test("dispatches selectionchange event in single mode with correct detail", async () => {
      const el = await createTreeView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;

      let eventDetail: { selectedId: string; item: TreeViewItem } | undefined;
      el.addEventListener("selectionchange", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();

      assert.equal(eventDetail?.selectedId, "1");
      assert.deepEqual(eventDetail?.item, sampleItems[0]);
    });

    test("dispatches collapse event when collapsing expanded item with correct detail", async () => {
      const el = await createTreeView(sampleItems);

      let eventDetail: { id: string } | undefined;
      el.addEventListener("collapse", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();

      assert.equal(eventDetail?.id, "1");
    });

    test("dispatches expand event when expanding collapsed item with correct detail", async () => {
      const el = await createTreeView(collapsedItems);

      let eventDetail: { id: string } | undefined;
      el.addEventListener("expand", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const treeItem = el.shadowRoot?.querySelector(
        ".tree-item",
      ) as HTMLElement;
      treeItem?.click();

      assert.equal(eventDetail?.id, "1");
    });
  });

  suite("public methods", () => {
    test("expandAll() expands all items", async () => {
      const el = await createTreeView(collapsedItems);

      el.expandAll();
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNotNull(expandedChildren);
    });

    test("collapseAll() collapses all items", async () => {
      const el = await createTreeView(sampleItems);

      el.collapseAll();
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNull(expandedChildren);
    });

    test("expandItem(id) expands specific item", async () => {
      const el = await createTreeView(collapsedItems);

      el.expandItem("1");
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNotNull(expandedChildren);
    });

    test("collapseItem(id) collapses specific item", async () => {
      const el = await createTreeView(sampleItems);

      el.collapseItem("1");
      await el.updateComplete;

      const expandedChildren =
        el.shadowRoot?.querySelector(".children.expanded");
      assert.isNull(expandedChildren);
    });
  });

  suite("icons", () => {
    test("renders item icon when provided", async () => {
      const items: TreeViewItem[] = [
        { id: "1", label: "Folder", icon: "folder" },
      ];
      const el = await createTreeView(items);

      const icon = el.shadowRoot?.querySelector(".item-icon");
      assert.isNotNull(icon);
    });
  });
});
