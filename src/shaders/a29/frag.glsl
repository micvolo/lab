#define PI 3.1415926535897932384626433832795
#define AA 1

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

vec3 shape(in vec2 p) {
    p *= 2.0;

    vec3 s = vec3(0.0);
    vec2 z = p;
    for(int i = 0; i < 10; i++) {
        // transform		
        z -= cos(z.x + cos(z.y + cos(z.xy + .1 * uTime)));

        // orbit traps		
        float d = dot(z - p, z - p);
        s.x += 1.0 / (1.0 + d);
        s.y += d;
        s.z += sin(atan(z.y - p.y, z.x - p.x));

    }

    return s / 8.0;
}

void main() {

    vec2 fragCoord = gl_FragCoord.xy * .5;
    vec2 iResolution = uResolution;

    // mouse
    vec2 diff = (vUv * uResolution) - (uMouse * uResolution);
    float uRadius = 100.;
    float distance = length(diff);
    if(distance <= uRadius) {
        fragCoord *= vec2(smoothstep(0., uRadius, distance));
    }

    vec2 pc = (2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.y, iResolution.x);

    vec2 pa = pc + vec2(0.04, 0.0);
    vec2 pb = pc + vec2(0.0, 0.04);

    // shape (3 times for diferentials)	
    vec3 sc = shape(pc);
    vec3 sa = shape(pa);
    vec3 sb = shape(pb);

    // color	
    vec3 col = mix(vec3(0.1, 0., 0.08), vec3(0.6, 1.1, 1.6), sc.x);
    // col = mix(col, col.zxy, smoothstep(-0.5, 0.5, cos(0.5 * iTime)));
    col *= 0.15 * sc.y;
    // col += 0.4 * abs(sc.z) - 0.1;

    // light	
    vec3 nor = normalize(vec3(sa.x - sc.x, 0.01, sb.x - sc.x));
    float dif = clamp(0.5 + 0.5 * dot(nor, vec3(0.5773)), 0.0, 1.0);
    col *= 1.0 + 0.7 * dif * col;
    col += 0.3 * pow(nor.y, 128.0);

    gl_FragColor = vec4(col, 1.0);
}