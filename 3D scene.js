import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {TrackballControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/TrackballControls.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';

let camera, controls, scene, renderer, layout, lightHolder;
let mouse = new THREE.Vector2();

function init(DOM) {
    addScene({"axisHelper": false, "grid": true});
    createCamera();

    renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(DOM).appendChild(renderer.domElement);
    
    createLight();
    createController();
    createLayout();
    createOBJGeometry({"name": "T501", "color": "#AABBCC", "angle": 0, "side": "front", "margin": 0.2, "position": [4, 5], "size": [22, 24, 24.9]});
}

function addScene(controls) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    if (controls["axisHelper"]) {
        let axesHelper = new THREE.AxesHelper(50);
        scene.add(axesHelper);
    }

    if (controls["grid"]) {
        let size = 50;
        let divisions = 50;
        let gridHelper = new THREE.GridHelper(size, divisions, 0x666666, 0xcccccc);
        scene.add(gridHelper);
    }
}


function createCamera(type="perspective") {
    if (type == "perspective") {
        camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    } else if (type == "orthographic") {
        let scale = 50;
        let width = (window.innerWidth)/scale;
        let height = window.innerHeight/scale;
        camera = new THREE.OrthographicCamera(-width, width, height, -height, 1, 500);
    }
    camera.position.set(80, 80, 80);
}

function createDirectionalLight(position, color) {
    let light = new THREE.DirectionalLight(color);
    light.position.set(...position);
    return light;
}

function createLight() {
    lightHolder = new THREE.Group();
    let light = new THREE.AmbientLight(0x808080);
    lightHolder.add(light);

    let dir_light_top = createDirectionalLight([0, 80, 0], 0xffffff);
    lightHolder.add(dir_light_top);

    let dir_light_bottom = createDirectionalLight([0, -80, 0], 0xffffff);
    lightHolder.add(dir_light_bottom);

    let dir_light_front = createDirectionalLight([80, 0, 0], 0x888888);
    lightHolder.add(dir_light_front);

    let dir_light_back = createDirectionalLight([-80, 0, 0], 0x888888);
    lightHolder.add(dir_light_back);
    
    let dir_light_left = createDirectionalLight([0, 0, 80], 0x222222);
    lightHolder.add(dir_light_left);

    let dir_light_right = createDirectionalLight([0, 0, -80], 0x222222);
    lightHolder.add(dir_light_right);

    scene.add(lightHolder);
}

function createController() {
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5;
    controls.panSpeed = 1;
    controls.zoomSpeed = 2;
    controls.dynamicDampingFactor = 1;
    controls.minDistance = 30;
    controls.maxDistance = 1000;
}

function createLayout() {
    let length = 29.2;
    let width = 32.5;
    let height = 1.2;
    layout = new THREE.Group();

    layout.translateX(-length/2);
    layout.translateZ(width/2);    
    
    scene.add(layout);

    if (controls["axisHelper"]) {
        let layoutAxis = new THREE.AxesHelper(20);
        layout.add(layoutAxis);
    }
}

function createOBJGeometry(component, BoxHelper=false) {
    let loader = new OBJLoader();
    let comp_id = component["name"];
    let comp_color = component["color"];
    let comp_angle = component["angle"];
    let side = component["side"];
    console.log("three js load", component)
    loader.load('./resources/OBJ/'+comp_id+'.obj',
        function (obj) {
            obj.traverse( function(child) {
                if (child instanceof THREE.Mesh) {
                    child.name = comp_id;
                    setOBJPosition(child, comp_angle, side);
                    let box = new THREE.Box3().setFromObject(child);
                    box.getCenter(child.position);
                    child.position.multiplyScalar(-1);
                    child.material.color.set(comp_color);
                    child.material.transparent = true;
                }
            });
            obj.name = comp_id;
            obj.translateX((component["margin"] + component["position"][0] + component["size"][0]/2));
            obj.translateZ(-(component["margin"] + component["position"][1] + component["size"][1]/2));
            console.log(controls)
            if (controls["axisHelper"]) {
                let axesHelper = new THREE.AxesHelper(10);
                obj.add(axesHelper);
            }

            if (BoxHelper) {
                let box = new THREE.BoxHelper(obj, 0x000000);
                box.geometry.computeBoundingBox();
                layout.add(box);
            }
            
            layout.add(obj);
        }
    );
}

function setOBJPosition(geometry, angle, side) {
    let deg_90 = Math.PI/2;

    // rotate angle
    geometry.rotateY(deg_90*(angle/90));
    
    // flip
    if (side == "back"){
        geometry.rotateX(Math.PI);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    // console.log(renderer.domElement.getBoundingClientRect());
    let canvasBounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('mousemove', onMouseMove);

init("threeJS-view");
animate();