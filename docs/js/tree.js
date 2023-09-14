import * as THREE from 'three';
import { randInt, deg2rad } from './utils.js';

export class Tree {
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
