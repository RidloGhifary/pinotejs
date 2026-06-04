import type {
  CommentReply,
  CreateCommentInput,
  LocalComment,
  PendingCommentDraft,
} from "./types";

export function createLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function normalizeCommentText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function createPendingCommentDraft(
  target: CreateCommentInput["target"],
): PendingCommentDraft {
  return {
    id: createLocalId("draft"),
    text: "",
    target,
    page: target.page,
    createdAt: new Date().toISOString(),
  };
}

export function createLocalComment(input: CreateCommentInput): LocalComment {
  const now = new Date().toISOString();

  return {
    version: 1,
    id: createLocalId("comment"),
    text: normalizeCommentText(input.text),
    target: input.target,
    page: input.target.page,
    createdAt: now,
    updatedAt: now,
    status: input.status ?? "open",
    replies: input.replies ?? [],
  };
}

export function createReply(text: string): CommentReply {
  const now = new Date().toISOString();

  return {
    id: createLocalId("reply"),
    text: normalizeCommentText(text),
    createdAt: now,
    updatedAt: now,
  };
}
