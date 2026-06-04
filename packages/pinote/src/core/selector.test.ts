import { describe, expect, it } from "vitest";
import { captureCommentTarget } from "./captureTarget";
import { createElementSelector, resolveElementSelector } from "./selector";

describe("comment target selectors", () => {
  it("prefers stable data attributes", () => {
    document.body.innerHTML = `
      <main>
        <button data-testid="save-button" class="Button_root__ab12">Save</button>
      </main>
    `;

    const button = document.querySelector("button")!;
    const selector = createElementSelector(button);

    expect(selector.primary).toBe('[data-testid="save-button"]');
    expect(selector.strategy).toBe("data-attribute");
  });

  it("creates a hierarchy fallback when stable identifiers are missing", () => {
    document.body.innerHTML = `
      <section class="settings-panel">
        <div>
          <button>Cancel</button>
          <button>Save changes</button>
        </div>
      </section>
    `;

    const button = document.querySelectorAll("button")[1]!;
    const selector = createElementSelector(button);

    expect(selector.primary).toContain("button");
    expect(selector.fallback).toContain("button:nth-of-type(2)");
  });

  it("resolves captured targets back to an element", () => {
    document.body.innerHTML = `
      <article data-comment-target="plan-card">
        <h2>Launch plan</h2>
      </article>
    `;

    const article = document.querySelector("article")!;
    const target = captureCommentTarget(article);

    expect(resolveElementSelector(target.selector)).toBe(article);
  });

  it("captures page and position metadata", () => {
    document.body.innerHTML = `<button aria-label="Add comment">Add</button>`;

    const target = captureCommentTarget(document.querySelector("button")!);

    expect(target.version).toBe(1);
    expect(target.page.path).toBe(window.location.pathname);
    expect(target.position.viewport.width).toBeGreaterThan(0);
    expect(target.element.ariaLabel).toBe("Add comment");
  });
});
