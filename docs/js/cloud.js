import * as THREE from 'three';
import { randInt } from './utils.js';

export class Cloud {
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
        this.cloud = new THREE.Mesh(new THREE.SphereGeometry(5, 6, 6), this.cloudMaterial);
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
        this.group.position.y += 2 * Math.random() + 7;
        this.group.position.z += randInt(-50, 50);
        this.group.scale.set(0.15 + Math.random() * 0.1, 0.15 + Math.random() * 0.05, 0.15 + Math.random() * 0.1);
    }
    move(x, y, z) {
        this.group.position.x += x;
        this.group.position.y += y;
        this.group.position.z += z;
    }
    checkBounds([minX, maxX], [minY, maxY], [minZ, maxZ]) {
        if (this.group.position.x < minX || this.group.position.x > maxX) {
            this.group.position.x = -this.group.position.x;
            this.group.position.y = 2 * Math.random() + 5;
            this.group.position.z = randInt(minZ, maxZ);
        }
        if (this.group.position.y < minY || this.group.position.y > maxY) {
            this.group.position.y = -this.group.position.y;
            this.group.position.x = randInt(minX, maxX);
            this.group.position.z = randInt(minZ, maxZ);
        }
        if (this.group.position.z < minZ || this.group.position.z > maxZ) {
            this.group.position.z = -this.group.position.z;
            this.group.position.y = 2 * Math.random() + 5;
            this.group.position.x = randInt(minX, maxX);
        }
    }
    update() {
        this.move(0.01, 0.00, 0.005);
        this.checkBounds([-50, 50], [5, 10], [-50, 50]);
    }
}
