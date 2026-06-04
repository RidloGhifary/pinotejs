import type {
  ElementSelector,
  SelectorCandidate,
  SelectorCandidateKind,
  SelectorStrategy,
} from "./types";

type QueryRoot = Document | Element;

const STABLE_DATA_ATTRIBUTES = [
  "data-comment-anchor",
  "data-rcl-id",
  "data-comment-target",
  "data-rcl-target",
  "data-testid",
  "data-test-id",
  "data-cy",
  "data-qa",
  "data-test",
  "data-automation-id",
  "data-analytics-id",
];

const TEXT_HINT_TAGS = new Set([
  "a",
  "button",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "label",
  "legend",
  "option",
  "p",
  "summary",
]);

function getRootDocument(root: QueryRoot): Document {
  return root instanceof Document ? root : root.ownerDocument;
}

function queryAll(root: QueryRoot, selector: string): Element[] {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

function getMatchInfo(root: QueryRoot, selector: string, element: Element) {
  const matches = queryAll(root, selector);
  return {
    matchCount: matches.length,
    unique: matches.length === 1 && matches[0] === element,
  };
}

function escapeAttribute(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\A ");
}

function escapeIdentifier(value: string): string {
  const css = getCssGlobal();

  if (css?.escape) {
    return css.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function getCssGlobal(): { escape?: (value: string) => string } | undefined {
  return typeof CSS === "undefined" ? undefined : CSS;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function getTextHint(
  element: Element,
  maxLength = 80,
): string | undefined {
  const text = normalizeText(element.textContent ?? "");

  if (!text) {
    return undefined;
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function isProbablyGeneratedToken(value: string): boolean {
  if (!value) {
    return true;
  }

  if (/^[a-f0-9]{8,}$/i.test(value)) {
    return true;
  }

  if (/[a-f0-9]{6,}/i.test(value) && /\d/.test(value)) {
    return true;
  }

  if (/^(css|sc|jsx)-[a-z0-9]{5,}$/i.test(value)) {
    return true;
  }

  if (value.length > 32 && /[0-9_-]/.test(value)) {
    return true;
  }

  return false;
}

function getStableClassNames(element: Element): string[] {
  return Array.from(element.classList)
    .filter((className) => !isProbablyGeneratedToken(className))
    .slice(0, 3);
}

function addCandidate(
  root: QueryRoot,
  element: Element,
  candidates: SelectorCandidate[],
  candidate: Omit<SelectorCandidate, "matchCount" | "unique">,
) {
  const { matchCount, unique } = getMatchInfo(
    root,
    candidate.selector,
    element,
  );

  candidates.push({
    ...candidate,
    matchCount,
    unique,
    score: unique ? candidate.score : Math.max(candidate.score - 30, 0),
  });
}

function getElementTag(element: Element): string {
  return element.tagName.toLowerCase();
}

function getNthOfType(element: Element): number {
  const tag = getElementTag(element);
  let index = 1;
  let sibling = element.previousElementSibling;

  while (sibling) {
    if (getElementTag(sibling) === tag) {
      index += 1;
    }

    sibling = sibling.previousElementSibling;
  }

  return index;
}

function getDataAttributeSelector(
  element: Element,
): SelectorCandidate | undefined {
  for (const attribute of STABLE_DATA_ATTRIBUTES) {
    const value = element.getAttribute(attribute);

    if (value) {
      return {
        kind: "data-attribute",
        selector: `[${attribute}="${escapeAttribute(value)}"]`,
        score: 110,
        unique: false,
        matchCount: 0,
        attribute,
        value,
        reason: `${attribute} is intended to be stable across renders.`,
      };
    }
  }

  return undefined;
}

function getHierarchySegment(element: Element): string {
  const dataSelector = getDataAttributeSelector(element)?.selector;

  if (dataSelector) {
    return dataSelector;
  }

  const tag = getElementTag(element);
  const id = element.getAttribute("id");

  if (id && !isProbablyGeneratedToken(id)) {
    return `${tag}[id="${escapeAttribute(id)}"]`;
  }

  const ariaLabel = element.getAttribute("aria-label");

  if (ariaLabel) {
    return `${tag}[aria-label="${escapeAttribute(ariaLabel)}"]`;
  }

  const name = element.getAttribute("name");

  if (name) {
    return `${tag}[name="${escapeAttribute(name)}"]`;
  }

  const classNames = getStableClassNames(element);

  if (classNames.length > 0) {
    return `${tag}.${classNames.map(escapeIdentifier).join(".")}`;
  }

  return tag;
}

function addNthOfTypeWhenNeeded(element: Element, segment: string): string {
  const parent = element.parentElement;

  if (!parent) {
    return segment;
  }

  const matchingSiblings = Array.from(parent.children).filter((sibling) => {
    try {
      return sibling.matches(segment);
    } catch {
      return false;
    }
  });

  if (matchingSiblings.length <= 1) {
    return segment;
  }

  return `${segment}:nth-of-type(${getNthOfType(element)})`;
}

function buildHierarchySelector(element: Element, root: QueryRoot): string {
  const segments: string[] = [];
  const documentElement = getRootDocument(root).documentElement;
  let current: Element | null = element;

  while (current && current !== documentElement) {
    const segment = addNthOfTypeWhenNeeded(
      current,
      getHierarchySegment(current),
    );
    segments.unshift(segment);

    const selector = segments.join(" > ");
    const matchInfo = getMatchInfo(root, selector, element);

    if (matchInfo.unique) {
      return selector;
    }

    current = current.parentElement;
  }

  return segments.join(" > ");
}

function buildDomPathSelector(element: Element): string {
  const segments: string[] = [];
  const documentElement = element.ownerDocument.documentElement;
  let current: Element | null = element;

  while (current && current !== documentElement) {
    const tag = getElementTag(current);
    segments.unshift(`${tag}:nth-of-type(${getNthOfType(current)})`);
    current = current.parentElement;
  }

  return segments.join(" > ");
}

function getBestCandidate(
  candidates: SelectorCandidate[],
): SelectorCandidate | undefined {
  return [...candidates]
    .filter((candidate) => candidate.kind !== "text-hint")
    .sort((a, b) => {
      if (a.unique !== b.unique) {
        return a.unique ? -1 : 1;
      }

      return b.score - a.score;
    })[0];
}

function inferStrategy(kind: SelectorCandidateKind): SelectorStrategy {
  return kind === "text-hint" ? "hierarchy" : kind;
}

export function createElementSelector(
  element: Element,
  root: QueryRoot = element.ownerDocument,
): ElementSelector {
  const candidates: SelectorCandidate[] = [];
  const tag = getElementTag(element);

  const dataCandidate = getDataAttributeSelector(element);

  if (dataCandidate) {
    addCandidate(root, element, candidates, dataCandidate);
  }

  const id = element.getAttribute("id");

  if (id) {
    addCandidate(root, element, candidates, {
      kind: "id",
      selector: `[id="${escapeAttribute(id)}"]`,
      score: isProbablyGeneratedToken(id) ? 70 : 105,
      attribute: "id",
      value: id,
      reason: isProbablyGeneratedToken(id)
        ? "The id is usable, but it looks generated."
        : "The id is usually stable and readable.",
    });
  }

  const ariaLabel = element.getAttribute("aria-label");

  if (ariaLabel) {
    addCandidate(root, element, candidates, {
      kind: "aria-label",
      selector: `[aria-label="${escapeAttribute(ariaLabel)}"]`,
      score: 88,
      attribute: "aria-label",
      value: ariaLabel,
      reason: "ARIA labels are often stable semantic identifiers.",
    });
  }

  const name = element.getAttribute("name");

  if (name) {
    addCandidate(root, element, candidates, {
      kind: "name",
      selector: `${tag}[name="${escapeAttribute(name)}"]`,
      score: 84,
      attribute: "name",
      value: name,
      reason: "Form field names are usually stable.",
    });
  }

  const role = element.getAttribute("role");

  if (role) {
    const selector = ariaLabel
      ? `[role="${escapeAttribute(role)}"][aria-label="${escapeAttribute(ariaLabel)}"]`
      : `[role="${escapeAttribute(role)}"]`;

    addCandidate(root, element, candidates, {
      kind: "role",
      selector,
      score: ariaLabel ? 80 : 58,
      attribute: "role",
      value: role,
      reason: "Role metadata helps identify semantic UI elements.",
    });
  }

  const stableClassNames = getStableClassNames(element);

  if (stableClassNames.length > 0) {
    addCandidate(root, element, candidates, {
      kind: "class",
      selector: `${tag}.${stableClassNames.map(escapeIdentifier).join(".")}`,
      score: 54,
      value: stableClassNames.join(" "),
      reason:
        "Readable class names can be useful when stronger identifiers are missing.",
    });
  }

  const textHint = getTextHint(element);

  if (textHint && TEXT_HINT_TAGS.has(tag)) {
    const textMatches = queryAll(root, tag).filter(
      (match) => getTextHint(match) === textHint,
    );

    candidates.push({
      kind: "text-hint",
      selector: tag,
      score: textMatches.length === 1 && textMatches[0] === element ? 45 : 20,
      unique: textMatches.length === 1 && textMatches[0] === element,
      matchCount: textMatches.length,
      value: textHint,
      reason: "Text is captured as a hint, not the only selector.",
    });
  }

  const hierarchySelector = buildHierarchySelector(element, root);

  addCandidate(root, element, candidates, {
    kind: "hierarchy",
    selector: hierarchySelector,
    score: 42,
    reason:
      "Hierarchy selector combines nearby stable identifiers with structure.",
  });

  const fallback = buildDomPathSelector(element);

  addCandidate(root, element, candidates, {
    kind: "dom-path",
    selector: fallback,
    score: 12,
    reason:
      "DOM path is a final fallback when stable selectors are unavailable.",
  });

  const bestCandidate = getBestCandidate(candidates);

  return {
    primary: bestCandidate?.selector ?? fallback,
    strategy: inferStrategy(bestCandidate?.kind ?? "dom-path"),
    candidates: candidates.sort((a, b) => b.score - a.score),
    fallback,
    textHint,
  };
}

export function resolveElementSelector(
  selector: ElementSelector,
  root: QueryRoot = document,
): Element | null {
  const candidates = [
    {
      kind: selector.strategy,
      selector: selector.primary,
      value: selector.textHint,
    },
    ...selector.candidates,
    {
      kind: "dom-path" as const,
      selector: selector.fallback,
      value: selector.textHint,
    },
  ];

  for (const candidate of candidates) {
    const matches = queryAll(root, candidate.selector);

    if (matches.length === 0) {
      continue;
    }

    if (candidate.kind === "text-hint" && candidate.value) {
      const matchByText = matches.find(
        (match) => getTextHint(match) === candidate.value,
      );

      if (matchByText) {
        return matchByText;
      }
    }

    if (selector.textHint) {
      const matchByText = matches.find(
        (match) => getTextHint(match) === selector.textHint,
      );

      if (matchByText) {
        return matchByText;
      }
    }

    return matches[0] ?? null;
  }

  return null;
}
