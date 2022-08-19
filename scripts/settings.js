let title = document.getElementById("start");
title.onclick = () => {
    alert("Welcome to Version 1.2.2, rounded borders, optimized UI.");
};
console.log("Welcome to Version 1.2.2, rounded borders, optimized UI. And user-defined is going to be supported.");

let day_btn = document.getElementById("day_mode");
let night_btn = document.getElementById("night_mode");
let circ_btn = document.getElementById("circulation");

night_btn.onclick = function () {
    //codes below set the modes.(in an awful way)
    dark_degree = 0;
    night_mode = true;
    circulate = day_mode = false;
};
night_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

day_btn.onclick = function () {
    dark_degree = 255;
    day_mode = true;
    circulate = night_mode = false;
};
day_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

circ_btn.onclick = function () {
    circulate = true;
    night_mode = day_mode = false;
};


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

uni_btn.onclick = function () {
    if (!universe_mode) {
        let conf;
        cnt > 20 ? conf = confirm("NOT SUGGESTED to open this mode with too much balls.\n" + "It'll be in a MESS and balls may FLY OUT.\n"
                + "ARE YOU SURE TO GO ON?") : conf = true;
        if (conf) {
            universe_mode = true;
            uni_btn.style.color = "white";
            uni_btn.style.backgroundColor = "#002e63";
            cnt_interv = 50;
        }
    }
    else {
        universe_mode = false;
        uni_btn.style.color = "black";
        uni_btn.style.backgroundColor = "rgba(225,225,225,1)";
    }
};
uni_btn.ondblclick = function () {
    merge_mode = !merge_mode;
    merge_mode ? alert("Merge mode is open.") : alert("Merge mode is close.");
}

function CheckSize() {
    if (width <= 520) {
        day_btn.innerHTML = "Day";
        night_btn.innerHTML = "Night";
        circ_btn.innerHTML = "Circ.";
        grav_btn.innerHTML = "Grav.";
        engy_btn.innerHTML = "Loss";
        uni_btn.innerHTML = "Univ.";
        title.setAttribute("style", "font-size:28px");
    }
    else {
        day_btn.innerHTML = "Day mode";
        night_btn.innerHTML = "Night mode";
        circ_btn.innerHTML = "Circulation";
        grav_btn.innerHTML = "Gravity";
        engy_btn.innerHTML = "Energy loss";
        uni_btn.innerHTML = "Universe mode";
        title.setAttribute("style", "font-size:44px");
    }
}
