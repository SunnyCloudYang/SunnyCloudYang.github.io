//Last changed 2022-8-24 20:12
let balls_valumn = [];
function ChooseBall(ev) {
    ev.preventDefault();
    let mouse_down = getEventPosition(ev);
    for (var j = 0; j < cnt; j++) {
        if (balls_valumn[j].isInsideMe(mouse_down.x, mouse_down.y)) {
            balls_valumn[j].vx = 0;
            balls_valumn[j].vy = 0;
            chosed = j;
        }
    }
    if (chosed < cnt) {
        document.addEventListener("ontouchmove", MoveBall, { passive: false });
        document.onmousemove = MoveBall;
    }
}

function MoveBall(ev) {
    ev.preventDefault();
    let x_pro = ev.layerX;
    let y_pro = ev.layerY;
    let maxX = width - balls_valumn[chosed].radius;
    let maxY = height - balls_valumn[chosed].radius;
    if (x_pro < balls_valumn[chosed].radius) {
        x_pro = balls_valumn[chosed].radius;
    }
    else if (x_pro > maxX) {
        x_pro = maxX;
    }
    if (y_pro < balls_valumn[chosed].radius) {
        y_pro = balls_valumn[chosed].radius;
    }
    else if (y_pro > maxY) {
        y_pro = maxY;
    }

    balls_valumn[chosed].x = x_pro;
    balls_valumn[chosed].y = y_pro;
    balls_valumn[chosed].vx = x_pro - balls_valumn[chosed].last_x;
    balls_valumn[chosed].vy = y_pro - balls_valumn[chosed].last_y;

    document.onmouseup = ReleaseBall;
    document.addEventListener("ontouchend", ReleaseBall, { passive: false });
    document.addEventListener("ontouchcancel", ReleaseBall, { passive: false });
};

function ReleaseBall() {
    document.onmousemove = "";
    document.ontouchmove = "";
    chosed = cnt;
};

function EatBall(num_ball0, num_ball1) {
    if (balls_valumn[num_ball1].radius > balls_valumn[num_ball0].radius) {
        num_ball0 += num_ball1;
        num_ball1 = num_ball0 - num_ball1;
        num_ball0 = num_ball0 - num_ball1;
    }
    balls_valumn[num_ball0].mess += balls_valumn[num_ball1].mess;
    balls_valumn[num_ball0].radius = (balls_valumn[num_ball0].mess / rou) ** (1 / 3);

    balls_valumn[num_ball0].vx += (balls_valumn[num_ball1].mess / balls_valumn[num_ball0].mess) * (balls_valumn[num_ball1].vx - balls_valumn[num_ball0].vx);

    balls_valumn[num_ball0].vy += (balls_valumn[num_ball1].mess / balls_valumn[num_ball0].mess) * (balls_valumn[num_ball1].vy - balls_valumn[num_ball0].vy);

    balls_valumn.splice(num_ball1, 1);
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
                balls_valumn[i].ax -= ax / 4;
                balls_valumn[i].ay += ay / 4;
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
    console.log("rotate: " + ev.gamma);
}

function GetAmount() {
    //adjust the number of balls
    let new_number = document.getElementById("number").value;
    if (new_number > 0 && new_number <= max_balls) {
        if (new_number > cnt) {
            NewBalls(new_number - cnt);
        }
        else
            balls_valumn.splice(0, cnt - new_number);
        cnt = new_number;
        document.getElementById("number").value = "";
    }
    else
        alert("Invalid number! Balls must be less than " + max_balls + " and not null.");
}

function SumOfBalls() {
    cnt = balls_valumn.length;
    for (var i = 0; i < cnt; i++) {
        if (!(balls_valumn[i].x > 0 - balls_valumn[i].radius &&
            balls_valumn[i].x < width + balls_valumn[i].radius &&
            balls_valumn[i].y > 0 - balls_valumn[i].radius &&
            balls_valumn[i].y < height + balls_valumn[i].radius)) {
            balls_valumn.splice(i, 1);
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
        balls_valumn.push(b_new);
    }
}

function DrawRect() {
    ctx.strokeStyle = ctx.fillStyle = day_mode ? hex2rgba(day_color, 0.55 + fuzzy) : hex2rgba(night_color, 0.55 + fuzzy);
    ctx.lineJoin = "round";
    const border = ctx.lineWidth = 20;
    ctx.fillRect(border, border, width - 2 * border, height - 2 * border);
    ctx.strokeRect(border / 2, border / 2, width - border, height - border);
}

for (var i = 0; i < number_of_balls; i++) {
    let r = random_int(min_r, max_r);
    let x = random_int(r, width - r);
    let y = random_int(r, height - r);
    let velX = random(-max_vx, max_vx);
    let velY = random(-max_vy, max_vy);
    let color = random_color();
    let b = new Ball(x, y, velX, velY, color, r);
    balls_valumn.push(b);
}

myCanvas.onmousedown = ChooseBall;
myCanvas.addEventListener("ontouchstart", ChooseBall, { passive: false });

let chosed = balls_valumn.length;
let counter = 0;
function movingLoop() {
    DrawRect();
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].collideWith(i);
    }
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].gravAround(i);
    }
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].rebound();
        balls_valumn[i].update();
        balls_valumn[i].draw();
        balls_valumn[i].ax = balls_valumn[i].ay = 0;
    }
    requestAnimationFrame(movingLoop);
    if (counter == 10) {
        cnt_of_balls_now.innerHTML = "Number of balls now: "
            + SumOfBalls();
        counter = 0;
    }
    counter++;
}
movingLoop();
