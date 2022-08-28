const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let cnt_of_balls_now = document.getElementById("cnt");
let width = canvas.width = window.innerWidth - 1;
let height = canvas.height = window.innerHeight - 1;

let min_r = 8;
let max_r = 15;
let max_vx = 3;
let max_vy = 3;
let max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
let number_of_balls = (width * height < 300000 ? 50 : 100); //default amount
const GlobalMaxSpeed = 100;

let default_gy = 0.4;                   //acceleration of gravity
let g_uni = 0.473;                      //the gravitational constant
let mu_floor = 0.03;                    //friction coefficient of the floor
let gx = 0;
let gy = 0;
let rou = 1;                            //density of ball
let cnt = 0;
let recovery = 1;
let recov_loss = 0.85;
let fuzzy = 0.9;

let universe_mode = false;
let merge_mode = true;
let gravity = false;
let loc_g_mode = true;
let energy_loss = false;
let shake_mode = false;
let bg_color = "#2a273c";

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
        window.ondeviceorientation = DeviceRotate;
    }
    else {
        alert("Device move sensor is not supported.");
    }
}

const setting = document.getElementById("setting-icon");
const set_menu = document.getElementById("user-settings");
setting.onclick = Menu;
document.onkeydown = function (ev) {
    console.log(ev.key);
    if (ev.key === "Control") {
        Menu();
    }
}

function Menu() {
    if (set_menu.style.display == "block") {
        set_menu.style.display = "none";
        executable = true;
    }
    else {
        set_menu.style.display = "block";
        executable = false;
        canvas.onclick = function () {
            set_menu.style.display = "none";
            executable = true;
        }
    }
    document.getElementById("min_r").placeholder = min_r;
    document.getElementById("max_r").placeholder = max_r;
    document.getElementById("max_vx").placeholder = max_vx;
    document.getElementById("max_vy").placeholder = max_vy;
    document.getElementById("val_g").value = document.getElementById("g_const").value = g_uni;
    document.getElementById("val_mu").value = document.getElementById("mu_floor").value = mu_floor;
    document.getElementById("val_loss").value = document.getElementById("recov_loss").value = recov_loss;
    document.getElementById("val_gy").value = document.getElementById("default_gy").value = default_gy * 24.5;
    document.getElementById("color").value = bg_color;
}

document.getElementById("save_set").onclick = () => {
    let user_min_r = document.getElementById("min_r").value;
    let user_max_r = document.getElementById("max_r").value;
    let user_max_vx = document.getElementById("max_vx").value;
    let user_max_vy = document.getElementById("max_vy").value;
    let user_g = document.getElementById("g_const").value;
    let user_color = document.getElementById("color").value;
    let user_mu = document.getElementById("mu_floor").value;
    let user_recov = document.getElementById("recov_loss").value;
    let user_gy = document.getElementById("default_gy").value;
    if (user_min_r &&
        user_min_r <=
        max_r) {
        min_r = Number(user_min_r);
        console.log("Read min r: " + min_r);
    }
    else if (user_min_r) {
        alert("Invalid min radius! Must be no bigger than " + max_r);
    }
    if (user_max_r &&
        user_max_r >=
        min_r) {
        max_r = Number(user_max_r);
        console.log("Read max r: " + max_r);
    }
    else if (user_max_r) {
        alert("Invalid max radius! Must be no less than " + min_r);
    }
    if (user_min_r || user_max_r) {
        if (max_r - min_r > cnt / 5) {
            for (var i = 0; i < cnt; i++) {
                balls[i].radius = random_int(min_r, max_r);
                balls[i].mess = rou * balls[i].radius ** 3;
            }
        }
        else
            for (var i = 0; i < cnt; i++) {
                balls[i].radius = random(min_r, max_r);
                balls[i].mess = rou * balls[i].radius ** 3;
            }
        CheckSize();
    }

    if (user_max_vx) {
        max_vx = Number(user_max_vx);
        console.log("Read max vx: " + max_vx);
    }
    if (user_max_vy) {
        max_vy = Number(user_max_vy);
        console.log("Read max vy: " + max_vy);
    }
    if (user_max_vx || user_max_vy) {
        for (var i = 0; i < cnt; i++) {
            balls[i].vx = random(-max_vx, max_vx);
            balls[i].vy = random(-max_vy, max_vy);
        }
    }
    g_uni = Number(user_g);
    mu_floor = Number(user_mu);
    recov_loss = Number(user_recov);
    recovery = energy_loss ? 1 : recov_loss;
    default_gy = Number(user_gy) / 24.5;
    bg_color = user_color;
    document.getElementById("min_r").value = '';
    document.getElementById("max_r").value = '';
    document.getElementById("max_vx").value = '';
    document.getElementById("max_vy").value = '';
    set_menu.style.display = "none";
}

document.getElementById("cancel_set").onclick = () => {
    document.getElementById("min_r").value = '';
    document.getElementById("max_r").value = '';
    document.getElementById("max_vx").value = '';
    document.getElementById("max_vy").value = '';
    set_menu.style.display = "none";
}