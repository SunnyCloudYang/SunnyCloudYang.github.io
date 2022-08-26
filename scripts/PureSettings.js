const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let cnt_of_balls_now = document.getElementById("cnt");
let width = canvas.width = window.innerWidth - 1;
let height = canvas.height = window.innerHeight - 1;

let min_r = 7;
let max_r = 15;
let max_vx = 3;
let max_vy = 3;
let max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
let number_of_balls = (width * height < 300000 ? 50 : 100); //default amount
const GlobalMaxSpeed = 100;

let default_gy = 0.4;                 //acceleration of gravity
let g_uni = 0.473;                      //the gravitational constant
let mu_floor = 0.03;                    //friction coefficient of the floor
let gx = 0;
let gy = 0;
let rou = 1;                            //density of ball
let cnt = 0;
let recovery = 1;
let recov_loss = 0.85;
let fuzzy = 0.3;

let universe_mode = false;
let merge_mode = true;
let gravity = false;
let loc_g_mode = true;
let energy_loss = false;
let shake_mode = false;
let night_color = "#2a273c";

window.onresize = () => {
    width = canvas.width = window.innerWidth - 1;
    height = canvas.height = window.innerHeight - 1;
    CheckSize();
}

setTimeout(() => {
    CheckSize();
    CheckMotion();
}, 1500);

function CheckSize() {
}

function CheckMotion() {
    if (window.DeviceMotionEvent) {
        window.ondevicemotion = DeviceMove;
        // window.ondeviceorientation = DeviceRotate;
    }
    else {
        alert("Device move sensor is not supported.");
    }
}

function getEventPosition(ev) {
    return { x: ev.layerX, y: ev.layerY };
} //choose


