#!/usr/bin/env python3
"""Dependency-free, deterministic XLSX to browser JSON importer."""
import json
import re
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
OFFICE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_REL = "http://schemas.openxmlformats.org/package/2006/relationships"

def column_index(reference):
    letters = re.match(r"[A-Z]+", reference).group(0)
    value = 0
    for letter in letters:
        value = value * 26 + ord(letter) - 64
    return value - 1

def clean(value):
    if value is None:
        return None
    value = str(value).strip()
    return value or None

def excel_date(value):
    if not value:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return clean(value)
    return (datetime(1899, 12, 30) + timedelta(days=number)).date().isoformat()

def number(value):
    if value in (None, ""):
        return None
    try:
        parsed = float(value)
        return int(parsed) if parsed.is_integer() else parsed
    except (TypeError, ValueError):
        return None

def read_workbook(path):
    with zipfile.ZipFile(path) as archive:
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(t.text or "" for t in item.iter(f"{{{MAIN}}}t")) for item in root.findall(f"{{{MAIN}}}si")]
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {item.attrib["Id"]: item.attrib["Target"] for item in relationships.findall(f"{{{PACKAGE_REL}}}Relationship")}
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        sheets = {}
        for sheet in workbook.find(f"{{{MAIN}}}sheets"):
            target = targets[sheet.attrib[f"{{{OFFICE_REL}}}id"]].lstrip("/")
            filename = target if target.startswith("xl/") else f"xl/{target}"
            xml = ET.fromstring(archive.read(filename))
            rows = []
            for row in xml.findall(f".//{{{MAIN}}}sheetData/{{{MAIN}}}row"):
                values = []
                for cell in row.findall(f"{{{MAIN}}}c"):
                    index = column_index(cell.attrib["r"])
                    values.extend([None] * (index + 1 - len(values)))
                    kind = cell.attrib.get("t")
                    node = cell.find(f"{{{MAIN}}}v")
                    inline = cell.find(f"{{{MAIN}}}is")
                    raw = node.text if node is not None else None
                    if inline is not None:
                        raw = "".join(t.text or "" for t in inline.iter(f"{{{MAIN}}}t"))
                    if kind == "s" and raw is not None:
                        raw = shared[int(raw)]
                    elif kind == "b":
                        raw = raw == "1"
                    values[index] = raw
                rows.append(values)
            if not rows:
                sheets[sheet.attrib["name"]] = []
                continue
            headers = [clean(value) for value in rows[0]]
            sheets[sheet.attrib["name"]] = [
                {header: clean(row[index]) if index < len(row) else None for index, header in enumerate(headers) if header}
                for row in rows[1:]
                if any(clean(value) for value in row)
            ]
        return sheets

def grouped(rows, key="Company ID"):
    result = {}
    for row in rows:
        identifier = row.get(key)
        if identifier:
            result.setdefault(identifier, []).append(row)
    return result

def unique(values):
    return sorted({value for value in values if value}, key=str.casefold)

def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: xlsx_importer.py INPUT.xlsx OUTPUT.json")
    source, destination = map(Path, sys.argv[1:])
    if not source.is_file():
        raise SystemExit(f"Workbook not found: {source}")
    sheets = read_workbook(source)
    required = {"Companies", "Locations", "Company Sectors", "Products & Brands", "Markets & Territories", "Key People", "Contacts", "Data Quality"}
    missing = sorted(required - sheets.keys())
    if missing:
        raise SystemExit(f"Workbook is missing required sheets: {', '.join(missing)}")
    locations = grouped(sheets["Locations"])
    sectors = grouped(sheets["Company Sectors"])
    products = grouped(sheets["Products & Brands"])
    markets = grouped(sheets["Markets & Territories"])
    people = grouped(sheets["Key People"])
    contacts = grouped(sheets["Contacts"])
    quality = {row["Company ID"]: row for row in sheets["Data Quality"] if row.get("Company ID")}
    companies = []
    for row in sorted(sheets["Companies"], key=lambda item: item.get("Company ID") or ""):
        cid = row.get("Company ID")
        if not cid or not row.get("Company name"):
            continue
        location = (locations.get(cid) or [{}])[0]
        contact = (contacts.get(cid) or [{}])[0]
        q = quality.get(cid, {})
        company = {
            "id": cid,
            "name": row.get("Company name"),
            "legalName": row.get("Legal name"),
            "country": row.get("Country"),
            "countryCode": row.get("Country code"),
            "locality": row.get("Published HQ locality / region"),
            "location": {"label": row.get("Map location"), "latitude": number(location.get("Latitude")), "longitude": number(location.get("Longitude")), "precision": location.get("Coordinate precision")},
            "primaryType": row.get("Primary business type"),
            "secondaryType": row.get("Secondary business type"),
            "typeConfidence": row.get("Type confidence"),
            "primarySector": row.get("Primary sector"),
            "sectors": unique(item.get("Sector name") for item in sectors.get(cid, [])),
            "summary": row.get("Product / service summary"),
            "description": row.get("Business description"),
            "ownership": row.get("Ownership"),
            "parentGroup": row.get("Parent group"),
            "ticker": row.get("Ticker"),
            "employees": number(row.get("Employees")),
            "financials": {"revenue": number(row.get("Latest turnover / revenue")), "operatingProfit": number(row.get("Latest operating profit")), "netProfit": number(row.get("Latest net profit")), "currency": row.get("Currency"), "year": number(row.get("Financial year")), "basis": row.get("Financial basis")},
            "markets": unique(item.get("Market / territory") for item in markets.get(cid, [])),
            "products": [{"name": item.get("Brand / product / service"), "type": item.get("Record type"), "sector": item.get("Sector"), "relationship": item.get("Ownership / relationship")} for item in products.get(cid, []) if item.get("Brand / product / service")],
            "people": [{"name": item.get("Person name"), "role": item.get("Role / title")} for item in people.get(cid, []) if item.get("Person name")],
            "scale": row.get("Published scale / output"),
            "website": row.get("Website"),
            "standNumber": row.get("Stand number"),
            "contact": {"name": contact.get("Company / contact name"), "role": contact.get("Role"), "email": contact.get("Email"), "phone": contact.get("Phone")},
            "researchStatus": row.get("Research status"),
            "lastVerified": excel_date(row.get("Last verified")),
            "quality": {"completeness": number(q.get("Completeness %")), "financials": q.get("Financials"), "contacts": q.get("Contacts"), "nextAction": q.get("Next action")},
            "sourceUrl": row.get("Primary source URL")
        }
        companies.append(company)
    verified_dates = [company["lastVerified"] for company in companies if company["lastVerified"]]
    payload = {
        "meta": {"schemaVersion": 1, "source": source.name, "companyCount": len(companies), "dataAsOf": max(verified_dates) if verified_dates else None},
        "companies": companies
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(companies)} companies from {source} to {destination}")

if __name__ == "__main__":
    main()
