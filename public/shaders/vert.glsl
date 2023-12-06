attribute vec3 aPosition;
varying vec2 vPos;

void main() {
    vPos = (gl_Position = vec4(aPosition, 1.0)).xy;
}