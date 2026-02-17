export interface VirtualizationConfig {
  itemHeight: number | ((index: number) => number);
  overscan: number;
  groupHeaderHeight?: number;
}

export interface VirtualizationRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
}

export interface VirtualizationGroup<T = unknown> {
  key: string;
  items: T[];
  indices: number[];
  headerOffset: number;
  contentHeight: number;
}

export interface VirtualizedListState<T = unknown> {
  totalHeight: number;
  groups: VirtualizationGroup<T>[];
  range: VirtualizationRange;
}

const DEFAULT_OVERSCAN = 10;
const DEFAULT_ITEM_HEIGHT = 44;
const DEFAULT_GROUP_HEADER_HEIGHT = 32;

export function getItemHeight(
  config: VirtualizationConfig,
  index: number
): number {
  if (typeof config.itemHeight === "function") {
    return config.itemHeight(index);
  }
  return config.itemHeight;
}

export function calculateVisibleRange(
  scrollTop: number,
  clientHeight: number,
  totalItems: number,
  config: VirtualizationConfig
): VirtualizationRange {
  const itemHeight = typeof config.itemHeight === "function"
    ? config.itemHeight(0)
    : config.itemHeight;
  const overscan = config.overscan ?? DEFAULT_OVERSCAN;

  if (totalItems === 0) {
    return { startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0 };
  }

  const totalHeight = totalItems * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
  );
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY, totalHeight };
}

export function calculateVisibleRangeWithGroups<T>(
  scrollTop: number,
  clientHeight: number,
  groups: VirtualizationGroup<T>[],
  config: VirtualizationConfig
): { visibleGroups: Array<{ group: VirtualizationGroup<T>; startIndex: number; endIndex: number; offsetY: number }>; totalHeight: number } {
  const itemHeight = typeof config.itemHeight === "function"
    ? config.itemHeight(0)
    : config.itemHeight;
  const overscan = config.overscan ?? DEFAULT_OVERSCAN;
  const groupHeaderHeight = config.groupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT;
  const overscanHeight = overscan * itemHeight;

  if (groups.length === 0) {
    return { visibleGroups: [], totalHeight: 0 };
  }

  const lastGroup = groups[groups.length - 1];
  const totalHeight = lastGroup.headerOffset + groupHeaderHeight + lastGroup.contentHeight;

  const visibleGroups: Array<{ group: VirtualizationGroup<T>; startIndex: number; endIndex: number; offsetY: number }> = [];
  const viewportEnd = scrollTop + clientHeight + overscanHeight;

  for (const group of groups) {
    const groupStart = group.headerOffset;
    const groupEnd = groupStart + groupHeaderHeight + group.contentHeight;

    if (groupEnd < scrollTop - overscanHeight) continue;
    if (groupStart > viewportEnd) break;

    const contentTop = groupStart + groupHeaderHeight;
    const firstItemVisible = Math.max(0, Math.floor((scrollTop - contentTop) / itemHeight) - overscan);
    const lastItemVisible = Math.min(
      group.items.length - 1,
      Math.ceil((scrollTop + clientHeight - contentTop) / itemHeight) + overscan
    );

    const offsetY = firstItemVisible * itemHeight;

    visibleGroups.push({
      group,
      startIndex: firstItemVisible,
      endIndex: lastItemVisible,
      offsetY,
    });
  }

  return { visibleGroups, totalHeight };
}

export function groupItems<T>(
  items: T[],
  groupKey: keyof T | ((item: T) => string),
  config: VirtualizationConfig
): VirtualizationGroup<T>[] {
  const itemHeight = typeof config.itemHeight === "function"
    ? config.itemHeight(0)
    : config.itemHeight;
  const groupHeaderHeight = config.groupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT;

  if (items.length === 0) {
    return [];
  }

  const getKey = typeof groupKey === "function"
    ? groupKey
    : (item: T) => String(item[groupKey] ?? "#");

  const groupMap = new Map<string, { items: T[]; indices: number[] }>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const keyValue = getKey(item);
    if (!groupMap.has(keyValue)) {
      groupMap.set(keyValue, { items: [], indices: [] });
    }
    const entry = groupMap.get(keyValue)!;
    entry.items.push(item);
    entry.indices.push(i);
  }

  const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a.localeCompare(b));
  const groups: VirtualizationGroup<T>[] = [];

  let currentOffset = 0;
  for (const key of sortedKeys) {
    const entry = groupMap.get(key)!;
    const contentHeight = entry.items.length * itemHeight;
    groups.push({
      key,
      items: entry.items,
      indices: entry.indices,
      headerOffset: currentOffset,
      contentHeight,
    });
    currentOffset += groupHeaderHeight + contentHeight;
  }

  return groups;
}

export function getScrollPositionForIndex<T>(
  itemIndex: number,
  groups: VirtualizationGroup<T>[],
  config: VirtualizationConfig
): number {
  const itemHeight = typeof config.itemHeight === "function"
    ? config.itemHeight(0)
    : config.itemHeight;
  const groupHeaderHeight = config.groupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT;

  if (groups.length === 0) {
    return itemIndex * itemHeight;
  }

  for (const group of groups) {
    const localIdx = group.indices.indexOf(itemIndex);
    if (localIdx !== -1) {
      return group.headerOffset + groupHeaderHeight + localIdx * itemHeight;
    }
  }

  return 0;
}

export function getScrollPositionForGroup<T>(
  groupKey: string,
  groups: VirtualizationGroup<T>[]
): number {
  const group = groups.find(g => g.key.toUpperCase() === groupKey.toUpperCase());
  return group?.headerOffset ?? 0;
}

export function createJumpListCache<T>(
  groups: VirtualizationGroup<T>[]
): Map<string, VirtualizationGroup<T>> {
  const cache = new Map<string, VirtualizationGroup<T>>();
  for (const group of groups) {
    cache.set(group.key.toUpperCase(), group);
  }
  return cache;
}

export function calculateGridVisibleRange(
  scrollTop: number,
  scrollLeft: number,
  clientHeight: number,
  clientWidth: number,
  totalItems: number,
  itemWidth: number,
  itemHeight: number,
  columns: number,
  overscan: number = DEFAULT_OVERSCAN
): { visibleIndices: Set<number>; offsetY: number; offsetX: number; totalHeight: number; totalWidth: number } {
  const rows = Math.ceil(totalItems / columns);
  const totalHeight = rows * itemHeight;
  const totalWidth = columns * itemWidth;

  const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endRow = Math.min(rows - 1, Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan);
  const startCol = Math.max(0, Math.floor(scrollLeft / itemWidth) - overscan);
  const endCol = Math.min(columns - 1, Math.ceil((scrollLeft + clientWidth) / itemWidth) + overscan);

  const visibleIndices = new Set<number>();
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * columns + col;
      if (index < totalItems) {
        visibleIndices.add(index);
      }
    }
  }

  return {
    visibleIndices,
    offsetY: startRow * itemHeight,
    offsetX: startCol * itemWidth,
    totalHeight,
    totalWidth,
  };
}

export const DEFAULT_CONFIG: VirtualizationConfig = {
  itemHeight: DEFAULT_ITEM_HEIGHT,
  overscan: DEFAULT_OVERSCAN,
  groupHeaderHeight: DEFAULT_GROUP_HEADER_HEIGHT,
};
