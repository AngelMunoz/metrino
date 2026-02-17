import { assert } from "chai";
import {
  calculateVisibleRange,
  calculateVisibleRangeWithGroups,
  groupItems,
  getScrollPositionForIndex,
  getScrollPositionForGroup,
  createJumpListCache,
  calculateGridVisibleRange,
  DEFAULT_CONFIG,
} from "./virtualization.ts";

suite("virtualization", () => {
  suite("calculateVisibleRange", () => {
    test("returns empty range for zero items", () => {
      const result = calculateVisibleRange(0, 500, 0, DEFAULT_CONFIG);
      assert.equal(result.startIndex, 0);
      assert.equal(result.endIndex, 0);
      assert.equal(result.offsetY, 0);
      assert.equal(result.totalHeight, 0);
    });

    test("calculates correct range for first viewport", () => {
      const itemHeight = 44;
      const clientHeight = 500;
      const itemsCount = 100;
      const config = { itemHeight, overscan: 5 };

      const result = calculateVisibleRange(0, clientHeight, itemsCount, config);

      assert.equal(result.startIndex, 0);
      assert.isAtMost(result.endIndex, 20);
      assert.equal(result.offsetY, 0);
      assert.equal(result.totalHeight, itemsCount * itemHeight);
    });

    test("calculates correct range with overscan", () => {
      const itemHeight = 44;
      const overscan = 10;
      const scrollTop = 1000;
      const clientHeight = 500;
      const itemsCount = 100;
      const config = { itemHeight, overscan };

      const result = calculateVisibleRange(scrollTop, clientHeight, itemsCount, config);

      const expectedStart = Math.floor(scrollTop / itemHeight) - overscan;
      assert.equal(result.startIndex, Math.max(0, expectedStart));
    });

    test("clamps end index to total items", () => {
      const itemHeight = 44;
      const scrollTop = 4000;
      const clientHeight = 500;
      const itemsCount = 50;
      const config = { itemHeight, overscan: 10 };

      const result = calculateVisibleRange(scrollTop, clientHeight, itemsCount, config);

      assert.isAtMost(result.endIndex, itemsCount - 1);
    });

    test("supports function-based item height", () => {
      const getItemHeight = (index: number) => index % 2 === 0 ? 60 : 40;
      const config = { itemHeight: getItemHeight, overscan: 5 };

      const result = calculateVisibleRange(0, 500, 100, config);

      assert.isAtLeast(result.startIndex, 0);
      assert.isAtLeast(result.endIndex, result.startIndex);
    });
  });

  suite("groupItems", () => {
    test("returns empty array for empty items", () => {
      const result = groupItems([], "category" as never, DEFAULT_CONFIG);
      assert.deepEqual(result, []);
    });

    test("groups items by key", () => {
      const items = [
        { name: "Apple", category: "A" },
        { name: "Apricot", category: "A" },
        { name: "Banana", category: "B" },
        { name: "Cherry", category: "C" },
      ];

      const result = groupItems(items, "category", DEFAULT_CONFIG);

      assert.equal(result.length, 3);
      assert.equal(result[0].key, "A");
      assert.equal(result[0].items.length, 2);
      assert.equal(result[1].key, "B");
      assert.equal(result[1].items.length, 1);
      assert.equal(result[2].key, "C");
      assert.equal(result[2].items.length, 1);
    });

    test("sorts groups alphabetically", () => {
      const items = [
        { name: "Zebra", category: "Z" },
        { name: "Apple", category: "A" },
        { name: "Mango", category: "M" },
      ];

      const result = groupItems(items, "category", DEFAULT_CONFIG);

      assert.equal(result[0].key, "A");
      assert.equal(result[1].key, "M");
      assert.equal(result[2].key, "Z");
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

      assert.equal(result[0].headerOffset, 0);
      assert.equal(result[0].contentHeight, 2 * itemHeight);
      assert.equal(result[1].headerOffset, groupHeaderHeight + 2 * itemHeight);
      assert.equal(result[1].contentHeight, itemHeight);
    });

    test("supports function-based group key", () => {
      const items = [
        { name: "Apple" },
        { name: "Apricot" },
        { name: "Banana" },
      ];

      const getGroupKey = (item: { name: string }) => item.name[0];
      const result = groupItems(items, getGroupKey, DEFAULT_CONFIG);

      assert.equal(result.length, 2);
      assert.equal(result[0].key, "A");
      assert.equal(result[1].key, "B");
    });

    test("uses # for undefined group key", () => {
      const items = [
        { name: "Apple" },
        { name: "Banana", category: "B" },
      ];

      const result = groupItems(items, "category" as never, DEFAULT_CONFIG);

      assert.equal(result.length, 2);
      assert.isTrue(result.some(g => g.key === "#"));
      assert.isTrue(result.some(g => g.key === "B"));
    });
  });

  suite("calculateVisibleRangeWithGroups", () => {
    test("returns empty for no groups", () => {
      const result = calculateVisibleRangeWithGroups(0, 500, [], DEFAULT_CONFIG);
      assert.deepEqual(result.visibleGroups, []);
      assert.equal(result.totalHeight, 0);
    });

    test("filters groups outside viewport", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 5, groupHeaderHeight };

      const groups = [
        { key: "A", items: [{}, {}], indices: [0, 1], headerOffset: 0, contentHeight: 2 * itemHeight },
        { key: "B", items: [{}], indices: [2], headerOffset: groupHeaderHeight + 2 * itemHeight, contentHeight: itemHeight },
      ];

      const scrollTop = 2000;
      const result = calculateVisibleRangeWithGroups(scrollTop, 500, groups, config);

      assert.isArray(result.visibleGroups);
    });

    test("calculates correct total height", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 5, groupHeaderHeight };

      const groups = [
        { key: "A", items: [{}, {}], indices: [0, 1], headerOffset: 0, contentHeight: 2 * itemHeight },
        { key: "B", items: [{}], indices: [2], headerOffset: groupHeaderHeight + 2 * itemHeight, contentHeight: itemHeight },
      ];

      const result = calculateVisibleRangeWithGroups(0, 500, groups, config);

      const expectedTotal = groupHeaderHeight + 2 * itemHeight + groupHeaderHeight + itemHeight;
      assert.equal(result.totalHeight, expectedTotal);
    });
  });

  suite("getScrollPositionForIndex", () => {
    test("returns correct position for flat list", () => {
      const itemHeight = 44;
      const config = { itemHeight, overscan: 10 };

      const result = getScrollPositionForIndex(5, [], config);

      assert.equal(result, 5 * itemHeight);
    });

    test("returns correct position within group", () => {
      const itemHeight = 44;
      const groupHeaderHeight = 32;
      const config = { itemHeight, overscan: 10, groupHeaderHeight };

      const groups = [
        { key: "A", items: [{}, {}, {}], indices: [0, 1, 2], headerOffset: 0, contentHeight: 3 * itemHeight },
        { key: "B", items: [{}, {}], indices: [3, 4], headerOffset: groupHeaderHeight + 3 * itemHeight, contentHeight: 2 * itemHeight },
      ];

      const result = getScrollPositionForIndex(4, groups, config);

      assert.equal(result, groupHeaderHeight + 3 * itemHeight + groupHeaderHeight + itemHeight);
    });

    test("returns 0 for index not in groups", () => {
      const config = DEFAULT_CONFIG;
      const groups = [
        { key: "A", items: [{}], indices: [0], headerOffset: 0, contentHeight: 44 },
      ];

      const result = getScrollPositionForIndex(99, groups, config);

      assert.equal(result, 0);
    });
  });

  suite("getScrollPositionForGroup", () => {
    test("returns correct offset for existing group", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 0, contentHeight: 0 },
        { key: "B", items: [], indices: [], headerOffset: 100, contentHeight: 0 },
      ];

      assert.equal(getScrollPositionForGroup("B", groups), 100);
    });

    test("is case-insensitive", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 50, contentHeight: 0 },
      ];

      assert.equal(getScrollPositionForGroup("a", groups), 50);
    });

    test("returns 0 for non-existent group", () => {
      const groups = [
        { key: "A", items: [], indices: [], headerOffset: 50, contentHeight: 0 },
      ];

      assert.equal(getScrollPositionForGroup("Z", groups), 0);
    });
  });

  suite("createJumpListCache", () => {
    test("creates cache from groups", () => {
      const groups = [
        { key: "A", items: [1], indices: [0], headerOffset: 0, contentHeight: 44 },
        { key: "B", items: [2], indices: [1], headerOffset: 76, contentHeight: 44 },
      ];

      const cache = createJumpListCache(groups);

      assert.isTrue(cache.has("A"));
      assert.isTrue(cache.has("B"));
      assert.equal(cache.get("A")?.items[0], 1);
    });

    test("keys are uppercase", () => {
      const groups = [
        { key: "a", items: [], indices: [], headerOffset: 0, contentHeight: 0 },
      ];

      const cache = createJumpListCache(groups);

      assert.isTrue(cache.has("A"));
      assert.isFalse(cache.has("a"));
    });
  });

  suite("calculateGridVisibleRange", () => {
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
        scrollTop, scrollLeft, clientHeight, clientWidth,
        totalItems, itemWidth, itemHeight, columns, 1
      );

      assert.isTrue(result.visibleIndices.size > 0);
      assert.isTrue(result.visibleIndices.has(0));
      assert.isFalse(result.visibleIndices.has(49));
    });

    test("calculates correct total dimensions", () => {
      const totalItems = 50;
      const itemWidth = 100;
      const itemHeight = 50;
      const columns = 3;

      const result = calculateGridVisibleRange(
        0, 0, 200, 300,
        totalItems, itemWidth, itemHeight, columns, 1
      );

      const expectedRows = Math.ceil(totalItems / columns);
      assert.equal(result.totalHeight, expectedRows * itemHeight);
      assert.equal(result.totalWidth, columns * itemWidth);
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
        scrollTop, scrollLeft, clientHeight, clientWidth,
        totalItems, itemWidth, itemHeight, columns, 2
      );

      for (const index of result.visibleIndices) {
        const row = Math.floor(index / columns);
        const expectedMinRow = Math.floor(scrollTop / itemHeight) - 2;
        const expectedMaxRow = Math.ceil((scrollTop + clientHeight) / itemHeight) + 2;
        assert.isAtLeast(row, Math.max(0, expectedMinRow));
        assert.isAtMost(row, expectedMaxRow);
      }
    });

    test("clamps indices to total items", () => {
      const totalItems = 5;
      const scrollTop = 10000;
      const itemHeight = 50;
      const columns = 3;

      const result = calculateGridVisibleRange(
        scrollTop, 0, 200, 300,
        totalItems, 100, itemHeight, columns, 1
      );

      for (const index of result.visibleIndices) {
        assert.isAtMost(index, totalItems - 1);
      }
    });
  });
});
