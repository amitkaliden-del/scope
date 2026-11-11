"""Build-time palettes. The kit CSS is written in Cyber Violet; every other palette is a recolour of it."""
import re,colorsys
PAL={
 'violet':None,
 'navy':   dict(hue=222,sat=1.0,a1='#19f0d2',a4='#8f6bff',a2='#ff3d9a',lime='#b8ff3d',orange='#ff8a1f'),
 'forest': dict(hue=152,sat=.9, a1='#19f08a',a4='#ffc233',a2='#ff7a3d',lime='#b6ff3b',orange='#ffb347'),
 'plum':   dict(hue=285,sat=1.0,a1='#ff3df0',a4='#3df0ff',a2='#ff7a5c',lime='#ffd23f',orange='#ff9f3d'),
 'volcano':dict(hue=8,  sat=.85,a1='#ff6a1a',a4='#ffb347',a2='#ff2d7a',lime='#ffe14d',orange='#ff9f3d'),
 'arctic': dict(hue=195,sat=.8, a1='#5cffc8',a4='#9ad8ff',a2='#ff7aa8',lime='#ffe14d',orange='#ffb347'),
 'daylight':dict(hue=205,sat=.55,a1='#0b7a75',a4='#2f6fd0',a2='#c2338a',lime='#12824a',orange='#b9650f',light=True),
}
ACC={'#9d6bff':'a1','#3df0ff':'a4','#ff4fd8':'a2','#b8ff3d':'lime','#ff9f3d':'orange'}
def _rgb(h):
    h=h.lstrip('#')
    if len(h) in(3,4): h=''.join(c*2 for c in h)
    return tuple(int(h[i:i+2],16)/255 for i in(0,2,4)),h[6:8]
def _hex(r,g,b,a=''): return '#%02x%02x%02x'%(round(r*255),round(g*255),round(b*255))+a
def recolour(css,name):
    p=PAL[name]
    if not p: return css
    light=p.get('light')
    def f(m):
        tok=m.group(0).lower();(r,g,b),a=_rgb(tok);base=_hex(r,g,b)
        if base in ACC: return p[ACC[base]]+a
        h,l,s=colorsys.rgb_to_hls(r,g,b);hd=h*360
        violet=215<=hd<=305 and s>.12
        if violet and l<.5:                      # dark family: backgrounds, panels, lines
            if light and base in ('#4b3d9c','#251a5c','#1a1243'):   # spotlight tiles stay dark so cut-outs show
                return _hex(*colorsys.hls_to_rgb(p['hue']/360,l,s*.5),a)
            l2=(0.985-l*0.62) if light else l
            return _hex(*colorsys.hls_to_rgb(p['hue']/360,max(0,min(1,l2)),min(1,s*p['sat']*(.55 if light else 1))),a)
        if violet and l>=.5 and s<.95 and l<.97: # pale tints: ink, muted text
            if light: return {'#eef6ff':'#16212b','#b3a9e0':'#4a5d6e'}.get(base,base)+a
            return _hex(*colorsys.hls_to_rgb(p['hue']/360,l,min(1,s*p['sat'])),a)
        return tok
    out=re.sub(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b',f,css)
    if light:
        out=out.replace('color-scheme:dark','color-scheme:light')
        out+=open(__file__.replace('palettes.py','light.css')).read()
    return out
