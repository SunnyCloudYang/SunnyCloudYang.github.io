import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { randInt, deg2rad } from './utils.js';

export class Ball {
    constructor() {
        this.group = new THREE.Group();
        this.entity = new CANNON.Body({
            type: CANNON.Body.DYNAMIC,
            mass: 1,
            restitution: 0.8,
            material: new CANNON.Material()
        });

        this.radius = 0.2;

        this.ballMaterial = new THREE.MeshLambertMaterial({
            color: 0x00aaaa,
            // shininess: 0.5,
            // flatShading: true
        });

        this.drawBall();
    }
    drawBall() {
        this.ball = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 12, 12), this.ballMaterial);
        this.ball.castShadow = true;
        this.ball.receiveShadow = true;
        this.group.add(this.ball);

        this.entity.addShape(new CANNON.Sphere(this.radius));
        this.entity.position.set(0, 5, 0);
    }
    setPosition(x, y, z) {
        this.entity.position.set(x, y, z);
    }
    update() {
        this.group.position.copy(this.entity.position);
        this.group.quaternion.copy(this.entity.quaternion);
    }
}