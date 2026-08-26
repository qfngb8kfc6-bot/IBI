# Architecture

## Decision
The repository was empty except for the workbook. The production application is dependency-free browser JavaScript with a portable static build rather than React/Vite. This is a deliberate environmental adaptation: the package registry returned HTTP 403 for React, Vite and D3 during implementation. It preserves all product behavior while avoiding a compromised or partially installable dependency tree.

The importer is a Node command wrapper around a dependency-free Python OOXML parser. It validates IDs, required values, centroid ranges and all public company relationships, then emits one deterministic JSON repository. UI code accesses only that generated repository and can be replaced with an HTTP adapter later. The local SVG uses an abstract world silhouette plus centroid-projected aggregates; it downloads no tiles or geography at runtime.

Routes use the History API and require an SPA fallback to `index.html`. The fixed `/company-finder` path is isolated in one `BASE` constant; IBI can alter it during integration. Static source, JSON, and styles are copied byte-for-byte into `dist/`.
