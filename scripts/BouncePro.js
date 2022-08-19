//GoodNullName changed something magically
const cans = document.querySelector("canvas");
let myCanvas = document.getElementById("myCanvas");
const ctx = cans.getContext("2d");
let cnt_of_balls_now = document.getElementById("cnt");
let width = cans.width = window.innerWidth - 20;
let height = cans.height = window.innerHeight - 30;
let balls_valumn = [];
let number_of_balls = width * height < 300000 ? 50 : 100; //default balls amount
let min_r = 10;
let max_r = 20;
let v = 3; //在这里修改生成球速度的范围[-v,v];
let delta = 0.5; //昼夜交替速率
const default_gy = 0.4; //重力加速度,最好别改
const g_uni = 0.667; //万有引力常量
const mu_floor = 0.007;
let gy = 0;
let rou = 1; //密度
let cnt;
let dark_degree = 0;
let recovery = 1;
let fuzzy = 0.3;
let circulate = false;
let night_mode = true; //default mode
let day_mode = false;
let universe_mode = false;
let gravity = false;
let energy_loss = false;

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

    a_gravation(serialNumber) {
        let a_g = 0;
        let a_gmax =
            (g_uni * balls_valumn[serialNumber].mess) /
            ((this.radius + balls_valumn[serialNumber].radius) ** 2);
        if (balls_valumn[serialNumber].x - this.x > 1
            || balls_valumn[serialNumber].y - this.y > 1)
            a_g =
                (g_uni * balls_valumn[serialNumber].mess) / this.distance(serialNumber);
        return a_g < a_gmax ? a_g : a_gmax;
    } //compute the a of gravation

    position_angel(serialNumber) {
        if (balls_valumn[serialNumber].x - this.x > 1 ||
            balls_valumn[serialNumber].y - this.y > 1) {
            if (balls_valumn[serialNumber].x > this.x) {
                return Math.atan(
                    (this.y - balls_valumn[serialNumber].y) /
                    (this.x - balls_valumn[serialNumber].x)
                );
            } else if (balls_valumn[serialNumber].x < this.x) {
                return (
                    Math.PI +
                    Math.atan(
                        (this.y - balls_valumn[serialNumber].y) /
                        (this.x - balls_valumn[serialNumber].x)
                    )
                );
            } else if (balls_valumn[serialNumber].x === this.x) {
                return this.y > balls_valumn[serialNumber].y ? -Math.PI / 2 : Math.PI / 2;
            }
        } else return 0;
    } //compute the angel between ball[serialNumber]

    grav_around() {
        this.ax = 0;
        this.ay = 0;
        if (universe_mode) {
            for (var i = 0; i < cnt; i++) {
                this.ax += this.a_gravation(i) * Math.cos(this.position_angel(i));
                this.ay += this.a_gravation(i) * Math.sin(this.position_angel(i));
            }
        }
    } //compute a of gravation in x and y in total

    //模拟碰撞代码开始
    distance(serialNumber) {
        //计算和编号为serialNumber的球的距离的平方
        return (this.x - balls_valumn[serialNumber].x) ** 2 +
            (this.y - balls_valumn[serialNumber].y) ** 2;
    }

    deal_with_collision(i) {
        for (let j = i + 1; j < cnt; j++) {
            checkCollision(balls_valumn[i], balls_valumn[j]);
        }
    }
    isInsideBall(event_x, event_y) {
        return (this.x - event_x) ** 2 + (this.y - event_y) ** 2 < this.radius ** 2;
    } //choose
}

function rotate(x, y, sin, cos, reverse) {
    return {
        x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
        y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
    };
}


function checkCollision(ball0, ball1) {
    let dx = ball1.x - ball0.x;
    let dy = ball1.y - ball0.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    // 检测冲突
    if (dx * (ball0.vx - ball1.vx) + dy * (ball0.vy - ball1.vy) > 0 &&
        dist < ball0.radius + ball1.radius) {
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
function choose_this_ball(ev) {
    let mouse_down = getEventPosition(ev);
    for (let j = 0; j < cnt; j++) {
        if (balls_valumn[j].isInsideBall(mouse_down.x, mouse_down.y)) {
            balls_valumn[j].vx = 0;
            balls_valumn[j].vy = 0;
            chosed = j;
        }
    }
    if (chosed < cnt) {
        document.addEventListener("ontouchmove", moveBall, { passive: true });
        document.onmousemove = moveBall;
    }
}

function getEventPosition(ev) {
    return { x: ev.layerX, y: ev.layerY };
} //choose

function moveBall(ev) {
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
    document.addEventListener("ontouchend", ReleaseBall, { passive: true });
    document.addEventListener("ontouchcancel", ReleaseBall, { passive: true });
};

function ReleaseBall() {
    document.onmousemove = "";
    document.ontouchmove = "";
    document.ontouchcancel = "";
    chosed = cnt;
};

function get_amount() {
    //adjust the number of balls
    let new_number = document.getElementById("number").value;
    if (new_number > 0 && new_number <= 500) {
        if (new_number > cnt) {
            new_balls(new_number - cnt);
        }
        else
            balls_valumn.splice(0, cnt - new_balls);
        cnt = number_of_balls = new_number;
        document.getElementById("number").value = "";
    }
    else
        alert("Invalid number! Must be less than 500 and not null.");
}

function sum_the_cnt_of_balls() {
    cnt = number_of_balls;
    for (var i = 0; i < cnt; i++)
        if (!(balls_valumn[i].x > 0 - balls_valumn[i].radius &&
            balls_valumn[i].x < width + balls_valumn[i].radius &&
            balls_valumn[i].y > 0 - balls_valumn[i].radius &&
            balls_valumn[i].y < height + balls_valumn[i].radius)) {
            balls_valumn.splice(i, 1);
            number_of_balls--;
            cnt--;
        }
    return cnt;
}

function random_color() {
    let random_num1 = Math.floor(Math.random() * 150) + 50;
    let random_num2 = Math.floor(Math.random() * 150) + 50;
    let random_num3 = Math.floor(Math.random() * 160) + 40; //deliberately
    return "rgb(" + random_num1 + "," + random_num2 + "," + random_num3 + ")";
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function new_balls(amount) {
    //add some new balls
    for (var i = 0; i < amount; i++) {
        let r_new = random_int(min_r, max_r);
        let x_new = random_int(r_new, width - r_new);
        let y_new = random_int(r_new, height - r_new);
        let velX_new = random(-v, v);
        let velY_new = random(-v, v);
        let color_new = random_color();
        let b_new = new Ball(x_new, y_new, velX_new, velY_new, color_new, r_new);
        balls_valumn.push(b_new);
    }
}
function draw_rect() {
    if (day_mode)
        ctx.fillStyle = "rgba(255,255,230," + (0.55 + fuzzy) + ")";
    else if (night_mode)
        ctx.fillStyle = "rgba(40,40,60," + (0.55 + fuzzy) + ")";
    else if (circulate)
        ctx.fillStyle =
            "rgba(" + dark_degree + ","
            + dark_degree + ","
            + dark_degree + ","
            + ((0.6 * dark_degree) / 255 + 0.03 * v) + ")";
    ctx.fillRect(0, 0, width, height);
    if (circulate) {
        dark_degree += delta;
        if (dark_degree > 276)
            delta = -delta;
        else if (dark_degree < -20)
            delta = Math.abs(delta);
    }
}

setTimeout(() => {
    CheckSize();
}, 500);

for (var i = 0; i < number_of_balls; i++) {
    let r = random_int(min_r, max_r);
    let x = random_int(r, width - r);
    let y = random_int(r, height - r);
    let velX = random(-v, v);
    let velY = random(-v, v);
    let color = random_color();
    let b = new Ball(x, y, velX, velY, color, r);
    balls_valumn.push(b);
}

window.onresize = () => {
    width = cans.width = window.innerWidth - 20;
    height = cans.height = window.innerHeight - 30;
    CheckSize();
}

setInterval(() => {
    cnt_of_balls_now.innerHTML = "Number of balls now: "
        + sum_the_cnt_of_balls();
}, 250);
myCanvas.onmousedown = choose_this_ball;
myCanvas.addEventListener("ontouchstart", choose_this_ball, { passive: true });
document.getElementById("number").onkeydown = function (ev) {
    if (ev.key === 'Enter') {
        get_amount();
    }
}

function moving_loop() {
    draw_rect();
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].grav_around();
        balls_valumn[i].deal_with_collision(i);
    }
    for (var i = 0; i < cnt; i++) {
        balls_valumn[i].update();
        balls_valumn[i].draw();
    }
    requestAnimationFrame(moving_loop);
}
moving_loop();
