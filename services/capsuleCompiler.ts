
import type { ContextCapsule, CapsuleMeta } from '../types.ts';

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render Pill Tags as List Items
 */
function pillsHtml(pills: string[] = [], tone: "sky" | "amber" = "sky"): string {
  const classes =
    tone === "amber"
      ? "bg-amber-500/15 text-amber-100 border-amber-400/40"
      : "bg-sky-500/15 text-sky-100 border-sky-400/40";

  return pills
    .map(
      (p) =>
        `<li class="text-xs px-3 py-1 rounded-full ${classes} border font-medium">${escapeHtml(
          p
        )}</li>`
    )
    .join("\n");
}

/**
 * Render Semantic Tables
 */
function tableHtml(table: any): string {
  const cols = table?.columns ?? [];
  const rows = table?.rows ?? [];
  if (!cols.length || !rows.length) return "";

  const head = cols
    .map(
      (c: string) =>
        `<th scope="col" class="text-left px-4 py-3 border-b border-slate-800 tracking-wide">${escapeHtml(
          c
        )}</th>`
    )
    .join("");

  const body = rows
    .map((row: any) => {
      const cells = row?.cells ?? [];
      const tds = cells
        .map((cell: string, idx: number) => {
          const base = "px-4 py-3 border-b border-slate-800";
          const extra = idx === 0 ? " font-medium text-slate-200" : " text-slate-400";
          const scope = idx === 0 ? ' scope="row"' : '';
          return `<td class="${base + extra}"${scope}>${escapeHtml(cell)}</td>`;
        })
        .join("");
      return `<tr class="hover:bg-slate-900/40 transition-colors">${tds}</tr>`;
    })
    .join("\n");

  return `
    <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm" role="region" aria-label="Data Table">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-900/80 text-xs uppercase text-slate-500 font-semibold">
          <tr>${head}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

// --- Section Renderers ---

/**
 * The renderCapsuleHeader function.
 * @param meta - The meta parameter.
 * @param sections - The sections parameter.
 * @returns The resulting string.
 */
function renderCapsuleHeader(meta: any, sections: any): string {
  const nav = [];

  if (sections.overview) nav.push({ href: "#overview", label: "Overview" });
  if (sections.key_concepts && (sections.key_concepts.cards ?? []).length)
    nav.push({ href: "#key-concepts", label: "Concepts" });
  if (sections.structure && (sections.structure.table?.rows ?? []).length)
    nav.push({ href: "#structure", label: "Structure" });
  if (sections.personas && (sections.personas.table?.rows ?? []).length)
    nav.push({ href: "#personas", label: "Personas" });
  if (sections.workflow && (sections.workflow.steps ?? []).length)
    nav.push({ href: "#workflow", label: "Workflow" });
  if (sections.resilience && (sections.resilience.failure_modes ?? []).length)
    nav.push({ href: "#resilience", label: "Resilience" });
  if (sections.metrics && (sections.metrics.items ?? []).length)
    nav.push({ href: "#metrics", label: "Metrics" });
  if (sections.checklist && (sections.checklist.items ?? []).length)
    nav.push({ href: "#checklist", label: "Start" });

  const navHtml = nav
    .map(
      (n) =>
        `<li><a href="${n.href}" class="block px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">${escapeHtml(
          n.label
        )}</a></li>`
    )
    .join("\n        ");

  const ctaLabel = meta.hero_cta_label ?? "Start Implementing";
  const ctaTarget = meta.hero_cta_target ?? "#checklist";
  const primary = meta.primary_pill ?? "";
  const researchDate = meta.research_date;

  return `
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 supports-[backdrop-filter]:bg-slate-950/60">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none">${escapeHtml(primary)}</span>
             ${researchDate ? `
                <span class="text-[9px] font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-1.5 py-0.5 rounded leading-none whitespace-nowrap" title="State of Mind: Research Effective Date">
                   TEMPORAL LOCK: ${escapeHtml(researchDate)}
                </span>
             ` : ''}
          </div>
          <h1 class="text-lg font-bold text-white truncate leading-none">${escapeHtml(meta.title ?? meta.id ?? "Capsule")}</h1>
        </div>
      </div>

      <nav class="hidden md:block" aria-label="Capsule Sections">
        <ul class="flex items-center gap-1 text-xs font-medium list-none m-0 p-0">
          ${navHtml}
        </ul>
      </nav>

      <a href="${ctaTarget}"
         role="button"
         class="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900">
        ${escapeHtml(ctaLabel)}
      </a>
    </div>
  </header>`;
}

/**
 * The renderOverview function.
 * @param sec - The sec parameter.
 * @param meta - The meta parameter.
 * @returns The resulting string.
 */
function renderOverview(sec: any, meta: any): string {
  if (!sec) return "";
  const heroPills = sec.hero_pills ?? [];
  const card = sec.summary_card ?? {};

  return `
  <section id="overview" class="pt-12 lg:pt-20 space-y-12 scroll-mt-20" aria-labelledby="overview-title">
    <div class="flex flex-col lg:flex-row gap-12">
      <div class="flex-1 space-y-6">
        ${
          heroPills.length
            ? `<ul class="flex flex-wrap gap-2 list-none p-0 m-0">${pillsHtml(heroPills, "sky")}</ul>`
            : ""
        }

        <h2 id="overview-title" class="text-4xl md:text-5xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          ${escapeHtml(meta.title ?? sec.title ?? "Overview")}
        </h2>

        <p class="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
          ${escapeHtml(sec.intro ?? "")}
        </p>
      </div>

      <aside class="w-full lg:w-80 shrink-0" aria-labelledby="summary-title">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 backdrop-blur-sm sticky top-24">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
             <div class="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></div>
             ${escapeHtml(card.label ?? "Summary")}
          </div>
          <h3 id="summary-title" class="text-lg font-bold text-white">${escapeHtml(card.title ?? "")}</h3>
          <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(card.body ?? "")}</p>
          ${
            (card.tags ?? []).length
              ? `<ul class="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50 list-none p-0 m-0">${pillsHtml(card.tags, "amber")}</ul>`
              : ""
          }
        </div>
      </aside>
    </div>
  </section>`;
}

/**
 * The renderKeyConcepts function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderKeyConcepts(sec: any): string {
  if (!sec || !(sec.cards ?? []).length) return "";
  const cardsHtml = sec.cards
    .map(
      (c: any) => `
      <article class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 hover:border-slate-700 transition-colors group">
        <h3 class="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">${escapeHtml(c.title ?? "")}</h3>
        <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(c.body ?? "")}</p>
      </article>`
    )
    .join("\n");

  return `
  <section id="key-concepts" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="concepts-title">
    <div class="max-w-2xl mb-8">
      <h2 id="concepts-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Key Concepts")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      ${cardsHtml}
    </div>
  </section>`;
}

/**
 * The renderStructure function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderStructure(sec: any): string {
  if (!sec || !(sec.table?.rows ?? []).length) return "";
  return `
  <section id="structure" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="structure-title">
    <div class="max-w-2xl mb-8">
      <h2 id="structure-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Structure")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="mt-8">${tableHtml(sec.table)}</div>
  </section>`;
}

/**
 * The renderPersonas function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderPersonas(sec: any): string {
  if (!sec || !(sec.table?.rows ?? []).length) return "";
  return `
  <section id="personas" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="personas-title">
    <div class="max-w-2xl mb-8">
      <h2 id="personas-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Personas")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="mt-8">${tableHtml(sec.table)}</div>
  </section>`;
}

/**
 * The renderWorkflow function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderWorkflow(sec: any): string {
  if (!sec || !(sec.steps ?? []).length) return "";
  const cards = sec.steps
    .map(
      (s: any, idx: number) => `
      <article class="relative pl-8 md:pl-0">
         <div class="md:hidden absolute left-0 top-0 bottom-0 w-px bg-slate-800" aria-hidden="true"></div>
         <div class="md:hidden absolute left-[-4px] top-6 w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true"></div>
         
         <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:bg-slate-900/60 transition-colors h-full">
            <div class="flex items-center justify-between">
               <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">Step ${idx + 1}</span>
            </div>
            <h3 class="font-bold text-lg text-white">${escapeHtml(s.label ?? s.id ?? "")}</h3>
            <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(s.summary ?? "")}</p>
            <ul class="space-y-2 pt-2 border-t border-slate-800/50 list-none p-0">
              ${(s.bullets ?? []).map((b: string) => `<li class="text-xs text-slate-400 flex items-start"><span class="mr-2 text-indigo-500" aria-hidden="true">•</span>${escapeHtml(b)}</li>`).join("\n")}
            </ul>
         </div>
      </article>`
    )
    .join("\n");

  return `
  <section id="workflow" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="workflow-title">
    <div class="max-w-2xl mb-8">
      <h2 id="workflow-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Workflow")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 items-stretch">${cards}</div>
  </section>`;
}

/**
 * The renderResilience function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderResilience(sec: any): string {
  if (!sec || !(sec.failure_modes ?? []).length) return "";
  const gridCols = sec.failure_modes.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  const cards = sec.failure_modes
    .map(
      (m: any) => `
      <article class="rounded-2xl border border-red-900/30 bg-red-950/10 p-6 space-y-3 h-full">
        <h3 class="font-bold text-red-200 flex items-center gap-2">
           <span class="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
           ${escapeHtml(m.name ?? "")}
        </h3>
        <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(m.description ?? "")}</p>
        <div class="pt-3">
           <p class="text-[10px] uppercase font-bold text-slate-500 mb-2">Mitigation Strategy</p>
           <ul class="space-y-1 list-none p-0">
             ${(m.mitigations ?? []).map((x: string) => `<li class="text-xs text-slate-400 flex items-start"><span class="mr-2 text-slate-600" aria-hidden="true">→</span>${escapeHtml(x)}</li>`).join("\n")}
           </ul>
        </div>
      </article>`
    )
    .join("\n");

  return `
  <section id="resilience" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="resilience-title">
    <div class="max-w-2xl mb-8">
      <h2 id="resilience-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Resilience")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="grid gap-6 ${gridCols} mt-8 items-stretch">${cards}</div>
  </section>`;
}

/**
 * The renderMetrics function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderMetrics(sec: any): string {
  if (!sec || !(sec.items ?? []).length) return "";
  const gridCols = sec.items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  const cards = sec.items
    .map(
      (m: any) => `
      <article class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 h-full">
        <h3 class="font-bold text-emerald-400">${escapeHtml(m.name ?? "")}</h3>
        <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(m.description ?? "")}</p>
        <div class="flex flex-wrap gap-2 pt-2">
          ${(m.signals ?? []).map((x: string) => `<span class="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">${escapeHtml(x)}</span>`).join("\n")}
        </div>
      </article>`
    )
    .join("\n");

  return `
  <section id="metrics" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="metrics-title">
    <div class="max-w-2xl mb-8">
      <h2 id="metrics-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Metrics")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="grid gap-6 ${gridCols} mt-8 items-stretch">${cards}</div>
  </section>`;
}

/**
 * The renderChecklist function.
 * @param sec - The sec parameter.
 * @returns The resulting string.
 */
function renderChecklist(sec: any): string {
  if (!sec || !(sec.items ?? []).length) return "";
  const gridCols = sec.items.length >= 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  const cards = sec.items
    .map(
      (it: any) => `
      <article class="rounded-2xl border border-indigo-900/30 bg-indigo-950/10 p-6 space-y-4 h-full">
        <h3 class="font-bold text-indigo-200 text-lg">${escapeHtml(it.label ?? "")}</h3>
        <ul class="space-y-3 list-none p-0">
          ${(it.bullets ?? []).map((b: string) => `
             <li class="flex items-start gap-3 text-sm text-slate-300">
                <input type="checkbox" class="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                <span>${escapeHtml(b)}</span>
             </li>`).join("\n")}
        </ul>
      </article>`
    )
    .join("\n");

  return `
  <section id="checklist" class="mt-20 pt-12 border-t border-slate-800 scroll-mt-20" aria-labelledby="checklist-title">
    <div class="max-w-2xl mb-8">
      <h2 id="checklist-title" class="text-2xl font-bold text-white mb-2">${escapeHtml(sec.title ?? "Get Started")}</h2>
      <p class="text-slate-400 leading-relaxed">${escapeHtml(sec.intro ?? "")}</p>
    </div>
    <div class="grid gap-6 ${gridCols} mt-8 items-stretch">${cards}</div>
  </section>`;
}

/**
 * Main compilation function
 */
export function compileCapsuleHtml(capsule: ContextCapsule): string {
  const meta = capsule?.meta ?? ({} as Partial<CapsuleMeta>);
  const sections = capsule?.sections ?? ({} as Partial<ContextCapsule['sections']>);

  const tags = (meta.tags ?? []).slice(0, 8);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(meta.title ?? meta.id ?? "Capsule")}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escapeHtml(meta.short_tagline ?? "")}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
  <a href="#overview" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] px-4 py-2 bg-indigo-600 text-white rounded font-bold shadow-xl">Skip to Content</a>

${renderCapsuleHeader(meta, sections)}

  <main class="max-w-6xl mx-auto px-6 pb-32">
    ${
      tags.length
        ? `<div class="pt-8 animate-in fade-in slide-in-from-top-4 duration-700"><ul class="flex flex-wrap gap-2 list-none p-0 m-0">${pillsHtml(tags, "amber")}</ul></div>`
        : ""
    }
${renderOverview(sections.overview, meta)}
${renderKeyConcepts(sections.key_concepts)}
${renderStructure(sections.structure)}
${renderPersonas(sections.personas)}
${renderWorkflow(sections.workflow)}
${renderResilience(sections.resilience)}
${renderMetrics(sections.metrics)}
${renderChecklist(sections.checklist)}
  </main>

  <footer class="border-t border-slate-800 bg-slate-950 py-12 mt-12">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
       <div class="text-left">
          <p class="text-sm font-bold text-white">Sovereign Cognitive OS</p>
          <p class="text-xs text-slate-500 font-mono mt-1">Context Capsule Artifact</p>
       </div>
       <div class="text-right">
          <p class="text-xs text-slate-600 font-mono mb-1">ID: ${escapeHtml(meta.id ?? "")}</p>
          <p class="text-xs text-slate-600 font-mono">Worldview: ${escapeHtml(meta.worldview_ref ?? "UNBOUND")}</p>
          ${meta.research_date ? `<p class="text-xs text-indigo-400 font-mono mt-1">State of Mind: ${escapeHtml(meta.research_date)}</p>` : ''}
       </div>
    </div>
  </footer>
</body>
</html>`;
}
