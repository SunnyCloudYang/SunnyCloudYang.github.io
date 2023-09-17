'use strict';

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import * as CANNON from 'cannon-es';

import { Ball } from './ball.js';

import { Dinosaur } from './dinosaur.js';
import { Cloud } from './cloud.js';
import { Sky } from './sky.js';
import { Ground } from './ground.js';
import { Tree } from './tree.js';
import { randInt, deg2rad } from './utils.js';
import { PerlinNoise } from './perlinNoise.js';

let width,
    height;

let scene,
    camera,
    directionalLight,
    renderer,
    composer,
    outlinePass,
    controls,
    stats,
    toggle = false,
    night = false;

let world;

let keydownW,
    keydownA,
    keydownS,
    keydownD,
    keydownSpace,
    keydownShift;

let dinosaur,
    cloud,
    clouds = [],
    sky,
    ground,
    trees = [],
    tree;

let balls = [],
    ball;

let showHelper = false;
const dinosaurdiv = document.getElementById('dinosaurdiv');

function init() {
    threeInit();
    cannonInit();

    themeToggle();

    addSky();
    addDinosaur();
    addClouds(randInt(6, 12));
    addTrees(randInt(12, 20));
    addGround();

    addBalls(randInt(10, 20));
}

function threeInit() {
    width = dinosaurdiv.clientWidth;
    height = dinosaurdiv.clientHeight;
    // console.log(width, height);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = -5;
    camera.position.y = 3;
    camera.position.z = 8;
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.enableZoom = true;
    controls.zoomToCursor = true;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    controls.minPolarAngle = deg2rad(10);
    controls.maxPolarAngle = deg2rad(90);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = true;
    // controls.enableKeys = true;
    controls.update();

    stats = new Stats();
    dinosaurdiv.appendChild(stats.domElement);
    stats.domElement.style.position = 'relative';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';


    const canvas = dinosaurdiv.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 1.0;
    outlinePass.edgeGlow = 1.0;
    outlinePass.edgeThickness = 1.0;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set('#79bd69');
    outlinePass.hiddenEdgeColor.set('#190a05');
    // outlinePass.selectedObjects = [dinosaur.group];
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(outlinePass);
}

function cannonInit() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.solver.iterations = 5;
}

function addLights(night) {
    const light = new THREE.AmbientLight(0xf0f0f0, 0.5);
    scene.add(light);

    directionalLight = new THREE.DirectionalLight(0xffeedd, 0.6);
    directionalLight.position.set(5, 20, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    if (!night) {
        scene.add(directionalLight);
    }
}

function addDinosaur() {
    dinosaur = new Dinosaur();
    scene.add(dinosaur.group);
    world.addBody(dinosaur.entity);
}

function addClouds(number) {
    for (let i = 0; i < number; i++) {
        clouds.push(addCloud());
    }
}

function addCloud() {
    cloud = new Cloud();
    scene.add(cloud.group);
    return cloud;
}

function addTrees(number) {
    for (let i = 0; i < number; i++) {
        trees.push(addTree());
    }
}

function addTree() {
    tree = new Tree();
    tree.setPosition(randInt(-20, 20), 0, randInt(-20, 20));
    scene.add(tree.group);
    world.addBody(tree.entity);
    return tree;
}

function addSky() {
    sky = new Sky();
    sky.setNight(isNight());
    addLights(night);
    scene.add(sky.group);
}

function addGround() {
    ground = new PerlinNoise();
    scene.add(ground.group);
    world.addBody(ground.entity);
}

function addBalls(number) {
    for (let i = 0; i < number; i++) {
        balls.push(addBall());
    }
}

function addBall() {
    ball = new Ball();
    ball.setPosition(randInt(-20, 20), 0, randInt(-20, 20));
    scene.add(ball.group);
    world.addBody(ball.entity);
    return ball;
}

function isNight() {
    night = (localStorage.getItem('pref-theme') === 'dark');
    return night;
}

function onMouseMove(event) {
    event.preventDefault();

    const x = event.clientX;
    const y = event.clientY;
    // rotate the scene if left mouse is pressed
    if (event.buttons === 1) {
        scene.rotation.y = (x - width / 2) / width * 4;
        scene.rotation.x = (y - height / 2) / height * 1;
        let minRotationX = deg2rad(-10);
        let maxRotationX = deg2rad(95);
        if (scene.rotation.x < minRotationX) {
            scene.rotation.x = minRotationX;
        }
        if (scene.rotation.x > maxRotationX) {
            scene.rotation.x = maxRotationX;
        }
    }
    // translate the scene if right mouse is pressed
    if (event.buttons === 2) {
        scene.position.x = (x - width / 2) / width * 4;
        scene.position.y = -(y - height / 2) / height * 4;
    }
}

function onWindowResize() {
    width = dinosaurdiv.clientWidth;
    height = dinosaurdiv.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function themeToggle() {
    const theme = document.getElementById('theme-toggle');
    theme.addEventListener('click', () => {
        if (isNight()) {
            night = true;
            scene.remove(directionalLight);
            console.log('night');
        }
        else {
            night = false;
            scene.add(directionalLight);
        }
        sky.setNight(night);
    });
}

function animate() {
    requestAnimationFrame(animate);

    world.fixedStep();
    dinosaur.circle();
    dinosaur.update();
    clouds.forEach((cloud) => {
        cloud.update();
    });
    trees.forEach((tree) => {
        tree.update();
    });
    ground.update();
    sky.update();

    balls.forEach((ball) => {
        ball.update();
    });

    controls.target.copy(dinosaur.group.position);
    controls.update();
    stats.update();

    composer.render(scene, camera);
}

init();
animate();
