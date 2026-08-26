# Engineering guidance

## Structure
- `data/`: authoritative source workbook; never publish it.
- `scripts/`: deterministic import, validation, build, and local server tooling.
- `public/`: static application and generated read-only JSON.
- `tests/`: Node unit/data-contract checks.
- `dist/`: disposable production output.

## Rules and definition of done
Preserve source meaning and IDs, join on IDs, render content as text, retain unavailable statuses, and never infer locations or financial values. Country coordinates are aggregations—not HQ pins. Run import, test, lint, typecheck, build and browser inspection. Keep all runtime dependencies optional: the production app must remain a static artifact.
