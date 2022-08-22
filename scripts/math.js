function random_color() {
    let random_num1 = random_int(20, 130) + 50;
    let random_num2 = random_int(20, 130) + 50;
    let random_num3 = random_int(30, 160) + 40; //deliberately
    return "rgb(" + random_num1 + "," + random_num2 + "," + random_num3 + ")";
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function rotate(x, y, sin, cos, reverse) {
    return {
        x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
        y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
    };
}

function hex2rgba(bgColor, alpha = 1) {
    let color = bgColor.slice(1); // 去掉'#'号
    let rgba = [
        parseInt("0x" + color.slice(0, 2)),
        parseInt("0x" + color.slice(2, 4)),
        parseInt("0x" + color.slice(4, 6)),
        alpha
    ];
    return "rgba(" + rgba.toString() + ")";
};
