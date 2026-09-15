'use strict';

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { randInt, deg2rad } from './utils.js';
import { generateMap, findPath } from './maze.js';

const mazeCanvas = document.getElementById('solidMaze');
let width = mazeCanvas.clientWidth;
let height = mazeCanvas.clientHeight;

const MazeObject = {
    Wall: 1,
    Path: 0,
    Prop: 3,
    Monster: 4,
    Key: 5,
    Start: -1,
    End: -2
}

let scene,
    camera,
    directionalLight,
    renderer,
    composer,
    controls,
    stats,
    toggle = false,
    night = false,
    displayAnimation;

let maze,
    size,
    easy;

function init() {
    if (renderer) return;

    width = mazeCanvas.clientWidth;
    height = mazeCanvas.clientHeight;
    // console.log(width, height);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = -0.5;
    controls.enablePan = true;
    controls.enableKeys = true;
    controls.update();

    stats = new Stats();
    mazeCanvas.appendChild(stats.domElement);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';


    const canvas = mazeCanvas.appendChild(renderer.domElement);
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            mazeCanvas.requestFullscreen();
        }
        onWindowResize();
    });
    window.addEventListener('resize', onWindowResize, false);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    size = Number(document.getElementById('sizeBar').value);
    easy = Number(document.getElementById('easyBar').value);

    regenerateMaze();
}

function addObjs(size, easy) {
    maze = generateMap(size, easy);
    addLights();
    addFloor(size);
    addCeil(size);
    addMaze(maze);
    addPath(maze);
}

let bubbleLights = [];

function addLights() {
    bubbleLights = [];

    for (let i = 1; i < maze.length; i+=5) {
        for (let j = 1; j < maze[i].length; j+=5) {
            if (maze[i][j] === 0) {
                const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color: 0xffff99 }));
                bubble.position.x = j - maze.length / 2;
                bubble.position.y = 1.35;
                bubble.position.z = (i - maze.length / 2);
                bubble.receiveShadow = false;
                bubble.castShadow = false;
                scene.add(bubble);

                const bubbleLight = new THREE.SpotLight(0xfffffc);
                bubbleLight.position.set(bubble.position.x, bubble.position.y+0.05, bubble.position.z);
                bubbleLight.castShadow = false;
                bubbleLight.intensity = 0.25;
                bubbleLight.penumbra = 1;
                bubbleLight.target = bubble;
                // bubbleLight.shadow.mapSize.width = 1024;
                // bubbleLight.shadow.mapSize.height = 1024;
                // bubbleLight.shadow.camera.near = 0.1;
                // bubbleLight.shadow.camera.far = 10;
                // bubbleLight.shadow.camera.fov = 30;
                scene.add(bubbleLight);

                bubbleLights.push({ light: bubbleLight, mesh: bubble });
            }
        }
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
}

function cullDistantLights(playerPos, maxDist) {
    for (const { light, mesh } of bubbleLights) {
        const dx = mesh.position.x - playerPos.x;
        const dz = mesh.position.z - playerPos.z;
        const inRange = dx * dx + dz * dz < maxDist * maxDist;
        if (inRange && !light.parent) {
            scene.add(light);
        } else if (!inRange && light.parent) {
            scene.remove(light);
        }
    }
}

function restoreAllLights() {
    for (const { light } of bubbleLights) {
        if (!light.parent) {
            scene.add(light);
        }
    }
}

function addFloor(size) {
    const floorSize = size + 1;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xccbb22, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.39;
    floor.receiveShadow = true;
    scene.add(floor);
}

function addCeil(size) {
    const ceilSize = size + 1;
    const ceilGeometry = new THREE.PlaneGeometry(ceilSize, ceilSize);
    const ceilMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
    const ceil = new THREE.Mesh(ceilGeometry, ceilMaterial);
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.y = 1.37;
    ceil.receiveShadow = true;
    ceil.castShadow = false;
    scene.add(ceil);
}

function addMaze(maze) {
    const wallThickness = 0.4;
    const materialWall = new THREE.MeshPhongMaterial({ color: 0xaaaa66, side: THREE.DoubleSide });
    const materialPath = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const materialProp = new THREE.MeshLambertMaterial({ color: 0x22ee22, side: THREE.DoubleSide });
    const materialMonster = new THREE.MeshLambertMaterial({ color: 0xdd2222, side: THREE.DoubleSide });
    const materialKey = new THREE.MeshLambertMaterial({ color: 0xaa66aa, side: THREE.DoubleSide });

    const mazeGroup = new THREE.Group();
    const monsterGroup = new THREE.Group();
    const propGroup = new THREE.Group();
    const keyGroup = new THREE.Group();

    function isWall(i, j) {
        return i >= 0 && i < maze.length && j >= 0 && j < maze[i].length && maze[i][j] === MazeObject.Wall;
    }

    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === MazeObject.Wall) {
                // X-direction strip (connects left-right neighbors)
                const extL = isWall(i, j - 1) ? 0.5 : wallThickness / 2;
                const extR = isWall(i, j + 1) ? 0.5 : wallThickness / 2;
                const sizeX = extL + extR;
                const offsetX = (extR - extL) / 2;

                if (sizeX > 0) {
                    const stripX = new THREE.Mesh(new THREE.BoxGeometry(sizeX, 2.8, wallThickness), getMaterial(maze[i][j]));
                    stripX.position.x = j - maze.length / 2 + offsetX;
                    stripX.position.z = (i - maze.length / 2);
                    stripX.receiveShadow = true;
                    stripX.castShadow = true;
                    mazeGroup.add(stripX);
                }

                // Z-direction strip (connects top-bottom neighbors), skip overlap with X strip
                const extT = isWall(i - 1, j) ? 0.5 : wallThickness / 2;
                const extB = isWall(i + 1, j) ? 0.5 : wallThickness / 2;
                const sizeZ = extT + extB;
                const offsetZ = (extB - extT) / 2;

                if (sizeZ > 0) {
                    const stripZ = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 2.8, sizeZ), getMaterial(maze[i][j]));
                    stripZ.position.x = j - maze.length / 2;
                    stripZ.position.z = (i - maze.length / 2) + offsetZ;
                    stripZ.receiveShadow = true;
                    stripZ.castShadow = true;
                    mazeGroup.add(stripZ);
                }
            } else if (maze[i][j] === MazeObject.Prop) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = (i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const prop = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshLambertMaterial({ color: 0x22ee22 }));
                prop.position.x = j - maze.length / 2;
                prop.position.y = 0.6;
                prop.position.z = (i - maze.length / 2);
                prop.receiveShadow = true;
                prop.castShadow = true;

                propGroup.add(prop);
                propGroup.add(cube);
            } else if (maze[i][j] === MazeObject.Monster) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = (i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const monster = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xdd2222 }));
                monster.position.x = j - maze.length / 2;
                monster.position.y = 0.4;
                monster.position.z = (i - maze.length / 2);
                monster.receiveShadow = true;
                monster.castShadow = true;

                monsterGroup.add(monster);
                mazeGroup.add(cube);
            } else if (maze[i][j] === MazeObject.Key) {
                const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1), getMaterial(maze[i][j]));
                cube.position.x = j - maze.length / 2;
                cube.position.y = 1.39;
                cube.position.z = (i - maze.length / 2);
                cube.receiveShadow = true;
                cube.castShadow = true;

                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 12), new THREE.MeshLambertMaterial({ color: 0xaa66aa }));
                cone.position.x = j - maze.length / 2;
                cone.position.y = 0.6;
                cone.position.z = (i - maze.length / 2);
                cone.receiveShadow = true;
                cone.castShadow = true;
                
                mazeGroup.add(cube);
                keyGroup.add(cone);
            } else if (maze[i][j] === MazeObject.Start) {
                const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8, 32), new THREE.MeshLambertMaterial({ color: 0xdd9933 }));
                cylinder.position.x = j - maze.length / 2;
                cylinder.position.z = (i - maze.length / 2);
                cylinder.receiveShadow = true;
                cylinder.castShadow = false;
                mazeGroup.add(cylinder);
            } else if (maze[i][j] === MazeObject.End) {
                const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8, 32), new THREE.MeshLambertMaterial({ color: 0x3388cc }));
                cylinder.position.x = j - maze.length / 2;
                cylinder.position.z = (i - maze.length / 2);
                cylinder.receiveShadow = true;
                cylinder.castShadow = false;
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
            case MazeObject.Wall: return materialWall;
            case MazeObject.Prop: return materialProp;
            case MazeObject.Monster: return materialMonster;
            case MazeObject.Key: return materialKey;
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
        cube.position.z = (path[i][0] - maze.length / 2);
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

let listenersAdded = false;
function addListeners() {
    if (listenersAdded) return;
    listenersAdded = true;
    document.getElementById('sizeBar').addEventListener('input', () => {
        size = Number(document.getElementById('sizeBar').value);
        document.getElementById('sizeLabel').innerHTML = size;
    });
    
    document.getElementById('sizeBar').addEventListener('mouseup', regenerateMaze);
    document.getElementById('sizeBar').addEventListener('touchend', regenerateMaze);
    
    document.getElementById('easyBar').addEventListener('input', () => {
        easy = Number(document.getElementById('easyBar').value);
        document.getElementById('easyLabel').innerHTML = easy;
    });
    
    document.getElementById('easyBar').addEventListener('mouseup', regenerateMaze);
    document.getElementById('easyBar').addEventListener('touchend', regenerateMaze);
}

function regenerateMaze() {
    scene.children = [];
    addObjs(size, easy);
    composer.render(scene, camera);
}

function animate() {
    displayAnimation = requestAnimationFrame(animate);

    controls.update();
    stats.update();

    composer.render(scene, camera);
}

function stopDisplay() {
    cancelAnimationFrame(displayAnimation);
}

function beginDisplay() {
    animate();
}

init();
addListeners();

export { scene, camera, renderer, controls, stats, maze, size, stopDisplay, beginDisplay, cullDistantLights, restoreAllLights };
