//GoodNullName changed something magically
class Ball {
    constructor(x, y, velX, velY, color, r) {
        this.x = x;
        this.y = y;
        this.vx = velX;
        this.vy = velY;
        this.color = color;
        this.radius = r;
        this.mess = rou * r ** 3;
        this.fri_ax = 0;
        this.ax = 0;
        this.ay = 0;
        this.last_x = 0;
        this.last_y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if (this.x <= this.radius) {
            //rebound at left
            this.x = this.radius;
            this.vx = Math.abs(recovery * this.vx);
        }
        else if (this.x >= width - this.radius) {
            //rebound at right
            this.x = width - this.radius;
            this.vx = -Math.abs(recovery * this.vx);
        }

        if (this.y <= this.radius) {
            //always rebound at ceil
            this.y = this.radius;
            this.vy = Math.abs(recovery * this.vy);
        }
        else if (this.y >= height - this.radius) {
            //at floor
            if (!gravity) {
                this.y = height - this.radius;
                this.vy = -Math.abs(recovery * this.vy);
            }
            else {
                if (!energy_loss) {
                    this.y = height - this.radius;
                    this.vy += gy;
                    this.vy = -Math.abs(gy * Math.round(this.vy / gy));
                }
                else if (this.vy ** 2 > 0.4 * this.radius * gy) {
                    this.y = height - this.radius;
                    this.vy += gy;
                    this.vy = -Math.abs(recovery * gy * Math.floor(this.vy / gy));
                }
                else {
                    this.y = height - this.radius;
                    this.vy = 0;
                    if (energy_loss) {
                        if (Math.abs(this.vx) > mu_floor)
                            this.fri_ax = -mu_floor * (this.vx / Math.abs(this.vx));
                        else {
                            this.vx = 0;
                            this.fri_ax = 0;
                        }
                    }
                }
            }
        }

        if (this.vy == 0 && this.y == height - this.radius) {
            //acceleration of x
            this.vx += this.fri_ax;
        }

        this.last_x = this.x;
        this.last_y = this.y; //choose
        this.vx += this.ax;
        this.vy += (this.ay + gy);
        this.x += this.vx;
        this.y += this.vy;
    }

    F_grav(serialNumber) {
        let F_g = 0;
        let F_gmax = (g_uni * this.mess * balls_valumn[serialNumber].mess) /
            ((this.radius + balls_valumn[serialNumber].radius) ** 2);

        if (Math.abs(balls_valumn[serialNumber].x - this.x) > 1
            || Math.abs(balls_valumn[serialNumber].y - this.y) > 1) {
            F_g = (g_uni * this.mess * balls_valumn[serialNumber].mess) /
                this.distance(serialNumber);
        }
        return F_g < F_gmax ? F_g : F_gmax;
    } //compute the acceleration of gravation

    position_angel(serialNumber) {
        if (Math.abs(balls_valumn[serialNumber].x - this.x) > 1
            || Math.abs(balls_valumn[serialNumber].y - this.y) > 1) {
            if (balls_valumn[serialNumber].x > this.x) {
                return Math.atan(
                    (this.y - balls_valumn[serialNumber].y) /
                    (this.x - balls_valumn[serialNumber].x));
            }
            else if (balls_valumn[serialNumber].x < this.x) {
                return (
                    Math.PI +
                    Math.atan(
                        (this.y - balls_valumn[serialNumber].y) /
                        (this.x - balls_valumn[serialNumber].x)));
            }
            else {
                return this.y > balls_valumn[serialNumber].y ? -Math.PI / 2 : Math.PI / 2;
            }
        }
        else
            return 0;
    } //compute the angel between ball[serialNumber]

    gravAround(me) {
        if (universe_mode) {
            let f_g = 0;
            let cos_t = 0;
            let sin_t = 0;
            for (var i = me + 1; i < balls_valumn.length; i++) {
                if (merge_mode && this.isInsideMe(balls_valumn[i].x, balls_valumn[i].y, 1, 2)) {
                    try {
                        EatBall(me, i);
                    }
                    catch (error) {
                        console.log("Ignored " + error.message);
                    }
                }
                else {
                    f_g = this.F_grav(i);
                    cos_t = Math.cos(this.position_angel(i));
                    sin_t = Math.sin(this.position_angel(i))
                    this.ax += (f_g / this.mess) * cos_t;
                    this.ay += (f_g / this.mess) * sin_t;
                    balls_valumn[i].ax -= (f_g / balls_valumn[i].mess) * cos_t;
                    balls_valumn[i].ay -= (f_g / balls_valumn[i].mess) * sin_t;
                }
            }
        }
    } //compute a of gravation in x and y in total

    distance(serialNumber) {
        //squared distance to balls[serialNumber]
        return (this.x - balls_valumn[serialNumber].x) ** 2 +
            (this.y - balls_valumn[serialNumber].y) ** 2;
    }

    collideWith(i) {
        for (var j = i + 1; j < cnt; j++) {
            CheckCollision(this, balls_valumn[j]);
        }
    }

    isInsideMe(event_x, event_y, ratio = 1, dist = 0) {
        return (this.x - event_x) ** 2 + (this.y - event_y) ** 2 <= (this.radius * ratio + dist) ** 2;
    } //choose
}

function CheckCollision(ball0, ball1) {
    let dx = ball1.x - ball0.x;
    let dy = ball1.y - ball0.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    // 检测冲突
    if (dx * (ball0.vx - ball1.vx) + dy * (ball0.vy - ball1.vy) > 0 &&
        dist <= ball0.radius + ball1.radius) {
        let angle = Math.atan2(dy, dx);
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        // boll0旋转后小球的位置
        let pos0 = { x: 0, y: 0 };
        // boll1旋转后小球的位置
        let pos1 = rotate(dx, dy, sin, cos, true);
        // ball0旋转后的速度
        let vel0 = rotate(ball0.vx, ball0.vy, sin, cos, true);
        // ball1旋转后的速度
        let vel1 = rotate(ball1.vx, ball1.vy, sin, cos, true);

        let vxTotal = vel0.x - vel1.x;
        vel0.x = ((ball0.mess - ball1.mess) * vel0.x + 2 * ball1.mess * vel1.x) / (ball0.mess + ball1.mess);
        vel1.x = vxTotal + vel0.x;

        // 两小球的x坐标加上速度 计算出新的x坐标
        pos0.x += vel0.x;
        pos1.x += vel1.x;
        // 相对于ball0原点为圆心时 旋转回去的坐标
        let pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
        let pos1F = rotate(pos1.x, pos1.y, sin, cos, false);
        // 相对于 原来的坐标
        ball1.x = ball0.x + pos1F.x;
        ball1.y = ball0.y + pos1F.y;
        ball0.x = ball0.x + pos0F.x;
        ball0.y = ball0.y + pos0F.y;
        // 速度旋转回去
        let vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
        let vel1F = rotate(vel1.x, vel1.y, sin, cos, false);
        ball0.vx = vel0F.x;
        ball0.vy = vel0F.y;
        ball1.vx = vel1F.x;
        ball1.vy = vel1F.y;
    }
}

let chosed = cnt;
function ChooseBall(ev) {
    let mouse_down = getEventPosition(ev);
    for (var j = 0; j < cnt; j++) {
        if (balls_valumn[j].isInsideMe(mouse_down.x, mouse_down.y)) {
            balls_valumn[j].vx = 0;
            balls_valumn[j].vy = 0;
            chosed = j;
        }
    }
    if (chosed < cnt) {
        document.addEventListener("ontouchmove", MoveBall);
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
    document.addEventListener("ontouchend", ReleaseBall);
    document.addEventListener("ontouchcancel", ReleaseBall);
};

function ReleaseBall() {
    document.onmousemove = "";
    document.ontouchmove = "";
    document.ontouchcancel = "";
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
    if (shake_mode && cur_time - last_time > 300) {
        last_time = cur_time;
        let accl = ev.acceleration;
        let ax = accl.x;
        let ay = accl.y;
        ax = Math.abs(ax) < 5 ? (ax / Math.abs(ax)) * 5 :
            Math.abs(ax) > 30 ? (ax / Math.abs(ax)) * 30 : ax;
        ay = Math.abs(ay) < 5 ? (ay / Math.abs(ay)) * 5 :
            Math.abs(ay) > 30 ? (ay / Math.abs(ay)) * 30 : ay;
        for (var i = 0; i < cnt; i++) {

            balls_valumn[i].ax -= ax / 5;
            balls_valumn[i].ay -= ay / 5;
        }
        console.log("Shaking balls...", ax, ay);
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
    for (var i = 0; i < balls_valumn.length; i++)
        if (!(balls_valumn[i].x > 0 - balls_valumn[i].radius &&
            balls_valumn[i].x < width + balls_valumn[i].radius &&
            balls_valumn[i].y > 0 - balls_valumn[i].radius &&
            balls_valumn[i].y < height + balls_valumn[i].radius)) {
            balls_valumn.splice(i, 1);
            cnt--;
        }
    return cnt;
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
    if (day_mode)
        ctx.strokeStyle = ctx.fillStyle = hex2rgba(day_color, 0.55 + fuzzy);
    else
        ctx.strokeStyle = ctx.fillStyle = hex2rgba(night_color, 0.55 + fuzzy);
    ctx.lineJoin = "round";
    ctx.lineWidth = 20;
    ctx.fillRect(20, 20, width - 40, height - 40);
    ctx.strokeRect(10, 10, width - 20, height - 20);
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

setInterval(() => {
    cnt_of_balls_now.innerHTML = "Number of balls now: "
        + SumOfBalls();
}, universe_mode ? 50 : 250);
myCanvas.onmousedown = ChooseBall;
myCanvas.addEventListener("ontouchstart", ChooseBall, { passive: true });

function movingLoop() {
    DrawRect();
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].collideWith(i);
    }
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].gravAround(i);
    }
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].update();
        balls_valumn[i].draw();
        balls_valumn[i].ax = balls_valumn[i].ay = 0;
    }
    requestAnimationFrame(movingLoop);
}
movingLoop();
