# Futurescaping Hero Shell Template

This template packages the top-level Futurescaping Labs shell that we built in the monitoring system:

- floating left navigation rail
- large hero image stage
- top-left brand block
- top-right survey/date pills
- reusable hero copy area
- optional bottom-right summary dock

It is intentionally limited to the top shell only. Everything below the hero stays project-specific.

## Files

- `shell-template.html`
- `shell-template.css`
- `shell-template.js`
- `shell-template.config.example.js`

## How to use

1. Copy the four files into the new project.
2. Copy the hero image asset(s) into that project.
3. Create a config object based on `shell-template.config.example.js`.
4. Include the CSS in the page head.
5. Add the HTML shell markup near the top of the page body.
6. Import `mountFuturescapingHeroShell` from `shell-template.js`.
7. Pass in the root element and your config object.

## What this template controls

- brand name and sub-brand
- hero eyebrow
- hero title
- hero summary
- hero image
- top-right pills
- optional bottom-right summary dock
- navigation items and active state

## What stays outside this template

- project-specific dashboards
- maps, charts, sections, and data panels
- admin tools
- upload flows
- lower-page content

## Suggested workflow for new showcase apps

1. Start with this shell.
2. Swap in the new hero image.
3. Update brand/title/copy/pills in config.
4. Point nav items at the new app sections.
5. Build the project-specific content below the shell.

## Notes

- The shell is framework-agnostic and works as plain HTML/CSS/JS.
- The config is deliberately simple so we can reuse it across Codex builds.
- If needed later, we can promote this into a shared package or partial include.
