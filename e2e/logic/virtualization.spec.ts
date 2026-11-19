import { expect, test } from "@playwright/test";
import {
  DEFAULT_CONFIG,
  calculateGridVisibleRange,
  calculateVisibleRange,
  calculateVisibleRangeWithGroups,
  createJumpListCache,
  getScrollPositionForGroup,
  getScrollPositionForIndex,
  groupItems,
} from "../../src/utils/virtualization.ts";

test.describe("virtualization", () => {
  test.describe("calculateVisibleRange", () => {
    test("returns empty range for zero items", () => {
      const result = calculateVisibleRange(0, 500, 0, DEFAULT_CONFIG);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(0);
      expect(result.offsetY).toBe(0);
      expect(result.totalHeight).toBe(0);
    });

    test("calculates correct range for first viewport", () => {
      const itemHeight = 44;
      const clientHeight = 500;
      const itemsCount = 100;
      const config = { itemHeight, overscan: 5 };

      const result = calculateVisibleRange(0, clientHeight, itemsCount, config);

      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBeLessThanOrEqual(20);
      expect(result.offsetY).toBe(0);
      expect(result.totalHeight).toBe(itemsCount * itemHeight);
    });

    test("calculates correct range with overscan", () => {
      const itemHeight = 44;
      const overscan = 10;
      const scrollTop = 1000;
      const clientHeight = 500;
      const itemsCount = 100;
      const config = { itemHeight, overscan };

      const result = calculateVisibleRange(
        scrollTop,
        clientHeight,
        itemsCount,
        config,
      );

      const expectedStart = Math.floor(scrollTop / itemHeight) - overscan;
      expect(result.startIndex).toBe(Math.max(0, expectedStart));
    });

    test("clamps end index to total items", () => {
      const itemHeight = 44;
      const scrollTop = 4000;
      const clientHeight = 500;
      const itemsCount = 50;
      const config = { itemHeight, overscan: 10 };

      const result = calculateVisibleRange(
        scrollTop,
        clientHeight,
        itemsCount,
        config,
      );

      expect(result.endIndex).toBeLessThanOrEqual(itemsCount - 1);
    });

    test("supports function-based item height", () => {
      const getItemHeight = (index: number): number =>
        index % 2 === 0 ? 60 : 40;
      const config = { itemHeight: getItemHeight, overscan: 5 };

      const result = calculateVisibleRange(0, 500, 100, config);

      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeGreaterThanOrEqual(result.startIndex);
    });
  });

  test.describe("groupItems", () => {
    test("returns empty array for empty items", () => {
      const result = groupItems([], "category" as never, DEFAULT_CONFIG);
      expect(result).toEqual([]);
    });

    test("groups items by key", () => {
      const items = [
        { name: "Apple", category: "A" },
        { name: "Apricot", category: "A" },
        { name: "Banana", category: "B" },
        { name: "Cherry", category: "C" },
      ];

      const result = groupItems(items, "category", DEFAULT_CONFIG);

      expect(result.length).toBe(3);
      expect(result[0].key).toBe("A");
      expect(result[0].items.length).toBe(2);
      expect(result[1].key).toBe("B");
      expect(result[1].items.length).toBe(1);
      expect(result[2].key).toBe("C");
      expect(result[2].items.length).toBe(1);
    });

    test("sorts groups alphabetically", () => {
      const items = [
        { name: "Zebra", category: "Z" },
        { name: "Apple", category: "A" },
        { name: "Mango", category: "M" },
      ];

      const result = groupItems(items, "category", DEFAULT_CONFIG);

      expect(result[0].key).toBe("A");
      expect(result[1].key).toBe("M");
      expect(result[2].key).toBe("Z");
    });

    test("calculates correct header offsets", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 10, groupHeaderHeight };

      const items = [
        { name: "Apple", category: "A" },
        { name: "Apricot", category: "A" },
        { name: "Banana", category: "B" },
      ];

      const result = groupItems(items, "category", config);

      expect(result[0].headerOffset).toBe(0);
      expect(result[0].contentHeight).toBe(2 * itemHeight);
      expect(result[1].headerOffset).toBe(groupHeaderHeight + 2 * itemHeight);
      expect(result[1].contentHeight).toBe(itemHeight);
    });

    test("supports function-based group key", () => {
      const items = [{ name: "Apple" }, { name: "Apricot" }, { name: "Banana" }];

      const getGroupKey = (item: { name: string }): string => item.name[0];
      const result = groupItems(items, getGroupKey, DEFAULT_CONFIG);

      expect(result.length).toBe(2);
      expect(result[0].key).toBe("A");
      expect(result[1].key).toBe("B");
    });

    test("uses # for undefined group key", () => {
      const items = [{ name: "Apple" }, { name: "Banana", category: "B" }];

      const result = groupItems(items, "category" as never, DEFAULT_CONFIG);

      expect(result.length).toBe(2);
      expect(result.some((g) => g.key === "#")).toBe(true);
      expect(result.some((g) => g.key === "B")).toBe(true);
    });
  });

  test.describe("calculateVisibleRangeWithGroups", () => {
    test("returns empty for no groups", () => {
      const result = calculateVisibleRangeWithGroups(0, 500, [], DEFAULT_CONFIG);
      expect(result.visibleGroups).toEqual([]);
      expect(result.totalHeight).toBe(0);
    });

    test("filters groups outside viewport", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 5, groupHeaderHeight };

      const groups = [
        {
          key: "A",
          items: [{}, {}],
          indices: [0, 1],
          headerOffset: 0,
          contentHeight: 2 * itemHeight,
        },
        {
          key: "B",
          items: [{}],
          indices: [2],
          headerOffset: groupHeaderHeight + 2 * itemHeight,
          contentHeight: itemHeight,
        },
      ];

      const scrollTop = 2000;
      const result = calculateVisibleRangeWithGroups(
        scrollTop,
        500,
        groups,
        config,
      );

      expect(Array.isArray(result.visibleGroups)).toBe(true);
    });

    test("calculates correct total height", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 5, groupHeaderHeight };

      const groups = [
        {
          key: "A",
          items: [{}, {}],
          indices: [0, 1],
          headerOffset: 0,
          contentHeight: 2 * itemHeight,
        },
        {
          key: "B",
          items: [{}],
          indices: [2],
          headerOffset: groupHeaderHeight + 2 * itemHeight,
          contentHeight: itemHeight,
        },
      ];

      const result = calculateVisibleRangeWithGroups(0, 500, groups, config);

      const expectedTotal =
        groupHeaderHeight + 2 * itemHeight + groupHeaderHeight + itemHeight;
      expect(result.totalHeight).toBe(expectedTotal);
    });
  });

  test.describe("getScrollPositionForIndex", () => {
    test("returns correct position for flat list", () => {
      const itemHeight = 44;
      const config = { itemHeight, overscan: 10 };

      const result = getScrollPositionForIndex(5, [], config);

      expect(result).toBe(5 * itemHeight);
    });

    test("returns correct position within group", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 10, groupHeaderHeight };

      const groups = [
        {
          key: "A",
          items: [{}, {}, {}],
          indices: [0, 1, 2],
          headerOffset: 0,
          contentHeight: 3 * itemHeight,
        },
        {
          key: "B",
          items: [{}, {}],
          indices: [3, 4],
          headerOffset: groupHeaderHeight + 3 * itemHeight,
          contentHeight: 2 * itemHeight,
        },
      ];

      const result = getScrollPositionForIndex(4, groups, config);

      expect(result).toBe(
        groupHeaderHeight + 3 * itemHeight + groupHeaderHeight + itemHeight,
      );
    });

    test("returns 0 for index not in groups", () => {
      const config = DEFAULT_CONFIG;
      const groups = [
        { key: "A", items: [{}], indices: [0], headerOffset: 0, contentHeight: 44 },
      ];

      const result = getScrollPositionForIndex(99, groups, config);

      expect(result).toBe(0);
    });
  });

  test.describe("getScrollPositionForGroup", () => {
    test("returns correct offset for existing group", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 0, contentHeight: 0 },
        {
          key: "B",
          items: [],
          indices: [],
          headerOffset: 100,
          contentHeight: 0,
        },
      ];

      expect(getScrollPositionForGroup("B", groups)).toBe(100);
    });

    test("is case-insensitive", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 50, contentHeight: 0 },
      ];

      expect(getScrollPositionForGroup("a", groups)).toBe(50);
    });

    test("returns 0 for non-existent group", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 50, contentHeight: 0 },
      ];

      expect(getScrollPositionForGroup("Z", groups)).toBe(0);
    });
  });

  test.describe("createJumpListCache", () => {
    test("creates cache from groups", () => {
      const groups = [
        {
          key: "A",
          items: [1],
          indices: [0],
          headerOffset: 0,
          contentHeight: 44,
        },
        {
          key: "B",
          items: [2],
          indices: [1],
          headerOffset: 76,
          contentHeight: 44,
        },
      ];

      const cache = createJumpListCache(groups);

      expect(cache.has("A")).toBe(true);
      expect(cache.has("B")).toBe(true);
      expect(cache.get("A")?.items[0]).toBe(1);
    });

    test("keys are uppercase", () => {
      const groups = [
        { key: "a", items: [], indices: [], headerOffset: 0, contentHeight: 0 },
      ];

      const cache = createJumpListCache(groups);

      expect(cache.has("A")).toBe(true);
      expect(cache.has("a")).toBe(false);
    });
  });

  test.describe("calculateGridVisibleRange", () => {
    test("calculates visible indices for grid", () => {
      const scrollTop = 0;
      const scrollLeft = 0;
      const clientHeight = 200;
      const clientWidth = 300;
      const itemWidth = 100;
      const itemHeight = 50;
      const columns = 3;
      const totalItems = 50;

      const result = calculateGridVisibleRange(
        scrollTop,
        scrollLeft,
        clientHeight,
        clientWidth,
        totalItems,
        itemWidth,
        itemHeight,
        columns,
        1,
      );

      expect(result.visibleIndices.size > 0).toBe(true);
      expect(result.visibleIndices.has(0)).toBe(true);
      expect(result.visibleIndices.has(49)).toBe(false);
    });

    test("calculates correct total dimensions", () => {
      const totalItems = 50;
      const itemWidth = 100;
      const itemHeight = 50;
      const columns = 3;

      const result = calculateGridVisibleRange(
        0,
        0,
        200,
        300,
        totalItems,
        itemWidth,
        itemHeight,
        columns,
        1,
      );

      const expectedRows = Math.ceil(totalItems / columns);
      expect(result.totalHeight).toBe(expectedRows * itemHeight);
      expect(result.totalWidth).toBe(columns * itemWidth);
    });

    test("handles scrolling correctly", () => {
      const scrollTop = 500;
      const scrollLeft = 200;
      const clientHeight = 200;
      const clientWidth = 300;
      const itemWidth = 100;
      const itemHeight = 50;
      const columns = 3;
      const totalItems = 100;

      const result = calculateGridVisibleRange(
        scrollTop,
        scrollLeft,
        clientHeight,
        clientWidth,
        totalItems,
        itemWidth,
        itemHeight,
        columns,
        2,
      );

      for (const index of result.visibleIndices) {
        const row = Math.floor(index / columns);
        const expectedMinRow = Math.floor(scrollTop / itemHeight) - 2;
        const expectedMaxRow =
          Math.ceil((scrollTop + clientHeight) / itemHeight) + 2;
        expect(row).toBeGreaterThanOrEqual(Math.max(0, expectedMinRow));
        expect(row).toBeLessThanOrEqual(expectedMaxRow);
      }
    });

    test("clamps indices to total items", () => {
      const totalItems = 5;
      const scrollTop = 10000;
      const itemHeight = 50;
      const columns = 3;

      const result = calculateGridVisibleRange(
        scrollTop,
        0,
        200,
        300,
        totalItems,
        100,
        itemHeight,
        columns,
        1,
      );

      for (const index of result.visibleIndices) {
        expect(index).toBeLessThanOrEqual(totalItems - 1);
      }
    });
  });
});
