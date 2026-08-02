const ICONS = {
  home: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M9 20v-5h6v5"/></svg>',
  grid: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M12 6v12"/><path d="M4 12h16"/></svg>',
  cloud: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a4 4 0 1 0-.9-7.9A5.5 5.5 0 0 0 5 12.5"/></svg>',
  bars: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V9"/><path d="M12 18V5"/><path d="M19 18v-7"/></svg>',
  split: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6H5v12h4"/><path d="M15 6h4v12h-4"/><path d="M12 4v16"/></svg>',
  columns: '<svg class="fs-shell__nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16"/><path d="M12 4v16"/><path d="M18 4v16"/></svg>'
};

export function mountFuturescapingHeroShell(root, config) {
  if (!root) return;

  const brandName = root.querySelector("[data-fs-brand-name]");
  const brandSub = root.querySelector("[data-fs-brand-sub]");
  const eyebrow = root.querySelector("[data-fs-eyebrow]");
  const title = root.querySelector("[data-fs-title]");
  const summary = root.querySelector("[data-fs-summary]");
  const heroImage = root.querySelector("[data-fs-hero-image]");
  const pills = root.querySelector("[data-fs-pills]");
  const nav = root.querySelector("[data-fs-nav]");
  const summaryDock = root.querySelector("[data-fs-summary-dock]");

  if (brandName) brandName.textContent = config.brand?.name || "";
  if (brandSub) brandSub.textContent = config.brand?.sublabel || "";
  if (eyebrow) eyebrow.textContent = config.hero?.eyebrow || "";
  if (title) title.textContent = config.hero?.title || "";
  if (summary) summary.textContent = config.hero?.summary || "";

  if (heroImage) {
    heroImage.src = config.hero?.imagePath || "";
    heroImage.alt = config.hero?.imageAlt || "";
  }

  if (pills) {
    pills.innerHTML = (config.pills || [])
      .map((pill) => `
        <article class="fs-shell__pill">
          <p class="fs-shell__pill-label">${escapeHtml(pill.label || "")}</p>
          <p class="fs-shell__pill-value">${escapeHtml(pill.value || "")}</p>
          ${pill.subtext ? `<p class="fs-shell__pill-subtext">${escapeHtml(pill.subtext)}</p>` : ""}
        </article>
      `)
      .join("");
  }

  if (nav) {
    nav.innerHTML = `
      <div class="fs-shell__nav-list">
        ${(config.navigation || [])
          .map((item) => `
            <a class="fs-shell__nav-item${item.active ? " is-active" : ""}" href="${escapeAttribute(item.href || "#")}">
              ${ICONS[item.icon] || ICONS.home}
              <span class="fs-shell__nav-label">${escapeHtml(item.label || "")}</span>
            </a>
          `)
          .join("")}
      </div>
    `;
  }

  if (summaryDock) {
    const enabled = Boolean(config.summaryDock?.enabled);
    summaryDock.textContent = config.summaryDock?.text || "";
    summaryDock.classList.toggle("is-hidden", !enabled);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
