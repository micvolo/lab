#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform float uTime;

float square(vec2 uv, float size) {
    float halfSize = size / 2.;
    float left = step(0.5 - halfSize, uv.x);
    float right = step(uv.x, 0.5 + halfSize);

    float top = step(0.5 - halfSize, uv.y);
    float bottom = step(uv.y, 0.5 + halfSize);

    return left * right * top * bottom;
}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

float normalSin(float val) {
    return sin(val) * 0.5 + 0.5;
}

void main() {
    vec3 color = vec3(1.);

  // 1. Grid UVs
    vec2 uv = vUv;
    float result = 0.;

    uv.x = normalSin(uv.x * 10.);
    uv.y = normalSin(uv.y * 10.);

    float gridSize = 20.;
    uv *= gridSize;
    uv = fract(uv);

    float cells = 10.;
    vec2 gridIndex = floor(uv * cells);
    // Old position
//vec2 pos = vec2(cos(uTime ), sin(uTime )) * 0.2 ;
    float angle = uTime + gridIndex.x + gridIndex.y;
    // float circlePos = vec2(cos(angle), sin(angle)) * 0.2;
    float sizeChange = sin(uTime * 2.) * 0.2;
    // float sizeChange = sin(uTime * 4. + distance(vec2(gridSize / 2. - 0.5), gridIndex) * 1.) * 0.4;
    float paletteOffset = distance(vec2(gridSize / 2. - 0.5), gridIndex) * 0.1 + uTime * 0.2;

  // 2. Change position
    vec2 pos = vec2(cos(uTime), sin(uTime)) * 0.2;

  // 3. Change the size formula
    // float sizeChange = sin(uTime * 2.) * 0.2;

    float circle = smoothstep(0.2 + sizeChange, 0.4 + sizeChange, distance(vec2(0.5), uv + pos));
    result += circle;

  // 4. Change color offset.
    // float paletteOffset = vUv.x * 0.3 + vUv.y + uTime * 0.2;
    result = 1. - result;
    color = (result) * palette(paletteOffset, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));

    gl_FragColor = vec4(color, 1.0);
}