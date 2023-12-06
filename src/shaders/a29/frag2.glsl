varying vec2 vUv;
uniform vec2 uAspectRatio;
uniform vec2 uMouse;
uniform vec2 uVelocity;

uniform sampler2D tMap;

float uFalloff = .1;
float uDissipation = .98;

void main() {
    vec4 color = texture2D(tMap, vUv) * uDissipation;
    vec2 cursor = vUv - uMouse;
    cursor.x *= uAspectRatio.x;
    vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
    float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * 1.;
    color.rgb = mix(color.rgb, stamp, vec3(falloff));
    gl_FragColor = color;
}