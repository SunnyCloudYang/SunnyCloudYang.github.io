class Ball {
    constructor(x, y, velX, velY, color, r) {
        this.x = x;
        this.y = y;
        this.vx = velX;
        this.vy = velY;
        this.color = color;
        this.radius = r;
        this.mess = rou * r ** 3;
        this.fri_a = 0;
        this.ax = 0;
        this.ay = 0;
        this.last_x = 0;
        this.last_y = 0;
        this.stop_x = false;
        this.stop_y = false;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        this.last_x = this.x;
        this.last_y = this.y; //choose
        this.vx += this.ax
            + (gravity && (!this.stop_x) ? gx : 0)
            + (energy_loss && this.stop_y ? this.fri_a : 0);
        this.vy += this.ay
            + (gravity && (!this.stop_y) ? gy : 0)
            + (energy_loss && this.stop_x ? this.fri_a : 0);
        this.vx = this.vx ** 2 > GlobalMaxSpeed ** 2 ? (this.vx / Math.abs(this.vx)) * GlobalMaxSpeed : this.vx;
        this.vy = this.vy ** 2 > GlobalMaxSpeed ** 2 ? (this.vy / Math.abs(this.vy)) * GlobalMaxSpeed : this.vy;
        this.x += this.vx;
        this.y += this.vy;
    }

    rebound() {
        this.stop_x = gravity &&
            gx * (this.x - width / 2) > 0 &&
            (Math.abs(this.x - width / 2) >=
            width / 2 - this.radius - 1) &&
            Math.abs(this.vx) < Math.abs(1.1 * gx);
        this.stop_y = gravity &&
            gy * (this.y - height / 2) > 0 &&
            (Math.abs(this.y - height / 2) >=
            height / 2 - this.radius - 1) &&
            Math.abs(this.vy) < Math.abs(1.1 * gy);

        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx -= gravity ? (this.stop_x ? 0 : Math.abs(gx / 2)) : 0;
            this.vx = Math.abs(recovery * this.vx);
            // console.log(this.vx);
        }
        else if (this.x > width - this.radius) {
            this.x = width - this.radius;
            this.vx += gravity ? (this.stop_x ? 0 : Math.abs(gx / 2)) : 0;
            this.vx = -Math.abs(recovery * this.vx);
            // console.log(this.vx);
        }

        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy -= gravity ? (this.stop_y ? 0 : Math.abs(gy / 2)) : 0;
            this.vy = Math.abs(recovery * this.vy);
            // this.vy = default_g_mode && !energy_loss ? Math.abs(gy * Math.round(this.vy / gy)) : Math.abs(recovery * this.vy);
            // console.log(this.vy);
        }
        else if (this.y > height - this.radius) {
            this.y = height - this.radius;
            this.vy += gravity ? (this.stop_y ? 0 : Math.abs(gy / 2)) : 0;
            this.vy = -Math.abs(recovery * this.vy);
            // this.vy = default_g_mode && !energy_loss ? -Math.abs(gy * Math.round(this.vy / gy)) : -Math.abs(recovery * this.vy);
            // console.log(this.vy);
        }

        if (energy_loss) {
            if (this.stop_x && gx != 0) {
                this.fri_a = -mu_floor * (this.vy / Math.abs(this.vy));
                this.vx = 0;
                this.x = gx > 0 ? width - this.radius : this.radius;
                if (Math.abs(this.vy) < mu_floor) {
                    this.fri_a = 0;
                    this.vy = 0;
                }
            }
            if (this.stop_y && gy != 0) {
                this.fri_a = -mu_floor * (this.vx / Math.abs(this.vx));
                this.vy = 0;
                this.y = gy > 0 ? height - this.radius : this.radius;
                if (Math.abs(this.vx) < mu_floor) {
                    this.fri_a = 0;
                    this.vx = 0;
                }
            }
        }
    }

    fGrav(serialNumber) {
        let F_g = 0;
        let F_gmax = (g_uni * this.mess * balls[serialNumber].mess) /
            ((this.radius + balls[serialNumber].radius) ** 2);

        if (Math.abs(balls[serialNumber].x - this.x) > 1
            || Math.abs(balls[serialNumber].y - this.y) > 1) {
            F_g = (g_uni * this.mess * balls[serialNumber].mess) /
                this.distance(serialNumber);
        }
        return F_g < F_gmax ? F_g : F_gmax;
    } //compute the acceleration of gravation

    positionAngel(serialNumber) {
        if (Math.abs(balls[serialNumber].x - this.x) > 1
            || Math.abs(balls[serialNumber].y - this.y) > 1) {
            if (balls[serialNumber].x > this.x) {
                return Math.atan(
                    (this.y - balls[serialNumber].y) /
                    (this.x - balls[serialNumber].x));
            }
            else if (balls[serialNumber].x < this.x) {
                return (
                    Math.PI +
                    Math.atan(
                        (this.y - balls[serialNumber].y) /
                        (this.x - balls[serialNumber].x)));
            }
            else {
                return this.y > balls[serialNumber].y ? -Math.PI / 2 : Math.PI / 2;
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
            for (var i = me + 1; i < cnt; i++) {
                if (merge_mode && this.isInsideMe(balls[i].x, balls[i].y, 1.1, 2)) {
                    try {
                        EatBall(me, i);
                    }
                    catch (error) {
                        console.log("Ignored " + error.message);
                    }
                }
                else {
                    f_g = this.fGrav(i);
                    cos_t = Math.cos(this.positionAngel(i));
                    sin_t = Math.sin(this.positionAngel(i))
                    this.ax += (f_g / this.mess) * cos_t;
                    this.ay += (f_g / this.mess) * sin_t;
                    balls[i].ax -= (f_g / balls[i].mess) * cos_t;
                    balls[i].ay -= (f_g / balls[i].mess) * sin_t;
                }
            }
        }
    } //compute a of gravation in x and y in total

    distance(serialNumber) {
        //squared distance to balls[serialNumber]
        return (this.x - balls[serialNumber].x) ** 2 +
            (this.y - balls[serialNumber].y) ** 2;
    }

    collideWith(i) {
        for (var j = i + 1; j < cnt; j++) {
            CheckCollision(this, balls[j]);
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