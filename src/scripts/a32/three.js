import gsap from "gsap";
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as waterShader from "@/shaders/a32/water";
import * as boardShader from "@/shaders/a32/board";

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

let settings = {
    uWaveAmp: .5,
    uWaveNoise: 1,
    uWaveTime: 5,
    wireframe: false,
};
const shaderMaterials = [];

document.querySelectorAll('.range-container input').forEach(el => {
    el.value = settings[el.id];
    el.onchange = (e) => {
        settings[e.target.id] = e.target.value;
        for (const [key, value] of Object.entries(settings)) {
            for (const shader of shaderMaterials) {
                if (shader.uniforms[key]) {
                    gsap.to(shader.uniforms[key], { value })
                }
            }
        }
    }
})
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100,
);
camera.position.set(-5, 5, 5);
scene.add(camera);

const controls = new MapControls(camera, canvas);
// controls.enableZoom = false;
// controls.enableRotate = false;
controls.addEventListener("change", (e) => {
    if (camera.position.x > 10) {
        camera.position.x = 10;
    }
});

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#000523");

var texture = await new RGBELoader().loadAsync("/projects/a32/bg.hdr");
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = texture;
scene.background = texture;

const waterGeometry = new THREE.PlaneGeometry(50, 50, 1024, 1024);
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterShader.vertex,
    fragmentShader: waterShader.fragment,
    transparent: true,
    uniforms: {
        uTime: { value: 0 },
        PI: { value: Math.PI },
        uTex: { value: null },
        uResolution: { value: [waterGeometry.parameters.width * 1., waterGeometry.parameters.height * 1.] },
        uWaveAmp: { value: settings.uWaveAmp * 1. },
        uWaveNoise: { value: settings.uWaveNoise * 1. },
        uWaveTime: { value: settings.uWaveTime * 1. },
        uRand: { value: Math.random() * 1. },
    },
    side: THREE.DoubleSide,
    wireframe: settings.wireframe,
});
shaderMaterials.push(waterMaterial);
let tex = await new THREE.TextureLoader().loadAsync("/projects/a32/waves.jpg");
waterMaterial.uniforms.uTex.value = tex;
waterMaterial.needsUpdate = true;

const water = new THREE.Mesh(waterGeometry, waterMaterial);
scene.add(water);

const gltfLoader = new GLTFLoader().setDRACOLoader(
    new DRACOLoader().setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
    ),
);
const gltf = await gltfLoader.loadAsync("/projects/a32/surf.glb");

let mesh = gltf.scene.children[0];
let objectGeometry = mesh.geometry;
const map = mesh.material.map;

const objectMaterial = new THREE.ShaderMaterial({
    vertexShader: boardShader.vertex,
    fragmentShader: boardShader.fragment,
    transparent: true,
    uniforms: {
        scale: { value: 0.02 },
        uTime: { value: 0 },
        PI: { value: Math.PI },
        uTex: { value: null },
        uTexRes: { value: null },
        uWaveAmp: { value: settings.uWaveAmp * 1. },
        uWaveNoise: { value: settings.uWaveNoise * 1. },
        uWaveTime: { value: settings.uWaveTime * 1. },
    },
    side: THREE.DoubleSide,
    wireframe: settings.wireframe,
});
shaderMaterials.push(objectMaterial);
objectMaterial.uniforms.uTex.value = map;
objectMaterial.uniforms.uTexRes.value = new THREE.Vector2(
    tex.image.width,
    tex.image.height,
);
objectMaterial.needsUpdate = true;

const object = new THREE.Mesh(objectGeometry, objectMaterial);
scene.add(object);

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    waterMaterial.uniforms.uTime.value = elapsedTime;
    objectMaterial.uniforms.uTime.value = elapsedTime;
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// AUDIO
let mySound = new Audio('/projects/a32/ocean.mp3');
mySound.volume = 1;
mySound.loop = true;
document.body.onclick = () => mySound.play();
