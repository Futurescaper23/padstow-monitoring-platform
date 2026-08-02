# FutureScaping Monitoring System Notes

## Product direction

This is an imagery-first monitoring product.

The main job of the interface is to help users inspect survey imagery, compare outputs across time, and explain visible changes to clients.

The UI should always prioritise the image viewer over explanatory text.

## Design direction

- follow the dark FutureScaping visual language already present in the existing apps
- use the Craigmore app as the strongest reference for interaction style
- keep controls compact and secondary to the imagery
- avoid large dashboard blocks taking visual priority over the viewer

## Viewer priorities

1. large image stage
2. zoom and pan that feel smooth and unrestricted enough for close inspection
3. unified comparison modes in one viewer
4. small supporting controls and metadata around the viewer, not dominating it

## Comparison roadmap

The desired long-term comparison viewer should support:

- single-layer inspection
- transparency overlay
- swipe slider
- change highlight overlay

All of these should share the same zoom/pan state so the user stays in one inspection context.

## Data direction

Assets now live under:

`survey-data/<project>/<survey>/<area>/`

Expected files per area:

- `ortho.jpg`
- `dsm.png`
- `contour.png`
- `section_lines.png`
- `section_profiles.csv`
- `manifest.json`

## Current operational status

- baseline survey `2025-02-18` has seeded assets
- later survey rounds are scaffolded and can be uploaded through the Admin tab
- the app now has survey coverage and admin board views
- the Layers view now supports primary/secondary survey selection
- the Layers view now supports single, transparency, and slider comparison modes
- the Layers view now supports independent primary/secondary layer selection
- the Layers view now includes live opacity controls for transparency mode
- the viewer pan bounds now clamp against the visible image area instead of drifting freely
- the comparison controls have been compacted so the viewer remains visually dominant
- the Sections view is being rebuilt into a full-screen map-plus-profile workspace with basemap toggles and linked hover feedback

## Next high-value implementation steps

1. finish calibrating the Sections workspace so map feedback follows the real section geometry accurately
2. redesign the Overview so it matches the quality of the stronger single-purpose apps
3. add change-highlight mode for client explanation
4. add multi-overlay transparency once more real rounds are uploaded
