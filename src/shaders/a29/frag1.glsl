varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform vec2 uAspectRatio;

void main() {
    vec2 fragCoord = uResolution * vUv;
    // fragCoord = gl_FragCoord.xy;

    // flow2
    vec2 cursor = vUv - uMouse;
    float uFalloff = .3;
    vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
    float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * 1.;

    vec2 diff = (vUv * uResolution) - (uMouse * uResolution);
    float uRadius = 100.;
    float distance = length(diff);
    if(distance <= uRadius) {
        fragCoord *= vec2(falloff);
    }

    // draw
    int x = int(fragCoord), y = int(fragCoord.y + 10. * uTime), r = (x) ^ (y);
    vec4 color = vec4(abs(r * r * r) / (y + int(uTime * 50.)) % 8970 < 1000);
    // color.rgb = mix(color.rgb, stamp, vec3(falloff));
    gl_FragColor = color;
}