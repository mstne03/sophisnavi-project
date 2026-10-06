import json, re, unicodedata, datetime, io
ROOT='.'  # ejecutar desde la raíz del repo: python data/seed/build-content-seed.py
md=io.open(f'{ROOT}/docs/content/sections.md',encoding='utf-8').read()
snap=json.load(io.open(f'{ROOT}/data/seed/notion-snapshot.json',encoding='utf-8'))

def slugify(t):
    t=unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode().lower()
    t=re.sub(r"[^a-z0-9]+","-",t).strip('-')
    return t

def field(block,label):
    m=re.search(r"\*\*"+re.escape(label)+r"[^*]*\*\*\s*(.+)",block)
    return m.group(1).strip() if m else None
def intro(block,label,stop):
    m=re.search(r"\*\*"+re.escape(label)+r"\*\*\s*\n\n(.*?)\n\n\*\*"+stop,block,re.S)
    return m.group(1).strip() if m else None

sections=[]
for m in re.finditer(r"### (\d)\. (.+?) · `/es/([a-z-]+)` · `/en/([a-z-]+)`\n(.*?)(?=\n---\n)",md,re.S):
    pos,_,slug_es,slug_en,block=m.groups()
    sections.append({
      "position":int(pos),"slug_es":slug_es,"slug_en":slug_en,
      "title_es":field(block,"Título ES:"),"title_en":field(block,"Title EN:"),
      "seo_description_es":field(block,"Descripción SEO ES"),"seo_description_en":field(block,"SEO description EN"),
      "intro_md_es":intro(block,"Intro ES:","Title EN"),
      "intro_md_en":re.search(r"\*\*Intro EN:\*\*\s*\n\n(.*)",block,re.S).group(1).strip(),
    })
assert len(sections)==6, len(sections)

cats=[]
for row in re.findall(r"^\| (\d+) \| ([a-z-]+) \| (.+?) \| `(.+?)` \| (.+?) \| `(.+?)` \|$",md,re.M):
    n,sec,name_es,slug_es,name_en,slug_en=row
    cats.append({"position":int(n),"section_slug":sec,"name_es":name_es,"slug_es":slug_es,"name_en":name_en,"slug_en":slug_en})
assert len(cats)==11, len(cats)
# cruzar con Notion
notion={re.sub(r"^\d+\.\s*","",c["name_es"]):c for c in snap["categories"]}
for c in cats:
    nc=notion.get(c["name_es"]); assert nc and nc["section"]==c["section_slug"], c
    c["notion_name"]=nc["name_es"]

cat_by_slug={c["slug_es"]:c for c in cats}
pages=[]
for v in snap["videos"]:
    c=cat_by_slug[v["category_slug"]]
    body=v["body_md"].strip()
    if v.get("hook") and not body: body=v["hook"].strip()
    if v["sources"]: body+=("\n\n" if body else "")+"## Fuentes\n"+"\n".join(f"- {s}" for s in v["sources"])
    seo=re.sub(r"\s+"," ",re.sub(r"[#*_>`\-]"," ",body.split("## Fuentes")[0]))[:150].rsplit(" ",1)[0].strip().rstrip(",;:") if body else ""
    pages.append({"type":"article","category_slug":c["slug_es"],"status":"draft",
      "notion_published_at":v.get("published_at"),"video_url":v.get("video_url"),
      "translations":{"es":{"slug":slugify(v["title"]),"title":v["title"],"seo_description":seo,"body_md":body}},
      "sources":v["sources"]})
pages.append({"type":"gallery","category_slug":"merchandising","status":"draft","notion_published_at":None,"video_url":None,
  "translations":{"es":{"slug":"mi-coleccion-de-avatar","title":"Mi colección de Avatar","seo_description":"Figuras, libros de arte, ediciones físicas y merchandising de Avatar: la colección de sophisnavi desde 2009.","body_md":snap["collection_intro_notes"].strip()}},
  "sources":[],"media":[]})
slugs=[p["translations"]["es"]["slug"] for p in pages]; assert len(slugs)==len(set(slugs))
out={"$schema_note":"JSON intermedio del seed de la fase 1 (plan: paso 1.2). Generado por script desde docs/content/sections.md y data/seed/notion-snapshot.json. Todo status=draft. Sin filas EN en pages: la versión EN es opcional por página.",
 "generated_at":datetime.date.today().isoformat(),"locales":["es","en"],"sections":sections,"categories":cats,"pages":pages,
 "counts":{"sections":6,"categories":11,"pages":len(pages),"articles":len(pages)-1,"galleries":1}}
io.open(f'{ROOT}/data/seed/content-seed.json','w',encoding='utf-8',newline='\n').write(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
print(json.dumps(out["counts"]),len(json.dumps(out,ensure_ascii=False)),"chars")
for s in sections: print(s["position"],s["slug_es"],s["slug_en"],len(s["intro_md_es"].split()),"/",len(s["intro_md_en"].split()),"palabras |",s["title_es"],"|",s["title_en"])
for p in pages: print(p["type"],p["category_slug"],p["translations"]["es"]["slug"],len(p["translations"]["es"]["body_md"]))
