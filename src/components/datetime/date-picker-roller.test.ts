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

  test("renders picker container", async () => {
    const el = await createPicker();
    const pickerContainer = el.shadowRoot?.querySelector(".picker-container");
    assert.exists(pickerContainer, "picker-container should exist");
  });

  test("renders three picker columns", async () => {
    const el = await createPicker();
    const columns = el.shadowRoot?.querySelectorAll(".picker-column");
    assert.equal(columns?.length, 3, "should have 3 picker columns");
  });

  test("renders day column with 31 days", async () => {
    const el = await createPicker();
    const dayColumn = el.shadowRoot?.querySelectorAll(".picker-column")[0];
    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    assert.equal(dayItems?.length, 31, "day column should have 31 items");
  });

  test("renders month column with 12 months", async () => {
    const el = await createPicker();
    const monthColumn = el.shadowRoot?.querySelectorAll(".picker-column")[1];
    const monthItems = monthColumn?.querySelectorAll(".picker-item");
    assert.equal(monthItems?.length, 12, "month column should have 12 items");
  });

  test("renders year column within range", async () => {
    const el = await createPicker();
    const yearColumn = el.shadowRoot?.querySelectorAll(".picker-column")[2];
    const yearItems = yearColumn?.querySelectorAll(".picker-item");
    const currentYear = new Date().getFullYear();
    const expectedYears = currentYear + 10 - 1900 + 1;
    assert.equal(yearItems?.length, expectedYears, "year column should have correct number of years");
  });

  test("label is displayed when provided", async () => {
    const el = await createPicker({ label: "Select Date" });
    const label = el.shadowRoot?.querySelector(".label");
    assert.equal(label?.textContent, "Select Date");
  });

  test("value attribute sets initial value", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    assert.equal(el.value, "2024-06-15");
  });

  test("clicking day item updates value", async () => {
    const el = await createPicker({ value: "2024-06-01" });
    await el.updateComplete;

    const dayColumn = el.shadowRoot?.querySelectorAll(".picker-column")[0];
    const dayItems = dayColumn?.querySelectorAll(".picker-item");

    const day15 = dayItems?.[14] as HTMLElement;
    day15.click();
    await el.updateComplete;

    assert.equal(el.value, "2024-06-15");
  });

  test("clicking month item updates value", async () => {
    const el = await createPicker({ value: "2024-01-15" });
    await el.updateComplete;

    const monthColumn = el.shadowRoot?.querySelectorAll(".picker-column")[1];
    const monthItems = monthColumn?.querySelectorAll(".picker-item");

    const june = monthItems?.[5] as HTMLElement;
    june.click();
    await el.updateComplete;

    assert.equal(el.value, "2024-06-15");
  });

  test("clicking year item updates value", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    await el.updateComplete;

    const yearColumn = el.shadowRoot?.querySelectorAll(".picker-column")[2];
    const yearItems = yearColumn?.querySelectorAll(".picker-item");

    const year2025 = yearItems?.[2025 - 1900] as HTMLElement;
    year2025.click();
    await el.updateComplete;

    assert.equal(el.value, "2025-06-15");
  });

  test("selected item has selected class", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    await el.updateComplete;

    const dayColumn = el.shadowRoot?.querySelectorAll(".picker-column")[0];
    const selectedDay = dayColumn?.querySelector(".picker-item.selected");
    assert.equal(selectedDay?.textContent?.trim(), "15");
  });

  test("integrates with form", async () => {
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

  test("disabled attribute is stored", async () => {
    const el = await createPicker({ disabled: "" });
    assert.isTrue(el.disabled);
  });

  test("required attribute is stored", async () => {
    const el = await createPicker({ required: "" });
    assert.isTrue(el.required);
  });

  test("min-year and max-year attributes work", async () => {
    const el = await createPicker({ "min-year": "2000", "max-year": "2030" });
    assert.equal(el.minYear, 2000);
    assert.equal(el.maxYear, 2030);
  });

  test("picker list transform updates on value change", async () => {
    const el = await createPicker({ value: "2024-06-15" });
    await el.updateComplete;

    const dayColumn = el.shadowRoot?.querySelectorAll(".picker-column")[0];
    const dayList = dayColumn?.querySelector(".picker-list") as HTMLElement;

    const transform = dayList.style.transform;
    assert.include(transform, "calc(-50% +");
    assert.include(transform, "560px");
  });

  test("change event is dispatched on selection", async () => {
    const el = await createPicker({ value: "2024-06-01" });
    await el.updateComplete;

    let changedValue: string | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      changedValue = e.detail.value;
    }) as EventListener);

    const dayColumn = el.shadowRoot?.querySelectorAll(".picker-column")[0];
    const dayItems = dayColumn?.querySelectorAll(".picker-item");
    const day15 = dayItems?.[14] as HTMLElement;
    day15.click();
    await el.updateComplete;

    assert.equal(changedValue, "2024-06-15");
  });

  test("formResetCallback resets to today", async () => {
    const el = await createPicker({ value: "2020-01-01" });
    await el.updateComplete;

    el.formResetCallback();

    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    assert.equal(el.value, expected);
  });
});
