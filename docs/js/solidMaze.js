'use strict';

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { randInt, deg2rad } from './utils.js';
import { generateMap, findPath } from './maze.js';

const mazeCanvas = document.getElementById('solidMaze');
let width = mazeCanvas.clientWidth;
let height = mazeCanvas.clientHeight;

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

let maze,
    size,
    easy;

function init() {
    width = mazeCanvas.clientWidth;
    height = mazeCanvas.clientHeight;
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
    controls.enableKeys = true;
    controls.update();

    stats = new Stats();
    mazeCanvas.appendChild(stats.domElement);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';


    const canvas = mazeCanvas.appendChild(renderer.domElement);
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

    size = Number(document.getElementById('sizeBar').value);
    easy = Number(document.getElementById('easyBar').value);

    addObjs(size, easy);
}

function addObjs(size, easy) {
    addLights();
    addFloor(size);
    // addCeil(size);
    maze = generateMap(size, easy);
    addMaze(maze);
    addPath(maze);
}

function addLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

function addFloor(size) {
    const floorGeometry = new THREE.PlaneGeometry(size, size);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xccbb22 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.4;
    floor.receiveShadow = true;
    scene.add(floor);
}

function addCeil(size) {
    const ceilGeometry = new THREE.PlaneGeometry(size+1, size+1);
    const ceilMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
    const ceil = new THREE.Mesh(ceilGeometry, ceilMaterial);
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.x = -0.5;
    ceil.position.y = 1.37;
    ceil.position.z = 0.5;
    ceil.receiveShadow = true;
    ceil.castShadow = false;
    scene.add(ceil);
}

function addMaze(maze) {
    const geometry = new THREE.BoxGeometry(1, 2.8, 1);
    const materialWall = new THREE.MeshLambertMaterial({ color: 0xaaaa66 });
    const materialPath = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const materialProp = new THREE.MeshLambertMaterial({ color: 0x22ee22 });
    const materialMonster = new THREE.MeshLambertMaterial({ color: 0xdd2222 });
    const materialKey = new THREE.MeshLambertMaterial({ color: 0xaa66aa });

    const mazeGroup = new THREE.Group();
    const monsterGroup = new THREE.Group();
    const propGroup = new THREE.Group();
    const keyGroup = new THREE.Group();
    
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 1) {
                const cube = new THREE.Mesh(geometry, getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.z = -(i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;
                mazeGroup.add(cube);
            } else if (maze[i][j] === 3) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = -(i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const prop = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshLambertMaterial({ color: 0x22ee22 }));
                prop.position.x = j - maze.length / 2;
                prop.position.y = 0.6;
                prop.position.z = -(i - maze.length / 2);
                prop.receiveShadow = true;
                prop.castShadow = true;

                propGroup.add(prop);
                propGroup.add(cube);
            } else if (maze[i][j] === 4) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = -(i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const monster = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xdd2222 }));
                monster.position.x = j - maze.length / 2;
                monster.position.y = 0.4;
                monster.position.z = -(i - maze.length / 2);
                monster.receiveShadow = true;
                monster.castShadow = true;

                monsterGroup.add(monster);
                mazeGroup.add(cube);
            } else if (maze[i][j] === 5) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = -(i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 12), new THREE.MeshLambertMaterial({ color: 0xaa66aa }));
                cone.position.x = j - maze.length / 2;
                cone.position.y = 0.6;
                cone.position.z = -(i - maze.length / 2);
                cone.receiveShadow = true;
                cone.castShadow = true;
                
                mazeGroup.add(cube);
                keyGroup.add(cone);
            } else if (maze[i][j] === -1) {
                const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8, 32), new THREE.MeshLambertMaterial({ color: 0xdd9933 }));
                cylinder.position.x = j - maze.length / 2;
                cylinder.position.z = -(i - maze.length / 2);
                cylinder.receiveShadow = true;
                cylinder.castShadow = true;
                mazeGroup.add(cylinder);
            } else if (maze[i][j] === -2) {
                const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8, 32), new THREE.MeshLambertMaterial({ color: 0x3388cc }));
                cylinder.position.x = j - maze.length / 2;
                cylinder.position.z = -(i - maze.length / 2);
                cylinder.receiveShadow = true;
                cylinder.castShadow = true;
                mazeGroup.add(cylinder);
            }
        }
    }
    scene.add(propGroup);
    scene.add(monsterGroup);
    scene.add(mazeGroup);
    scene.add(keyGroup);

    function getMaterial(value) {
        switch (value) {
            case 1: return materialWall;
            case 3: return materialProp;
            case 4: return materialMonster;
            case 5: return materialKey;
            default: return materialPath;
        }
    }
}

function addPath(maze) {
    let keys = findKeys(maze);
    
    const path1 = findPath([1, 1], keys[0], maze);
    const path2 = findPath([1, 1], keys[1], maze);
    const path3 = findPath(keys[0], keys[1], maze);
    const path4 = findPath(keys[0], [size - 1, size - 1], maze);
    const path5 = findPath(keys[1], [size - 1, size - 1], maze);
    
    const stage1 = (path1.path.length + 8 * path1.monsters - 5 * path1.collected) + (path5.path.length + 8 * path5.monsters - 5 * path5.collected) < (path2.path.length + 8 * path2.monsters - 5 * path2.collected) + (path4.path.length + 8 * path4.monsters - 5 * path4.collected) ? path1.path.concat(path5.path) : path2.path.concat(path4.path);
    const stage2 = path3.path;

    const path = stage1.concat(stage2);
    const geometry = new THREE.BoxGeometry(1, 0.01, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

    const pathGroup = new THREE.Group();
    for (let i = 0; i < path.length; i++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = path[i][1] - maze.length / 2;
        cube.position.y = 1.38;
        cube.position.z = -(path[i][0] - maze.length / 2);
        cube.receiveShadow = true;
        cube.castShadow = true;
        pathGroup.add(cube);
    }
    scene.add(pathGroup);
}

function findKeys(maze) {
    let keys = [];
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 5) {
                keys.push([i, j]);
            }
        }
    }
    return keys;
}

function onWindowResize() {
    width = mazeCanvas.clientWidth;
    height = mazeCanvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function addListeners() {
    document.getElementById('sizeBar').addEventListener('input', () => {
        size = Number(document.getElementById('sizeBar').value);
        document.getElementById('sizeLabel').innerHTML = size;
    });
    document.getElementById('easyBar').addEventListener('input', () => {
        easy = Number(document.getElementById('easyBar').value);
        document.getElementById('easyLabel').innerHTML = easy;
    });
    document.getElementById('startGame').addEventListener('click', () => {
        scene.children = [];
        addObjs(size, easy);
    });
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    stats.update();

    composer.render(scene, camera);
}

init();
animate();
addListeners();
