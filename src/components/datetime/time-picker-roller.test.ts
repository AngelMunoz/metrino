import { assert } from "chai";
import "./time-picker-roller.ts";
import { MetroTimePickerRoller } from "./time-picker-roller.ts";

suite("metro-time-picker-roller", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPicker(attrs: Record<string, string> = {}): Promise<MetroTimePickerRoller> {
    const el = document.createElement("metro-time-picker-roller") as MetroTimePickerRoller;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  function getPickerElements(el: MetroTimePickerRoller) {
    const columns = el.shadowRoot?.querySelectorAll(".picker-column");
    return {
      hourColumn: columns?.[0],
      minuteColumn: columns?.[1],
      periodColumn: columns?.[2],
      hourList: columns?.[0]?.querySelector(".picker-list") as HTMLElement,
      minuteList: columns?.[1]?.querySelector(".picker-list") as HTMLElement,
      periodList: columns?.[2]?.querySelector(".picker-list") as HTMLElement,
    };
  }

  test("clicking an hour item shifts the list to center it (12-hour format)", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { hourColumn, hourList } = getPickerElements(el);

    const hour6 = hourColumn?.querySelectorAll(".picker-item")[6] as HTMLElement;
    hour6.click();
    await el.updateComplete;

    assert.equal(hourList.style.transform, "translateY(-240px)", "Hour 6 (index 6) should shift list up by 240px");
  });

  test("clicking a minute item shifts the list and updates value", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { minuteColumn, minuteList } = getPickerElements(el);

    const minute30 = minuteColumn?.querySelectorAll(".picker-item")[30] as HTMLElement;
    minute30.click();
    await el.updateComplete;

    assert.equal(minuteList.style.transform, "translateY(-1200px)", "Minute 30 should shift list up by 1200px");
    assert.equal(el.value, "12:30 PM");
  });

  test("clicking period toggles AM/PM and centers it", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { periodColumn, periodList } = getPickerElements(el);

    const am = periodColumn?.querySelectorAll(".picker-item")[0] as HTMLElement;
    am.click();
    await el.updateComplete;

    assert.equal(el.value, "12:00 AM");
    assert.equal(periodList.style.transform, "translateY(0px)", "AM (index 0) should have no shift");
  });

  test("selected items have selected class and correct transforms", async () => {
    const el = await createPicker({ value: "3:45 PM" });
    const { hourColumn, minuteColumn, periodColumn, hourList, minuteList, periodList } = getPickerElements(el);

    const selectedHour = hourColumn?.querySelector(".picker-item.selected");
    const selectedMinute = minuteColumn?.querySelector(".picker-item.selected");
    const selectedPeriod = periodColumn?.querySelector(".picker-item.selected");

    assert.equal(selectedHour?.textContent?.trim(), "3");
    assert.equal(selectedMinute?.textContent?.trim(), "45");
    assert.equal(selectedPeriod?.textContent?.trim(), "PM");

    assert.equal(hourList.style.transform, "translateY(-120px)", "Hour 3 (index 3 in 12h array) should shift by 120px");
    assert.equal(minuteList.style.transform, "translateY(-1800px)", "Minute 45 should shift by 1800px");
    assert.equal(periodList.style.transform, "translateY(-40px)", "PM (index 1) should shift by 40px");
  });

  test("24-hour format hides period column", async () => {
    const el = await createPicker({ "hour-format": "24", value: "14:30" });
    const columns = el.shadowRoot?.querySelectorAll(".picker-column");

    assert.equal(columns?.length, 2, "Should only have hour and minute columns");
    assert.equal(el.value, "14:30");
  });

  test("24-hour format centers correct hour", async () => {
    const el = await createPicker({ "hour-format": "24", value: "14:30" });
    const { hourList } = getPickerElements(el);

    assert.equal(hourList.style.transform, "translateY(-560px)", "Hour 14 (index 14) should shift by 560px");
  });

  test("change event fires with correct value", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    let eventDetail: { value: string } | null = null;

    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const { minuteColumn } = getPickerElements(el);
    const minute15 = minuteColumn?.querySelectorAll(".picker-item")[15] as HTMLElement;
    minute15.click();
    await el.updateComplete;

    assert.deepEqual(eventDetail, { value: "12:15 PM" });
  });

  test("form integration - FormData contains correct value", async () => {
    const form = document.createElement("form");
    container.appendChild(form);

    const el = document.createElement("metro-time-picker-roller") as MetroTimePickerRoller;
    el.setAttribute("name", "startTime");
    el.value = "09:30 AM";
    form.appendChild(el);
    await el.updateComplete;

    const formData = new FormData(form);
    assert.equal(formData.get("startTime"), "09:30 AM");
    form.remove();
  });

  test("formResetCallback resets value to current time", async () => {
    const el = await createPicker({ value: "01:00 AM" });
    el.formResetCallback();

    const now = new Date();
    const hour = String(now.getHours() % 12 || 12);
    const minute = String(now.getMinutes()).padStart(2, "0");
    const period = now.getHours() >= 12 ? "PM" : "AM";
    const expected = `${hour}:${minute} ${period}`;

    assert.equal(el.value, expected);
  });

  test("formDisabledCallback sets disabled state", async () => {
    const el = await createPicker();
    el.formDisabledCallback(true);
    assert.isTrue(el.disabled);
  });

  test("formDisabledCallback(false) enables the element", async () => {
    const el = await createPicker({ disabled: "" });
    el.formDisabledCallback(false);
    assert.isFalse(el.disabled);
  });

  test("selection indicator exists in each column", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { hourColumn, minuteColumn, periodColumn } = getPickerElements(el);

    assert.exists(hourColumn?.querySelector(".selection-indicator"));
    assert.exists(minuteColumn?.querySelector(".selection-indicator"));
    assert.exists(periodColumn?.querySelector(".selection-indicator"));
  });

  test("separator colon is displayed between hour and minute", async () => {
    const el = await createPicker();
    const separator = el.shadowRoot?.querySelector(".separator");
    assert.equal(separator?.textContent, ":");
  });

  test("label is displayed when provided", async () => {
    const el = await createPicker({ label: "Start Time" });
    const label = el.shadowRoot?.querySelector(".label");
    assert.equal(label?.textContent, "Start Time");
  });

  test("value attribute initializes correct transforms", async () => {
    const el = await createPicker({ value: "6:30 AM" });
    const { hourList, minuteList, periodList } = getPickerElements(el);

    assert.equal(hourList.style.transform, "translateY(-240px)", "Hour 6 (index 6) should shift by 240px");
    assert.equal(minuteList.style.transform, "translateY(-1200px)", "Minute 30 should shift by 1200px");
    assert.equal(periodList.style.transform, "translateY(0px)", "AM (index 0) should have no shift");
  });

  test("gradient overlays exist for fade effect", async () => {
    const el = await createPicker();
    const { hourColumn } = getPickerElements(el);

    const styles = getComputedStyle(hourColumn!, "::before");
    assert.notEqual(styles.background, "none", "Should have gradient overlay");
  });

  test("clicking first hour (12) centers it", async () => {
    const el = await createPicker({ value: "6:00 PM" });
    const { hourColumn, hourList } = getPickerElements(el);

    const hour12 = hourColumn?.querySelectorAll(".picker-item")[0] as HTMLElement;
    hour12.click();
    await el.updateComplete;

    assert.equal(hourList.style.transform, "translateY(0px)", "Hour 12 (index 0) should have no shift");
    assert.equal(el.value, "12:00 PM");
  });

  test("clicking minute 0 centers it", async () => {
    const el = await createPicker({ value: "6:30 PM" });
    const { minuteColumn, minuteList } = getPickerElements(el);

    const minute0 = minuteColumn?.querySelectorAll(".picker-item")[0] as HTMLElement;
    minute0.click();
    await el.updateComplete;

    assert.equal(minuteList.style.transform, "translateY(0px)", "Minute 0 should have no shift");
    assert.equal(el.value, "6:00 PM");
  });

  test("clicking minute 59 centers it", async () => {
    const el = await createPicker({ value: "6:00 PM" });
    const { minuteColumn, minuteList } = getPickerElements(el);

    const minute59 = minuteColumn?.querySelectorAll(".picker-item")[59] as HTMLElement;
    minute59.click();
    await el.updateComplete;

    assert.equal(minuteList.style.transform, "translateY(-2360px)", "Minute 59 should shift by 2360px");
    assert.equal(el.value, "6:59 PM");
  });

  test("24-hour format clicking hour 0 centers it", async () => {
    const el = await createPicker({ "hour-format": "24", value: "14:00" });
    const { hourColumn, hourList } = getPickerElements(el);

    const hour0 = hourColumn?.querySelectorAll(".picker-item")[0] as HTMLElement;
    hour0.click();
    await el.updateComplete;

    assert.equal(hourList.style.transform, "translateY(0px)", "Hour 00 (index 0) should have no shift");
    assert.equal(el.value, "00:00");
  });

  test("24-hour format clicking hour 23 centers it", async () => {
    const el = await createPicker({ "hour-format": "24", value: "00:00" });
    const { hourColumn, hourList } = getPickerElements(el);

    const hour23 = hourColumn?.querySelectorAll(".picker-item")[23] as HTMLElement;
    hour23.click();
    await el.updateComplete;

    assert.equal(hourList.style.transform, "translateY(-920px)", "Hour 23 (index 23) should shift by 920px");
    assert.equal(el.value, "23:00");
  });

  test("wheel scroll on minute column changes minute", async () => {
    const el = await createPicker({ value: "12:30 PM" });
    const { minuteColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    minuteColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "12:31 PM", "Scrolling down should increment minute");
  });

  test("wheel scroll up on hour column changes hour", async () => {
    const el = await createPicker({ value: "6:00 PM" });
    const { hourColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: -100, bubbles: true });
    hourColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "5:00 PM", "Scrolling up should decrement hour");
  });

  test("wheel scroll is clamped at minimum minute", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { minuteColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: -100, bubbles: true });
    minuteColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "12:00 PM", "Minute should stay at 0 when scrolling up from minimum");
  });

  test("wheel scroll is clamped at maximum minute", async () => {
    const el = await createPicker({ value: "12:59 PM" });
    const { minuteColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    minuteColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "12:59 PM", "Minute should stay at 59 when scrolling down from maximum");
  });

  test("wheel scroll on period column toggles AM/PM", async () => {
    const el = await createPicker({ value: "12:00 PM" });
    const { periodColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: -100, bubbles: true });
    periodColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "12:00 AM", "Scrolling up should toggle from PM to AM");
  });

  test("disabled picker ignores wheel events", async () => {
    const el = await createPicker({ value: "12:30 PM", disabled: "" });
    const { minuteColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    minuteColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "12:30 PM", "Disabled picker should not change value on wheel");
  });

  test("columns have correct width classes", async () => {
    const el = await createPicker();
    const { hourColumn, minuteColumn, periodColumn } = getPickerElements(el);

    assert.isTrue(hourColumn?.classList.contains("picker-column--hour"));
    assert.isTrue(minuteColumn?.classList.contains("picker-column--minute"));
    assert.isTrue(periodColumn?.classList.contains("picker-column--period"));
  });

  test("24-hour format wheel scroll works correctly", async () => {
    const el = await createPicker({ "hour-format": "24", value: "14:00" });
    const { hourColumn } = getPickerElements(el);

    const wheelEvent = new WheelEvent("wheel", { deltaY: 100, bubbles: true });
    hourColumn?.dispatchEvent(wheelEvent);
    await el.updateComplete;

    assert.equal(el.value, "15:00", "Scrolling down should increment hour in 24h format");
  });
});
