import { describe, expect, it } from "vitest";
import { createLocalStorageAdapter } from "./localStorageAdapter";

describe("createLocalStorageAdapter", () => {
  it("returns an empty list for corrupted storage data", () => {
    window.localStorage.setItem(
      "react-comment-library:corrupted:v1",
      "{bad json",
    );

    const adapter = createLocalStorageAdapter({ storageKey: "corrupted" });

    expect(adapter.load()).toEqual([]);
  });

  it("scopes data by storage key", () => {
    window.localStorage.setItem(
      "react-comment-library:other-project:v1",
      JSON.stringify({ version: 1, comments: [] }),
    );

    const adapter = createLocalStorageAdapter({ storageKey: "provider-test" });

    expect(adapter.getStorageKey()).toBe(
      "react-comment-library:provider-test:v1",
    );
    expect(adapter.load()).toEqual([]);
  });
});
