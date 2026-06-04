import { createLocalStorageAdapter, type CommentStorageAdapter } from "./storage/localStorageAdapter";
import { getPageContext, normalizePath } from "./pageContext";
import { captureCommentTarget } from "./captureTarget";
import { createLocalComment, normalizeCommentText } from "./comment";
import { resolveElementSelector } from "./selector";
import { getTargetPosition } from "./position";
import { createCommentExport, downloadCommentExport } from "./export/commentExport";
import { COMMENT_IGNORE_ATTRIBUTE } from "./types";
import type { 
  LocalComment, 
  CommentTarget, 
  PendingCommentDraft, 
  PageContext,
  CommentStatus,
  HoverOverlayState,
  TargetPosition,
  CommentExportOptions,
  CommentExportPayload,
  CommentTargetAttachmentState
} from "./types";

export interface PinoteState {
  isCommentModeEnabled: boolean;
  comments: LocalComment[];
  activeCommentId: string | null;
  pendingCommentDraft: PendingCommentDraft | null;
  hover: HoverOverlayState | null;
  currentPage: PageContext;
  lastCapturedTarget: CommentTarget | null;
}

export interface PinoteOptions {
  storageKey?: string;
  ignoreSelector?: string;
  onCommentsChange?: (comments: LocalComment[]) => void;
  onCommentModeChange?: (enabled: boolean) => void;
  onStateChange?: (state: PinoteState) => void;
}

function applyStyles(
  element: HTMLElement | null | undefined,
  ...styles: (Record<string, any> | CSSStyleDeclaration | null | undefined)[]
) {
  if (!element || !element.style) return;

  for (const s of styles) {
    if (!s) continue;
    for (const key in s) {
      // Skip numeric keys (which come from CSSStyleDeclaration objects)
      // and inherited properties/methods
      if (!isNaN(Number(key)) || typeof (s as any)[key] === "function") {
        continue;
      }

      try {
        const value = (s as any)[key];
        if (value === undefined || value === null) {
          continue;
        }

        if (key.startsWith("--")) {
          element.style.setProperty(key, String(value));
        } else {
          (element.style as any)[key] = value;
        }
      } catch {
        // Silently skip properties that cannot be set
      }
    }
  }
}

const DEFAULT_IGNORE_SELECTOR = `[${COMMENT_IGNORE_ATTRIBUTE}], .pinote-ignore`;

export class Pinote {
  private storageKey: string;
  private storageAdapter: CommentStorageAdapter;
  private isCommentModeEnabled = false;
  private comments: LocalComment[] = [];
  private currentPage: PageContext;
  private pendingCommentDraft: PendingCommentDraft | null = null;
  private activeCommentId: string | null = null;
  private lastCapturedTarget: CommentTarget | null = null;
  private hover: HoverOverlayState | null = null;
  private effectiveIgnoreSelector: string;
  
  private onCommentsChange?: (comments: LocalComment[]) => void;
  private onCommentModeChange?: (enabled: boolean) => void;
  private onStateChange?: (state: PinoteState) => void;

  private container: HTMLDivElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private cleanupFunctions: Array<() => void> = [];

  constructor(options: PinoteOptions = {}) {
    this.storageKey = options.storageKey || "default";
    this.storageAdapter = createLocalStorageAdapter({ storageKey: this.storageKey });
    this.effectiveIgnoreSelector = options.ignoreSelector 
      ? `${DEFAULT_IGNORE_SELECTOR}, ${options.ignoreSelector}`
      : DEFAULT_IGNORE_SELECTOR;
    
    this.onCommentsChange = options.onCommentsChange;
    this.onCommentModeChange = options.onCommentModeChange;
    this.onStateChange = options.onStateChange;
    
    this.currentPage = getPageContext();
  }

  public getState(): PinoteState {
    return {
      isCommentModeEnabled: this.isCommentModeEnabled,
      comments: this.comments,
      activeCommentId: this.activeCommentId,
      pendingCommentDraft: this.pendingCommentDraft,
      hover: this.hover,
      currentPage: this.currentPage,
      lastCapturedTarget: this.lastCapturedTarget,
    };
  }

  private notifyStateChange() {
    this.onStateChange?.(this.getState());
  }

  public mount() {
    if (typeof document === "undefined") return;

    this.comments = this.storageAdapter.load() || [];
    
    this.container = document.createElement("div");
    this.container.className = "pinote-container pinote-ignore";
    this.container.setAttribute(COMMENT_IGNORE_ATTRIBUTE, "true");
    document.body.appendChild(this.container);

    this.bindEvents();
    this.render();
    this.notifyStateChange();
  }

  public unmount() {
    this.cleanupFunctions.forEach((fn) => fn());
    this.cleanupFunctions = [];
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.animationFrameId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }

  public toggleCommentMode = () => {
    this.isCommentModeEnabled = !this.isCommentModeEnabled;
    if (!this.isCommentModeEnabled) {
      this.hover = null;
    }
    this.onCommentModeChange?.(this.isCommentModeEnabled);
    this.render();
    this.notifyStateChange();
  };

  public enableCommentMode = () => {
    if (!this.isCommentModeEnabled) {
      this.toggleCommentMode();
    }
  };

  public disableCommentMode = () => {
    if (this.isCommentModeEnabled) {
      this.toggleCommentMode();
    }
  };

  public exportComments = (options: CommentExportOptions = {}): CommentExportPayload => {
    return createCommentExport({
      comments: this.comments,
      projectKey: this.storageKey,
      currentPagePath: this.currentPage.path,
      options,
    });
  };

  public downloadCommentsExport = (options: CommentExportOptions = {}): string | null => {
    const payload = this.exportComments(options);
    return downloadCommentExport(payload);
  };

  public deleteComment = (id: string) => {
    this.saveComments(this.comments.filter(c => c.id !== id));
    if (this.activeCommentId === id) {
       this.activeCommentId = null;
       this.render();
       this.notifyStateChange();
    }
  };

  public resolveComment = (id: string) => {
    this.saveComments(this.comments.map(c => c.id === id ? { ...c, status: "resolved", updatedAt: new Date().toISOString() } : c));
  };

  public reopenComment = (id: string) => {
    this.saveComments(this.comments.map(c => c.id === id ? { ...c, status: "open", updatedAt: new Date().toISOString() } : c));
  };

  public updateComment = (id: string, text: string) => {
    const normalized = normalizeCommentText(text);
    if (!normalized) return;
    this.saveComments(this.comments.map(c => c.id === id ? { ...c, text: normalized, updatedAt: new Date().toISOString() } : c));
  };

  public openComment = (id: string) => {
    this.activeCommentId = id;
    this.pendingCommentDraft = null;
    this.render();
    this.notifyStateChange();
  };

  public closeComment = () => {
    this.activeCommentId = null;
    this.render();
    this.notifyStateChange();
  };

  public clearLocalComments = () => {
    this.storageAdapter.clear();
    this.saveComments([]);
    this.activeCommentId = null;
    this.pendingCommentDraft = null;
    this.render();
    this.notifyStateChange();
  };

  public getCommentTargetState = (commentId: string): CommentTargetAttachmentState | null => {
    const comment = this.comments.find((current) => current.id === commentId);
    if (!comment) return null;
    if (typeof document === "undefined") return "fallback";
    return resolveElementSelector(comment.target.selector, document) ? "attached" : "fallback";
  };

  private bindEvents() {
    if (typeof window === "undefined") return;

    // Route tracking
    const handlePageChange = () => {
      this.currentPage = getPageContext();
      this.pendingCommentDraft = null;
      this.activeCommentId = null;
      this.hover = null;
      this.render();
      this.notifyStateChange();

      window.requestAnimationFrame(() => {
        this.render();
        setTimeout(() => this.render(), 100);
      });
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handlePageChange();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handlePageChange();
      return result;
    };

    const onPopState = () => handlePageChange();
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);

    this.cleanupFunctions.push(() => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    });

    // Layout tracking
    const handleLayoutChange = () => {
      if (this.animationFrameId !== null) return;
      this.animationFrameId = window.requestAnimationFrame(() => {
        this.animationFrameId = null;
        this.render();
      });
    };

    window.addEventListener("scroll", handleLayoutChange, true);
    window.addEventListener("resize", handleLayoutChange);

    this.cleanupFunctions.push(() => {
      window.removeEventListener("scroll", handleLayoutChange, true);
      window.removeEventListener("resize", handleLayoutChange);
    });

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => handleLayoutChange());
      this.resizeObserver.observe(document.body);
    }

    // Pointer events
    const onPointerMove = (e: PointerEvent) => {
      if (!this.isCommentModeEnabled || this.pendingCommentDraft) return;
      
      const target = this.findCommentTarget(e.target as Element);
      if (target) {
        const position = getTargetPosition(target);
        this.hover = {
          label: this.describeElement(target),
          rect: position.rect,
          selectorPreview: target.getAttribute("data-comment-anchor") || target.getAttribute("data-rcl-id") || target.getAttribute("data-testid") || target.getAttribute("id") || undefined
        };
      } else {
        this.hover = null;
      }
      this.render();
    };

    const onPointerLeave = () => {
      if (!this.isCommentModeEnabled) return;
      this.hover = null;
      this.render();
    };

    const onClick = (e: MouseEvent) => {
      if (!this.isCommentModeEnabled) return;
      
      const target = this.findCommentTarget(e.target as Element);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const captured = captureCommentTarget(target, { clientX: e.clientX, clientY: e.clientY });
        this.lastCapturedTarget = captured;
        this.pendingCommentDraft = {
          id: `draft_${Date.now()}`,
          text: "",
          target: captured,
          page: this.currentPage,
          createdAt: new Date().toISOString()
        };
        this.activeCommentId = null;
        this.hover = null;
        this.render();
        this.notifyStateChange();
      }
    };

    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerleave", onPointerLeave, true);
    document.addEventListener("click", onClick, true);

    this.cleanupFunctions.push(() => {
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerleave", onPointerLeave, true);
      document.removeEventListener("click", onClick, true);
    });
  }

  private findCommentTarget(rawTarget: Element | null): Element | null {
    if (!rawTarget || !(rawTarget instanceof Element)) return null;
    const docElement = rawTarget.ownerDocument.documentElement;
    if (rawTarget === docElement || rawTarget === rawTarget.ownerDocument.body) return null;
    if (rawTarget.closest(this.effectiveIgnoreSelector)) return null;
    return rawTarget;
  }

  private describeElement(element: Element): string {
    const tag = element.tagName.toLowerCase();
    const id = element.getAttribute("id");
    const ariaLabel = element.getAttribute("aria-label");
    const name = element.getAttribute("name");
    
    if (ariaLabel) return `${tag}[aria-label="${ariaLabel}"]`;
    if (id) return `${tag}#${id}`;
    if (name) return `${tag}[name="${name}"]`;
    
    const className = Array.from(element.classList).slice(0, 2).join(".");
    return className ? `${tag}.${className}` : tag;
  }

  private saveComments(newComments: LocalComment[]) {
    this.comments = newComments;
    this.storageAdapter.save(this.comments);
    this.onCommentsChange?.(this.comments);
    this.render();
  }

  public render() {
    if (!this.container || typeof document === "undefined") return;

    // We will build the innerHTML or DOM nodes manually
    this.container.innerHTML = "";

    // Render Toolbar
    this.container.appendChild(this.createToolbarNode());

    // Filter comments by page
    const currentPageComments = this.comments.filter(
      (c) => normalizePath(c.page.path) === this.currentPage.path
    );

    // Render Overlay (Markers + Popovers + Draft + Hover)
    const overlayRenderNeeded = this.isCommentModeEnabled || currentPageComments.length > 0 || this.pendingCommentDraft;
    
    if (overlayRenderNeeded) {
      const overlay = document.createElement("div");
      overlay.className = "pinote-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "2147483646";

      if (this.isCommentModeEnabled && this.hover) {
        const highlight = document.createElement("div");
        highlight.className = "pinote-highlight";
        applyStyles(highlight, {
          position: "fixed",
          left: `${this.hover.rect.left}px`,
          top: `${this.hover.rect.top}px`,
          width: `${this.hover.rect.width}px`,
          height: `${this.hover.rect.height}px`,
          border: "2px solid #2563eb",
          background: "rgba(37, 99, 235, 0.08)",
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.92), 0 8px 24px rgba(37, 99, 235, 0.18)",
          borderRadius: "4px",
          pointerEvents: "none"
        });
        overlay.appendChild(highlight);

        const label = document.createElement("div");
        label.className = "pinote-hover-label";
        const labelTop = Math.max(8, this.hover.rect.top - 30);
        const labelLeft = Math.max(8, Math.min(this.hover.rect.left, window.innerWidth - 380));
        applyStyles(label, {
          position: "fixed",
          left: `${labelLeft}px`,
          top: `${labelTop}px`,
          maxWidth: "360px",
          padding: "5px 8px",
          borderRadius: "6px",
          color: "white",
          background: "#1d4ed8",
          font: "12px/1.3 system-ui, sans-serif",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          pointerEvents: "none"
        });
        label.textContent = this.hover.label + (this.hover.selectorPreview ? ` | ${this.hover.selectorPreview}` : "");
        overlay.appendChild(label);
      }

      // Render Markers
      currentPageComments.forEach((comment, index) => {
        const position = this.getCurrentTargetPosition(comment.target);
        const isAttached = typeof document !== "undefined" && resolveElementSelector(comment.target.selector, document) !== null;

        if (!isAttached) return; // Do not render fallback markers

        const marker = document.createElement("button");
        marker.className = `pinote-marker ${comment.status === "resolved" ? "is-resolved" : ""}`;
        marker.setAttribute(COMMENT_IGNORE_ATTRIBUTE, "true");
        marker.textContent = String(index + 1);
        
        let left = position.rect.left;
        let top = position.rect.top;
        if (position.relativeX !== undefined && position.relativeY !== undefined) {
          left -= 13;
          top -= 13;
        } else {
          left += position.rect.width - 13;
          top -= 13;
        }
        
        left = Math.max(8, Math.min(left, window.innerWidth - 34));
        top = Math.max(8, Math.min(top, window.innerHeight - 34));

        applyStyles(marker, {
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          width: "26px",
          height: "26px",
          border: "2px solid #ffffff",
          borderRadius: "50%",
          color: "#ffffff",
          background: comment.status === "resolved" ? "#64748b" : "#f97316",
          boxShadow: comment.status === "resolved" ? "0 10px 26px rgba(100, 116, 139, 0.3)" : "0 10px 26px rgba(249, 115, 22, 0.34)",
          cursor: "pointer",
          font: "700 12px/1 system-ui, sans-serif",
          pointerEvents: "auto"
        });

        marker.onclick = (e) => {
          e.stopPropagation();
          this.activeCommentId = comment.id;
          this.pendingCommentDraft = null;
          this.render();
        };

        overlay.appendChild(marker);
      });

      // Render Draft Popover
      if (this.pendingCommentDraft) {
        const position = this.getCurrentTargetPosition(this.pendingCommentDraft.target);
        overlay.appendChild(this.createPopoverNode({
          title: "New comment",
          position,
          content: this.pendingCommentDraft.text,
          onContentChange: (val: string) => {
            if (this.pendingCommentDraft) this.pendingCommentDraft.text = val;
          },
          actions: [
            { label: "Cancel", class: "pinote-button-ghost", onClick: () => { this.pendingCommentDraft = null; this.render(); } },
            { label: "Save", class: "pinote-button-save", disabled: this.pendingCommentDraft.text.trim().length === 0, onClick: () => {
                const normalized = normalizeCommentText(this.pendingCommentDraft!.text);
                if (normalized) {
                  const newComment = createLocalComment({ text: normalized, target: this.pendingCommentDraft!.target });
                  this.saveComments([newComment, ...this.comments]);
                  this.activeCommentId = newComment.id;
                  this.pendingCommentDraft = null;
                }
              }
            }
          ]
        }, true));
      } else if (this.activeCommentId) {
        const active = currentPageComments.find(c => c.id === this.activeCommentId);
        if (active) {
          const position = this.getCurrentTargetPosition(active.target);
          overlay.appendChild(this.createPopoverNode({
            title: "Comment",
            position,
            onClose: () => { this.activeCommentId = null; this.render(); },
            bodyHtml: `
              <p class="pinote-comment-text" style="margin: 0; white-space: pre-wrap;">${this.escapeHtml(active.text)}</p>
              <p class="pinote-comment-meta" style="margin: 10px 0 0; color: #667085; font-size: 12px;">
                ${active.status} | ${active.page.path || "/"}
              </p>
            `,
            actions: [
               { label: "Delete", class: "pinote-button-danger", onClick: () => {
                   this.saveComments(this.comments.filter(c => c.id !== active.id));
                   this.activeCommentId = null;
               }},
               { label: active.status === "resolved" ? "Reopen" : "Resolve", class: "pinote-button-ghost", onClick: () => {
                   this.saveComments(this.comments.map(c => c.id === active.id ? { ...c, status: c.status === "resolved" ? "open" : "resolved", updatedAt: new Date().toISOString() } : c));
               }}
            ]
          }, false));
        }
      }
      
      this.container.appendChild(overlay);
    }
  }

  private escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  private getCurrentTargetPosition(target: CommentTarget): TargetPosition {
    if (typeof document === "undefined") return target.position;
    const resolved = resolveElementSelector(target.selector, document);
    if (resolved) {
      const pos = getTargetPosition(resolved);
      if (target.position.relativeX !== undefined && target.position.relativeY !== undefined) {
        const offsetX = pos.rect.width * target.position.relativeX;
        const offsetY = pos.rect.height * target.position.relativeY;
        return {
          ...pos,
          rect: { ...pos.rect, left: pos.rect.left + offsetX, top: pos.rect.top + offsetY },
          relativeX: target.position.relativeX,
          relativeY: target.position.relativeY
        };
      }
      return pos;
    }
    // Fallback
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    return {
      ...target.position,
      rect: {
        ...target.position.pageRect,
        x: target.position.pageRect.x - scrollX,
        y: target.position.pageRect.y - scrollY,
        top: target.position.pageRect.top - scrollY,
        right: target.position.pageRect.right - scrollX,
        bottom: target.position.pageRect.bottom - scrollY,
        left: target.position.pageRect.left - scrollX,
      },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scroll: { x: scrollX, y: scrollY }
    };
  }

  private createToolbarNode(): HTMLElement {
    const toolbar = document.createElement("div");
    toolbar.className = "pinote-toolbar";
    toolbar.setAttribute(COMMENT_IGNORE_ATTRIBUTE, "true");
    
    applyStyles(toolbar, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      pointerEvents: "auto",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px",
      background: "rgba(248, 250, 252, 0.96)",
      backdropFilter: "blur(8px)",
      border: "1px solid #d7dee8",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)",
      fontFamily: "system-ui, sans-serif"
    });

    const status = document.createElement("span");
    status.className = `pinote-status ${this.isCommentModeEnabled ? "is-active" : ""}`;
    status.textContent = this.isCommentModeEnabled ? "Comment mode on" : "Comment mode off";
    applyStyles(status, {
      display: "inline-flex", alignItems: "center", minHeight: "32px", padding: "0 10px",
      border: "1px solid #ccd6e2", borderRadius: "6px", color: "#475467", background: "#ffffff", fontSize: "13px",
      ...(this.isCommentModeEnabled ? { borderColor: "#9fc0ff", color: "#194a9f", background: "#eaf2ff" } : {})
    });
    toolbar.appendChild(status);

    const currentPageComments = this.comments.filter(c => normalizePath(c.page.path) === this.currentPage.path);
    
    const countPage = document.createElement("span");
    countPage.className = "pinote-counter";
    countPage.textContent = `${currentPageComments.length} on page`;
    applyStyles(countPage, status.style, { borderColor: "#ccd6e2", color: "#475467", background: "#ffffff" });
    toolbar.appendChild(countPage);

    const countStored = document.createElement("span");
    countStored.className = "pinote-counter";
    countStored.textContent = `${this.comments.length} stored`;
    applyStyles(countStored, status.style, { borderColor: "#ccd6e2", color: "#475467", background: "#ffffff" });
    toolbar.appendChild(countStored);

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "pinote-button-primary";
    toggleBtn.textContent = this.isCommentModeEnabled ? "Disable comment mode" : "Enable comment mode";
    applyStyles(toggleBtn, {
      minHeight: "34px", padding: "0 14px", border: "0", borderRadius: "6px",
      color: "#ffffff", background: "#1f6feb", fontWeight: "700", cursor: "pointer"
    });
    toggleBtn.onclick = (e) => { e.stopPropagation(); this.toggleCommentMode(); };
    toolbar.appendChild(toggleBtn);

    if (this.comments.length > 0) {
      const exportBtn = document.createElement("button");
      exportBtn.className = "pinote-button-secondary";
      exportBtn.textContent = "Export JSON";
      applyStyles(exportBtn, {
        minHeight: "34px", padding: "0 14px", border: "0", borderRadius: "6px",
        color: "#344054", background: "#edf1f6", fontWeight: "700", cursor: "pointer"
      });
      exportBtn.onclick = (e) => { e.stopPropagation(); this.exportComments(); };
      toolbar.appendChild(exportBtn);
    }

    return toolbar;
  }

  private createPopoverNode(config: any, isInput: boolean): HTMLElement {
    const panel = document.createElement("section");
    panel.className = "pinote-panel";
    panel.setAttribute(COMMENT_IGNORE_ATTRIBUTE, "true");
    
    let left = config.position.rect.left;
    let top = config.position.rect.top;
    if (config.position.relativeX !== undefined) {
      left -= 13; top -= 13;
    } else {
      left += config.position.rect.width - 13; top -= 13;
    }
    
    left = Math.max(8, Math.min(left, window.innerWidth - 34));
    top = Math.max(8, Math.min(top, window.innerHeight - 34));

    left = Math.max(8, Math.min(left + 16, window.innerWidth - 316));
    top = Math.max(8, Math.min(top + 20, window.innerHeight - 230));

    applyStyles(panel, {
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      width: "300px",
      border: "1px solid #d7dee8",
      borderRadius: "8px",
      background: "#ffffff",
      boxShadow: "0 18px 46px rgba(15, 23, 42, 0.22)",
      color: "#172033",
      fontFamily: "system-ui, sans-serif",
      pointerEvents: "auto"
    });

    const header = document.createElement("div");
    applyStyles(header, { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #e4e9f0" });
    const title = document.createElement("p");
    title.textContent = config.title;
    applyStyles(title, { margin: "0", color: "#475467", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" });
    header.appendChild(title);
    
    if (config.onClose) {
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "x";
      applyStyles(closeBtn, { width: "28px", height: "28px", border: "0", borderRadius: "6px", color: "#475467", background: "#edf1f6", cursor: "pointer" });
      closeBtn.onclick = (e) => { e.stopPropagation(); config.onClose(); };
      header.appendChild(closeBtn);
    }
    panel.appendChild(header);

    const body = document.createElement("div");
    applyStyles(body, { padding: "12px" });
    if (isInput) {
      const textarea = document.createElement("textarea");
      textarea.value = config.content || "";
      textarea.placeholder = "Write a comment...";
      applyStyles(textarea, {
        display: "block", width: "100%", minHeight: "92px", resize: "vertical", border: "1px solid #cbd5e1",
        borderRadius: "6px", padding: "10px", color: "#172033", background: "#ffffff", boxSizing: "border-box",
        fontFamily: "inherit", fontSize: "14px"
      });
      textarea.oninput = (e) => {
        config.onContentChange((e.target as HTMLTextAreaElement).value);
        this.render();
      };
      setTimeout(() => textarea.focus(), 10);
      body.appendChild(textarea);
    } else {
      body.innerHTML = config.bodyHtml;
    }
    panel.appendChild(body);

    const actionsDiv = document.createElement("div");
    applyStyles(actionsDiv, { display: "flex", justifyContent: "flex-end", gap: "8px", padding: "0 12px 12px" });
    
    if (config.actions) {
      config.actions.forEach((act: any) => {
        const btn = document.createElement("button");
        btn.textContent = act.label;
        btn.disabled = act.disabled || false;
        applyStyles(btn, {
          minHeight: "34px", padding: "0 12px", border: "0", borderRadius: "6px", cursor: "pointer", fontWeight: "700",
          color: act.class === "pinote-button-save" ? "#ffffff" : (act.class === "pinote-button-danger" ? "#fff" : "#344054"),
          background: act.class === "pinote-button-save" ? "#1f6feb" : (act.class === "pinote-button-danger" ? "#dc2626" : "#edf1f6")
        });
        btn.onclick = (e) => { e.stopPropagation(); act.onClick(); };
        actionsDiv.appendChild(btn);
      });
    }
    panel.appendChild(actionsDiv);

    return panel;
  }
}
