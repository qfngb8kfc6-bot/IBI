# Browser data dictionary

`public/data/companies.json` contains `meta` and `companies`. `meta` records schema version, source filename, count and the latest workbook verification date. Each company includes:

| Group | Fields | Source |
| --- | --- | --- |
| Identity | `id`, `name`, `legalName`, `primaryType`, `secondaryType`, `ownership`, `parentGroup`, `ticker` | Companies |
| Geography | `country`, `countryCode`, `locality`, broad `location` label/centroid/precision | Companies + Locations |
| Classification | `primarySector`, `sectors`, `summary`, `description` | Companies + Company Sectors |
| Offering | `products` (name, type, sector, relationship) | Products & Brands |
| Reach | `markets`, `scale` | Markets & Territories + Companies |
| Finance | `employees`, `financials` revenue/profit/currency/year/basis | Companies |
| People/contact | `people`, company-level `contact` | Key People + Contacts |
| Provenance | `researchStatus`, `lastVerified`, `quality`, `sourceUrl` | Companies + Data Quality |

Missing workbook values remain `null` or empty arrays. Monetary amounts are not converted between currencies.
