const cans = document.querySelector("canvas");
const ctx = cans.getContext("2d");
let myCanvas = document.getElementById("myCanvas");
let cnt_of_balls_now = document.getElementById("cnt");
let width = cans.width = window.innerWidth - 16;
let height = cans.height = window.innerHeight - 30;
let balls_valumn = [];
let min_r = 7;
let max_r = 20;
let max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
let number_of_balls = width * height < 300000 ? 50 : 100; //default balls amount
let max_vx = 3;
let max_vy = 3;
let default_gy = 0.4; //acceleration of gravity
let g_uni = 0.667; //the gravitational constant
let mu_floor = 0.007;
let gy = 0;
let rou = 1; //density of ball
let cnt;
let dark_degree = 0;
let recovery = 1;
let fuzzy = 0.3;
let night_mode = true; //default mode
let day_mode = false;
let merge_mode = true;
let universe_mode = false;
let gravity = false;
let energy_loss = false;
let shake_mode = true;
let night_color = "#2a273c";
let day_color = "#feffe6";
let bg_color = night_mode ? night_color : day_color;

let title = document.getElementById("start");
title.onclick = () => {
    alert("Welcome to Version 1.3.0, now you can almost define EVERYTHING on your own!");
};
console.log("Welcome to Version 1.3.0 with DIY mode. Click 'Custom' to change whatever you like.");

let day_btn = document.getElementById("day_mode");
let night_btn = document.getElementById("night_mode");
let cust_btn = document.getElementById("custom");

night_btn.onclick = function () {
    //codes below set the modes.(in an awful way)
    dark_degree = 0;
    night_mode = true;
    day_mode = false;
    night_btn.style.backgroundColor = "black";
    day_btn.style.backgroundColor = "rgb(225,225,225)";
    bg_color = night_color;
};
night_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

day_btn.onclick = function () {
    dark_degree = 255;
    day_mode = true;
    night_mode = false;
    night_btn.style.backgroundColor = "dimgray";
    day_btn.style.backgroundColor = "white";
    bg_color = day_color;
};
day_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

let grav_btn = document.getElementById("gravity");
let engy_btn = document.getElementById("energy_loss");
let uni_btn = document.getElementById("universe_mode");

grav_btn.onclick = function () {
    if (!gravity) {
        gravity = true;
        gy = default_gy;
        grav_btn.style.color = "white";
        grav_btn.style.backgroundColor = "purple";
    }
    else {
        gravity = false;
        gy = 0;
        grav_btn.style.color = "black";
        grav_btn.style.backgroundColor = "rgba(225,225,225,1)";
    }
};

engy_btn.onclick = function () {
    if (!energy_loss) {
        energy_loss = true;
        recovery = 0.85;
        engy_btn.style.color = "white";
        engy_btn.style.backgroundColor = "purple";
    }
    else {
        energy_loss = false;
        recovery = 1;
        engy_btn.style.color = "black";
        engy_btn.style.backgroundColor =
            "rgba(225,225,225,1)";
    }
};

let UniClick = null;
uni_btn.onclick = function () {
    clearInterval(UniClick);
    UniClick = setTimeout(() => {
        if (!universe_mode) {
            let conf;
            cnt * g_uni > 10 ? conf = confirm("NOT SUGGESTED to open this mode with too much balls.\n" + "It'll be in a MESS and balls may FLY OUT.\n" + "ARE YOU SURE TO GO ON?") : conf = true;
            if (conf) {
                universe_mode = true;
                uni_btn.style.color = "white";
                uni_btn.style.backgroundColor = "#002e63";
            }
        }
        else {
            universe_mode = false;
            uni_btn.style.color = "black";
            uni_btn.style.backgroundColor = "rgb(225,225,225)";
        }
    }, 200);
};
uni_btn.ondblclick = function () {
    clearInterval(UniClick);
    merge_mode = !merge_mode;
    merge_mode ? alert("Merge mode is open.") : alert("Merge mode is close.");
}

document.getElementById("number").onkeydown = function (ev) {
    if (ev.key === 'Enter') {
        GetAmount();
    }
}

window.onresize = () => {
    width = cans.width = window.innerWidth - 16;
    height = cans.height = window.innerHeight - 30;
    CheckSize();
}

setTimeout(() => {
    CheckSize();
    CheckMotion();
}, 1500);

function CheckSize() {
    let input_num = document.getElementById("number");
    if (width <= 520) {
        day_btn.innerHTML = "Day";
        night_btn.innerHTML = "Night";
        cust_btn.innerHTML = "Cust.";
        grav_btn.innerHTML = "Grav.";
        engy_btn.innerHTML = "Loss";
        uni_btn.innerHTML = "Univ.";
        title.setAttribute("style", "font-size:28px");
        input_num.setAttribute("style", "width:50px");
    }
    else {
        day_btn.innerHTML = "Day mode";
        night_btn.innerHTML = "Night mode";
        cust_btn.innerHTML = "Custom";
        grav_btn.innerHTML = "Gravity";
        engy_btn.innerHTML = "Energy loss";
        uni_btn.innerHTML = "Universe mode";
        title.setAttribute("style", "font-size:44px");
        input_num.setAttribute("style", "width:88px");
    }
    max_balls = 25 * Math.floor(width * height / (1500 * (min_r + max_r)));
    max_balls = max_balls < 700 ? max_balls : 700;
    input_num.setAttribute("placeholder", "1-" + max_balls);
}

function CheckMotion() {
    if (window.DeviceMotionEvent) {
        window.ondevicemotion = DeviceMove;
        window.ondeviceorientation = DeviceRotate;
    }
    else {
        alert("device move is not supported.");
    }
}

function getEventPosition(ev) {
    return { x: ev.layerX, y: ev.layerY };
} //choose

cust_btn.onclick = UserDef;
let set_menu = document.getElementById("user_settings");
function UserDef() {
    set_menu.style.display == "inline-flex" ? set_menu.style.display = "none" : set_menu.style.display = "inline-flex";
    document.getElementById("val").value = document.getElementById("g_const").value = g_uni;
    document.getElementById("color").value = bg_color;
}


document.getElementById("save_set").onclick = () => {
    let user_min_r = document.getElementById("min_r").value;
    let user_max_r = document.getElementById("max_r").value;
    let user_max_vx = document.getElementById("max_vx").value;
    let user_max_vy = document.getElementById("max_vy").value;
    let user_g = document.getElementById("g_const").value;
    let user_color = document.getElementById("color").value;
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
                balls_valumn[i].radius = random_int(min_r, max_r);
                balls_valumn[i].mess = rou * balls_valumn[i].radius ** 3;
            }
        }
        else
            for (var i = 0; i < cnt; i++) {
                balls_valumn[i].radius = random(min_r, max_r);
                balls_valumn[i].mess = rou * balls_valumn[i].radius ** 3;
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
            balls_valumn[i].vx = random(-max_vx, max_vx);
            balls_valumn[i].vy = random(-max_vy, max_vy);
        }
    }
    g_uni = Number(user_g);
    day_mode ? day_color = user_color : night_color = user_color;
    console.log("Current settings: ", min_r, max_r, max_vx, max_vy, g_uni, bg_color);
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
