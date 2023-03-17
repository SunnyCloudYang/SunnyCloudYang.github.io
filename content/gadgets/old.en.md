---
author: "Yang"
title: "Bounce Balls"
date: "2023-01-17T17:00:00+08:00"
summary: "Some toys I made before, take a look?"
description: "Generate your own universe in this simulator"
tags: ["gadgets"]
categories: "gadgets"
draft: false
comments: true
hideMeta: false
searchHidden: false
ShowReadingTime: true
---

---

## Introduction

### Welcome to the Ball Universe

### Brand new interface with brand new experience

In short, it's a simple universe with just balls, you can make it chaotic or just in peace and love, that's up to you. (It breaks **your** browser not mine after all)

hiahia (╯`□′)╯BOMBS! •••*～●)

---

## Axiom System

- Newtonian laws of mechanics
- Galilean velocity transformation
- SunnyCloudYang's collision mode

---

## Portals

### -> {{< color-text color="#cceecc">}}[Click here](/oldsite/Balls/BounceBalls.html){{< /color-text >}} to enter the old balls universe

### -> {{< color-text color="#aaddee">}}[Click here](/oldsite/Balls/PureBalls.html){{< /color-text >}} to enter the BRAND NEW balls universe

---

## Tutorials (Please read it carefully!)

### Ⅰ . Primary Balls Simulator

1. By clicking the headline of the page (Welcome to xxx), you can check the version of the current universe;
2. The input box <del>(could have)</del> (now it works) can change the amount of balls rapidly;
3. Clicking 'Gravity' will take gravity into account (and it will enable energy loss as well); clicking 'Energy loss' will do what it's name implies; clicking 'Universe mode' will add gravity between the balls, they will attract each other;
4. In 'Custom' tab you can define the scale/speed of the balls, gravity constant and background color on your own, just feel free to drag the bar;
5. Advanced hidden options:
   - **Double click** 'Gravity' tab can enable/disable gravity follow mode, which means the ball will always fall towards the ground in your real life. The default value is enable;
   - **Double click** 'Energy Loss' tab can enable/disable shake mode, you can shake the balls by shaking your device (notice that PC usually doesn't have a acceleration sensor). The default value is disable;
   * **You can NOT open 'shake mode' and 'gravity follow' at the same time right now!**;
   - **Double click** 'Universe mode' tab can enable/disable merge mode, the lager ball will eat the smaller one in the collision. The default value is enable;
   - **Double click** 'Day mode' or 'Night mode' tab can enable/disable tail shadow (to make it prettier or uglier). The default value is disable;
   - <del>**Double click** Custom tab? That makes no sense.</del>
6. You can drag any ball by clicking it inside, and release it by releasing the left mouse button;
7. If you got stuck by some bugs, just refresh the page, which will restart the universe;
8. The collision now fully abide by the physics laws, don't worry about it;
9. On the PC, there is much more room for the balls, so usually it can contain up to 700 balls; while on the mobile device, you can experience shake mode; (so maybe the best choice is to use a pad)
10. The 🔒 on the top right corner can lock the screen scroll, maybe useful sometimes;
11. Super advanced hidden options:
    * Press F12 to open the console, `balls[i]` corresponds to each ball. You can assign a valid value to its `mess` / `radius` / `x` / `y` / `vx` / `vy` (eg. `balls[0].mess = 114514;`) , and there is usually no restrictions about that. <del>But use that carefully in case it breaks your browser</del>

### Ⅱ. Brand New Balls Universe

1. This mode is a full-screen pure enjoyable version with a brand new UI design, suitable as a wallpaper or for you who have an excellent artistic eye for a more discerning interface!
2. On the upper left corner is the current count of balls, click the number to quickly change the number of balls.
3. Click the Settings icon in the upper right corner to open the Settings menu. Try scroll up or down? All of the customizable variables are almost there.
    {{< alert class="warning" >}}
⚠️**ATTENTION**: All your settings will only take effects after you **SAVE** them!
    {{</ alert >}}
4. I believe you HAVE read the initial simulator guide before this section (right?). In this version, all the double-click operations are presented directly as a switch to avoid the embarrassment of confusion.
5. {{< color-text color="#ee9999">}}Restrictions Announcement:{{< /color-text >}} In this version, some restrictions were added to <del>limit your destructive power</del> to try to present the best performance, mainly refer to the following points：
    - **Universe mode** and **Gravity mode** can NOT be enabled simultaneously.
    - **Gravity mode** forces the inclusion of **Energy Loss** (to make you feel at home), and when you turn off Gravity mode, Energy Loss automatically reverts to the state it was in **before** Gravity was turned on.
    - **Ground Pointing mode** and **Shake mode** don't work together because the acceleration captured by Ground Pointing includes the acceleration generated when you shake the phone with might and main. If you want to turn on Shake mode, please turn off Ground Pointing first.
    - Control the ball: **hold** the mouse on the ball to control it and drag the ball across. When there is no ball under your mouse, **hold** the mouse will create a new ball (and pause all movement temporarily), drag the mouse to control its size (the limit value depends on the maximum/minimum ball radius you set), if you do not want to control its size, just click to create the same size as the last one.

---

## Suggestions

1. I suggest turning down the Graviation const under 'Universe mode'. (suggested: 0.200~0.450)；
2. The previous suggestion is **really important!**

---

## Features

1. Bug performance;
2. <del>Sometimes energy is not quite conserved</del> No longer exists;
3. <del>Sometimes momentum is also not quite conserved</del> No longer exists;
4. It may make you relax and angry at the same time.

---

## Privacy

This program does NOT collect any personal data of users, nor will it upload any data to the cloud. All data processing is carried out locally. And all required device parameters are as follows：

- Your screen's width and height. It's used to determine display size, default number of balls, etc;
- Your device's acceleration sensor data, it's used to determine the ball's acceleration in Ground Pointing mode and Shake mode.

---

## Special Thanks

1. Sincere thanks to Yan (pseudonym) who provided the source code framework!
2. Thanks to Edge as it suffered a lot in debugging;
3. Tanks to my hair as they never leave my head alone;
4. Thanks to Newton for the theoretical support；
5. Thanks to quantum mechanics for it's omnipotent explanation to all the strange behaviors;
6. Thanks to YOU for visiting my program.

---

## The End

Wow you are still reading! Consider [⭐Star me on Github](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io)?

**[Raise Your Issues and Report Bugs Here!](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io/issues)**

---
