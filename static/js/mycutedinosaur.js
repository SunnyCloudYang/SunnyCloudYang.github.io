'use strict';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

let width,
    height;

let scene,
    camera,
    renderer,
    composer,
    outlinePass,
    geometry,
    material,
    controls,
    toggle = false,
    night = false;

let dinosaur,
    cloud,
    clouds = [],
    sky,
    ground,
    trees = [],
    tree;

let showHelper = false;
const dinosaurdiv = document.getElementById('dinosaurdiv');

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init() {
    width = dinosaurdiv.clientWidth;
    height = dinosaurdiv.clientHeight;
    // console.log(width, height);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = -5;
    camera.position.y = 1;
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
    controls.maxPolarAngle = deg2rad(90);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    // controls.enableKeys = true;
    controls.update();

    addLights();
    addSky();
    addDinosaur();
    addClouds(randInt(5, 7));
    addTrees(randInt(6, 10));
    addGround();

    dinosaurdiv.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 1.0;
    outlinePass.edgeGlow = 1.0;
    outlinePass.edgeThickness = 1.0;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set('#79bd69');
    outlinePass.hiddenEdgeColor.set('#190a05');
    outlinePass.selectedObjects = [dinosaur.group];
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(outlinePass);
}

function addLights() {
    const light = new THREE.AmbientLight(0xf0f0f0, 0.5);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffeedd, 0.6);
    directionalLight.position.set(5, 20, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);
}

function addDinosaur() {
    dinosaur = new Dinosaur();
    scene.add(dinosaur.group);
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
    scene.add(tree.group);
    return tree;
}

function addSky() {
    sky = new Sky();
    sky.showNight(night);
    scene.add(sky.group);
}

function addGround() {
    ground = new Ground();
    scene.add(ground.group);
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

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function animate() {
    requestAnimationFrame(animate);

    dinosaur.update();
    clouds.forEach((cloud) => {
        cloud.update();
    });
    trees.forEach((tree) => {
        tree.update();
    });
    ground.update();
    sky.update();

    controls.target.copy(dinosaur.group.position);
    controls.update();
    composer.render(scene, camera);
}

class Dinosaur {
    constructor() {
        this.group = new THREE.Group();

        this.stepLength = 0.02;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.orientationArrow = new THREE.ArrowHelper(this.orientation, this.group.position, 10, 0xff0000);

        this.skinMaterial = new THREE.MeshLambertMaterial({
            color: 0x79bd69,
            // roughness: 1,
            // wireframe: true,
            // flatShading: true
        });
        this.bellyMaterial = new THREE.MeshLambertMaterial({
            color: 0xEFEFEF,
            // roughness: 1,
            // wireframe: true,
            // flatShading: true
        });
        this.hornMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFC0CB,
            // shininess: 1,
            flatShading: true
        });
        this.eyeMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            // shininess: 1,
            // flatShading: true
        });
        this.mouthMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            // shininess: 1,
            // flatShading: true
        });
        this.cheekMaterial = new THREE.MeshLambertMaterial({
            color: 0xeffc2c6,
            // shininess: 1,
            // flatShading: true
        });

        this.drawBody();
        this.drawHead();
        this.drawNeck();
        this.drawHorn();
        this.drawLeg();
        this.drawArm();
        this.drawTail();
    }
    drawBody() {
        this.body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), this.skinMaterial);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.group.add(this.body);

        this.belly = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), this.bellyMaterial);
        this.belly.position.set(0, -0.08, 0.16);
        this.belly.scale.set(0.96, 1.02, 1.04);
        this.belly.castShadow = true;
        this.belly.receiveShadow = true;
        this.group.add(this.belly);
    }
    drawHead() {
        this.head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), this.skinMaterial);
        this.head.position.set(0, 1.4, 0.3);
        this.head.scale.set(1, 1, 1.1);
        this.head.castShadow = true;
        this.head.receiveShadow = true;
        this.group.add(this.head);

        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), this.eyeMaterial);
        leftEye.position.set(-0.45, 0.25, 0.75);
        leftEye.castShadow = true;
        leftEye.receiveShadow = true;
        this.head.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.x = -leftEye.position.x;
        this.head.add(rightEye);

        let mouth = [];
        for (let i = 0; i < 10; i++) {
            const mouthLine = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 1.84), this.mouthMaterial);
            mouthLine.position.set(0, 0, 0.1);
            mouthLine.rotation.y = deg2rad(-4.5 * 8 + i * 8);
            mouthLine.rotation.z = deg2rad(-45) + (i % 2) * deg2rad(90);
            mouth.push(mouthLine);
        }
        mouth.forEach((mouthLine) => {
            this.head.add(mouthLine);
        });

        const leftCheek = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), this.cheekMaterial);
        leftCheek.position.set(-0.66, 0.18, 0.55);
        leftCheek.rotation.x = deg2rad(90);
        leftCheek.rotation.y = deg2rad(-15);
        leftCheek.rotation.z = deg2rad(56);
        leftCheek.castShadow = true;
        leftCheek.receiveShadow = true;
        this.head.add(leftCheek);

        const rightCheek = leftCheek.clone();
        rightCheek.position.x = -leftCheek.position.x;
        rightCheek.rotation.y = -leftCheek.rotation.y;
        rightCheek.rotation.z = -leftCheek.rotation.z;
        this.head.add(rightCheek);
    }
    drawNeck() {
        this.neck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 12), this.skinMaterial);
        this.neck.position.set(0, 0.86, -0.08);
        this.neck.rotation.x = deg2rad(3);
        this.neck.castShadow = true;
        this.neck.receiveShadow = true;
        this.group.add(this.neck);
    }
    drawHorn() {
        this.horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 9), this.hornMaterial);
        this.horn.position.set(0, 2.43, 0.3);
        this.horn.scale.set(0.5, 1, 1);
        this.horn.castShadow = true;
        this.horn.receiveShadow = true;
        this.group.add(this.horn);

        this.horn2 = this.horn.clone();
        this.horn2.position.y = this.horn.position.y - 0.14;
        this.horn2.position.z = this.horn.position.z - 0.6;
        this.horn2.rotation.x = deg2rad(-32);
        this.group.add(this.horn2);

        this.horn3 = this.horn2.clone();
        this.horn3.position.y = this.horn2.position.y - 0.44;
        this.horn3.position.z = this.horn2.position.z - 0.44;
        this.horn3.rotation.x = deg2rad(-66);
        this.group.add(this.horn3);

        this.horn4 = this.horn3.clone();
        this.horn4.scale.set(0.52, 1.2, 1.4);
        this.horn4.position.y = this.horn3.position.y - 0.62;
        this.horn4.position.z = this.horn3.position.z - 0.16;
        this.horn4.rotation.x = deg2rad(-80);
        this.group.add(this.horn4);

        this.horn5 = this.horn4.clone();
        this.horn5.position.y = this.horn4.position.y - 0.68;
        this.horn5.position.z = this.horn4.position.z - 0.15;
        this.horn5.rotation.x = deg2rad(-70);
        this.group.add(this.horn5);

        this.horn6 = this.horn5.clone();
        this.horn6.position.y = this.horn5.position.y - 0.6;
        this.horn6.position.z = this.horn5.position.z - 0.14;
        this.horn6.rotation.x = deg2rad(-64);
        this.group.add(this.horn6);

        this.horn7 = this.horn6.clone();
        this.horn7.position.y = this.horn6.position.y - 0.55;
        this.horn7.position.z = this.horn6.position.z - 0.2;
        this.horn7.rotation.x = deg2rad(-58);
        this.group.add(this.horn7);

    }
    drawLeg() {
        this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.3, 1.0, 12), this.skinMaterial);
        // this.leftLeg.position.set(-0.5, -0.7, 0.5);
        this.leftLeg.castShadow = true;
        this.leftLeg.receiveShadow = true;
        
        let x = 0, y = 0.5, z = 0;
        let offsetX = -0.2, offsetY = -0.4, offsetZ = 0.1;
        this.leftLegWrapper = new THREE.Object3D();
        this.leftLegWrapper.position.set(x+offsetX, y+offsetY, z+offsetZ);
        this.leftLeg.position.set(-x+offsetX, -y+offsetY, -z+offsetZ);
        this.leftLegWrapper.rotation.x = deg2rad(-15);
        this.leftLegWrapper.rotation.z = deg2rad(-10);
        this.leftLegWrapper.add(this.leftLeg);

        this.group.add(this.leftLegWrapper);

        this.rightLeg = this.leftLeg.clone();
        this.rightLeg.position.x = -this.leftLeg.position.x;
        this.rightLeg.rotation.z = -this.leftLeg.rotation.z;

        this.rightLegWrapper = new THREE.Object3D();
        this.rightLegWrapper.position.set(-x-offsetX, y+offsetY, z+offsetZ);
        this.rightLeg.position.set(x-offsetX, -y+offsetY, -z+offsetZ);
        this.rightLegWrapper.rotation.x = deg2rad(-15);
        this.rightLegWrapper.rotation.z = deg2rad(10);
        this.rightLegWrapper.add(this.rightLeg);

        this.group.add(this.rightLegWrapper);
    }
    drawArm() {
        // this.leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.5, 12), this.skinMaterial);
        this.leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 4, 12), this.skinMaterial);
        this.leftArm.position.set(0.72, 0.35, 0.65);
        this.leftArm.rotation.x = deg2rad(-110);
        this.leftArm.rotation.z = deg2rad(20);
        this.leftArm.castShadow = true;
        this.leftArm.receiveShadow = true;
        this.group.add(this.leftArm);

        this.rightArm = this.leftArm.clone();
        this.rightArm.position.x = -this.leftArm.position.x;
        this.rightArm.rotation.z = -this.leftArm.rotation.z;
        this.group.add(this.rightArm);
    }
    drawTail() {
        this.tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.86, 1.25, 12), this.skinMaterial);
        this.tail.position.set(0, -0.77, -0.96);
        this.tail.rotation.x = deg2rad(-126);
        this.tail.castShadow = true;
        this.tail.receiveShadow = true;
        this.group.add(this.tail);

        this.tail2 = new THREE.Mesh(new THREE.ConeGeometry(0.382, 0.84, 12), this.skinMaterial);
        this.tail2.position.set(0, -1.055, -1.47);
        this.tail2.rotation.x = deg2rad(-120);
        this.tail2.castShadow = true;
        this.tail2.receiveShadow = true;
        this.group.add(this.tail2);
    }

    updateOrientation() {
        const oneVector = new THREE.Vector3(0, 0, 1);
        this.orientation = oneVector.applyQuaternion(this.group.quaternion);
        // console.log(this.initOrientation);
        if (showHelper) {
            this.orientationArrow.setDirection(this.orientation);
            this.orientationArrow.position.copy(this.group.position);
            scene.add(this.orientationArrow);
        }
        // console.log(this.group.rotation);
        // console.log(this.orientation);
    }
    moveForward() {
        this.group.position.addScaledVector(this.orientation, this.stepLength);
        this.walkAnimation();
    }
    walkAnimation() {
        this.leftLegWrapper.rotation.x = deg2rad(-12 + Math.sin(Date.now() * 0.005) * 15);
        this.rightLegWrapper.rotation.x = deg2rad(-12 + Math.sin(Date.now() * 0.005 + Math.PI) * 15);
        this.leftArm.rotation.x = deg2rad(-110 + Math.sin(Date.now() * 0.005) * 8);
        this.rightArm.rotation.x = deg2rad(-110 + Math.sin(Date.now() * 0.005 + Math.PI) * 8);
        this.tail.rotation.z = deg2rad(Math.sin(Date.now() * 0.005) * 2);
        this.tail2.rotation.z = deg2rad(Math.sin(Date.now() * 0.005) * 2);
        this.head.rotation.y = deg2rad(Math.sin(Date.now() * 0.005) * 2);
    }
    circle() {
        this.moveForward();
        this.group.rotation.y += deg2rad(0.2);
        this.updateOrientation();
    }
    turn(degree) {
        this.group.rotation.y += deg2rad(degree);
        this.updateOrientation();
    }
    update() {
        this.circle();
        // this.wander();
    }
}

class Cloud {
    constructor() {
        this.group = new THREE.Group();

        this.cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            shininess: 1,
            flatShading: true
        });

        this.drawCloud();
    }
    drawCloud() {
        this.cloud = new THREE.Mesh(new THREE.SphereGeometry(5, 5, 6), this.cloudMaterial);
        this.cloud.castShadow = true;
        this.cloud.receiveShadow = true;
        this.group.add(this.cloud);

        this.cloud2 = this.cloud.clone();
        this.cloud2.scale.set(0.55, 0.35, 1);
        this.cloud2.position.set(5, -1.5, 2);
        this.group.add(this.cloud2);

        this.cloud3 = this.cloud.clone();
        this.cloud3.scale.set(0.75, 0.5, 1);
        this.cloud3.position.set(-5.5, -2, -1);
        this.group.add(this.cloud3);

        this.group.position.x += randInt(-50, 50);
        this.group.position.y += 2 * Math.random() + 5;
        this.group.position.z += randInt(-50, 50);
        this.group.scale.set(0.15 + Math.random() * 0.1, 0.15 + Math.random() * 0.05, 0.15 + Math.random() * 0.1);
    }
    update() {
        this.group.position.x += 0.01;
        if (this.group.position.x > 50 || this.group.position.x < -50) {
            this.group.position.x = -this.group.position.x;
            this.group.position.y = 2 * Math.random() + 5;
            this.group.position.z = randInt(-50, 50);
        }
        this.group.position.z += 0.005;
        if (this.group.position.z > 50 || this.group.position.z < -50) {
            this.group.position.z = -this.group.position.z;
            this.group.position.y = 2 * Math.random() + 5;
            this.group.position.x = randInt(-50, 50);
        }
    }
}

class Sky {
    constructor() {
        this.dayColor = 0x8acef2;
        this.nightColor = 0x32506e;
        this.group = new THREE.Group();

        this.skyMaterial = new THREE.MeshBasicMaterial({
            color: this.dayColor,
            side: THREE.BackSide,
            // shininess: 0,
            // flatShading: true
        });

        this.drawSky();
    }
    drawSky() {
        this.sky = new THREE.Mesh(new THREE.SphereGeometry(100, 8, 8), this.skyMaterial);
        this.sky.castShadow = true;
        this.sky.receiveShadow = true;
        this.group.add(this.sky);
    }
    showNight(night) {
        if (night) {
            this.skyMaterial.color.setHex(this.nightColor);
        } else {
            this.skyMaterial.color.setHex(this.dayColor);
        }
    }
    update() {
        // this.group.rotation.y += 0.001;
        this.showNight(night);
    }
}

class Tree {
    constructor() {
        this.group = new THREE.Group();

        this.treeMaterial = new THREE.MeshPhongMaterial({
            color: 0x04ee04,
            shininess: 0,
            flatShading: true
        });
        this.trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 0,
            flatShading: true
        });

        this.drawTree();
    }
    drawTree() {
        this.tree = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.6, 7), this.treeMaterial);
        this.tree.position.set(0, 0.25, 0);
        this.tree.castShadow = true;
        this.tree.receiveShadow = true;
        this.group.add(this.tree);

        this.tree2 = this.tree.clone();
        this.tree2.scale.set(0.7, 1.1, 0.8);
        this.tree2.position.set(0, 0.75, 0);
        this.tree2.rotation.y = deg2rad(35);
        this.group.add(this.tree2);

        this.tree3 = this.tree.clone();
        this.tree3.scale.set(0.5, 1.2, 0.6);
        this.tree3.position.set(0, 1.25, 0);
        this.group.add(this.tree3);

        this.trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.6, 12), this.trunkMaterial);
        this.trunk.position.set(0, -0.4, 0);
        this.trunk.castShadow = true;
        this.trunk.receiveShadow = true;
        this.group.add(this.trunk);

        this.group.scale.set(0.9 + Math.random() * 0.2, 0.8 + Math.random() * 0.4, 0.9 + Math.random() * 0.2);
        this.group.position.x = (randInt(0, 1) * 2 - 1) * randInt(2, 15);
        this.group.position.z = (randInt(0, 1) * 2 - 1) * randInt(2, 15);
    }
    update() {
        // this.group.rotation.y += 0.01;
    }
}

class Ground {
    constructor() {
        this.group = new THREE.Group();
        this.groundMaterial = new THREE.MeshLambertMaterial({
            color: 0xddc178,
            // side: THREE.DoubleSide,
            // shininess: 0.5,
            // flatShading: true
        });

        this.drawGround();
    }
    drawGround() {
        this.ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), this.groundMaterial);
        this.ground.position.set(0, -1.2, 0);
        this.ground.rotation.x = deg2rad(-90);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
        this.group.add(this.ground);
    }
    update() {
        // this.group.rotation.y += 0.01;
    }
}

init();
animate();
