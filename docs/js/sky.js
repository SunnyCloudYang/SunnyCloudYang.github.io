import * as THREE from 'three';

export class Sky {
    constructor() {
        this.dayColor = 0x8acef2;
        this.nightColor = 0x32506e;
        this.night = false;

        this.group = new THREE.Group();

        this.skyMaterial = new THREE.MeshBasicMaterial({
            color: this.dayColor,
            side: THREE.BackSide,
            // shininess: 0,
            // flatShading: true
        });

        this.drawSky();
    }
    drawSky() {
        this.sky = new THREE.Mesh(new THREE.SphereGeometry(100, 8, 8), this.skyMaterial);
        this.sky.castShadow = true;
        this.sky.receiveShadow = true;
        this.group.add(this.sky);
    }
    setNight(night) {
        this.night = night;
        if (night) {
            this.skyMaterial.color.setHex(this.nightColor);
        } else {
            this.skyMaterial.color.setHex(this.dayColor);
        }
    }
    update() {
        // this.group.rotation.y += 0.001;
    }
}