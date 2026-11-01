// GLSL sources for the Projects ripple (WebGL 1).
// A heightfield covering the whole section is simulated at a few CSS px per cell (wave + drop
// passes, ping-pong textures); the render pass draws faint ink rings over the visible window of
// the section and nothing over the project images, so they stay pixel for pixel.

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

/** Most image boxes the render pass can leave untouched (cards on screen at once, with margin). */
export const MAX_HOLES = 16;

/**
 * Render pass over the visible window of the section. Coordinates are section CSS px, y down.
 * uWin: window top and height inside the section. uSection: section size.
 * uHoles: image boxes (x0, y0, x1, y1) where nothing is drawn. Output is premultiplied alpha.
 */
export const RENDER_SHADER = `${HEAD}uniform sampler2D uH;uniform vec2 uT,uSection,uWin;
uniform vec4 uHoles[${MAX_HOLES}];uniform float uHoleCount;
uniform vec3 uInk;uniform float uShade,uRing;
void main(){
  vec2 p=vec2(v.x*uSection.x,uWin.x+(1.-v.y)*uWin.y);
  for(int i=0;i<${MAX_HOLES};i++){
    if(float(i)>=uHoleCount)break;
    vec4 b=uHoles[i];
    if(p.x>=b.x&&p.x<=b.z&&p.y>=b.y&&p.y<=b.w){gl_FragColor=vec4(0.);return;}
  }
  vec2 t=vec2(p.x/uSection.x,1.-p.y/uSection.y);
  float dx=texture2D(uH,t+vec2(uT.x,0.)).r-texture2D(uH,t-vec2(uT.x,0.)).r;
  float dy=texture2D(uH,t+vec2(0.,uT.y)).r-texture2D(uH,t-vec2(0.,uT.y)).r;
  vec3 N=normalize(vec3(-dx*6.,-dy*6.,1.));
  vec3 L=normalize(vec3(-.35,.45,1.));
  float slope=dot(N,L)-L.z;
  // Fade at the section's top and bottom edges, where the waves reflect.
  float edge=smoothstep(0.,80.,min(p.y,uSection.y-p.y));
  float a=clamp(abs(slope)*uShade*uRing,0.,.12)*edge;
  gl_FragColor=vec4(uInk*a,a);
}`;
