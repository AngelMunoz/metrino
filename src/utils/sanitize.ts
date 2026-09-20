const ALLOWED_ELEMENTS = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DIV",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "I",
  "LI",
  "OL",
  "P",
  "PRE",
  "S",
  "SPAN",
  "STRIKE",
  "STRONG",
  "U",
  "UL",
]);

const DROPPED_ELEMENTS = new Set([
  "BASE",
  "EMBED",
  "FRAME",
  "IFRAME",
  "LINK",
  "MATH",
  "META",
  "OBJECT",
  "SCRIPT",
  "STYLE",
  "SVG",
  "TEMPLATE",
]);

const GLOBAL_ATTRIBUTES = new Set(["title"]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  A: new Set(["href", "target"]),
};

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Returns true when a URL is safe to keep in sanitized markup. Relative URLs
 * and the http, https, mailto and tel schemes are allowed; executable schemes
 * such as `javascript:` are rejected.
 * @param value - The URL value
 * @returns boolean
 */
export function isSafeUrl(value: string): boolean {
  try {
    return SAFE_URL_SCHEMES.has(new URL(value, document.baseURI).protocol);
  } catch {
    return false;
  }
}

/**
 * Parses an HTML string into a document fragment that only contains the
 * supported text-formatting elements and safe attributes. Unknown elements
 * are unwrapped, executable elements are dropped, every event handler
 * attribute is removed, and links keep their href only when the scheme is
 * allowed. The fragment is built with DOM APIs, never re-serialized and
 * re-parsed, so it is safe to insert directly and compatible with Trusted
 * Types enforcement.
 * @param html - The HTML string to sanitize
 * @returns DocumentFragment
 */
export function sanitizeHtmlFragment(html: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (!html) return fragment;

  const source = new DOMParser().parseFromString(html, "text/html");
  appendSanitized(source.body, fragment);
  return fragment;
}

function appendSanitized(source: Node, target: Node): void {
  source.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(node.nodeValue ?? ""));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as Element;
    const tagName = element.tagName.toUpperCase();

    if (DROPPED_ELEMENTS.has(tagName)) return;

    if (!ALLOWED_ELEMENTS.has(tagName)) {
      appendSanitized(element, target);
      return;
    }

    const clean = document.createElement(tagName.toLowerCase());
    copySafeAttributes(element, clean, tagName);
    target.appendChild(clean);
    appendSanitized(element, clean);
  });
}

function copySafeAttributes(source: Element, target: Element, tagName: string): void {
  const allowed = ALLOWED_ATTRIBUTES[tagName];

  for (const attribute of Array.from(source.attributes)) {
    const name = attribute.name.toLowerCase();
    if (name.startsWith("on")) continue;
    if (!GLOBAL_ATTRIBUTES.has(name) && !allowed?.has(name)) continue;
    if (name === "href" && !isSafeUrl(attribute.value)) continue;

    if (name === "target") {
      if (attribute.value !== "_blank") continue;
      target.setAttribute("target", "_blank");
      target.setAttribute("rel", "noopener noreferrer");
      continue;
    }

    target.setAttribute(name, attribute.value);
  }
}
