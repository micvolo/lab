import * as THREE from "three";

export class Flowmap {
    constructor(renderer, camera, { falloff = 0.3, alpha = 1, dissipation = 0.98 }) {
        this.renderer = renderer;
        this.camera = camera;
        this.aspect = 1;
        this.mouse = new THREE.Vector2();
        this.velocity = new THREE.Vector2();
        this.options = {
            falloff,
            alpha,
            dissipation,
        }
        this.mask = {}
        this.init();
    }
    init() {
        this.mask.read = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
            },
        );
        this.mask.write = this.mask.read.clone();
        this.scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(
            window.innerWidth,
            window.innerHeight,
        );
        const material = new THREE.ShaderMaterial({
            uniforms: {
                tMap: { value: new THREE.TextureLoader().load("/projects/a29/bgFrag.png") },
                uFalloff: { value: this.options.falloff * 0.5 },
                uAlpha: { value: this.options.alpha },
                uDissipation: { value: this.options.dissipation },
                uAspect: { value: this.aspect },
                uMouse: { value: this.mouse },
                uVelocity: { value: this.velocity },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
        this.value = this.mask.read.texture;
    }
    update() {
        this.mesh.material.uniforms.uAspect.value = this.aspect;
        this.renderer.setRenderTarget(this.mask.write);
        this.renderer.render(this.scene, this.camera);
        const t = this.mask.read;
        this.mask.read = this.mask.write;
        this.mask.write = t;
        this.mesh.material.uniforms.tMap.value = this.mask.read.texture;
        this.renderer.setRenderTarget(null);
    }
}


const vertex = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }`;

const fragment = /* glsl */ `
    uniform sampler2D tMap;

    uniform float uFalloff;
    uniform float uAlpha;
    uniform float uDissipation;

    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tMap, vUv) * uDissipation;
        vec2 cursor = vUv - uMouse;
        cursor.x *= uAspect;

        vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
        float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

        color.rgb = mix(color.rgb, stamp, vec3(falloff));
        gl_FragColor = color;
    }`;