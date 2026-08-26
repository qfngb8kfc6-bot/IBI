# QA report

The authoritative import validates 500 unique companies, 500 unique locations, non-empty country/group/locality values, valid centroid coordinates and public relationship integrity. It found 40 country grouping keys. Relationship totals are recorded in generated metadata.

Automated checks cover totals, location validity, search prefixes, combined filtering/aggregation, slug resolution, comparison limits, missing financial treatment, URL protocols, and related-table totals. The production server and SPA response were smoke-tested with `curl`. The country display is deliberately schematic rather than a border-accurate choropleth; all represented countries still use authoritative centroid aggregation and have an accessible list equivalent. Browser binaries, Lighthouse and Playwright were unavailable in the dependency-restricted environment, so visual/browser automation remains a required IBI CI handoff check rather than a claimed pass.
