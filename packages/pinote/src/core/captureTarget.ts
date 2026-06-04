import { getPageContext } from "./pageContext";
import { getTargetPosition } from "./position";
import { createElementSelector, getTextHint } from "./selector";
import type { CommentTarget, ElementMetadata } from "./types";

export interface CaptureCommentTargetOptions {
  root?: Document | Element;
  clientX?: number;
  clientY?: number;
}

const METADATA_ATTRIBUTES = [
  "data-comment-target",
  "data-rcl-target",
  "data-testid",
  "data-test-id",
  "data-cy",
  "data-qa",
  "data-test",
  "data-automation-id",
  "data-analytics-id",
  "href",
  "type",
];

function createTargetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `target_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getElementMetadata(element: Element): ElementMetadata {
  const attributes: Record<string, string> = {};

  for (const attribute of METADATA_ATTRIBUTES) {
    const value = element.getAttribute(attribute);

    if (value) {
      attributes[attribute] = value;
    }
  }

  return {
    tagName: element.tagName.toLowerCase(),
    id: element.getAttribute("id") ?? undefined,
    role: element.getAttribute("role") ?? undefined,
    ariaLabel: element.getAttribute("aria-label") ?? undefined,
    name: element.getAttribute("name") ?? undefined,
    textSnippet: getTextHint(element),
    classNames: Array.from(element.classList),
    attributes,
  };
}

export function captureCommentTarget(
  element: Element,
  options: CaptureCommentTargetOptions = {},
): CommentTarget {
  const root = options.root ?? element.ownerDocument;
  const capturedAt = new Date().toISOString();

  return {
    version: 1,
    id: createTargetId(),
    capturedAt,
    page: {
      ...getPageContext(element.ownerDocument),
      capturedAt,
    },
    selector: createElementSelector(element, root),
    position: getTargetPosition(element, options.clientX, options.clientY),
    element: getElementMetadata(element),
  };
}
