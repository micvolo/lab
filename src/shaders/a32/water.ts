import { map, perlin3d, rotation3d } from "./utils";

export const vertex = /* glsl */ `
  uniform float uTime;
  uniform float PI;
  uniform float uWaveAmp;
  uniform float uWaveNoise;
  uniform float uWaveTime;
  uniform float uRand;
  uniform vec2 uResolution;

  varying float vElevation;
  varying float vT;
  varying vec2 vUv;
  varying vec3 vPosition;

  ${perlin3d}
  ${rotation3d}
  ${map}

  vec4 displace(vec3 p, float uTime, float uRand) {
    vec3 q = p;
    float ld = uWaveTime;
    float timeNoise = cnoise(vec3(-p * .01 + (1000. * uRand) + (uTime * .1))  ) + .8;
    float off = -q.z * timeNoise * (ld / 4.);
    float t = mod(uTime + off, ld) / ld;
    float u = t * PI * 2.;

    // wave height
    q.y += sin(u + 2. - cos(u + .5) * .5) * uWaveAmp;
    q.z += cos(u) * uWaveAmp;
    
    return vec4(q, u);
  }

  void main() {
    // WAVE HEIGHT
    vec3 rotated = (vec4(position, 1.) * rotation3d(vec3(1., 0., 0.), -PI/2.)).xyz;
    vec4 pos = displace(rotated, uTime, uRand);
    float u = pos.w;
    float heightNoise = cnoise(vec3((position + uTime) * .1 + (1000. * uRand))) * 1.5;
    pos.y += heightNoise;

    // NOISE Y
    float fy = sin(u) * .5 + .5;
    float yoff = cnoise(vec3(position * 2. + uTime * .5)) * mix(.1, .3, fy) +
                 cnoise(vec3(position * 4. + uTime * .5)) * mix(.1, .3, fy) * .5 +
                 cnoise(vec3(position * 8. + uTime * .5)) * mix(.1, .3, fy) * .25;

    pos.y += yoff * uWaveNoise;

    // NOISE
    float zoff = cnoise(vec3(position * .5 + vec3(uTime, 0., 0.) * .0)) * .5 +
                 cnoise(vec3(position * 1.)) * .3 +
                 cnoise(vec3(position * 4.)) * .15;

    float fz = sin(u + 2.) * .5 + .5;
    pos.z += zoff * fz * uWaveNoise;

    vec4 modelPosition = modelMatrix * vec4(pos.xyz, 1.0);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // VARIABLES FOR FRAGMENT
    vUv = uv;
    vPosition = position;
    vT = sin(u - 1.75 + zoff + yoff) * .5 + .5;
    float yd = uWaveAmp + mix(.1, .3, fy) * 1.75;
    vElevation = smoothstep(.1, .75, map(pos.y, -yd, yd, 0., 1.));
    // vElevation = clamp(map(pos.y, -.6, .25, 0., 1.), 0., 1.);
}`;


export const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uWaveAmp;
  uniform vec2 uResolution;

  varying vec2 vUv;
  varying float vElevation;
  varying float vT;
  varying vec3 vPosition;

  void main() {
    float circle = 1. - step(length(uResolution.x)/2., length(vPosition));

    vec4 c0 = vec4(vec3(2., 44., 104.)/255., 0.);
    vec4 c1 = vec4(vec3(16., 144., 161.)/255., .0);
    vec4 c2 = vec4(vec3(159., 184., 189.)/200., .5);
    vec4 c3 = vec4(vec3(160., 180., 180.)/255., 1.);

    vec3 colorA = c0.rgb;
    float stopA = c0.a;
    for (float i = 1.; i < 4.; i++) {
      vec4 cB = c1;
      if (i == 2.) cB = c2;
      if (i == 3.) cB = c3;
      vec3 colorB = cB.rgb;
      float stopB = cB.a;
      float fc = smoothstep(stopA, stopB, vElevation);
      colorA = mix(colorA, colorB, fc);
      stopA = cB.a;
    }

    // TEXTURE
    colorA = mix(texture2D(uTex, fract(vUv * 10.)).rgb, colorA, vElevation);
    // SMOOTHING
    colorA = mix(colorA, c1.rgb, pow(1. - vElevation, 2.) * .9);
    // DARK
    colorA *= mix(vec3(1.), c0.rgb, pow(vT, 2.) * mix(.9, 1., smoothstep(.6, 1., uWaveAmp)) * smoothstep(0., .6, uWaveAmp));

    gl_FragColor = vec4(colorA, 1.) * circle;
  }
`;