import type { CommentStatus, LocalComment } from "../types";

export interface CommentStorageAdapter {
  load: () => LocalComment[];
  save: (comments: LocalComment[]) => void;
  clear: () => void;
  getStorageKey: () => string;
}

export interface LocalStorageAdapterOptions {
  storageKey?: string;
  storage?: Storage;
}

interface StoredCommentState {
  version: 1;
  comments: LocalComment[];
}

const STORAGE_PREFIX = "react-comment-library";
const STORAGE_VERSION = 1;
const DEFAULT_STORAGE_KEY = "default";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStatus(value: unknown): value is CommentStatus {
  return value === "open" || value === "resolved";
}

function normalizeComment(value: unknown): LocalComment | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.version !== 1 ||
    !isString(value.id) ||
    !isString(value.text) ||
    !isRecord(value.target) ||
    !isRecord(value.page) ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    return null;
  }

  const page = value.page;

  if (!isString(page.path)) {
    return null;
  }

  return {
    ...(value as unknown as LocalComment),
    status: isStatus(value.status) ? value.status : "open",
    replies: Array.isArray(value.replies) ? value.replies : [],
  };
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function buildStorageKey(storageKey = DEFAULT_STORAGE_KEY): string {
  return `${STORAGE_PREFIX}:${storageKey}:v${STORAGE_VERSION}`;
}

function parseStoredState(rawValue: string | null): LocalComment[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.comments)
    ) {
      return [];
    }

    return parsed.comments
      .map((comment) => normalizeComment(comment))
      .filter((comment): comment is LocalComment => comment !== null);
  } catch {
    return [];
  }
}

export function createLocalStorageAdapter(
  options: LocalStorageAdapterOptions = {},
): CommentStorageAdapter {
  const resolvedStorage = options.storage ?? getBrowserStorage();
  const resolvedStorageKey = buildStorageKey(options.storageKey);

  return {
    getStorageKey: () => resolvedStorageKey,
    load: () => {
      if (!resolvedStorage) {
        return [];
      }

      try {
        return parseStoredState(resolvedStorage.getItem(resolvedStorageKey));
      } catch {
        return [];
      }
    },
    save: (comments) => {
      if (!resolvedStorage) {
        return;
      }

      const state: StoredCommentState = {
        version: 1,
        comments,
      };

      try {
        resolvedStorage.setItem(resolvedStorageKey, JSON.stringify(state));
      } catch {
        // Persistence should never break the host app.
      }
    },
    clear: () => {
      if (!resolvedStorage) {
        return;
      }

      try {
        resolvedStorage.removeItem(resolvedStorageKey);
      } catch {
        // Persistence should never break the host app.
      }
    },
  };
}
