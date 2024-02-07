precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uMouse;

varying vec2 vUv;

// Custom gradient - https://iquilezles.org/articles/palettes/
vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float box(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.)) + min(max(d.x, max(d.y, d.z)), 0.);
}

float torus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float smin(float a, float b, float k) {
    float h = clamp(.5 + .5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

mat2 rot2d(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

// Scene definition
float map(vec3 p) {

    // p.z += uTime * -1.; // Forward movement

    float ground = p.y + 3.;

    vec3 spherePos = vec3(sin(uTime) * 2., 0, 0);
    float sphere = sphere(p - spherePos, 1.);

    vec3 q = p;
    q.y -= uTime * .4;
    q = fract(q) - .5;
    q.xy *= rot2d(uTime);

    float box = box(q, vec3(.1));

    return smin(ground, smin(box, sphere, 1.), 1.);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2. - uResolution.xy) / uResolution.y;

    vec2 mSpeed = vec2(2., 1.);
    float reverseMouseY = uResolution.y - uMouse.y;
    vec2 m = (vec2(uMouse.x, reverseMouseY) * 2. - uResolution.xy) / uResolution.y * mSpeed;

    // Initialization
    vec3 ro = vec3(0, 0, -5.);         // ray origin
    vec3 rd = normalize(vec3(uv, 1)); // ray direction
    vec3 col = vec3(0);               // final pixel color

    // Camera rotation
    ro.yz *= rot2d(-m.y);
    // rd.yz *= rot2d(-m.y);
    ro.xz *= rot2d(-m.x);
    rd.xz *= rot2d(-m.x);

    float t = 0.; // total distance travelled

    // Raymarching
    int j = 0;
    for(int i = 0; i < 80; i++) {
        j = i;
        vec3 p = ro + rd * t;     // position along the ray
        float d = map(p);         // current distance to the scene
        t += d;                   // "march" the ray
        if(d < .001 || t > 100.)
            break; // early stop
    }

    // Coloring
    col = vec3(t * .05); // color based on distance
    col = palette(t * .04 + float(j) * .002);

    gl_FragColor = vec4(col, 1);
}