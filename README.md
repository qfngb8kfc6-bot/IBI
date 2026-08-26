# IBI Company Finder

A portable, static, country-level discovery product for 500 leisure-marine organisations. It provides deterministic search, combined filters, an accessible country aggregation map/list, deep-linked profiles and shareable two/three-company comparisons. No runtime database, map tile service, tracker, geocoder, or secret is required.

## Start locally

Requires Node 20+ and Python 3.11+ (only Python's standard library is used).

### Prerequisite: obtain the project files

The project files in the Codex/build workspace are **not automatically copied
to your Mac**. Before using npm, obtain an exported ZIP or Git checkout of this
repository from the person/system that owns the workspace or pull request.

After downloading a ZIP:

1. Open Finder and go to **Downloads**.
2. Double-click the ZIP to extract it.
3. Open the extracted folder and confirm it contains `package.json`, `README.md`,
   `public`, `scripts`, and `data`.
4. Only then continue with the terminal steps below.

For a Git checkout, the repository owner must provide the actual Git URL and
access permission. Then use the supplied URL—not a placeholder:

```bash
git clone ACTUAL_REPOSITORY_URL
cd ACTUAL_CLONED_FOLDER
test -f package.json && echo "IBI Company Finder project found"
```

If no ZIP, repository URL, or repository access has been supplied, local startup
is blocked: there is nothing on the Mac for `cd`, `find`, or `npm` to open.

All `npm` commands **must be run from this repository's root directory**, the
folder that contains this `README.md` and `package.json`.

> **Do not copy a guessed path such as `~/Downloads/IBI`.** That path is only
> valid if an `IBI` folder really exists there. Use the automatic finder below
> to locate the downloaded project first.

On macOS, paste this complete block into Terminal. It searches the usual user
folders for this project's manifest and changes into the correct directory:

```bash
PROJECT_MANIFEST="$({
  find "$HOME/Downloads" "$HOME/Desktop" "$HOME/Documents" \
    -maxdepth 8 -type f -name package.json \
    -exec grep -l '"name"[[:space:]]*:[[:space:]]*"ibi-company-finder"' {} \; \
    2>/dev/null
} | head -n 1)"

if [ -z "$PROJECT_MANIFEST" ]; then
  echo "IBI Company Finder was not found. Obtain and extract the project ZIP, or clone the supplied repository URL, before running npm."
else
  cd "$(dirname "$PROJECT_MANIFEST")" || exit 1
  echo "IBI Company Finder project found at: $(pwd)"
fi
```

Only continue when Terminal prints `IBI Company Finder project found at:` followed
by a path. Then run:

```bash
npm run import:data -- ./data/IBI_Company_Finder_Database_v3.xlsx
npm run dev
```

Open `http://localhost:4173/company-finder/`. Keep that terminal window open
while reviewing the site; press <kbd>Control</kbd>+<kbd>C</kbd> to stop it. Set
`PORT` to change the local port. No `npm install` is needed for the local static
application or its core tests.

### Other commands

Run these from the same project directory:

```bash
npm test
npm run lint && npm run typecheck
npm run build
npm run preview
```

The production output is written to `dist/`. The source workbook remains in
`data/`, never `public/` or `dist/`.

## Troubleshooting `npm error enoent ... package.json`

An error such as:

```text
npm error path /Users/your-name/package.json
npm error enoent Could not read package.json
```

means the terminal is in your home folder (or another folder), rather than in
the downloaded/cloned IBI project. It does **not** indicate a missing package in
the application.

1. Run the automatic project-finder block in **Start locally** above.
2. If it reports that the project was not found, the repository has not been
   downloaded into Downloads, Desktop, or Documents. Request the project ZIP or
   actual Git repository URL/access from the repository owner. Download/clone it
   first, and extract it if it arrived as a ZIP archive.
3. As a Finder-based alternative, locate the extracted project folder—the one
   containing `package.json`, `public`, `scripts`, and `data`. Type `cd ` in
   Terminal, including the trailing space, drag that folder into Terminal, and
   press Return.
4. Run `pwd` and `test -f package.json && echo "Project found"`.
5. Only after `Project found` appears, run `npm run dev`.

Alternatively, run a command from anywhere by passing the project path to npm:

```bash
npm --prefix /absolute/path/to/IBI run dev
```

Replace `/absolute/path/to/IBI` with the actual folder printed by the automatic
finder. For the reported path `/Users/lucadominguez/package.json`, npm is still
running in the home folder. The failed `cd ~/Downloads/IBI` confirms there is no
project at that guessed location; running more npm commands there will continue
to produce the same `ENOENT` until the project is found or downloaded.

Theme tokens live at the beginning of `public/styles.css`. Analytics integration is intentionally a no-op in v1; approved event plumbing belongs behind a future adapter rather than direct vendor calls.
