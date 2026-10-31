// GLSL sources for the ink signature effect (WebGL 1).
// The fragment shader only does real work inside the letters of the name:
// the mask is sampled first and every fragment outside it returns transparent.
// Inside the letters: domain-warped fbm built from a vec2 value noise
// (q: 2 octaves, r: 2 octaves, f: 3 octaves = 7 noise evaluations at quality 1).
// The glyph outline comes from the static h1 underneath (mask is eroded).

export const VERTEX_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

/** Octave counts per quality level: [q/r octaves, f octaves]. */
const OCTAVES = { 1: [2, 3], 0.5: [1, 2] };

/** Scale a partial fbm sum so its range matches the 3-octave reference (0.875). */
const norm = (n) => (0.875 / (1 - Math.pow(0.5, n))).toFixed(4);

/**
 * Build the fragment shader for a quality level.
 * @param {number} quality 1 (full) or 0.5 (degraded)
 * @returns {string}
 */
export function fragmentShader(quality) {
  const [qr, f] = OCTAVES[quality] || OCTAVES[1];
  return `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uScale;
uniform sampler2D uMask;
uniform vec3 uInk, uInk2, uAccent;
uniform vec2 uPts[8];
uniform float uAge[8];
vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
vec2 vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash2(i),hash2(i+vec2(1.,0.)),f.x),mix(hash2(i+vec2(0.,1.)),hash2(i+vec2(1.,1.)),f.x),f.y);}
vec2 fbm2(vec2 p){vec2 v=vec2(0.);float a=.5;for(int i=0;i<${qr};i++){v+=a*vnoise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v*${norm(qr)};}
float fbm1(vec2 p){float v=0.;float a=.5;for(int i=0;i<${f};i++){v+=a*vnoise(p).x;p=p*2.03+vec2(1.7,9.2);a*=.5;}return v*${norm(f)};}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float m=texture2D(uMask,uv).r;
  if(m<0.002){gl_FragColor=vec4(0.);return;}
  // Erode the mask edge so the crisp static h1 draws the glyph outline,
  // even when the canvas is rendered below device resolution.
  m=smoothstep(.4,1.,m);
  vec2 p=gl_FragCoord.xy*uScale;
  vec2 warp=vec2(0.);
  for(int i=0;i<8;i++){vec2 d=p-uPts[i];float k=exp(-dot(d,d)*5.)*(1.-uAge[i]);warp+=vec2(-d.y,d.x)*k*1.6+d*k*.4;}
  vec2 q=fbm2(p+vec2(.12*uTime,-.09*uTime));
  vec2 r=fbm2(p+3.5*q+warp+vec2(1.7+.1*uTime,9.2));
  float f=fbm1(p+3.2*r);
  vec3 ink=mix(uInk,uInk2,smoothstep(.32,.78,f));
  ink=mix(ink,uAccent,smoothstep(.5,.85,length(r))*.55);
  gl_FragColor=vec4(ink*m,m);
}`;
}
