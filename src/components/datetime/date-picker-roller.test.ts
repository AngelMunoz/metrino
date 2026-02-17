import { assert } from "chai";
import "./date-picker-roller.ts";
import { MetroDatePickerRoller } from "./date-picker-roller.ts";

suite("metro-date-picker-roller", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPicker(attrs: Record<string, string> = {}): Promise<MetroDatePickerRoller> {
    const el = document.createElement("metro-date-picker-roller") as MetroDatePickerRoller;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  function getPickerElements(el: MetroDatePickerRoller) {
    const columns = el.shadowRoot?.querySelectorAll(".picker-column");
    return {
      dayColumn: columns?.[0],
      monthColumn: columns?.[1],
      yearColumn: columns?.[2],
      dayList: columns?.[0]?.querySelector(".picker-list") as HTMLElement,
      monthList: columns?.[1]?.querySelector(".picker-list") as HTMLElement,
      yearList: columns?.[2]?.querySelector(".picker-list") as HTMLElement,
    };
  }

  test("clicking a day item shifts the list to center it", async () => {
    const el = await createPicker({ value: "2024-06-01" });
    const { dayColumn, dayList } = getPickerElements(el);

    const day15 = dayColumn?.querySelectorAll(".picker-item")[14] as HTMLElement;
    day15.click();
    await el.updateComplete;

    assert.equal(dayList.style.transform, "translateY(-560px)", "Day 15 (index 14) should shift list up by 560px");
  });

  test("clicking a month item shifts the list and updates value", async () => {
    const el = await createPicker({ value: "2024-01-15" });
    const { monthColumn, monthList } = getPickerElements(el);

    const june = monthColumn?.querySelectorAll(".picker-item")[5] as HTMLElement;
    june.click();
    await el.updateComplete;

    assert.equal(monthList.style.transform, "translateY(-200px)", "June (index 5) should shift list up by 200px");
    assert.equal(el.value, "2024-06-15");
  });

  test("selected item has selected class and correct transform", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    const { dayColumn, dayList } = getPickerElements(el);

    const selectedDay = dayColumn?.querySelector(".picker-item.selected");
    assert.equal(selectedDay?.textContent?.trim(), "15", "Day 15 should have selected class");
    assert.equal(dayList.style.transform, "translateY(-560px)", "Day 15 should be centered");
  });

  test("change event fires with correct value when day changes", async () => {
    const el = await createPicker({ value: "2024-06-01" });
    let eventDetail: { value: string } | null = null;

    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const { dayColumn } = getPickerElements(el);
    const day20 = dayColumn?.querySelectorAll(".picker-item")[19] as HTMLElement;
    day20.click();
    await el.updateComplete;

    assert.deepEqual(eventDetail, { value: "2024-06-20" });
  });

  test("value attribute initializes correct transforms", async () => {
    const el = await createPicker({ value: "2024-12-25" });
    const { dayList, monthList, yearList } = getPickerElements(el);

    assert.equal(dayList.style.transform, "translateY(-960px)", "Day 25 (offset 24) should shift by 960px");
    assert.equal(monthList.style.transform, "translateY(-440px)", "December (offset 11) should shift by 440px");
    assert.equal(yearList.style.transform, "translateY(-4960px)", "Year 2024 (offset 124) should shift by 4960px");
  });

  test("form integration - FormData contains correct value", async () => {
    const form = document.createElement("form");
    container.appendChild(form);

    const el = document.createElement("metro-date-picker-roller") as MetroDatePickerRoller;
    el.setAttribute("name", "birthdate");
    el.value = "2024-06-15";
    form.appendChild(el);
    await el.updateComplete;

    const formData = new FormData(form);
    assert.equal(formData.get("birthdate"), "2024-06-15");
    form.remove();
  });

  test("formResetCallback resets value to today", async () => {
    const el = await createPicker({ value: "2020-01-01" });
    el.formResetCallback();

    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    assert.equal(el.value, expected);
  });

  test("formDisabledCallback sets disabled state", async () => {
    const el = await createPicker();
    assert.isFalse(el.disabled);
    el.formDisabledCallback(true);
    assert.isTrue(el.disabled);
  });

  test("formDisabledCallback(false) enables the element", async () => {
    const el = await createPicker({ disabled: "" });
    assert.isTrue(el.disabled);
    el.formDisabledCallback(false);
    assert.isFalse(el.disabled);
  });

  test("selection indicator exists in each column", async () => {
    const el = await createPicker();
    const { dayColumn, monthColumn, yearColumn } = getPickerElements(el);

    assert.exists(dayColumn?.querySelector(".selection-indicator"), "Day column should have selection indicator");
    assert.exists(monthColumn?.querySelector(".selection-indicator"), "Month column should have selection indicator");
    assert.exists(yearColumn?.querySelector(".selection-indicator"), "Year column should have selection indicator");
  });

  test("min-year and max-year constrain year range", async () => {
    const el = await createPicker({ "min-year": "2000", "max-year": "2010" });
    const { yearColumn } = getPickerElements(el);

    const yearItems = yearColumn?.querySelectorAll(".picker-item");
    assert.equal(yearItems?.length, 11, "Should have 11 years (2000-2010 inclusive)");
    assert.equal(yearItems?.[0]?.textContent?.trim(), "2000");
    assert.equal(yearItems?.[10]?.textContent?.trim(), "2010");
  });

  test("clicking year item updates value and centers it", async () => {
    const el = await createPicker({ value: "2024-06-15", "min-year": "2020", "max-year": "2030" });
    const { yearColumn, yearList } = getPickerElements(el);

    const year2030 = yearColumn?.querySelectorAll(".picker-item")[10] as HTMLElement;
    year2030.click();
    await el.updateComplete;

    assert.equal(el.value, "2030-06-15");
    assert.equal(yearList.style.transform, "translateY(-400px)", "Year 2030 (offset 10) should shift by 400px");
  });

  test("label is displayed when provided", async () => {
    const el = await createPicker({ label: "Birth Date" });
    const label = el.shadowRoot?.querySelector(".label");
    assert.equal(label?.textContent, "Birth Date");
  });

  test("gradient overlays exist for fade effect", async () => {
    const el = await createPicker();
    const { dayColumn } = getPickerElements(el);

    const styles = getComputedStyle(dayColumn!, "::before");
    assert.notEqual(styles.background, "none", "Should have gradient overlay at top");
  });

  test("clicking first day keeps it centered at top of selection", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    const { dayColumn, dayList } = getPickerElements(el);

    const day1 = dayColumn?.querySelectorAll(".picker-item")[0] as HTMLElement;
    day1.click();
    await el.updateComplete;

    assert.equal(dayList.style.transform, "translateY(0px)", "Day 1 (index 0) should have no shift");
    assert.equal(el.value, "2024-06-01");
  });

  test("clicking last day centers it", async () => {
    const el = await createPicker({ value: "2024-06-01" });
    const { dayColumn, dayList } = getPickerElements(el);

    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    const lastDay = dayItems?.[dayItems.length - 1] as HTMLElement;
    lastDay.click();
    await el.updateComplete;

    assert.equal(el.value, "2024-06-30", "June has 30 days");
    const expectedOffset = (dayItems!.length - 1) * 40;
    assert.equal(dayList.style.transform, `translateY(-${expectedOffset}px)`, "Last day should be centered");
  });

  test("wheel scroll on day column changes day", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    const { dayColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    dayColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "2024-06-16", "Scrolling down should increment day");
  });

  test("wheel scroll up on month column changes month", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    const { monthColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: -100, bubbles: true });
    monthColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "2024-05-15", "Scrolling up should decrement month");
  });

  test("wheel scroll is clamped at minimum", async () => {
    const el = await createPicker({ value: "2024-01-01" });
    const { dayColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: -100, bubbles: true });
    dayColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "2024-01-01", "Day should stay at 1 when scrolling up from minimum");
  });

  test("wheel scroll is clamped at maximum day for month", async () => {
    const el = await createPicker({ value: "2024-06-30" });
    const { dayColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    dayColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "2024-06-30", "Day should stay at 30 (June max) when scrolling down from maximum");
  });

  test("disabled picker ignores wheel events", async () => {
    const el = await createPicker({ value: "2024-06-15", disabled: "" });
    const { dayColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    dayColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "2024-06-15", "Disabled picker should not change value on wheel");
  });

  test("columns have correct width classes", async () => {
    const el = await createPicker();
    const { dayColumn, monthColumn, yearColumn } = getPickerElements(el);

    assert.isTrue(dayColumn?.classList.contains("picker-column--day"));
    assert.isTrue(monthColumn?.classList.contains("picker-column--month"));
    assert.isTrue(yearColumn?.classList.contains("picker-column--year"));
  });

  test("February has correct number of days (non-leap year)", async () => {
    const el = await createPicker({ value: "2023-02-15" });
    const { dayColumn } = getPickerElements(el);

    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    assert.equal(dayItems?.length, 28, "February 2023 should have 28 days");
  });

  test("February has correct number of days (leap year)", async () => {
    const el = await createPicker({ value: "2024-02-15" });
    const { dayColumn } = getPickerElements(el);

    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    assert.equal(dayItems?.length, 29, "February 2024 should have 29 days");
  });

  test("changing month to February clamps day if needed", async () => {
    const el = await createPicker({ value: "2024-01-31" });
    const { monthColumn } = getPickerElements(el);

    const feb = monthColumn?.querySelectorAll(".picker-item")[1] as HTMLElement;
    feb.click();
    await el.updateComplete;

    assert.equal(el.value, "2024-02-29", "Day should clamp to 29 (Feb max in leap year)");
  });

  test("changing from February to month with more days keeps day", async () => {
    const el = await createPicker({ value: "2024-02-15" });
    const { monthColumn } = getPickerElements(el);

    const mar = monthColumn?.querySelectorAll(".picker-item")[2] as HTMLElement;
    mar.click();
    await el.updateComplete;

    assert.equal(el.value, "2024-03-15", "Day should remain 15");
  });

  test("changing year adjusts days for leap year February", async () => {
    const el = await createPicker({ value: "2024-02-29" });
    const { yearColumn } = getPickerElements(el);

    const year2023 = yearColumn?.querySelectorAll(".picker-item")[2023 - 1900] as HTMLElement;
    year2023.click();
    await el.updateComplete;

    assert.equal(el.value, "2023-02-28", "Day should clamp to 28 (Feb max in non-leap year)");
  });

  test("April has 30 days", async () => {
    const el = await createPicker({ value: "2024-04-01" });
    const { dayColumn } = getPickerElements(el);

    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    assert.equal(dayItems?.length, 30, "April should have 30 days");
  });

  test("December has 31 days", async () => {
    const el = await createPicker({ value: "2024-12-01" });
    const { dayColumn } = getPickerElements(el);

    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    assert.equal(dayItems?.length, 31, "December should have 31 days");
  });
});
