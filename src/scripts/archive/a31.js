import { Renderer, Program, Mesh, Vec2, Vec3, Vec4, Flowmap, Texture, Geometry } from 'ogl';

const imgSize = [1250, 833];

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
}
`;
const fragment = /* glsl */ `
precision highp float;
precision highp int;
uniform sampler2D tFlow;
uniform float uTime;
varying vec2 vUv;
uniform vec4 res;
uniform vec3 bg1;
uniform vec3 bg2;
uniform vec3 bg3;

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(vec2 uv, float offset){
    float a = abs(0.5 * cos((uv.y) * 1.0) + offset * .5 );
    return smoothstep(0.0, .5 + offset * 0.5, a);
}

void main() {
        vec3 flow = texture2D(tFlow, vUv).rgb;

        vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
        vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
        myUV -= flow.xy * (0.15 * 0.7);

        float n = noise(vec3(myUV.xy * 10.,uTime*.005));

        vec2 baseUv = (1.-vUv) * n * 20.;
        float basePattern = lines(baseUv, 1.);
        float secondPattern = lines(baseUv, .1);
        vec3 baseColor = mix(bg1, bg2, basePattern);
        vec3 secondBaseColor = mix(baseColor, bg3, secondPattern);
        
        // GRANA
        vec2 uvRandom = vUv;
        uvRandom.y *= rand(vec2(uvRandom.y, 1.));
        secondBaseColor.rgb += rand(uvRandom) * 0.15;
        gl_FragColor = vec4(secondBaseColor, 1.0);
}
`;
{
    const canvas = document.querySelector('.webgl')
    const renderer = new Renderer({ dpr: 2, canvas });
    const gl = renderer.gl;

    // Variable inputs to control flowmap
    let aspect = 1;
    const mouse = new Vec2(-1);
    const velocity = new Vec2();
    function resize() {
        let a1, a2;
        var imageAspect = imgSize[1] / imgSize[0];
        if (window.innerHeight / window.innerWidth < imageAspect) {
            a1 = 1;
            a2 = window.innerHeight / window.innerWidth / imageAspect;
        } else {
            a1 = (window.innerWidth / window.innerHeight) * imageAspect;
            a2 = 1;
        }
        mesh.program.uniforms.res.value = new Vec4(
            window.innerWidth,
            window.innerHeight,
            a1,
            a2
        );

        renderer.setSize(window.innerWidth, window.innerHeight);
        aspect = window.innerWidth / window.innerHeight;
    }
    const flowmap = new Flowmap(gl, { falloff: .3, dissipation: 0.99 });
    // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
    const geometry = new Geometry(gl, {
        position: {
            size: 2,
            data: new Float32Array([-1, -1, 3, -1, -1, 3])
        },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });
    const texture = new Texture(gl, {
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR
    });
    const img = new Image();
    img.onload = () => (texture.image = img);
    img.crossOrigin = "Anonymous";
    img.src = "https://images.unsplash.com/photo-1568059151110-949642101084?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9";

    let a1, a2;
    var imageAspect = imgSize[1] / imgSize[0];
    if (window.innerHeight / window.innerWidth < imageAspect) {
        a1 = 1;
        a2 = window.innerHeight / window.innerWidth / imageAspect;
    } else {
        a1 = (window.innerWidth / window.innerHeight) * imageAspect;
        a2 = 1;
    }

    const colors = []
    for (const variable of ['--bg1', '--bg2', '--bg3']) {
        let bgcolor1 = getComputedStyle(document.documentElement)
            .getPropertyValue(variable);
        bgcolor1 = bgcolor1.substring(4, bgcolor1.length - 1)
            .replace(/ /g, '')
            .split(',');
        colors.push(bgcolor1.map(c => c / 255))
    }
    console.log(colors)

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            uTime: { value: 0 },
            bg1: { value: new Vec3(colors[0][0], colors[0][1], colors[0][2]) },
            bg2: { value: new Vec3(colors[1][0], colors[1][1], colors[1][2]) },
            bg3: { value: new Vec3(colors[2][0], colors[2][1], colors[2][2]) },
            res: {
                value: new Vec4(window.innerWidth, window.innerHeight, a1, a2)
            },
            img: { value: new Vec2(imgSize[0], imgSize[1]) },
            // Note that the uniform is applied without using an object and value property
            // This is because the class alternates this texture between two render targets
            // and updates the value property after each render.
            tFlow: flowmap.uniform
        }
    });
    const mesh = new Mesh(gl, { geometry, program });

    window.addEventListener("resize", resize, false);
    resize();

    // Create handlers to get mouse position and velocity
    const isTouchCapable = "ontouchstart" in window;
    if (isTouchCapable) {
        window.addEventListener("touchstart", updateMouse, false);
        window.addEventListener("touchmove", updateMouse, { passive: false });
    } else {
        window.addEventListener("mousemove", updateMouse, false);
    }
    let lastTime;
    const lastMouse = new Vec2();
    function updateMouse(e) {
        e.preventDefault();
        if (e.changedTouches && e.changedTouches.length) {
            e.x = e.changedTouches[0].pageX;
            e.y = e.changedTouches[0].pageY;
        }
        if (e.x === undefined) {
            e.x = e.pageX;
            e.y = e.pageY;
        }
        // Get mouse value in 0 to 1 range, with y flipped
        mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
        // Calculate velocity
        if (!lastTime) {
            // First frame
            lastTime = performance.now();
            lastMouse.set(e.x, e.y);
        }

        const deltaX = e.x - lastMouse.x;
        const deltaY = e.y - lastMouse.y;

        lastMouse.set(e.x, e.y);

        let time = performance.now();

        // Avoid dividing by 0
        let delta = Math.max(10.4, time - lastTime);
        lastTime = time;
        velocity.x = deltaX / delta;
        velocity.y = deltaY / delta;
        // Flag update to prevent hanging velocity values when not moving
        velocity.needsUpdate = true;
    }
    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        // Reset velocity when mouse not moving
        if (!velocity.needsUpdate) {
            mouse.set(-1);
            velocity.set(0);
        }
        velocity.needsUpdate = false;
        // Update flowmap inputs
        flowmap.aspect = aspect;
        flowmap.mouse.copy(mouse);
        // Ease velocity input, slower when fading out
        flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
        flowmap.update();
        program.uniforms.uTime.value = t * 0.01;
        renderer.render({ scene: mesh });
    }
}