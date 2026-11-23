#!/usr/bin/env python3
"""Builds the SpecTrim Story page: src/story/* -> ../../index.html (one self-contained file).
Run from anywhere:  python3 src/story/build.py
"""
import os
here=os.path.dirname(os.path.abspath(__file__))
r=lambda n:open(os.path.join(here,n),encoding='utf-8').read()
# part7.js = interface scene data + code (kept as three source files)
part7=r('ws_data.js')+'\n'+r('ex_data.js')+r('ws_code.js')
head=r('part1_head.html');body=r('part2_body.html')
css=r('part4.css')+r('part5.css')+r('part6.css')
j=r('part3.js').replace('__QDATA__',r('qdata.json').strip())
assert j.rstrip().endswith('})();')
j=j.rstrip()[:-5]            # the IIFE opened in part3 is closed after part7
js=j+'\n'+r('part4.js')+'\n'+r('part5.js')+r('part6.js')+'\n'+r('cues.js')+'\n'+part7+'\n})();\n'
page=head+'\n<style>\n'+css+'\n</style>\n'+body+'\n<script>\n'+r('lenis.min.js')+'\n</script>\n<script>\n'+js+'</script>\n'
# the page parts were written as an artifact (title and meta first, no <head>); turn that into a normal document
page=page.replace('<title>SpecTrim Story</title>\n','',1).replace('<meta name="claude:viewport-fit-sides" content="cover">\n','',1)
doc=('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
     '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
     '<title>SpecTrim Story</title></head><body>\n'+page+'\n</body></html>\n')
out=os.path.abspath(os.path.join(here,'..','..','index.html'))
open(out,'w',encoding='utf-8').write(doc)
print('wrote',out,len(doc),'bytes')
