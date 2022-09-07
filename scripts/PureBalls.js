let balls = [];
let x0 = width / 2;
let y0 = height / 2;
let n_color = "";
let n_r = 0;
let sleep = false;
let executable = true;

function MousedownHandler(ev) {
    if (executable) {
        x0 = ev.pageX || ev.touches[0].pageX;
        y0 = ev.pageY || ev.touches[0].pageY;
        for (var j = 0; j < cnt; j++) {
            if (balls[j].isInsideMe(x0, y0)) {
                balls[j].vx = 0;
                balls[j].vy = 0;
                chosed = j;
                break;
            }
        }
        canvas.onmousemove = canvas.ontouchmove = null;
        if (chosed < cnt) {
            last_x = x0;
            last_y = y0;
            ev.pageX ? canvas.onmousemove = MoveBall : canvas.ontouchmove = MoveBall;
        }
        else {
            n_color = random_color();
            ev.pageX ? canvas.onmousemove = ShapeBall : canvas.ontouchmove = ShapeBall;
        }
    }
    else {
        canvas.onmousemove = canvas.onmouseup = null;
    }
}

function ShapeBall(ev) {
    let x = ev.pageX || ev.touches[0].pageX;
    let y = ev.pageY || ev.touches[0].pageY;
    sleep = true;
    n_r = ((x - x0) ** 2 + (y - y0) ** 2) ** 0.5;
    n_r = !n_r || n_r < min_r ? min_r : (n_r > max_r ? max_r : n_r);
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
    canvas.onmouseup = canvas.ontouchend = null;
    ev.pageX ? canvas.onmouseup = CreateBall : canvas.ontouchend = CreateBall;
    function CreateBall() {
        let n_ball = new Ball(x0, y0, 0, 0, n_color, n_r);
        balls.push(n_ball);
        chosed = balls.length;
        sleep = false;
        x0 = y0 = -1;
        canvas.onmousemove = canvas.ontouchmove = null;
    };
}

let x_pro = 0;
let y_pro = 0;
function MoveBall(ev) {
    x_pro = ev.pageX || ev.touches[0].pageX;
    y_pro = ev.pageY || ev.touches[0].pageY;
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
    balls[chosed].vx = x_pro - balls[chosed].last_x;
    balls[chosed].vy = y_pro - balls[chosed].last_y;
    balls[chosed].last_x = x_pro;
    balls[chosed].last_y = y_pro;
    canvas.onmouseup = canvas.ontouchend = null
    ev.pageX ? canvas.onmouseup = ReleaseBall : canvas.ontouchend = ReleaseBall;
};

function ReleaseBall() {
    canvas.onmousemove = canvas.ontouchmove = null;
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
let a_sensor = true;
function DeviceMove(ev) {
    var cur_time = new Date().getTime();
    if (shake_mode && cur_time - last_time > 49) {
        last_time = cur_time;
        let accl = ev.acceleration;
        let ax = accl.x;
        let ay = accl.y;
        if (ax != null && ay != null) {
            ax = Math.abs(ax) > 20 ? (ax / Math.abs(ax)) * 20 : ax;
            ay = Math.abs(ay) > 20 ? (ay / Math.abs(ay)) * 20 : ay;
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
        a_sensor = true;
        if (gx == 0 && gy == 0) {
            gy = default_gy;
            a_sensor = false;
        }
        // console.log("g: ", gx, gy);
    }
}

function DeviceRotate(ev) {
    // console.log("rotate: " + ev.gamma);
}

function GetAmount(new_number) {
    //adjust the number of balls
    if (new_number >= 0 && new_number <= max_balls) {
        if (new_number > cnt) {
            NewBalls(new_number - cnt);
        }
        else
            balls.splice(0, cnt - new_number);
        cnt = new_number;
    }
    else
        alert("Invalid number! Balls must be positive and less than " + max_balls);
}

function SumOfBalls() {
    cnt = balls.length;
    if (!cnt) {
        return 0;
    }
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
    ctx.fillStyle = hex2rgba(bg_color, 1 - fuzzy);
    ctx.fillRect(0, 0, width, height);
}

canvas.onmousedown = MousedownHandler;
canvas.ontouchstart = MousedownHandler;

NewBalls(number_of_balls);
let chosed = balls.length;
let counter = 0;
let p = 0;
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
            balls[i].update();
            balls[i].rebound();
            balls[i].draw();
            balls[i].ax = balls[i].ay = 0;
        }
    }
    requestAnimationFrame(movingLoop);
    if (counter == 10) {
        balls_cnt.innerHTML = "Current balls: "
            + SumOfBalls();
        counter = 0;
        p = 0;
        for (var i = 0; i < balls.length; i++) {
            p += balls[i].mess * (balls[i].vx ** 2 + balls[i].vy ** 2);
        }
    }
    counter++;
}
movingLoop();
