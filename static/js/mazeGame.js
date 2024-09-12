import { scene, camera, renderer, controls, stats, maze, size, stopDisplay, beginDisplay } from './solidMaze.js';
import * as THREE from 'three';

let player, raycaster;
let gameAnimation;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let basicSpeed = 2;
let speed = basicSpeed;
let prevTime = performance.now();
let gap = 0.1;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const originCameraPosition = camera.position.clone();
const originCameraRotation = camera.rotation.clone();

function init() {
    // Disable OrbitControls
    controls.enabled = false;

    // Remove former player
    scene.remove(player);

    // Set up player
    let playerGeometry = new THREE.SphereGeometry(gap, 32, 32);
    player = new THREE.Mesh(
        playerGeometry,
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    player.position.set(0.5-size/2, 1.4, 0.5-size/2);
    player.rotation.set(0, 0, 0);
    scene.add(player);

    // Attach camera to player
    player.add(camera);
    camera.position.set(0, -0.8, 0); // Adjust camera height
    camera.rotation.set(0, -Math.PI/2, 0);
    // camera.lookAt(player.position);

    // Set up raycaster for collision detection
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    
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
        player.rotation.y -= event.movementX * 0.002;
        // camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - event.movementY * 0.002));
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
    renderer.render(scene, camera);
}

function deinit() {
    cancelAnimationFrame(gameAnimation);
    camera.position.copy(originCameraPosition);
    camera.rotation.copy(originCameraRotation);
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
