document.getElementById("start").ondblclick = () => {
    alert("Welcome to Version 1.2.0, the bug that balls can't be counted properly has been fixed.");
};
console.log("Welcome to Version 1.2.0, the bug that balls can't be counted properly has been fixed.");

let day_btn = document.getElementById("day_mode");
let night_btn = document.getElementById("night_mode");
let circ_btn = document.getElementById("circulation");

night_btn.onclick = function () {
    //codes below set the modes.(in an awful way)
    dark_degree = 0;
    circulate = 0;
    night_mode = 1;
    day_mode = 0;
    night_btn.style.backgroundColor = "black";
    day_btn.style.backgroundColor = "rgba(225,225,225,1)";
    circ_btn.style.backgroundColor = "rgba(225,225,225,1)";
};
night_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

day_btn.onclick = function () {
    dark_degree = 255;
    circulate = 0;
    night_mode = 0;
    day_mode = 1;
    night_btn.style.backgroundColor = "dimgrey";
    day_btn.style.backgroundColor = "white";
    circ_btn.style.backgroundColor = "rgba(225,225,225,1)";
};
day_btn.ondblclick = function () {
    fuzzy = -fuzzy;
}

circ_btn.onclick = function () {
    circulate = 1;
    night_mode = 0;
    day_mode = 0;
    night_btn.style.backgroundColor = "dimgrey";
    day_btn.style.backgroundColor = "rgba(225,225,225,1)";
    circ_btn.style.backgroundColor = "rgba(200,225,200,1)";
};


let grav_btn = document.getElementById("gravity");
let engy_btn = document.getElementById("energy_loss");
let uni_btn = document.getElementById("Ball_Universe");

grav_btn.onclick = function () {
    if (!gravity) {
        gravity = true;
        gy = default_gy;
        grav_btn.style.color = "white";
        grav_btn.style.backgroundColor = "purple";
    } else {
        gravity = false;
        gy = 0;
        grav_btn.style.color = "black";
        grav_btn.style.backgroundColor = "rgba(225,225,225,1)";
    }
};

engy_btn.onclick = function () {
    if (energy_loss == 0) {
        energy_loss = 1;
        recovery = 0.85;
        engy_btn.style.color = "white";
        engy_btn.style.backgroundColor = "purple";
    } else {
        energy_loss = 0;
        recovery = 1;
        engy_btn.style.color = "black";
        engy_btn.style.backgroundColor =
            "rgba(225,225,225,1)";
    }
};

uni_btn.onclick = function () {
    if (universe_mode === 0) {
        let conf = true;
        if (cnt > 50) {
            conf = confirm("NOT SUGGESTED to open this mode with too much balls.\n" + "It'll be in a MESS and balls may FLY OUT.\n"
                + "ARE YOU SURE TO GO ON?");
        }
        if (conf) {
            universe_mode = 1;
            uni_btn.style.color = "white";
            uni_btn.style.backgroundColor = "#002e63";
        }
    } else {
        universe_mode = 0;
        uni_btn.style.color = "black";
        uni_btn.style.backgroundColor = "rgba(225,225,225,1)";
    }
};

function CheckSize() {
    if (width <= 520) {
        day_btn.innerHTML = "Day";
        night_btn.innerHTML = "Night";
        circ_btn.innerHTML = "Circ.";
        grav_btn.innerHTML = "Grav.";
        engy_btn.innerHTML = "Loss";
        uni_btn.innerHTML = "Univ.";
    }
    else {
        day_btn.innerHTML = "Day mode";
        night_btn.innerHTML = "Night mode";
        circ_btn.innerHTML = "Circulation";
        engy_btn.innerHTML = "Energy loss";
        uni_btn.innerHTML = "Universe mode";
    }
}
