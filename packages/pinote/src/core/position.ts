import type { TargetPosition, TargetRect } from "./types";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function toTargetRect(rect: DOMRect | ClientRect): TargetRect {
  return {
    x: round(rect.left),
    y: round(rect.top),
    top: round(rect.top),
    right: round(rect.right),
    bottom: round(rect.bottom),
    left: round(rect.left),
    width: round(rect.width),
    height: round(rect.height),
  };
}

function getOwnerWindow(element: Element): Window {
  return element.ownerDocument.defaultView ?? window;
}

export function getTargetPosition(
  element: Element,
  clientX?: number,
  clientY?: number,
): TargetPosition {
  const ownerWindow = getOwnerWindow(element);
  const viewportRect = toTargetRect(element.getBoundingClientRect());
  const scrollX = round(ownerWindow.scrollX);
  const scrollY = round(ownerWindow.scrollY);

  let relativeX: number | undefined;
  let relativeY: number | undefined;

  if (typeof clientX === "number" && typeof clientY === "number" && viewportRect.width > 0 && viewportRect.height > 0) {
    relativeX = clamp((clientX - viewportRect.x) / viewportRect.width, 0, 1);
    relativeY = clamp((clientY - viewportRect.y) / viewportRect.height, 0, 1);
  }

  return {
    rect: viewportRect,
    pageRect: {
      ...viewportRect,
      x: round(viewportRect.x + scrollX),
      y: round(viewportRect.y + scrollY),
      top: round(viewportRect.top + scrollY),
      right: round(viewportRect.right + scrollX),
      bottom: round(viewportRect.bottom + scrollY),
      left: round(viewportRect.left + scrollX),
    },
    viewport: {
      width: round(ownerWindow.innerWidth),
      height: round(ownerWindow.innerHeight),
    },
    scroll: {
      x: scrollX,
      y: scrollY,
    },
    relativeX,
    relativeY,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
