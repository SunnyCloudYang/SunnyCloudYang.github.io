import { scene, renderer, camera, controls, stats, maze, size, stopDisplay, beginDisplay } from './solidMaze.js';
import * as THREE from 'three';

let player, flashLight, cameraContainer;
let gameAnimation;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let basicSpeed = 2;
let speed = basicSpeed;
let prevTime = performance.now();
let gap = 0.2,
    sensitivity = 0.002;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const gameCamera = new THREE.PerspectiveCamera();

function init() {
    // Disable OrbitControls
    controls.enabled = false;

    // Remove former player
    scene.remove(player);

    // Set up player
    let playerGeometry = new THREE.SphereGeometry(gap, 32, 32, 0, Math.PI*2, 0, Math.PI/2);
    player = new THREE.Mesh(
        playerGeometry,
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    player.position.set(0.5-size/2, 1.4, 0.5-size/2);
    player.rotation.set(0, 0, 0);
    scene.add(player);

    // Attach camera to player
    cameraContainer = new THREE.Object3D();
    cameraContainer.position.set(0, 0, 0);
    cameraContainer.rotation.set(0, -Math.PI/2, 0);
    gameCamera.far = 100;
    gameCamera.aspect = screen.width / screen.height;
    gameCamera.position.set(0, -0.8, 0);
    gameCamera.rotation.set(0, 0, 0);
    gameCamera.updateProjectionMatrix();
    player.add(cameraContainer);
    cameraContainer.add(gameCamera);

    flashLight = new THREE.SpotLight(0xffffff, 0.5);
    flashLight.position.set(-0.1, -0.8, 0);
    flashLight.target = gameCamera;
    flashLight.angle = Math.PI / 6;
    flashLight.castShadow = true;
    flashLight.intensity = 0.4;
    flashLight.penumbra = 1;
    player.add(flashLight);

    // const directionalLightHelper = new THREE.SpotLightHelper(flashLight);
    // scene.add(directionalLightHelper);
    
    // Add event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === null) {
            exitGame();
        }
    });
}

function lockPointer() {
    document.body.requestPointerLock();
    console.log("Pointer locked");
}

function unlockPointer() {
    document.exitPointerLock();
    console.log("Pointer unlocked");
}

function onKeyDown(event) {
    if (event.code === 'ShiftLeft') {
        speed = basicSpeed * 2;
    }
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    if (event.code === 'ShiftLeft') {
        speed = basicSpeed;
    }
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onMouseMove(event) {
    if (document.pointerLockElement === document.body) {
        player.rotation.y -= event.movementX * sensitivity;
        gameCamera.rotation.x = Math.max(-5 * Math.PI / 12, Math.min(5 * Math.PI / 12, gameCamera.rotation.x - event.movementY * sensitivity));
        flashLight.position.y = -0.8 - 0.1 * Math.tan(gameCamera.rotation.x);
    }
}

function update() {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    direction.x = Number(moveForward) - Number(moveBackward);
    direction.z = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    velocity.set(0, 0, 0);

    if (moveForward || moveBackward) velocity.x = direction.x * speed;
    if (moveLeft || moveRight) velocity.z = direction.z * speed;

    // Simple collision detection
    const playerPosition = player.position.clone();
    const playerRotationAngle = player.rotation.clone().y;

    const speedInMazeX = (Math.cos(playerRotationAngle) * velocity.x + Math.sin(playerRotationAngle) * velocity.z);
    const speedInMazeZ = (Math.cos(playerRotationAngle) * velocity.z - Math.sin(playerRotationAngle) * velocity.x);

    const targetX = playerPosition.x + speedInMazeX * delta;
    const targetZ = playerPosition.z + speedInMazeZ * delta;
    const mazeX = Math.ceil(targetX + size / 2 + Math.sign(speedInMazeX) * gap);
    const mazeZ = Math.ceil(targetZ + size / 2 + Math.sign(speedInMazeZ) * gap);

    const playerMazeX = Math.ceil(playerPosition.x + size / 2);
    const playerMazeZ = Math.ceil(playerPosition.z + size / 2);
    
    const collisionX = maze[playerMazeZ] && maze[playerMazeZ][mazeX] === 1 && playerMazeX !== mazeX;
    const collisionZ = maze[mazeZ] && maze[mazeZ][playerMazeX] === 1 && playerMazeZ !== mazeZ;
    
    if (collisionX) {
        velocity.x -= speedInMazeX * Math.cos(playerRotationAngle);
        velocity.z -= speedInMazeX * Math.sin(playerRotationAngle);
    }
    if (collisionZ) {
        velocity.z -= speedInMazeZ * Math.cos(playerRotationAngle);
        velocity.x += speedInMazeZ * Math.sin(playerRotationAngle);
    }

    player.translateX(velocity.x * delta);
    player.translateZ(velocity.z * delta);
    prevTime = time;
}

function exitGame() {
    unlockPointer();
    deinit();
    beginDisplay();
    console.log("Exit game");
}

function animate() {
    gameAnimation = requestAnimationFrame(animate);
    update();
    stats.update();
    renderer.render(scene, gameCamera);
}

function deinit() {
    cancelAnimationFrame(gameAnimation);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('mousemove', onMouseMove);
    controls.enabled = true;
}

beginDisplay();
document.getElementById('startGame').addEventListener('click', () => {
    stopDisplay();
    if (!document.fullscreenElement) {
        document.getElementById('fullscreenBtn').click();
        console.log("Fullscreen");
    }
    if (document.pointerLockElement === null) {
        lockPointer();
    }
    init();
    animate();
});
