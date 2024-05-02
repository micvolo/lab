// ----- Shader ----- //

const frag = /*glsl */`

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_bool;

float lessCoord = min(u_resolution.x, u_resolution.y);
vec2 resRatio = u_resolution / vec2(lessCoord);

void main() {

  vec4 color = vec4(1.0 * sin(u_time *( 80. * u_bool)));
  vec2 grad = abs((gl_FragCoord.xy - u_mouse) / u_resolution * resRatio);
  float screenX = gl_FragCoord.x / u_resolution.x;
  gl_FragColor = color;
}
`;

// ----- Uniform ----- //

function Uniform(name, suffix) {
    this.name = name;
    this.suffix = suffix;
    this.location = gl.getUniformLocation(program, name);
}

Uniform.prototype.set = function (...values) {
    let method = 'uniform' + this.suffix;
    let args = [this.location].concat(values);
    gl[method].apply(gl, args);
};

// ----- Rect ----- //

function Rect(gl) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW);
}

Rect.verts = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
]);

Rect.prototype.render = function (gl) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

// ----- addShader ----- //

function addShader(source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!isCompiled) {
        throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
}


// ----- init WebGL ----- //

let canvas = document.querySelector('.webgl');
let gl = canvas.getContext('webgl2');
let width, height;
let mouseX = 0;
let mouseY = 0;
let startTime = new Date().getTime(); // Get start time for animating

// create program
let program = gl.createProgram();
// add shaders
addShader(/*glsl */`

attribute vec2 u_position;

void main() {
    gl_Position = vec4(u_position, 0, 1);
}

`, gl.VERTEX_SHADER);
addShader(frag, gl.FRAGMENT_SHADER);
// link & use program
gl.linkProgram(program);
gl.useProgram(program);

// create fragment uniforms
let uResolution = new Uniform('u_resolution', '2f');
let uMouse = new Uniform('u_mouse', '2f');
let uTime = new Uniform('u_time', '1f');
let uBool = new Uniform('u_bool', '1f');

// create position attrib
let billboard = new Rect(gl);
let positionLocation = gl.getAttribLocation(program, 'u_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

resize();
animate();

// ----- render ----- //

function animate() {
    // update
    let now = new Date().getTime();
    let currentTime = (now - startTime) / 1000;
    uTime.set(currentTime);
    uMouse.set(mouseX, mouseY);
    // render
    billboard.render(gl);
    // animate next frame
    requestAnimationFrame(animate);
}

// ----- resize ----- //

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    uResolution.set(width, height);
    gl.viewport(0, 0, width, height);
}

window.addEventListener('resize', resize);

// ----- mouse move ----- //

document.addEventListener('mousemove', function (event) {
    mouseX = event.pageX;
    mouseY = height - event.pageY;
});

// ----- scroll ----- //

document.addEventListener("astro:page-load", () => {
    const c = document.querySelector('.wheel-container');
    if (!c) return;
    let scrollEndTimer;
    c.addEventListener('scroll', (e) => {
        uBool.set(1)
        clearTimeout(scrollEndTimer)
        scrollEndTimer = setTimeout(() => uBool.set(0), 100);
    });
});
