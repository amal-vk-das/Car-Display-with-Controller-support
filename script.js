// Import three.js core and modules
import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.zoomSpeed = 5;

// Create ground mesh
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Add lights
const spotLight = new THREE.SpotLight(0xffffff, 3500, 100, 0.2, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const spotLight4 = new THREE.SpotLight(0xffffff, 4500, 100, 0.2, 1);
spotLight4.position.set(0, 15, 0);
spotLight4.castShadow = true;
spotLight4.shadow.bias = -0.0001;
scene.add(spotLight4);

const spotLight5 = new THREE.SpotLight(0xffffff, 4500, 100, 0.2, 1);
spotLight5.position.set(5, 15, 15);
spotLight5.castShadow = true;
spotLight5.shadow.bias = -0.0001;
scene.add(spotLight5);

// Load GLTF model
const gltfLoader = new GLTFLoader();
const url = "public/porsche_911_turbo_s__takeover/scene.gltf";
gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    root.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    root.position.set(0, 0, 0);
    scene.add(root);
});

// Add ambient lights
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);
const ambientLight2 = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight2);

// Set up XR controllers and controller models
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

// Function to handle controller interaction
function onSelectStart(event) {
    const controller = event.target;
    controller.userData.isSelecting = true;
}

function onSelectEnd(event) {
    const controller = event.target;
    controller.userData.isSelecting = false;
}

controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);

function handleController(controller) {
    const session = renderer.xr.getSession();
    if (session) {
        const inputSources = session.inputSources;
        for (const inputSource of inputSources) {
            if (inputSource.gamepad) {
                const axes = inputSource.gamepad.axes;
                const zoomDelta = -axes[1] * 0.1;
                const panDeltaX = axes[2] * 0.1;
                const panDeltaY = axes[3] * 0.1;

                // Handle zoom
                camera.position.z += zoomDelta;

                // Handle pan
                controls.target.x += panDeltaX;
                controls.target.y += panDeltaY;
                controls.update();
            }
        }
    }
}

// Animation loop
function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    controls.update();
    controls2.update();
    handleController(controller1);
    handleController(controller2);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleWindowResize, false);
