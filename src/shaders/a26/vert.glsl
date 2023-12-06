#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform float uTime;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}