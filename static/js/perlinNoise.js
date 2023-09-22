import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as noise from 'noisejs';
import { randInt, deg2rad } from './utils.js';

export class PerlinNoise {
    constructor() {
        this.width = 100;
        this.height = 100;
        this.widthSegments = 100;
        this.heightSegments = 100;
        this.noiseScale = 10;
        this.noiseStrength = 2;
        this.group = new THREE.Group();
        this.entity = new CANNON.Body({
            type: CANNON.Body.STATIC,
            mass: 0,
            material: new CANNON.Material({
                id: 'ground'
            }),
            friction: 0.8,
            restitution: 0.4
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
        this.heightValues = [];
        this.groundGeometry = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments, this.heightSegments);

        this.seed = Math.random();
        this.noise = new noise.Noise(this.seed);
        let count = 0;
        for (let i = 0; i <= this.widthSegments; i++) {
            this.heightValues[i] = [];
            for (let j = 0; j <= this.heightSegments; j++) {
                let x = i / this.widthSegments;
                let y = j / this.heightSegments;
                let z = this.noise.perlin2(x * this.noiseScale, y * this.noiseScale) * this.noiseStrength;
                this.vertices.push((x - 0.5) * this.width, (y - 0.5) * this.height, z);
                this.heightValues[i][j] = z;
                count++;
            }
        }
        // console.log(count);
        this.groundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        // console.log(this.groundGeometry.getAttribute('position'));
        this.groundGeometry.attributes.position.needsUpdate = true;

        this.ground = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
        this.ground.rotation.x = deg2rad(-90);
        this.ground.position.set(...this.offset);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
        this.group.add(this.ground);

        // console.log(this.heightValues);
        // this.entity.addShape(new CANNON.Plane());
        this.entity.addShape(new CANNON.Heightfield(this.heightValues, {
            elementSize: this.width / this.widthSegments
        }));
        this.groundPosition = new THREE.Vector3().copy(this.ground.position);

        this.entity.position.copy(this.groundPosition.sub(new THREE.Vector3(this.width/2, 0, -this.height/2)));
        this.entity.quaternion.copy(this.ground.quaternion);
        // console.log(this.entity);
    }
    update() {
        // this.group.rotation.y += 0.01;
        // this.group.position.copy(this.entity.position);
        // this.group.quaternion.copy(this.entity.quaternion);
    }
}