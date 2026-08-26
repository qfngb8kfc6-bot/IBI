"""Dependency-free, deterministic OOXML importer for the IBI workbook."""
import sys, zipfile, xml.etree.ElementTree as E, re, posixpath, json, os, hashlib, datetime
M='http://schemas.openxmlformats.org/spreadsheetml/2006/main'; R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'; NS={'m':M}

def clean(v): return re.sub(r'\s+', ' ', str(v or '')).strip()
def workbook_rows(path):
 z=zipfile.ZipFile(path); ss=[]
 if 'xl/sharedStrings.xml' in z.namelist(): ss=[''.join(t.text or '' for t in x.iter('{%s}t'%M)) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
 wb=E.fromstring(z.read('xl/workbook.xml')); rel=E.fromstring(z.read('xl/_rels/workbook.xml.rels')); rm={x.attrib['Id']:x.attrib['Target'] for x in rel}; out={}
 for sh in wb.find('m:sheets',NS):
  raw=rm[sh.attrib['{%s}id'%R]]; target=raw.lstrip('/') if raw.startswith('/') else posixpath.normpath(posixpath.join('xl',raw)); rows=[]
  for row in E.fromstring(z.read(target)).findall('.//m:sheetData/m:row',NS):
   vals=[]
   for c in row.findall('m:c',NS):
    col=0
    for x in re.match(r'[A-Z]+',c.attrib['r']).group(): col=col*26+ord(x)-64
    vals += ['']*(col-len(vals)); v=c.find('m:v',NS); val='' if v is None else v.text
    if c.attrib.get('t')=='s' and val: val=ss[int(val)]
    elif c.attrib.get('t')=='inlineStr': val=''.join(x.text or '' for x in c.iter('{%s}t'%M))
    vals[col-1]=clean(val)
   rows.append(vals)
  heads=rows[0]; out[sh.attrib['name']]=[{heads[i]: row[i] if i<len(row) else '' for i in range(len(heads))} for row in rows[1:] if any(row)]
 return out
def slug(s): return re.sub(r'(^-|-$)','',re.sub(r'[^a-z0-9]+','-',s.lower()))
def main(path):
 sheets=workbook_rows(path); errors=[]
 required={'Companies':['Company ID','Company name'],'Locations':['Location ID','Company ID','Map grouping key','Published HQ locality / region','Country','Latitude','Longitude']}
 for sheet,heads in required.items():
  if sheet not in sheets: errors.append(f'Missing worksheet: {sheet}'); continue
  missing=[h for h in heads if h not in (sheets[sheet][0] if sheets[sheet] else {})]
  if missing: errors.append(f'{sheet}: missing required headers: {", ".join(missing)}')
 companies=sheets.get('Companies',[]); locs=sheets.get('Locations',[]); ids=[x.get('Company ID','') for x in companies]; idset=set(ids)
 if len(companies)!=500: errors.append(f'Companies: expected 500 rows, found {len(companies)}')
 if len(ids)!=len(idset): errors.append('Companies: duplicate Company ID values')
 if len(locs)!=500: errors.append(f'Locations: expected 500 rows, found {len(locs)}')
 seen=set()
 for i,l in enumerate(locs,2):
  cid=l.get('Company ID','');
  if cid not in idset: errors.append(f'Locations row {i}: orphan Company ID {cid}')
  if cid in seen: errors.append(f'Locations row {i}: duplicate company location {cid}')
  seen.add(cid)
  for h in ['Map grouping key','Published HQ locality / region','Country']:
   if not l.get(h): errors.append(f'Locations row {i}: missing {h}')
  try:
   lat=float(l.get('Latitude','')); lon=float(l.get('Longitude',''))
   if not (-90<=lat<=90 and -180<=lon<=180): raise ValueError()
  except: errors.append(f'Locations row {i}: invalid country-centroid coordinates')
 relations=['Company Sectors','Products & Brands','Contacts','Key People','Markets & Territories','Financials','Scale & Output','Sources']
 for s in relations:
  for i,r in enumerate(sheets.get(s,[]),2):
   if r.get('Company ID') not in idset: errors.append(f'{s} row {i}: orphan Company ID {r.get("Company ID")}')
 expected=['Brunswick','Saffier Yachts','Omaya Yachts','Nanni','Seakeeper','Zipwake','Sunseeker','Yamaha','Windy','Volvo Penta','IBEX','Princess','Garmin','Yanmar','Viking Yacht','Sleipner','De Antonio Yachts','Quick','D-Marin','Raymarine']
 names=' '.join(x.get('Company name','').lower() for x in companies)
 for n in expected:
  if n.lower() not in names: errors.append(f'Expected company not found: {n}')
 if errors:
  print('IMPORT FAILED\n- '+'\n- '.join(errors),file=sys.stderr); sys.exit(1)
 by=lambda sheet,cid:[x for x in sheets.get(sheet,[]) if x.get('Company ID')==cid]
 locmap={x['Company ID']:x for x in locs}; sector_names={x['Sector ID']:x['Sector name'] for x in sheets['Sectors']}
 output=[]
 for c in companies:
  cid=c['Company ID']; l=locmap[cid]; cs=by('Company Sectors',cid)
  item={'id':cid,'slug':slug(c['Company name'])+'-'+cid.lower(),'name':c['Company name'],'legalName':c['Legal name'],'country':l['Country'],'countryCode':l['Map grouping key'],'locality':l['Published HQ locality / region'],'latitude':float(l['Latitude']),'longitude':float(l['Longitude']),'type':c['Primary business type'],'secondaryType':c['Secondary business type'],'description':c['Business description'],'summary':c['Product / service summary'],'ownership':c['Ownership'],'parentGroup':c['Parent group'],'website':c['Website'],'address':c['HQ address'],'lastVerified':c['Last verified'],'sectors':[sector_names.get(x['Sector ID'],x.get('Sector name','')) for x in cs], 'products':by('Products & Brands',cid),'contacts':by('Contacts',cid),'people':by('Key People',cid),'markets':by('Markets & Territories',cid),'financials':by('Financials',cid),'scale':by('Scale & Output',cid),'sources':by('Sources',cid)}
  searchable=' '.join([item['name'],item['legalName'],item['country'],item['locality'],item['type'],*item['sectors'],*[x.get('Brand / product / service','') for x in item['products']],*[x.get('Market / territory','') for x in item['markets']]])
  item['search']=re.sub(r'[^a-z0-9]+',' ',searchable.lower()).strip(); output.append(item)
 output.sort(key=lambda x:x['id']); os.makedirs('public/data',exist_ok=True)
 payload={'meta':{'companyCount':len(output),'locationCount':len(locs),'countryCount':len(set(x['countryCode'] for x in output)),'relatedCounts':{x:len(sheets[x]) for x in relations},'coordinatePrecision':'Country-level centroid'},'companies':output}
 text=json.dumps(payload,ensure_ascii=False,separators=(',',':'),sort_keys=True); open('public/data/companies.json','w').write(text+'\n')
 print(json.dumps(payload['meta'],indent=2)); print('SHA256',hashlib.sha256(text.encode()).hexdigest())
if __name__=='__main__': main(sys.argv[1])
