"""python3 build.py <lab> [palette] [assets.json ...]  ->  out/<lab>-<palette>.html"""
import sys,json,os
from palettes import recolour,PAL
here=os.path.dirname(os.path.abspath(__file__))
lab=sys.argv[1];pal=sys.argv[2] if len(sys.argv)>2 else 'violet'
assets={}
for f in sys.argv[3:] or [os.path.join(here,'labs',lab+'.assets.json')]:
    d=json.load(open(f));assets.update(d.get('A',d) if isinstance(d.get('A',None),dict) else d)
css=open(os.path.join(here,'base.css')).read()+open(os.path.join(here,'kit.css')).read()
css=recolour(css,pal)
js="'use strict';\nconst IMG="+json.dumps(assets)+";\n"+open(os.path.join(here,'labs',lab+'.js')).read()+"\n"+open(os.path.join(here,'core.js')).read()
html=open(os.path.join(here,'shell.html')).read().replace('/*CSS*/',css).replace('/*JS*/',js)
os.makedirs(os.path.join(here,'out'),exist_ok=True)
o=os.path.join(here,'out','%s-%s.html'%(lab,pal));open(o,'w').write(html);print(o,len(html)//1024,'KB')
