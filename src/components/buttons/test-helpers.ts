import "./dropdown-button.ts";
import { MetroDropdownButton } from "./dropdown-button.ts";

export async function createButton(
  label: string = "Menu",
  content: string = "",
): Promise<MetroDropdownButton> {
  const el = document.createElement("metro-dropdown-button") as MetroDropdownButton;
  el.label = label;
  if (content) {
    el.innerHTML = content;
  }
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
