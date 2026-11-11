"""python3 sheet.py <tag> [cols]  ->  t/sheet_<tag>_N.png  contact sheets of every screenshot for one size"""
import sys,glob,os
from PIL import Image,ImageDraw
tag=sys.argv[1];cols=int(sys.argv[2]) if len(sys.argv)>2 else 3
fs=sorted(glob.glob('t/shots/*-%s_*.png'%tag));per=cols*3
for n in range(0,len(fs),per):
    part=fs[n:n+per];im0=Image.open(part[0]);w=600;h=int(w*im0.height/im0.width)
    W=Image.new('RGB',(cols*w,((len(part)+cols-1)//cols)*(h+18)),(0,0,0));d=ImageDraw.Draw(W)
    for i,f in enumerate(part):
        x,y=(i%cols)*w,(i//cols)*(h+18);W.paste(Image.open(f).convert('RGB').resize((w,h)),(x,y+18));d.text((x+4,y+3),os.path.basename(f)[9:-4],fill=(255,255,0))
    o='t/sheet_%s_%d.png'%(tag,n//per);W.save(o);print(o)
