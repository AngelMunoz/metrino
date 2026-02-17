import { assert } from "chai";
import "./calendar.ts";
import { MetroCalendar } from "./calendar.ts";

suite("metro-calendar", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createCalendar(html: string): Promise<MetroCalendar> {
    container.innerHTML = html;
    const el = container.querySelector("metro-calendar") as MetroCalendar;
    await el.updateComplete;
    return el;
  }

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroCalendar);
    });

    test("renders calendar header", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const header = el.shadowRoot?.querySelector(".calendar-header");
      assert.isNotNull(header);
    });

    test("renders month/year in header", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const monthYear = el.shadowRoot?.querySelector(".month-year");
      assert.include(monthYear?.textContent, "June");
      assert.include(monthYear?.textContent, "2024");
    });

    test("renders weekday headers", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const weekdays = el.shadowRoot?.querySelectorAll(".weekday");
      assert.equal(weekdays?.length, 7);
    });

    test("renders day grid", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const daysGrid = el.shadowRoot?.querySelector(".days-grid");
      assert.isNotNull(daysGrid);
    });

    test("renders navigation buttons", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const navBtns = el.shadowRoot?.querySelectorAll(".nav-btn");
      assert.equal(navBtns?.length, 2);
    });

    test("renders days as buttons", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const days = el.shadowRoot?.querySelectorAll(".day");
      assert.equal(days?.length, 42);
    });

    test("day buttons have aria-label", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const day = el.shadowRoot?.querySelector(".day");
      assert.isNotNull(day?.getAttribute("aria-label"));
    });
  });

  suite("navigation", () => {
    test("next button advances month and updates DOM", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const initialMonth = el.shadowRoot?.querySelector(".month-year")?.textContent;
      
      const nextBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[1] as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      
      const newMonth = el.shadowRoot?.querySelector(".month-year")?.textContent;
      assert.notEqual(newMonth, initialMonth);
      assert.include(newMonth, "July");
    });

    test("prev button goes to previous month and updates DOM", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const initialMonth = el.shadowRoot?.querySelector(".month-year")?.textContent;
      
      const prevBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[0] as HTMLElement;
      prevBtn?.click();
      await el.updateComplete;
      
      const newMonth = el.shadowRoot?.querySelector(".month-year")?.textContent;
      assert.notEqual(newMonth, initialMonth);
      assert.include(newMonth, "May");
    });

    test("next button wraps year at December", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-12-15"></metro-calendar>`);
      
      const nextBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[1] as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      
      const monthYear = el.shadowRoot?.querySelector(".month-year")?.textContent;
      assert.include(monthYear, "January");
      assert.include(monthYear, "2025");
    });

    test("prev button wraps year at January", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-01-15"></metro-calendar>`);
      
      const prevBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[0] as HTMLElement;
      prevBtn?.click();
      await el.updateComplete;
      
      const monthYear = el.shadowRoot?.querySelector(".month-year")?.textContent;
      assert.include(monthYear, "December");
      assert.include(monthYear, "2023");
    });
  });

  suite("selection", () => {
    test("clicking day sets selectedDate property", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      
      const day = el.shadowRoot?.querySelector(".day:not(.other-month)") as HTMLElement;
      day?.click();
      await el.updateComplete;
      
      assert.isNotNull(el.selectedDate);
      assert.include(el.selectedDate, "2024-06");
    });

    test("selected date has selected class", async () => {
      const el = await createCalendar(`<metro-calendar selected-date="2024-06-15" display-date="2024-06-01"></metro-calendar>`);
      
      const selected = el.shadowRoot?.querySelector(".day.selected");
      assert.isNotNull(selected);
      assert.equal(selected?.textContent?.trim(), "15");
    });

    test("selected date reflects to attribute", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      
      const day = el.shadowRoot?.querySelector(".day:not(.other-month)") as HTMLElement;
      day?.click();
      await el.updateComplete;
      
      assert.equal(el.getAttribute("selected-date"), el.selectedDate);
    });

    test("clicking different day updates selection in DOM", async () => {
      const el = await createCalendar(`<metro-calendar selected-date="2024-06-15" display-date="2024-06-15"></metro-calendar>`);
      
      const days = el.shadowRoot?.querySelectorAll(".day:not(.other-month)");
      const day10 = Array.from(days || []).find(d => d.textContent?.trim() === "10");
      
      (day10 as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.equal(el.shadowRoot?.querySelectorAll(".day.selected").length, 1);
      assert.equal(el.shadowRoot?.querySelector(".day.selected")?.textContent?.trim(), "10");
    });
  });

  suite("events", () => {
    test("dispatches dateselected event with correct detail", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      
      let eventDetail: { date: Date; value: string } | undefined;
      el.addEventListener("dateselected", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const day = el.shadowRoot?.querySelector(".day:not(.other-month)") as HTMLElement;
      day?.click();
      
      assert.isNotNull(eventDetail?.date);
      assert.isNotNull(eventDetail?.value);
      assert.include(eventDetail?.value, "2024-06");
    });

    test("dispatches displaymonthchanged event on navigation with correct detail", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      
      let eventDetail: { year: number; month: number } | undefined;
      el.addEventListener("displaymonthchanged", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const nextBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[1] as HTMLElement;
      nextBtn?.click();
      
      assert.equal(eventDetail?.year, 2024);
      assert.equal(eventDetail?.month, 6);
    });
  });

  suite("today highlighting", () => {
    test("highlights today with today class", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const today = el.shadowRoot?.querySelector(".day.today");
      assert.isNotNull(today);
    });

    test("today has correct date", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      const today = el.shadowRoot?.querySelector(".day.today");
      const todayDate = new Date().getDate().toString();
      assert.equal(today?.textContent?.trim(), todayDate);
    });
  });

  suite("other month days", () => {
    test("renders previous month days with other-month class", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      const otherMonth = el.shadowRoot?.querySelectorAll(".day.other-month");
      assert.isAtLeast(otherMonth?.length || 0, 1);
    });

    test("clicking other-month day selects that date", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15"></metro-calendar>`);
      
      let selectedValue = "";
      el.addEventListener("dateselected", ((e: CustomEvent) => {
        selectedValue = e.detail.value;
      }) as EventListener);
      
      const otherMonthDay = el.shadowRoot?.querySelector(".day.other-month") as HTMLElement;
      otherMonthDay?.click();
      
      assert.isNotNull(selectedValue);
      assert.notInclude(selectedValue, "2024-06");
    });
  });

  suite("min/max date restrictions", () => {
    test("days before minDate have disabled class", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" min-date="2024-06-10"></metro-calendar>`);
      
      const days = el.shadowRoot?.querySelectorAll(".day:not(.other-month)");
      const day5 = Array.from(days || []).find(d => d.textContent?.trim() === "5");
      
      assert.isTrue(day5?.classList.contains("disabled"));
    });

    test("days after maxDate have disabled class", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" max-date="2024-06-20"></metro-calendar>`);
      
      const days = el.shadowRoot?.querySelectorAll(".day:not(.other-month)");
      const day25 = Array.from(days || []).find(d => d.textContent?.trim() === "25");
      
      assert.isTrue(day25?.classList.contains("disabled"));
    });

    test("disabled days have disabled attribute", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" min-date="2024-06-10"></metro-calendar>`);
      
      const days = el.shadowRoot?.querySelectorAll(".day:not(.other-month)");
      const day5 = Array.from(days || []).find(d => d.textContent?.trim() === "5");
      
      assert.isTrue((day5 as HTMLButtonElement)?.disabled);
    });

    test("clicking disabled day does not dispatch dateselected", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" min-date="2024-06-10"></metro-calendar>`);
      
      let fired = false;
      el.addEventListener("dateselected", () => { fired = true; });
      
      const days = el.shadowRoot?.querySelectorAll(".day:not(.other-month)");
      const day5 = Array.from(days || []).find(d => d.textContent?.trim() === "5");
      
      (day5 as HTMLElement)?.click();
      
      assert.isFalse(fired);
    });

    test("prev button is disabled when all months before minDate", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" min-date="2024-06-01"></metro-calendar>`);
      
      const prevBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[0] as HTMLButtonElement;
      assert.isTrue(prevBtn?.disabled);
    });

    test("next button is disabled when all months after maxDate", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-15" max-date="2024-06-30"></metro-calendar>`);
      
      const nextBtn = el.shadowRoot?.querySelectorAll(".nav-btn")[1] as HTMLButtonElement;
      assert.isTrue(nextBtn?.disabled);
    });
  });

  suite("firstDayOfWeek", () => {
    test("defaults to Sunday (0)", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      assert.equal(el.firstDayOfWeek, 0);
    });

    test("firstDayOfWeek=1 starts week on Monday", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-01" first-day-of-week="1"></metro-calendar>`);
      
      const weekdays = el.shadowRoot?.querySelectorAll(".weekday");
      assert.equal(weekdays?.[0]?.textContent, "Mo");
    });

    test("firstDayOfWeek=6 starts week on Saturday", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-06-01" first-day-of-week="6"></metro-calendar>`);
      
      const weekdays = el.shadowRoot?.querySelectorAll(".weekday");
      assert.equal(weekdays?.[0]?.textContent, "Sa");
    });
  });

  suite("display-date attribute", () => {
    test("respects display-date attribute", async () => {
      const el = await createCalendar(`<metro-calendar display-date="2024-12-25"></metro-calendar>`);
      
      const monthYear = el.shadowRoot?.querySelector(".month-year")?.textContent;
      assert.include(monthYear, "December");
      assert.include(monthYear, "2024");
    });

    test("displayDate property reflects to attribute", async () => {
      const el = await createCalendar("<metro-calendar></metro-calendar>");
      el.displayDate = "2024-03-15";
      await el.updateComplete;
      
      assert.equal(el.getAttribute("display-date"), "2024-03-15");
    });
  });
});
