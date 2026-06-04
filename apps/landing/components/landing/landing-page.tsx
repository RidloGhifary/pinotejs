"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Anchor,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  CopyCheck,
  Database,
  FileJson,
  GitPullRequest,
  Globe2,
  Layers3,
  MessageCircle,
  MousePointer2,
  Package,
  Route,
  ScrollText,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { CodeBlock } from "@/components/landing/code-block";
import { ProductPreview } from "@/components/landing/product-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const githubUrl = "https://github.com/RidloGhifary/pinote";
const npmUrl = "https://www.npmjs.com/package/pinotejs";
const docsUrl = "https://github.com/RidloGhifary/pinote#readme";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const features = [
  {
    icon: MessageCircle,
    title: "Comment anywhere",
    description: "Turn any screen into a review surface and capture feedback in context.",
  },
  {
    icon: Anchor,
    title: "Element anchoring",
    description: "Pins attach to DOM elements and keep their meaning as layouts change.",
  },
  {
    icon: Database,
    title: "Local persistence",
    description: "Store review notes in the browser for lightweight product walkthroughs.",
  },
  {
    icon: Route,
    title: "Cross-page support",
    description: "Keep comments scoped to the route where feedback was collected.",
  },
  {
    icon: FileJson,
    title: "JSON export",
    description: "Export structured feedback that developers can inspect and share.",
  },
  {
    icon: Globe2,
    title: "Framework agnostic",
    description: "Use the core engine with plain JavaScript or your favorite UI layer.",
  },
  {
    icon: Layers3,
    title: "React support",
    description: "Drop in a provider and hooks for React and Next.js interfaces.",
  },
  {
    icon: Zap,
    title: "Lightweight footprint",
    description: "A focused feedback layer without a heavy product-management suite.",
  },
];

const supportedFrameworks = [
  { name: "Vanilla JavaScript", logo: "/logos/javascript.svg" },
  { name: "React", logo: "/logos/react.svg" },
  { name: "Next.js", logo: "/logos/nextjs.webp" },
];

const comingSoonFrameworks = [
  { name: "Vue", logo: "/logos/vue.svg" },
  { name: "Nuxt", logo: "/logos/nuxt.svg" },
  { name: "Angular", logo: "/logos/angular.svg" },
  { name: "Svelte", logo: "/logos/svelte.svg" },
  { name: "Astro", logo: "/logos/astro.svg" },
];

const roadmap = [
  "Team collaboration",
  "Backend adapters",
  "Realtime comments",
  "Screenshot attachments",
  "Browser extension",
  "GitHub integration",
];

const vanillaCode = `import { createPinote } from "pinotejs";
import "pinotejs/style.css";

const pinote = createPinote({
  storageKey: "my-product",
});

pinote.mount();`;

const reactCode = `import { PinoteProvider } from "pinotejs/react";
import "pinotejs/style.css";

export function App() {
  return (
    <PinoteProvider storageKey="my-product">
      <YourApplication />
    </PinoteProvider>
  );
}`;

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 bg-white text-slate-950 shadow-lg shadow-white/10">
        <MessageCircle className="h-4.5 w-4.5" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-white">Pinote</span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className="mx-auto mb-12 max-w-3xl text-center"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="visible"
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">{description}</p>
      ) : null}
    </motion.div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/10 backdrop-blur transition duration-300 hover:border-white/18 hover:bg-white/[0.055]",
        className,
      )}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/10 bg-slate-950/72 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a aria-label="Pinote home" href="#">
          <Logo />
        </a>

        <div className="hidden items-center gap-7 md:flex">
          <a className="text-sm text-slate-400 transition hover:text-white" href="#features">
            Features
          </a>
          <a className="text-sm text-slate-400 transition hover:text-white" href={docsUrl}>
            Documentation
          </a>
          <a className="text-sm text-slate-400 transition hover:text-white" href={githubUrl}>
            GitHub
          </a>
          <a className="text-sm text-slate-400 transition hover:text-white" href={npmUrl}>
            npm
          </a>
        </div>

        <a
          className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
          href={npmUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          animate="visible"
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          variants={stagger}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 shadow-lg shadow-black/10 backdrop-blur"
            variants={fadeUp}
          >
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            Lightweight UI feedback for modern teams
          </motion.div>
          <motion.h1
            className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
            variants={fadeUp}
          >
            Figma-style feedback for any website.
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-400 sm:text-xl"
            variants={fadeUp}
          >
            Pinote lets designers, developers, QA teams, and clients leave comments
            directly on the UI instead of sending screenshots through chat.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            variants={fadeUp}
          >
            <a
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              href={npmUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full sm:w-auto")}
              href={githubUrl}
            >
              <Code2 className="h-4 w-4" />
              View on GitHub
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 34 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const traditional = [
    { icon: ClipboardList, title: "Screenshot", description: "Capture the screen and hope it has enough context." },
    { icon: MessageCircle, title: "Slack message", description: "Send a note into a thread that moves fast." },
    { icon: ScrollText, title: "Confusing explanations", description: "Describe which button, card, or state needs work." },
    { icon: GitPullRequest, title: "Follow-up questions", description: "Spend review time clarifying the original feedback." },
  ];

  const pinote = [
    { icon: MousePointer2, title: "Click UI", description: "Enable comment mode and choose the exact element." },
    { icon: MessageCircle, title: "Leave comment", description: "Write feedback where the issue appears." },
    { icon: Anchor, title: "Stay attached", description: "Pins remain connected to the selected element." },
  ];

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8" id="problem">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          description="Screenshots separate feedback from the interface. Pinote keeps comments where decisions actually happen."
          title="Feedback shouldn't start with screenshots."
        />

        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <Card>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Traditional workflow</h3>
              <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
                Slow
              </span>
            </div>
            <div className="grid gap-3">
              {traditional.map((item) => (
                <div
                  className="flex gap-4 rounded-xl border border-white/8 bg-black/20 p-4"
                  key={item.title}
                >
                  <item.icon className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-blue-200/20 bg-blue-400/[0.045]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Pinote workflow</h3>
              <span className="rounded-full border border-blue-200/25 bg-blue-300/10 px-3 py-1 text-xs text-blue-100">
                Direct
              </span>
            </div>
            <div className="grid gap-3">
              {pinote.map((item) => (
                <div
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-4"
                  key={item.title}
                >
                  <item.icon className="mt-1 h-5 w-5 shrink-0 text-blue-200" />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8" id="features">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          description="A focused feedback layer for teams that care about product quality, implementation context, and developer workflow."
          eyebrow="Features"
          title="Built for modern product teams"
        />
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          {features.map((feature) => (
            <Card className="min-h-52" key={feature.title}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-blue-200">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FrameworkCard({
  framework,
  status,
}: {
  framework: { name: string; logo: string };
  status: "supported" | "planned";
}) {
  return (
    <motion.div
      className={cn(
        "group flex min-h-32 flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-2xl shadow-black/10 backdrop-blur transition duration-300",
        status === "supported"
          ? "border-blue-200/20 bg-blue-400/[0.055] hover:border-blue-200/30 hover:bg-blue-400/[0.075]"
          : "border-white/10 bg-white/[0.025] opacity-70 hover:border-white/16 hover:bg-white/[0.04] hover:opacity-85",
      )}
      variants={fadeUp}
    >
      <div
        className={cn(
          "mb-4 grid h-14 w-14 place-items-center rounded-2xl border bg-black/25 shadow-inner",
          status === "supported" ? "border-white/12" : "border-white/8",
        )}
      >
        <img
          alt={`${framework.name} logo`}
          className={cn(
            "h-9 w-9 object-contain transition duration-300",
            status === "planned" && "grayscale-[0.25]",
          )}
          height="36"
          src={framework.logo}
          width="36"
        />
      </div>
      <p
        className={cn(
          "text-sm font-medium",
          status === "supported" ? "text-white" : "text-slate-400",
        )}
      >
        {framework.name}
      </p>
    </motion.div>
  );
}

function FrameworksSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          description="Pinote currently supports Vanilla JavaScript and React / Next.js. More framework integrations are coming soon."
          eyebrow="Compatibility"
          title="Framework-friendly by design"
        />
        <div className="space-y-10">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Supported now
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-200/25 to-transparent" />
            </div>
            <motion.div
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              initial="hidden"
              variants={stagger}
              viewport={{ once: true, margin: "-80px" }}
              whileInView="visible"
            >
              {supportedFrameworks.map((framework) => (
                <FrameworkCard
                  framework={framework}
                  key={framework.name}
                  status="supported"
                />
              ))}
            </motion.div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Coming soon
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/12 to-transparent" />
            </div>
            <motion.div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
              initial="hidden"
              variants={stagger}
              viewport={{ once: true, margin: "-80px" }}
              whileInView="visible"
            >
              {comingSoonFrameworks.map((framework) => (
                <FrameworkCard
                  framework={framework}
                  key={framework.name}
                  status="planned"
                />
              ))}
            </motion.div>
          </div>
        </div>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-slate-500"
          initial="hidden"
          variants={fadeUp}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          Built around a framework-agnostic core, designed to work across the web.
        </motion.p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Enable comment mode",
      description: "Turn on Pinote when a review session starts.",
      icon: CheckCircle2,
    },
    {
      title: "Click any element",
      description: "Choose the button, card, label, or layout area that needs feedback.",
      icon: MousePointer2,
    },
    {
      title: "Leave feedback instantly",
      description: "Comments appear on the UI and stay attached to the right context.",
      icon: MessageCircle,
    },
  ];

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Workflow" title="How it works" />
        <motion.div
          className="relative grid gap-5 lg:grid-cols-3"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <div className="absolute left-8 right-8 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/16 to-transparent lg:block" />
          {steps.map((step, index) => (
            <Card className="relative" key={step.title}>
              <div className="mb-8 flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-blue-200/20 bg-blue-300/10 text-blue-100">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-sm text-slate-500">Step {index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{step.description}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CodeSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8" id="code">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          description="Install the npm package, import the shared CSS, and mount Pinote wherever reviews happen."
          eyebrow="Install"
          title="Add contextual feedback in minutes"
        />
        <motion.div
          className="mx-auto mb-8 flex max-w-2xl flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between"
          initial="hidden"
          variants={fadeUp}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <div className="flex min-w-0 items-center gap-3 px-2">
            <Package className="h-4 w-4 shrink-0 text-blue-200" />
            <code className="truncate text-sm text-slate-200">pnpm add pinotejs</code>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 sm:flex">
            <span className="rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2">
              npm install pinotejs
            </span>
            <span className="rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2">
              yarn add pinotejs
            </span>
          </div>
        </motion.div>
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <motion.div variants={fadeUp}>
            <CodeBlock code={vanillaCode} label="Vanilla JavaScript" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <CodeBlock code={reactCode} label="React / Next.js" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function OpenSourceSection() {
  const items = [
    { icon: ShieldCheck, label: "MIT License" },
    { icon: Code2, label: "TypeScript support" },
    { icon: Package, label: "npm package" },
    { icon: GitPullRequest, label: "GitHub repository" },
  ];

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20 backdrop-blur sm:p-10"
        initial="hidden"
        variants={fadeUp}
        viewport={{ once: true, margin: "-80px" }}
        whileInView="visible"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/80">
              Open source
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Open source and developer friendly
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Pinote is small enough to understand, typed for modern codebases, and
              packaged for the workflows developers already use.
            </p>
            <a className={cn(buttonVariants(), "mt-8")} href={githubUrl}>
              <GitPullRequest className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {items.map((item) => (
              <div
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                key={item.label}
              >
                <item.icon className="h-5 w-5 text-blue-200" />
                <span className="font-medium text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          description="The core stays focused while future layers unlock richer review workflows."
          eyebrow="Roadmap"
          title="A focused foundation with room to grow"
        />
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          {roadmap.map((item) => (
            <Card className="flex items-center gap-4 p-5" key={item}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                <CopyCheck className="h-5 w-5 text-blue-200" />
              </div>
              <p className="font-medium text-white">{item}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-12"
        initial={{ opacity: 0, y: 28 }}
        viewport={{ once: true, margin: "-80px" }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-950 shadow-xl shadow-white/10">
          <Package className="h-6 w-6" />
        </div>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Start collecting feedback directly on your UI.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          Replace screenshot threads with attached comments that developers can
          understand immediately.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")} href="#code">
            Install Pinote
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full sm:w-auto")}
            href={docsUrl}
          >
            View Documentation
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
          <a className="transition hover:text-white" href={githubUrl}>
            GitHub
          </a>
          <a className="transition hover:text-white" href={npmUrl}>
            npm
          </a>
          <a className="transition hover:text-white" href="https://opensource.org/license/mit">
            MIT License
          </a>
          <span>Copyright 2026 Ridlo Ghifary</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <main>
      <Navigation />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <FrameworksSection />
      <HowItWorksSection />
      <CodeSection />
      <OpenSourceSection />
      <RoadmapSection />
      <FinalCta />
      <Footer />
    </main>
  );
}
