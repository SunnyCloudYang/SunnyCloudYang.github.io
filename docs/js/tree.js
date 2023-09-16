import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { randInt, deg2rad } from './utils.js';

export class Tree {
    constructor() {
        this.group = new THREE.Group();
        this.entity = new CANNON.Body({
            type: CANNON.Body.STATIC
        });

        this.treeMaterial = new THREE.MeshPhongMaterial({
            color: 0x04ee04,
            shininess: 0.5,
            flatShading: true
        });
        this.trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 0,
            // flatShading: true
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

        this.scale = [0.9 + Math.random() * 0.2, 0.8 + Math.random() * 0.4, 0.9 + Math.random() * 0.2];
        this.group.scale.set(...this.scale);

        this.volumeBox = new THREE.BoxHelper(this.group, 0x00ff00);
        this.volumeBox.visible = false;
        if (this.volumeBox.visible) {
            this.group.add(this.volumeBox);
        }

        // this.upperBound = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.55, 1.4, 12));
        // this.upperBound.position.set(0, 0.6, 0);
        // this.group.add(this.upperBound);
        // this.lowerBound = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 12));
        // this.lowerBound.position.set(0, -0.4, 0);
        // this.group.add(this.lowerBound);

        this.entity.upper = new CANNON.Cylinder(0.25, 0.55, 1.4);
        this.entity.upper.position = new CANNON.Vec3(0, 0.6, 0);
        this.entity.lower = new CANNON.Cylinder(0.1, 0.1, 1.6);
        this.entity.lower.position = new CANNON.Vec3(0, -0.4, 0);
        this.entity.addShape(this.entity.upper);
        this.entity.addShape(this.entity.lower);

        this.entity.position.copy(this.group.position);
        this.entity.quaternion.copy(this.group.quaternion);

    }
    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
        this.entity.position.copy(this.group.position);
    }
    setRotation(x, y, z) {
        this.group.rotation.set(x, y, z);
        this.entity.quaternion.copy(this.group.quaternion);
    }
    update() {
        // this.group.rotation.y += 0.01;
        this.group.position.copy(this.entity.position);
        this.group.quaternion.copy(this.entity.quaternion);
    }
}
