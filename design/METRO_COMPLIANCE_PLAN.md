# Metro Design Language Compliance Plan

## Methodology

Each phase follows this workflow:
1. **Fix** - Make the code change
2. **Test** - Add/update unit tests for the behavior
3. **Type Check** - Run `./node_modules/.bin/tsc --noEmit`
4. **Visual Verify** - Use MCP browser to confirm visual correctness
5. **Regression Check** - Run full test suite to ensure nothing broke

---

## Phase 1: Fix Broken Test Files

**Goal:** Get clean TypeScript compilation so we have a reliable baseline.

### 1.1 Fix `test-helpers.ts`

The file at `src/components/buttons/test-helpers.ts` is actually the content of `dropdown-button.test.ts` — it's been misplaced/overwritten. The real test helpers (like `createButton`) are defined locally in each test file.

**Action:** Replace `test-helpers.ts` with a proper helper module exporting shared utilities used across button tests.

**Verify:** `./node_modules/.bin/tsc --noEmit src/components/buttons/test-helpers.ts`

### 1.2 Fix `dropdown-button.test.ts`

The file has structural syntax errors — mismatched braces, missing `setup()` call body, references to undefined `el`.

**Action:** Rewrite the test file following the pattern from `toggle-switch.test.ts`:
- Proper `suite`/`setup`/`teardown` structure
- Local `createButton` helper
- All tests use the helper

**Verify:** `./node_modules/.bin/tsc --noEmit src/components/buttons/dropdown-button.test.ts`

---

## Phase 2: Keyboard Accessibility for Toggle Controls

**Goal:** `metro-toggle-switch`, `metro-check-box`, and `metro-radio-button` must be keyboard-operable.

### Problem
The interactive `.switch`/`.checkbox`/`.radio` divs have `role` and `aria-checked` but no `tabindex`, so keyboard users cannot focus or activate them.

### 2.1 Fix `metro-toggle-switch`

**Code changes in `src/components/input/toggle-switch.ts`:**
- Add `tabindex="0"` to the `.switch` div
- Add `@keydown` handler for Enter and Space keys to call `#toggle`
- Add `:host(:focus-visible)` outline style (use `focusRing` from shared.ts or inline)

**Tests to add in `toggle-switch.test.ts`:**
```typescript
test("switch is focusable via tabindex", async () => {
  const el = await createToggle();
  const switchEl = el.shadowRoot?.querySelector(".switch");
  assert.equal(switchEl?.getAttribute("tabindex"), "0");
});

test("Enter key toggles switch", async () => {
  const el = await createToggle();
  const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
  const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
  switchEl.dispatchEvent(event);
  await el.updateComplete;
  assert.isTrue(el.on);
});

test("Space key toggles switch", async () => {
  const el = await createToggle();
  const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
  const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
  switchEl.dispatchEvent(event);
  await el.updateComplete;
  assert.isTrue(el.on);
});

test("disabled switch ignores keyboard", async () => {
  const el = await createToggle({ disabled: "" });
  const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
  switchEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await el.updateComplete;
  assert.isFalse(el.on);
});
```

**MCP verification:** Navigate to `http://localhost:5173/#/input`, Tab to a toggle switch, press Space/Enter to toggle.

### 2.2 Fix `metro-check-box`

Same pattern as toggle-switch:
- Add `tabindex="0"` to `.checkbox` div
- Add `@keydown` for Enter/Space
- Add focus outline

**Tests:** Same pattern — tabindex, Enter, Space, disabled.

### 2.3 Fix `metro-radio-button`

Same pattern:
- Add `tabindex="0"` to `.radio` div
- Add `@keydown` for Enter/Space
- Add focus outline

**Tests:** tabindex, Enter, Space, disabled, already-checked does nothing.

---

## Phase 3: Dialog Accessibility

**Goal:** `metro-content-dialog` gets focus trap, Escape key, and ARIA labelling.

### 3.1 Escape Key Handling

**Code changes in `content-dialog.ts`:**
- Add `@keydown` handler on the `.dialog` div (or host) that calls `#close()` when `e.key === "Escape"` and `this.closable`

**Tests to add:**
```typescript
test("Escape key closes dialog when closable", async () => {
  const el = await createDialog();
  el.show();
  await el.updateComplete;
  const dialog = el.shadowRoot?.querySelector(".dialog") as HTMLElement;
  dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await el.updateComplete;
  assert.isTrue(el.closing);
});

test("Escape key does nothing when not closable", async () => {
  const el = await createDialog({ closable: "false" });
  el.show();
  await el.updateComplete;
  const dialog = el.shadowRoot?.querySelector(".dialog") as HTMLElement;
  dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await el.updateComplete;
  assert.isTrue(el.open);
  assert.isFalse(el.closing);
});
```

### 3.2 Focus Trap

**Code changes:**
- On `show()`, save `document.activeElement` as `#previousFocus`
- Query all focusable elements inside `.dialog` (buttons, inputs, [tabindex])
- On Tab at last element → wrap to first
- On Shift+Tab at first element → wrap to last
- On `hide()` / close, restore focus to `#previousFocus`

**Tests:**
```typescript
test("first focusable element receives focus on open", async () => {
  const el = await createDialog();
  const btn = document.createElement("button");
  btn.slot = "buttons";
  btn.textContent = "OK";
  el.appendChild(btn);
  el.show();
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 50));
  assert.equal(document.activeElement, btn); // or assert focus is inside dialog
});
```

### 3.3 ARIA Labelling

**Code changes:**
- Add `aria-labelledby` pointing to the title element's id when title is present
- Add `aria-describedby` pointing to the content element's id
- Add `aria-label="Close"` to the close button

**Tests:**
```typescript
test("dialog has aria-labelledby when title provided", async () => {
  const el = await createDialog({ title: "My Title" });
  el.show();
  await el.updateComplete;
  const dialog = el.shadowRoot?.querySelector(".dialog");
  const header = el.shadowRoot?.querySelector(".dialog-header");
  assert.equal(dialog?.getAttribute("aria-labelledby"), header?.id);
});

test("close button has aria-label", async () => {
  const el = await createDialog();
  el.show();
  await el.updateComplete;
  const closeBtn = el.shadowRoot?.querySelector(".close-btn");
  assert.equal(closeBtn?.getAttribute("aria-label"), "Close");
});
```

**MCP verification:** Open a content-dialog via demo page, Tab through elements, verify focus stays trapped, press Escape to close.

### 3.4 Apply same Escape key pattern to `metro-flyout` and `metro-message-dialog`

Read both files, add Escape key handler, add tests.

---

## Phase 4: ARIA Roles for Collection Components

**Goal:** `metro-list-view`, `metro-grid-view`, and `metro-panorama` have proper ARIA roles.

### 4.1 `metro-list-view`

**Code changes:**
- Add `role="listbox"` to the scroll container
- Add `aria-multiselectable="true"` when `selectionMode` is `multiple` or `extended`
- Add `aria-activedescendant` pointing to the currently focused item

**Tests:**
```typescript
test("container has role=listbox", async () => { ... });
test("aria-multiselectable set for multiple mode", async () => { ... });
test("aria-activedescendant updates on focus change", async () => { ... });
```

### 4.2 `metro-panorama`

**Code changes:**
- Add `role="region"` and `aria-label="Panorama"` to host
- Add `aria-roledescription="panorama"` to the scroll container

**Tests:**
```typescript
test("panorama has region role", async () => { ... });
```

---

## Phase 5: App Bar Keyboard Support

**Goal:** `metro-app-bar` menu closes on Escape, has `aria-controls`.

### 5.1 Escape Key

**Code changes:**
- Add `@keydown` handler that sets `expanded = false` on Escape when expanded

### 5.2 `aria-controls`

**Code changes:**
- Generate an id for the menu panel
- Add `aria-controls="<id>"` to the ellipsis button

**Tests:**
```typescript
test("Escape key closes menu", async () => { ... });
test("ellipsis button has aria-controls", async () => { ... });
```

---

## Phase 6: Tilt Effects

**Goal:** Apply `applyTiltEffect()` from `shared.ts` to components missing it.

### Components to update:
1. `metro-flip-tile` — import and call `applyTiltEffect` in `firstUpdated`, cleanup in `disconnectedCallback`
2. `metro-live-tile` — same
3. `metro-cycle-tile` — same
4. `metro-iconic-tile` — same
5. `metro-app-bar-button` — same
6. `metro-app-bar-toggle-button` — same

**Pattern (from `button.ts`):**
```typescript
#cleanupTilt?: () => void;

firstUpdated(): void {
  this.#cleanupTilt = applyTiltEffect(this);
}

disconnectedCallback(): void {
  super.disconnectedCallback();
  this.#cleanupTilt?.();
}
```

**Tests:** For each component, verify that pointerdown sets a transform on the element:
```typescript
test("tilt effect applies on pointerdown", async () => {
  const el = await createTile();
  el.dispatchEvent(new PointerEvent("pointerdown", { clientX: 85, clientY: 85 }));
  await el.updateComplete;
  assert.notEqual(el.style.transform, "");
});
```

**MCP verification:** Click tiles on the Tiles demo page, verify subtle 3D tilt on press.

---

## Phase 7: Hover/Press States

**Goal:** Interactive components have visible hover and press feedback.

### 7.1 `metro-toggle-switch`

**CSS additions:**
```css
.switch:hover {
  border-color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
}
.switch:active {
  background: var(--metro-highlight-active, rgba(255, 255, 255, 0.08));
}
```

### 7.2 `metro-check-box`

**CSS additions:**
```css
.checkbox:hover {
  border-color: var(--metro-foreground, #ffffff);
}
.checkbox:active {
  background: var(--metro-highlight-active, rgba(255, 255, 255, 0.08));
}
```

### 7.3 `metro-flip-tile`

**CSS additions:**
```css
:host(:hover) {
  background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
}
:host(:active) {
  background: var(--metro-highlight-active, rgba(255, 255, 255, 0.08));
}
```

**MCP verification:** Hover over each component type, verify visual highlight appears.

---

## Phase 8: Swivel Animation for Dialogs

**Goal:** Dialogs use Metro's swivel (rotateX) entrance instead of scale+translate.

### 8.1 Verify current animation

The `dialogAnimation` in `shared.ts` already has the correct swivel keyframes:
```css
@keyframes dialogEnter {
  from { opacity: 0; transform: perspective(1000px) rotateX(90deg); }
  to { opacity: 1; transform: perspective(1000px) rotateX(0deg); }
}
```

This is already correct. No change needed — just verify visually.

**MCP verification:** Open a content-dialog, verify it rotates in from 90deg on the X axis.

---

## Phase 9: Pivot Circular Loop

**Goal:** Pivot headers wrap from last to first seamlessly.

### Implementation approach:
1. Clone first and last header elements
2. When user scrolls past the last header, jump to the cloned first (and vice versa)
3. Use `requestAnimationFrame` to perform the jump without visible flicker

**Tests:**
```typescript
test("selecting past last wraps to first", async () => {
  // Create pivot with 3 items
  // Select item 2 (last, 0-indexed)
  // Call next()
  // Verify selectedIndex is 0
});
```

**Note:** This is a medium-complexity feature. Implement after accessibility fixes.

---

## Phase 10: Panorama Circular Wrapping

**Goal:** Panorama scrolls seamlessly from last panel back to first.

### Implementation approach:
1. Clone first and last panorama items
2. When scroll position reaches the clone, instantly jump to the real item
3. Maintain parallax across the wrap boundary

**Tests:**
```typescript
test("scrolling past last item wraps to first", async () => { ... });
```

---

## Phase 11: RTL Support

**Goal:** Replace physical CSS properties with logical properties.

### Scope: ~86 instances across all component files.

**Replacements:**
| Physical | Logical |
|----------|---------|
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |

**Approach:**
1. Use grep to find all instances: `rg "(left|right|margin-left|margin-right|padding-left|padding-right)" src/components/ --include="*.ts"`
2. Fix each file, verifying no visual regression via MCP
3. Run type check after each batch

**Important:** Keep `left: 0; right: 0` patterns for `position: absolute; inset: 0` — replace with `inset: 0` or `inset-inline: 0`.

---

## Phase 12: ScrollViewer Auto-Hide Scrollbars

**Goal:** `metro-scroll-viewer` supports `scrollbarMode="auto"` with show-on-interact behavior.

### Implementation:
1. Add `scrollbarMode` property: `"auto" | "visible" | "hidden"`
2. In `auto` mode, add a class `scrollbar-visible` on scroll/touch, remove after 1.5s idle
3. Use CSS transitions for opacity fade

**Tests:**
```typescript
test("scrollbarMode=auto shows scrollbar on scroll", async () => { ... });
test("scrollbarMode=auto hides scrollbar after idle", async () => { ... });
test("scrollbarMode=visible always shows scrollbar", async () => { ... });
test("scrollbarMode=hidden never shows scrollbar", async () => { ... });
```

---

## Phase 13: Final Verification

**Goal:** Confirm all changes work together without regressions.

### Steps:
1. Run `./node_modules/.bin/tsc --noEmit` — must be clean (0 errors)
2. Run `pnpm test` (if Playwright installed) — all tests pass
3. MCP visual sweep:
   - Home page renders correctly
   - Buttons page: hover states, tilt, keyboard focus
   - Input page: toggle/checkbox/radio keyboard operable
   - Dialog page: focus trap, Escape key
   - Tiles page: tilt effects
   - Navigation page: app bar Escape key
   - Light theme: all above still work
4. Update `design/ROADMAP.md` to mark completed items

---

## Execution Order

```
Phase 1  → Phase 2  → Phase 3  → Phase 4  → Phase 5
   ↓          ↓          ↓          ↓          ↓
Fix TS    Keyboard   Dialog     ARIA       App Bar
errors    toggle     a11y       roles      keyboard

Phase 6  → Phase 7  → Phase 8  → Phase 9  → Phase 10
   ↓          ↓          ↓          ↓          ↓
Tilt      Hover/     Swivel     Pivot      Panorama
effects   press      verify     loop       wrap

Phase 11 → Phase 12 → Phase 13
   ↓          ↓          ↓
RTL       Scroll     Final
support   bars       verify
```

Each phase: fix → test → typecheck → MCP verify → commit checkpoint.
