precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uVideoResolution;
uniform vec2 uVideo2Resolution;
uniform vec4 uMouse;
uniform sampler2D uVideo;
uniform sampler2D uVideo2;
uniform sampler2D uDisplacement;

varying vec2 vUv;

void main() {
    // center video
    vec2 uv = vUv;
    float videoAspect = uVideo2Resolution.x / uVideo2Resolution.y;
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
    float dCenter = .5 - length(mouse - vec2(.5, .5));

    // pixelate
    // float m = distance(mouse, (vec2(.5, .5))) * uVideoResolution.x;
    // uv = floor((uv - .5) * m) / m + .5;

    float d = texture2D(uDisplacement, uv).r / 3.;

    vec3 tex = texture2D(uVideo, uv).rgb;
    vec3 tex2 = texture2D(uVideo2, uv).rgb;

    float d1 = (tex.r + tex.g + tex.b) / 3.;
    float d2 = (tex2.r + tex2.g + tex2.b) / 3.;

    float val = d * dCenter;
    vec2 displacedUv = uv + val;

    vec3 t1 = texture2D(uVideo, displacedUv).rgb;
    vec3 t2 = texture2D(uVideo2, vec2(uv.x, uv.y + mouse.x * d2)).rgb;

    // mix
    vec3 color = mix(t1, t2, .5);

    gl_FragColor = vec4(t1, 1.);
}