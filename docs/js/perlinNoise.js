import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as noise from 'noisejs';
import { randInt, deg2rad } from './utils.js';

export class PerlinNoise {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.widthSegments = 50;
        this.heightSegments = 50;
        this.noiseScale = 10;
        this.noiseStrength = 3;
        this.group = new THREE.Group();
        this.entity = new CANNON.Body({
            type: CANNON.Body.STATIC,
            mass: 0,
            restitution: 0.8
        });
        this.groundMaterial = new THREE.MeshLambertMaterial({
            color: 0xddc178,
            // side: THREE.DoubleSide,
            // shininess: 0.5,
            flatShading: true
        });

        this.drawPerlinGround();
    }
    drawPerlinGround() {
        this.offset = [0, -1.24, 0];
        this.vertices = [];
        this.groundGeometry = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments, this.heightSegments);

        this.seed = Math.random();
        this.noise = new noise.Noise(this.seed);
        let count = 0;
        for (let i = 0; i <= this.widthSegments; i++) {
            for (let j = 0; j <= this.heightSegments; j++) {
                let x = i / this.widthSegments;
                let y = j / this.heightSegments;
                let z = this.noise.perlin2(x * this.noiseScale, y * this.noiseScale) * this.noiseStrength;
                this.vertices.push((x - 0.5) * this.width, (y - 0.5) * this.height, z);
                count++;
            }
        }
        this.groundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        // console.log(this.groundGeometry.getAttribute('position'));
        this.groundGeometry.attributes.position.needsUpdate = true;

        this.ground = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
        this.ground.rotation.x = deg2rad(-90);
        this.ground.position.set(...this.offset);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
        this.group.add(this.ground);

        this.heightValues = [];
        for (let i = 1; i <= (this.widthSegments + 1) * (this.heightSegments + 1); i += 3) {
            this.heightValues.push(this.vertices[i]);
        }
        // console.log(this.heightValues);
        this.entity.addShape(new CANNON.Heightfield(this.heightValues, {
            elementSize: this.width / this.widthSegments
        }));
        this.entity.position.copy(this.ground.position);
        this.entity.quaternion.copy(this.ground.quaternion);
    }
    update() {
        // this.group.rotation.y += 0.01;
        // this.group.position.copy(this.entity.position);
        // this.group.quaternion.copy(this.entity.quaternion);
    }
}