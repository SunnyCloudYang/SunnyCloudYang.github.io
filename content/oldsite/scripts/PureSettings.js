const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const balls_cnt = document.getElementById("cnt");
let width = canvas.width = window.innerWidth - 1;
let height = canvas.height = window.innerHeight - 1;

let max_vx = 3;
let max_vy = 3;
let number_of_balls = (width * height < 300000 ? 50 : 70); //default amount
let new_number = number_of_balls;
let min_r = 8 + (number_of_balls == 50 ? 0 : 4);
let max_r = 15 + (number_of_balls == 50 ? 0 : 5);
let max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
const GlobalMaxSpeed = 100;

let default_gy = 0.4;                   //acceleration of gravity
let g_uni = 0.16675;                    //gravitational constant
let mu_floor = 0.03;                    //friction factor of the floor
let gx = 0;
let gy = 0;
let rou = 1;                            //density of ball
let cnt = 0;
let recovery = 1;
let recov_loss = 0.85;
let fuzzy = 0.1;

let universe_mode = false;
let merge_mode = true;
let gravity = false;
let loc_g_mode = true;
let energy_loss = false;
let shake_mode = false;
let bg_color = "#27273c";

let show_setting = false;

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
    max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
    max_balls = max_balls < 600 ? max_balls : 600;
}

function CheckMotion() {
    if (window.DeviceMotionEvent) {
        window.ondevicemotion = DeviceMove;
        window.ondeviceorientation = DeviceRotate;
    }
    else {
        alert("Device's move sensor is not accessable.");
        a_sensor = false;
    }
}

balls_cnt.onclick = function () {
    let user_new = prompt("Balls amount: ", cnt);
    new_number = user_new == null || user_new == "" ? cnt : parseInt(user_new);
    new_number < 0 ? alert("Number can't be negative") : new_number > max_balls ? alert("Balls must be LESS than " + max_balls) : gravity && (min_r + max_r) * new_number > 1.1 * width ? alert("There are too many balls for the floor to contain!") : GetAmount(new_number);
}

const setting = document.getElementById("setting-icon");
const set_menu = document.getElementById("user-settings");
const menu_icons = document.getElementById("menu-icon");
const home_icon = document.getElementById("home-icon");
menu_icons.onmouseenter = function () {
    menu_icons.style.width = menu_icons.childElementCount * 36 + "px";
    setTimeout(() => {
        home_icon.style.display = "block";
    }, 150);
}
menu_icons.onmouseleave = function () {
    menu_icons.style.width = "36px";
    setTimeout(() => {
        home_icon.style.display = "none";
    }, 150);
}
setting.onclick = Menu;
document.onkeydown = function (ev) {
    if (ev.key === "Control") {
        Menu();
    }
}

const min_r_input = document.getElementById("min_r");
const max_r_input = document.getElementById("max_r");
const max_vx_input = document.getElementById("max_vx");
const max_vy_input = document.getElementById("max_vy");
const univ_set = document.getElementById("universe");
const grav_set = document.getElementById("gravity");
const loss_set = document.getElementById("energy_loss");
const merge_set = document.getElementById("merge_mode");
const shake_set = document.getElementById("shake_mode");
const ground_set = document.getElementById("loc_g_mode");
function Menu() {
    if (show_setting) {
        closeSetting();
        executable = true;
    }
    else {
        showSetting();
        executable = false;
        canvas.onclick = function () {
            closeSetting();
            executable = true;
        }
    }
    min_r_input.placeholder = min_r;
    max_r_input.placeholder = max_r;
    max_vx_input.placeholder = max_vx;
    max_vy_input.placeholder = max_vy;
    document.getElementById("val_g").value = document.getElementById("g_const").value = g_uni * 4;
    document.getElementById("val_mu").value = document.getElementById("mu_floor").value = mu_floor;
    document.getElementById("val_loss").value = document.getElementById("recov_loss").value = recov_loss;
    document.getElementById("val_gy").value = document.getElementById("default_gy").value = default_gy * 24.5;
    document.getElementById("val_fuzzy").value = document.getElementById("fuzzy").value = fuzzy;
    document.getElementById("color").value = bg_color;
    univ_set.checked = universe_mode;
    grav_set.checked = gravity;
    loss_set.checked = energy_loss;
    merge_set.checked = merge_mode;
    shake_set.checked = shake_mode;
    ground_set.checked = a_sensor && loc_g_mode;
}

let pre_loss = false;
let pre_shake = shake_mode;
univ_set.onclick = () => {
    univ_set.checked && grav_set.checked ? grav_set.click() : console.log("Universe mode: " + univ_set.checked);
}
grav_set.onclick = () => {
    if (grav_set.checked && (min_r + max_r) * cnt > 1.1 * width) {
        alert("There are too many balls for the floor to contain!");
        grav_set.checked = false;
    }
    else {
        grav_set.checked && univ_set.checked ? univ_set.click() : console.log("Gravity mode: " + grav_set.checked);
        if (grav_set.checked) {
            pre_loss = loss_set.checked;
            loss_set.checked = true;
        }
        else {
            loss_set.checked = pre_loss;
        }
    }
}
loss_set.onclick = () => {
    if (!grav_set.checked) {
        pre_loss = loss_set.checked = !pre_loss;
    }
    else {
        loss_set.checked = true;
    }
}
ground_set.onclick = () => {
    if (ground_set.checked && !a_sensor) {
        alert("This device doesn't have acceleration sensor.");
        ground_set.checked = false;
    }
    else {
        ground_set.checked && shake_set.checked ? shake_set.click() : console.log("Ground pointing: " + ground_set.checked);
        if (ground_set.checked) {
            pre_shake = shake_set.checked;
            shake_set.checked = false;
        } else {
            shake_set.checked = pre_shake;
        }
    }
}
shake_set.onclick = () => {
    if (!ground_set.checked) {
        pre_shake = shake_set.checked = !pre_shake;
    }
    else {
        shake_set.checked = false;
    }
}

document.getElementById("save_set").onclick = () => {
    let valid_set = true;
    let user_min_r = min_r_input.value;
    let user_max_r = max_r_input.value;
    let user_max_vx = max_vx_input.value;
    let user_max_vy = max_vy_input.value;
    let user_g = document.getElementById("g_const").value;
    let user_color = document.getElementById("color").value;
    let user_mu = document.getElementById("mu_floor").value;
    let user_recov = document.getElementById("recov_loss").value;
    let user_gy = document.getElementById("default_gy").value;
    let user_fuzzy = document.getElementById("fuzzy").value;
    const min_r_style = min_r_input.style;
    const max_r_style = max_r_input.style;
    const max_vx_style = max_vx_input.style;
    const max_vy_style = max_vy_input.style;

    if (user_min_r) {
        if (user_min_r >= 3 && user_max_r <= Math.min(width, height) / 25) {
            min_r = Number(user_min_r);
            console.log("Read min r: " + min_r);
        }
        else {
            valid_set = false;
            min_r_style.border = "2px solid red";
            alert("Invalid min radius! Must be no less than 3 and no more than " + Math.min(width, height) / 25);
        }
    }

    if (user_max_r) {
        if (user_max_r >= 3 &&
            user_max_r <= Math.min(width, height) / 20) {
            max_r = Number(user_max_r);
            console.log("Read max r: " + max_r);
        }
        else {
            valid_set = false;
            max_r_style.border = "2px solid red";
            alert("Invalid max radius! Must be no less than 3 and no more than " + Math.min(width, height) / 20);
        }
    }

    if ((min_r > max_r) && valid_set) {
        valid_set = false;
        if (user_max_r) {
            max_r_style.border = "2px solid red";
            alert("Invalid max radius! Must be no less than " + min_r);
        }
        else {
            min_r_style.border = "2px solid red";
            alert("Invalid min radius! Must be no more than " + max_r);
        }
    }

    if ((user_min_r || user_max_r) && valid_set) {
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
        if (Math.abs(user_max_vx) <= 6) {
            max_vx = Math.abs(Number(user_max_vx));
            console.log("Read max vx: " + max_vx);
        }
        else {
            valid_set = false;
            max_vx_style.border = "2px solid red";
            alert("Absolute value of vx must be no more than 6.");
        }

    }
    if (user_max_vy) {
        if (Math.abs(user_max_vy) <= 6) {
            max_vy = Math.abs(Number(user_max_vy));
            console.log("Read max vy: " + max_vy);
        }
        else {
            valid_set = false;
            max_vy_style.border = "2px solid red";
            alert("Absolute value of vy must be no more than 6.");
        }
    }

    if ((user_max_vx || user_max_vy) && valid_set) {
        for (var i = 0; i < cnt; i++) {
            balls[i].vx = random(-max_vx, max_vx);
            balls[i].vy = random(-max_vy, max_vy);
        }
    }

    g_uni = Number(user_g) / 4;
    mu_floor = Number(user_mu);
    recov_loss = Number(user_recov);
    default_gy = Number(user_gy) / 24.5;
    fuzzy = Number(user_fuzzy);
    bg_color = user_color;

    universe_mode = univ_set.checked;
    gravity = grav_set.checked;
    energy_loss = loss_set.checked;
    merge_mode = merge_set.checked;
    shake_mode = shake_set.checked;
    loc_g_mode = ground_set.checked;
    recovery = energy_loss ? recov_loss : 1;

    if (valid_set) {
        min_r_style.border = max_r_style.border =
            max_vx_style.border = max_vy_style.border = "0px";
        document.getElementById("min_r").value = '';
        document.getElementById("max_r").value = '';
        document.getElementById("max_vx").value = '';
        document.getElementById("max_vy").value = '';
        closeSetting();
    }
}

document.getElementById("cancel_set").onclick = () => {
    document.getElementById("min_r").value = '';
    document.getElementById("max_r").value = '';
    document.getElementById("max_vx").value = '';
    document.getElementById("max_vy").value = '';
    closeSetting();
}

function showSetting() {
    show_setting = true;
    set_menu.style.right = "0px";
}
function closeSetting() {
    show_setting = false;
    set_menu.style.right = "-264px";
}