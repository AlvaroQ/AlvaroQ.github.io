// GLSL sources for the project-card ripple (WebGL 1).
// A heightfield is simulated at a few CSS px per cell (wave + drop passes, ping-pong textures);
// the render pass refracts a copy of the cover image where the water moves and draws faint ink
// rings over the rest of the card. Where the surface is flat the output is fully transparent,
// so the real <img> underneath stays visible pixel for pixel.

const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
`;

export const VERTEX_SHADER = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';

/** One damped wave step: (previous, current) → next height, clamped so energy never saturates. */
export const WAVE_SHADER = `${HEAD}uniform sampler2D uP,uC;uniform vec2 uT;uniform float uD;
void main(){
  float p=texture2D(uP,v).r,c=texture2D(uC,v).r;
  float lap=texture2D(uC,v-vec2(uT.x,0.)).r+texture2D(uC,v+vec2(uT.x,0.)).r
    +texture2D(uC,v+vec2(0.,uT.y)).r+texture2D(uC,v-vec2(0.,uT.y)).r-4.*c;
  gl_FragColor=vec4(clamp((2.*c-p+.45*lap)*uD,-1.,1.),0.,0.,1.);
}`;

/** Adds up to four drops (x, y, radius, strength in sim cells) as cosine bumps. */
export const DROP_SHADER = `${HEAD}uniform sampler2D uS;uniform vec2 uSize;uniform vec4 uDrop[4];
void main(){
  float h=texture2D(uS,v).r;vec2 p=v*uSize;
  for(int i=0;i<4;i++){vec4 d=uDrop[i];if(d.z>0.){float r=length(p-d.xy)/d.z;if(r<1.)h+=d.w*(.5+.5*cos(3.14159*r));}}
  gl_FragColor=vec4(h,0.,0.,1.);
}`;

/**
 * Render pass. Coordinates are canvas CSS px with y down; the canvas covers the whole card.
 * uClip: visible media box (x0, y0, x1, y1). uEl: untransformed <img> box (x, y, w, h).
 * uFit: displayed bitmap inside the element (ox, oy, w, h). uZoom: the hover scale of the <img>.
 * Output is premultiplied alpha.
 */
export const RENDER_SHADER = `${HEAD}uniform sampler2D uH,uImg;uniform vec2 uT,uSize;
uniform vec4 uClip,uEl,uFit;
uniform float uZoom,uHasImg,uLight,uForce;
uniform vec3 uInk;
uniform float uRefr,uSpec,uShade,uRing;
// CSS filter: sepia(.25) contrast(1.05), as on the card image.
vec3 filt(vec3 c){
  vec3 s=vec3(dot(c,vec3(.393,.769,.189)),dot(c,vec3(.349,.686,.168)),dot(c,vec3(.272,.534,.131)));
  c=mix(c,min(s,1.),.25);return clamp((c-.5)*1.05+.5,0.,1.);
}
vec4 image(vec2 p){
  vec2 c=uEl.xy+uEl.zw*.5;vec2 q=c+(p-c)/uZoom-uEl.xy;
  vec2 t=(q-uFit.xy)/uFit.zw;
  float inside=step(0.,t.x)*step(t.x,1.)*step(0.,t.y)*step(t.y,1.);
  return vec4(filt(texture2D(uImg,clamp(t,0.,1.)).rgb),inside);
}
void main(){
  float h=texture2D(uH,v).r;
  float dx=texture2D(uH,v+vec2(uT.x,0.)).r-texture2D(uH,v-vec2(uT.x,0.)).r;
  float dy=texture2D(uH,v+vec2(0.,uT.y)).r-texture2D(uH,v-vec2(0.,uT.y)).r;
  vec3 N=normalize(vec3(-dx*6.,-dy*6.,1.));
  vec3 L=normalize(vec3(-.35,.45,1.));vec3 H=normalize(L+vec3(0.,0.,1.));
  // Specular relative to the flat surface, so still water adds no light.
  float base=pow(H.z,70.);
  float spec=max(pow(max(dot(N,H),0.),70.)-base,0.)/(1.-base);
  float slope=dot(N,L)-L.z;
  // How much the water moves here: 0 on a flat surface, so the real image shows through.
  float wet=max(uForce,smoothstep(.004,.04,length(vec2(dx,dy))+abs(h)*.1));
  vec2 p=vec2(v.x,1.-v.y)*uSize;
  bool inImg=uHasImg>.5&&p.x>=uClip.x&&p.x<=uClip.z&&p.y>=uClip.y&&p.y<=uClip.w;
  vec4 o=vec4(0.);
  if(inImg){
    // The edge fade keeps the refraction from pulling pixels across the frame.
    float e=min(min(p.x-uClip.x,uClip.z-p.x),min(p.y-uClip.y,uClip.w-p.y));
    float k=smoothstep(0.,14.,e);
    vec4 im=image(p+vec2(dx,-dy)*uRefr*k);
    vec3 col=im.rgb+(uLight>.5?vec3(1.):uInk)*spec*uSpec*k;
    col*=1.+slope*uShade*k;
    o=vec4(col,1.)*im.a*wet;
  }else{
    float a=clamp(abs(slope)*uShade*uRing,0.,.12);
    o=vec4(uInk*a,a);
  }
  gl_FragColor=o;
}`;
