import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { randInt, deg2rad } from './utils.js';

export class Ground {
    constructor() {
        this.group = new THREE.Group();
        this.entity = new CANNON.Body({
            type: CANNON.Body.STATIC
        });
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
        this.ground.position.set(0, -1.24, 0);
        this.ground.rotation.x = deg2rad(-90);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
        this.group.add(this.ground);

        this.entity.addShape(new CANNON.Plane());
        this.entity.position.copy(this.ground.position);
        this.entity.quaternion.copy(this.ground.quaternion);
        this.entity.mass = 0;
    }
    update() {
        // this.group.rotation.y += 0.01;
        // this.group.position.copy(this.entity.position);
        // this.group.quaternion.copy(this.entity.quaternion);
    }
}
