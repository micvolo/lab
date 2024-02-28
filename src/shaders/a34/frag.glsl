precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uVideoResolution;
uniform vec4 uMouse;
uniform sampler2D uVideo;

varying vec2 vUv;

void main() {
    // center video
    vec2 uv = vUv;
    float videoAspect = uVideoResolution.x / uVideoResolution.y;
    float screenAspect = uResolution.x / uResolution.y;
    vec2 scale = vec2(1., 1.);
    if(videoAspect > screenAspect) {
        scale.x = screenAspect / videoAspect;
    } else {
        scale.y = videoAspect / screenAspect;
    }
    uv = (uv - .5) * scale + .5;

    // mouse
    vec2 mouse = uMouse.xy / uResolution;
    mouse.y = 1. - mouse.y;

    // pixelate
    float m = distance(mouse, (vec2(.5, .5))) * uVideoResolution.x;
    uv = floor(uv * m) / m;

    vec3 tex = texture2D(uVideo, uv).rgb;
    gl_FragColor = vec4(tex, 1.);
}