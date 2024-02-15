import { map, perlin3d, rotation3d } from "./utils";

export const vertex = /* glsl */ `
  uniform float uTime;
  uniform float PI;
  uniform float uWaveAmp;
  uniform float uWaveNoise;
  uniform float uWaveTime;
  uniform float scale;

  varying vec3 vNormal;
  varying vec2 vUv;

  ${perlin3d}
  ${rotation3d}
  ${map}
  
  void main() {

    vNormal = normal;
    vUv = uv;
    
    float ld = uWaveTime;
    float off = 1.;

    float t = mod(uTime + off, ld) / ld;
    float u = t * PI * 2.;

    // SCALE AND ROTATE
    vec3 pos = position * scale;
    pos = (vec4(pos, 1.) * rotation3d(vec3(1., 0., 0.), PI / -2. + .3)).xyz;
    pos = (vec4(pos, 1.) * rotation3d(vec3(0., 1., 0.), PI)).xyz;

    vec2 dir = vec2(
      sin(u + 2. - cos(u + .5) * .5) * uWaveAmp,
      cos(u) * uWaveAmp
    );

    // ROTATION
    pos = (vec4(pos, 1.) * rotation3d(vec3(1., 0., 0.), -sin(u) * PI / 4. * uWaveAmp)).xyz;
    float za = cnoise(vec3(uTime * .5));
    pos = (vec4(pos, 1.) * rotation3d(vec3(0., 0., 1.), za * PI / 4. * uWaveNoise)).xyz;

    // MOVE TOP-BOTTOM
    pos.yz += dir;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}`;

export const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uRes;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uTex, vUv);
    gl_FragColor = color;
  }
`;
