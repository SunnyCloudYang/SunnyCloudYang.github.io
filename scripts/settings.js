let day_btn = document.getElementById("day_mode").style;
let night_btn = document.getElementById("night_mode").style;
let circ_btn = document.getElementById("circulation").style;

document.getElementById("night_mode").onclick = function () {
    //codes below set the modes.(in an awful way)
    dark_degree = 0;
    circulate = 0;
    night_mode = 1;
    day_mode = 0;
    night_btn.backgroundColor = "black";
    day_btn.backgroundColor = "rgba(225,225,225,1)";
    circ_btn.backgroundColor = "rgba(225,225,225,1)";
};
document.getElementById("night_mode").ondblclick = function () {
    fuzzy = -fuzzy;
}

document.getElementById("day_mode").onclick = function () {
    dark_degree = 255;
    circulate = 0;
    night_mode = 0;
    day_mode = 1;
    night_btn.backgroundColor = "dimgrey";
    day_btn.backgroundColor = "white";
    circ_btn.backgroundColor = "rgba(225,225,225,1)";
};
document.getElementById("day_mode").ondblclick = function () {
    fuzzy = -fuzzy;
}

document.getElementById("circulation").onclick = function () {
    circulate = 1;
    night_mode = 0;
    day_mode = 0;
    night_btn.backgroundColor = "dimgrey";
    day_btn.backgroundColor = "rgba(225,225,225,1)";
    circ_btn.backgroundColor = "rgba(200,225,200,1)";
};


let grav_btn = document.getElementById("gravity").style;
let engy_btn = document.getElementById("energy_loss").style;
let uni_btn = document.getElementById("Ball_Universe").style;

document.getElementById("gravity").onclick = function () {
    if (gravity === 0) {
        gravity = 1;
        gy = default_gy;
        grav_btn.color = "white";
        grav_btn.backgroundColor = "purple";
    } else {
        gravity = 0;
        gy = 0;
        grav_btn.color = "black";
        grav_btn.backgroundColor = "rgba(225,225,225,1)";
    }
};

document.getElementById("energy_loss").onclick = function () {
    if (energy_loss === 0) {
        energy_loss = 1;
        recovery = 0.85;
        engy_btn.color = "white";
        engy_btn.backgroundColor = "purple";
    } else {
        energy_loss = 0;
        recovery = 1;
        engy_btn.color = "black";
        engy_btn.backgroundColor =
            "rgba(225,225,225,1)";
    }
};

document.getElementById("Ball_Universe").onclick = function () {
    if (universe_mode === 0) {
        let conf = true;
        if (cnt > 50) {
            conf = confirm("NOT SUGGESTED to open this mode with too much balls.\n" + "It'll be in a MESS and balls may FLY OUT.\n"
                + "ARE YOU SURE TO GO ON?");
        }
        if (conf) {
            universe_mode = 1;
            uni_btn.color = "white";
            uni_btn.backgroundColor = "#002e63";
        }
    } else {
        universe_mode = 0;
        uni_btn.color = "black";
        uni_btn.backgroundColor = "rgba(225,225,225,1)";
    }
};