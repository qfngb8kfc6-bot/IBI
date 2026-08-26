# Data dictionary

| Application field | Workbook source | Key / treatment |
|---|---|---|
| `id`, `name`, `legalName` | Companies | Company ID is canonical; names are display text |
| `slug` | Companies | Normalized display name plus immutable Company ID |
| `country`, `countryCode`, `locality`, `latitude`, `longitude` | Locations | Joined by Company ID; grouping key retained; coordinates explicitly labelled country centroid |
| `type`, `secondaryType`, description, ownership, parent, website, address | Companies | Whitespace normalized; blanks remain blank |
| `sectors` | Company Sectors + Sectors | Company ID and Sector ID joins only |
| `products` | Products & Brands | Source row retained, joined by Company ID |
| `contacts`, `people`, `markets`, `financials`, `scale`, `sources` | Same-named sheets | Source rows retained, joined by Company ID; missing numeric values remain empty |
| `search` | Public fields above | Lowercase token index; prefix token matching, not arbitrary substrings |

Excel serial verification dates are retained exactly as source values in v1 to avoid inventing timezone/date semantics. URLs are protocol-validated at render time. Developer-only Data Quality rows are validated during research but are not published.
