import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { deg2rad } from './utils.js';

export class Dinosaur {
    constructor() {
        this.group = new THREE.Group();
        this.entity = new CANNON.Body(
            {
                type: CANNON.Body.DYNAMIC,
                mass: 20,
                material: new CANNON.Material(
                    {
                        friction: 0.3,
                        restitution: 0.1
                    }),
                position: new CANNON.Vec3(0, 0, 0),
            });

        this.stepLength = 0.02;
        this.walkSpeed = 0.02;
        this.runSpeed = 0.05;
        this.turnSpeed = 0.02;

        this.orientation = new THREE.Vector3(0, 0, 1);
        this.orientationArrow = new THREE.ArrowHelper(this.orientation, this.group.position, 10, 0xff0000);

        this.showVolumeBox = false;
        this.showHeadBox = false;
        this.showBodyBox = false;
        this.showOrientationArrow = false;

        this.skinMaterial = new THREE.MeshLambertMaterial({
            color: 0x79bd69,
            // roughness: 1,
            // wireframe: true,
            // flatShading: true
        });
        this.bellyMaterial = new THREE.MeshLambertMaterial({
            color: 0xEFEFEF,
            // roughness: 1,
            // wireframe: true,
            // flatShading: true
        });
        this.hornMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFC0CB,
            // shininess: 1,
            flatShading: true
        });
        this.eyeMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            // shininess: 1,
            // flatShading: true
        });
        this.mouthMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            // shininess: 1,
            // flatShading: true
        });
        this.cheekMaterial = new THREE.MeshLambertMaterial({
            color: 0xeffc2c6,
            // shininess: 1,
            // flatShading: true
        });

        this.drawBody();
        this.drawHead();
        this.drawNeck();
        this.drawHorn();
        this.drawLeg();
        this.drawArm();
        this.drawTail();

        this.setEntityBox(this.showVolumeBox);

        // this.volumeBox = new THREE.BoxHelper(this.group, 0xff0000);
        // this.group.add(this.volumeBox);
        // this.volumeBox.visible = this.showVolumeBox;

        // add shape from mesh's box helper
        // this.entity.addShape(new CANNON.Box(CANNON.copyBox(this.volumeBox.geometry.boundingBox)));
    }
    drawBody() {
        this.body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), this.skinMaterial);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.group.add(this.body);

        this.belly = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), this.bellyMaterial);
        this.belly.position.set(0, -0.08, 0.16);
        this.belly.scale.set(0.96, 1.02, 1.04);
        this.belly.castShadow = true;
        this.belly.receiveShadow = true;
        this.group.add(this.belly);

        // this.bodyBox = new THREE.BoxHelper(this.body, 0x00ff00);
        // this.group.add(this.bodyBox);
        // this.bodyBox.visible = this.showBodyBox;
    }
    drawHead() {
        this.head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), this.skinMaterial);
        this.head.position.set(0, 1.4, 0.3);
        this.head.scale.set(1, 1, 1.1);
        this.head.castShadow = true;
        this.head.receiveShadow = true;
        this.group.add(this.head);

        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), this.eyeMaterial);
        leftEye.position.set(-0.45, 0.25, 0.75);
        leftEye.castShadow = true;
        leftEye.receiveShadow = true;
        this.head.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.x = -leftEye.position.x;
        this.head.add(rightEye);

        let mouth = [];
        for (let i = 0; i < 10; i++) {
            const mouthLine = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 1.84), this.mouthMaterial);
            mouthLine.position.set(0, 0, 0.1);
            mouthLine.rotation.y = deg2rad(-4.5 * 8 + i * 8);
            mouthLine.rotation.z = deg2rad(-45) + (i % 2) * deg2rad(90);
            mouth.push(mouthLine);
        }
        mouth.forEach((mouthLine) => {
            this.head.add(mouthLine);
        });

        const leftCheek = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), this.cheekMaterial);
        leftCheek.position.set(-0.66, 0.18, 0.55);
        leftCheek.rotation.x = deg2rad(90);
        leftCheek.rotation.y = deg2rad(-15);
        leftCheek.rotation.z = deg2rad(56);
        leftCheek.castShadow = true;
        leftCheek.receiveShadow = true;
        this.head.add(leftCheek);

        const rightCheek = leftCheek.clone();
        rightCheek.position.x = -leftCheek.position.x;
        rightCheek.rotation.y = -leftCheek.rotation.y;
        rightCheek.rotation.z = -leftCheek.rotation.z;
        this.head.add(rightCheek);
    }
    drawNeck() {
        this.neck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 12), this.skinMaterial);
        this.neck.position.set(0, 0.86, -0.08);
        this.neck.rotation.x = deg2rad(3);
        this.neck.castShadow = true;
        this.neck.receiveShadow = true;
        this.group.add(this.neck);
    }
    drawHorn() {
        this.horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 9), this.hornMaterial);
        this.horn.position.set(0, 2.43, 0.3);
        this.horn.scale.set(0.5, 1, 1);
        this.horn.castShadow = true;
        this.horn.receiveShadow = true;
        this.group.add(this.horn);

        this.horn2 = this.horn.clone();
        this.horn2.position.y = this.horn.position.y - 0.14;
        this.horn2.position.z = this.horn.position.z - 0.6;
        this.horn2.rotation.x = deg2rad(-32);
        this.group.add(this.horn2);

        this.horn3 = this.horn2.clone();
        this.horn3.position.y = this.horn2.position.y - 0.44;
        this.horn3.position.z = this.horn2.position.z - 0.44;
        this.horn3.rotation.x = deg2rad(-66);
        this.group.add(this.horn3);

        this.horn4 = this.horn3.clone();
        this.horn4.scale.set(0.52, 1.2, 1.4);
        this.horn4.position.y = this.horn3.position.y - 0.62;
        this.horn4.position.z = this.horn3.position.z - 0.16;
        this.horn4.rotation.x = deg2rad(-80);
        this.group.add(this.horn4);

        this.horn5 = this.horn4.clone();
        this.horn5.position.y = this.horn4.position.y - 0.68;
        this.horn5.position.z = this.horn4.position.z - 0.15;
        this.horn5.rotation.x = deg2rad(-70);
        this.group.add(this.horn5);

        this.horn6 = this.horn5.clone();
        this.horn6.position.y = this.horn5.position.y - 0.6;
        this.horn6.position.z = this.horn5.position.z - 0.14;
        this.horn6.rotation.x = deg2rad(-64);
        this.group.add(this.horn6);

        this.horn7 = this.horn6.clone();
        this.horn7.position.y = this.horn6.position.y - 0.55;
        this.horn7.position.z = this.horn6.position.z - 0.2;
        this.horn7.rotation.x = deg2rad(-58);
        this.group.add(this.horn7);

    }
    drawLeg() {
        this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.3, 1.0, 12), this.skinMaterial);
        // this.leftLeg.position.set(-0.5, -0.7, 0.5);
        this.leftLeg.castShadow = true;
        this.leftLeg.receiveShadow = true;

        let x = 0, y = 0.5, z = 0;
        let offsetX = -0.2, offsetY = -0.4, offsetZ = 0.1;
        this.leftLegWrapper = new THREE.Object3D();
        this.leftLegWrapper.position.set(x + offsetX, y + offsetY, z + offsetZ);
        this.leftLeg.position.set(-x + offsetX, -y + offsetY, -z + offsetZ);
        this.leftLegWrapper.rotation.x = deg2rad(-15);
        this.leftLegWrapper.rotation.z = deg2rad(-10);
        this.leftLegWrapper.add(this.leftLeg);

        this.group.add(this.leftLegWrapper);
        // this.leftLegBox = new THREE.BoxHelper(this.leftLegWrapper, 0x00ff00);
        // this.group.add(this.leftLegBox);

        this.rightLeg = this.leftLeg.clone();
        this.rightLeg.position.x = -this.leftLeg.position.x;
        this.rightLeg.rotation.z = -this.leftLeg.rotation.z;

        this.rightLegWrapper = new THREE.Object3D();
        this.rightLegWrapper.position.set(-x - offsetX, y + offsetY, z + offsetZ);
        this.rightLeg.position.set(x - offsetX, -y + offsetY, -z + offsetZ);
        this.rightLegWrapper.rotation.x = deg2rad(-15);
        this.rightLegWrapper.rotation.z = deg2rad(10);
        this.rightLegWrapper.add(this.rightLeg);

        this.group.add(this.rightLegWrapper);
    }
    drawArm() {
        // this.leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.5, 12), this.skinMaterial);
        this.leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 4, 12), this.skinMaterial);
        this.leftArm.position.set(0.72, 0.35, 0.65);
        this.leftArm.rotation.x = deg2rad(-110);
        this.leftArm.rotation.z = deg2rad(20);
        this.leftArm.castShadow = true;
        this.leftArm.receiveShadow = true;
        this.group.add(this.leftArm);

        this.rightArm = this.leftArm.clone();
        this.rightArm.position.x = -this.leftArm.position.x;
        this.rightArm.rotation.z = -this.leftArm.rotation.z;
        this.group.add(this.rightArm);
    }
    drawTail() {
        this.tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.86, 1.25, 12), this.skinMaterial);
        this.tail.position.set(0, -0.77, -0.96);
        this.tail.rotation.x = deg2rad(-126);
        this.tail.castShadow = true;
        this.tail.receiveShadow = true;
        this.group.add(this.tail);

        this.tail2 = new THREE.Mesh(new THREE.ConeGeometry(0.382, 0.84, 12), this.skinMaterial);
        this.tail2.position.set(0, -1.055, -1.47);
        this.tail2.rotation.x = deg2rad(-120);
        this.tail2.castShadow = true;
        this.tail2.receiveShadow = true;
        this.group.add(this.tail2);
    }
    setEntityBox(visible) {
        let boxParams = [1.0, 1.25, 3.2, 9];
        this.boxOffset = [0, -0.36, -0.1];
        this.group.position.set(...this.boxOffset);

        this.volumeBox = new THREE.Mesh(new THREE.CylinderGeometry(...boxParams), new THREE.MeshBasicMaterial({ color: 0x0ff000, wireframe: true }));
        this.volumeBox.position.set(0, 0.36, 0.1);
        this.volumeBox.rotation.y = deg2rad(180);
        if (visible) {
            this.group.add(this.volumeBox);
        }
        
        this.entityBox = new CANNON.Cylinder(...boxParams);
        this.entity.addShape(this.entityBox);
        this.entity.quaternion.setFromEuler(0, deg2rad(180), 0);
    }
    updateOrientation() {
        const oneVector = new THREE.Vector3(0, 0, 1);
        this.orientation = oneVector.applyQuaternion(this.group.quaternion);
        this.entity.quaternion.copy(this.group.quaternion);
        // console.log(this.initOrientation);
        if (this.showOrientationArrow) {
            this.orientationArrow.setDirection(this.orientation);
            this.orientationArrow.position.copy(this.group.position);
            this.group.add(this.orientationArrow);
        }
        // console.log(this.group.rotation);
        // console.log(this.orientation);
    }
    setPositon(x, y, z) {
        this.entity.position.set(x, y, z);
        this.group.position.copy(this.entity.position.sub(new THREE.Vector3(...this.boxOffset)));
    }
    setRotation(x, y, z) { // can't use this method to rotate the dinosaur
        this.entity.quaternion.setFromEuler(x, y, z);
        this.group.quaternion.copy(this.entity.quaternion);
        this.updateOrientation();
    }
    walkForward() {
        this.entity.position.x += this.orientation.x * this.stepLength;
        this.entity.position.y += this.orientation.y * this.stepLength;
        this.entity.position.z += this.orientation.z * this.stepLength;
        this.group.position.copy(this.entity.position);
        // console.log(this.entity.position);
        this.walkAnimation();
    }
    walkAnimation() {
        this.leftLegWrapper.rotation.x = deg2rad(-12 + Math.sin(Date.now() * 0.005) * 15);
        this.rightLegWrapper.rotation.x = deg2rad(-12 + Math.sin(Date.now() * 0.005 + Math.PI) * 15);
        this.leftArm.rotation.x = deg2rad(-110 + Math.sin(Date.now() * 0.005) * 8);
        this.rightArm.rotation.x = deg2rad(-110 + Math.sin(Date.now() * 0.005 + Math.PI) * 8);
        this.tail.rotation.z = deg2rad(Math.sin(Date.now() * 0.005) * 2);
        this.tail2.rotation.z = deg2rad(Math.sin(Date.now() * 0.005) * 2);
        this.head.rotation.y = deg2rad(Math.sin(Date.now() * 0.005) * 2);
    }
    circle() {
        this.turn(0.1);
        this.walkForward();
    }
    turn(degree) {
        this.group.rotateY(deg2rad(degree));
        this.updateOrientation();
    }
    update() {
        this.group.position.x = this.entity.position.x + this.boxOffset[0];
        this.group.position.y = this.entity.position.y + this.boxOffset[1];
        this.group.position.z = this.entity.position.z + this.boxOffset[2];
        this.group.quaternion.copy(this.entity.quaternion);
    }
}
