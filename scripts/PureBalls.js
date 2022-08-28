//Last changed 2022-8-24 20:12
let balls = [];
let x0 = -1;
let y0 = -1;
let n_color = "";
let n_r = 0;
let sleep = false;
let executable = true;
function MousedownHandler(ev) {
    if (executable) {
        x0 = ev.pageX;
        y0 = ev.pageY;
        console.log(ev.layerX, ev.pageX, ev.clientX, ev.x);
        if (ChooseBall({ x0, y0 })) {
            canvas.onmousemove = MoveBall;
        }
        else {
            n_color = random_color();
            canvas.onmousemove = canvas.ontouchmove = ShapeBall;
        }
    }
    else {
        canvas.onmousemove = canvas.onmouseup = null;
    }
}

function ShapeBall(ev) {
    sleep = true;
    n_r = ((ev.pageX - x0) ** 2 + (ev.pageY - y0) ** 2) ** 0.5;
    n_r = n_r < min_r ? min_r : (n_r > max_r ? max_r : n_r);
    console.log(x0, y0, ev.pageX, ev.pageY, n_r);
    requestAnimationFrame(() => {
        ctx.fillStyle = hex2rgba(bg_color, 1);
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < cnt; i++) {
            balls[i].draw();
        }
        ctx.beginPath();
        ctx.fillStyle = n_color;
        ctx.arc(x0, y0, n_r, 0, 2 * Math.PI);
        ctx.fill();
    });
    canvas.onmouseup = canvas.ontouchend = function () {
        let n_ball = new Ball(x0, y0, 0, 0, n_color, n_r);
        balls.push(n_ball);
        chosed = balls.length;
        sleep = false;
        x0 = y0 = -1;
        canvas.onmousemove = canvas.ontouchmove = null;
        console.log("Create");
    };
}



function ChooseBall({ x, y }) {
    for (var j = 0; j < cnt; j++) {
        if (balls[j].isInsideMe(x, y)) {
            balls[j].vx = 0;
            balls[j].vy = 0;
            chosed = j;
        }
    }
    return chosed < cnt;
}


let last_x = 0;
let last_y = 0;
function MoveBall(ev) {
    x_pro = ev.pageX;
    y_pro = ev.pageY;
    let maxX = width - balls[chosed].radius;
    let maxY = height - balls[chosed].radius;
    if (x_pro < balls[chosed].radius) {
        x_pro = balls[chosed].radius;
    }
    else if (x_pro > maxX) {
        x_pro = maxX;
    }
    if (y_pro < balls[chosed].radius) {
        y_pro = balls[chosed].radius;
    }
    else if (y_pro > maxY) {
        y_pro = maxY;
    }

    balls[chosed].x = x_pro;
    balls[chosed].y = y_pro;
    balls[chosed].vx = x_pro - last_x;
    balls[chosed].vy = y_pro - last_y;
    console.log(last_x, x_pro);
    last_x = x_pro;
    last_y = y_pro;

    canvas.onmouseup = ReleaseBall;
    canvas.ontouchend = ReleaseBall;
};

function ReleaseBall() {
    canvas.onmousemove = null;
    canvas.ontouchmove = null;
    chosed = cnt;
};

function EatBall(num_ball0, num_ball1) {
    if (balls[num_ball1].radius > balls[num_ball0].radius) {
        num_ball0 += num_ball1;
        num_ball1 = num_ball0 - num_ball1;
        num_ball0 = num_ball0 - num_ball1;
    }
    balls[num_ball0].mess += balls[num_ball1].mess;
    balls[num_ball0].radius = (balls[num_ball0].mess / rou) ** (1 / 3);

    balls[num_ball0].vx += (balls[num_ball1].mess / balls[num_ball0].mess) * (balls[num_ball1].vx - balls[num_ball0].vx);

    balls[num_ball0].vy += (balls[num_ball1].mess / balls[num_ball0].mess) * (balls[num_ball1].vy - balls[num_ball0].vy);

    balls.splice(num_ball1, 1);
    cnt--;
}

let last_time = 0;
function DeviceMove(ev) {
    var cur_time = new Date().getTime();
    if (shake_mode && cur_time - last_time > 49) {
        last_time = cur_time;
        let accl = ev.acceleration;
        let ax = accl.x;
        let ay = accl.y;
        if (ax != null && ay != null) {
            ax = (Math.abs(ax) < 2 ? 0 : Math.abs(ax) > 20 ? (ax / Math.abs(ax)) * 20 : ax);
            ay = (Math.abs(ay) < 2 ? 0 : Math.abs(ay) > 20 ? (ay / Math.abs(ay)) * 20 : ay);
            for (var i = 0; i < cnt; i++) {
                balls[i].ax -= ax / 4;
                balls[i].ay += ay / 4;
            }
        }
        // console.log("a: ", ax, ay);
    }
    if (loc_g_mode && cur_time - last_time > 49) {
        last_time = cur_time;
        gx = -default_gy * ev.accelerationIncludingGravity.x / 9.8;
        gy = default_gy * ev.accelerationIncludingGravity.y / 9.8;
        if (gx == 0 && gy == 0) {
            gy = default_gy;
        }
        // console.log("g: ", gx, gy);
    }
}

function DeviceRotate(ev) {
    // console.log("rotate: " + ev.gamma);
}

function GetAmount() {
    //adjust the number of balls
    let new_number = document.getElementById("number").value;
    if (new_number > 0 && new_number <= max_balls) {
        if (new_number > cnt) {
            NewBalls(new_number - cnt);
        }
        else
            balls.splice(0, cnt - new_number);
        cnt = new_number;
        document.getElementById("number").value = "";
    }
    else
        alert("Invalid number! Balls must be less than " + max_balls + " and not null.");
}

function SumOfBalls() {
    cnt = balls.length;
    for (var i = 0; i < cnt; i++) {
        if (!(balls[i].x > 0 - balls[i].radius &&
            balls[i].x < width + balls[i].radius &&
            balls[i].y > 0 - balls[i].radius &&
            balls[i].y < height + balls[i].radius)) {
            balls.splice(i, 1);
            cnt--;
        }
        return cnt;
    }
}

function NewBalls(amount) {
    //add some new balls
    for (var i = 0; i < amount; i++) {
        let r_new = random_int(min_r, max_r);
        let x_new = random_int(r_new, width - r_new);
        let y_new = random_int(r_new, height - r_new);
        let velX_new = random(-max_vx, max_vx);
        let velY_new = random(-max_vy, max_vy);
        let color_new = random_color();
        let b_new = new Ball(x_new, y_new, velX_new, velY_new, color_new, r_new);
        balls.push(b_new);
    }
}

function DrawRect() {
    ctx.fillStyle = hex2rgba(bg_color, fuzzy);
    ctx.fillRect(0, 0, width, height);
}

canvas.onmousedown = MousedownHandler;
canvas.ontouchstart = MousedownHandler;

NewBalls(50);
let chosed = balls.length;
let counter = 0;
function movingLoop() {
    if (!sleep) {
        DrawRect();
        for (var i = 0; i < cnt; i++) {
            balls[i].collideWith(i);
        }
        for (var i = 0; i < cnt; i++) {
            balls[i].gravAround(i);
        }
        for (var i = 0; i < cnt; i++) {
            balls[i].rebound();
            balls[i].update();
            balls[i].draw();
            balls[i].ax = balls[i].ay = 0;
        }
    }
    requestAnimationFrame(movingLoop);
    if (counter == 10) {
        cnt_of_balls_now.innerHTML = "Current balls: "
            + SumOfBalls();
        counter = 0;
    }
    counter++;
}
movingLoop();
