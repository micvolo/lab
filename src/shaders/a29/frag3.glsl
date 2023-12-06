varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uAspectRatio;

uniform sampler2D tFlow;
uniform sampler2D tWater;

void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    // vec4 res = vec4(uResolution.x, uResolution.y, uAspectRatio.x, uAspectRatio.y);
    // vec2 uv = .5 * gl_FragCoord.xy / res.xy;
    // vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);
    // myUV -= flow.xy * (0.15 * 0.7);
    // vec3 tex = texture2D(tWater, myUV).rgb;
    gl_FragColor = vec4(flow.rgb, 1.0);
}