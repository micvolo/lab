precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uVideoResolution;
uniform vec4 uMouse;
uniform sampler2D uVideo;
uniform sampler2D uVideo1;
uniform sampler2D uImage;

varying vec2 vUv;

vec4 randS(vec2 uv) {
    return texture2D(uImage, vUv) - vec4(0.5);
}

void main() {
    vec2 uv = vUv;
    float rnd = randS(vec2(.5 / uResolution.x, 0.5 / uResolution.y)).x;

    vec4 c1, c2;
    gl_FragColor = texture2D(uVideo, vUv);
}