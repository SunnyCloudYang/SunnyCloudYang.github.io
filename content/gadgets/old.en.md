---
author: "SunnyCloudYang"
title: "Toys"
date: "2023-01-17T17:00:00+08:00"
summary: "Some toys I made before, take a look?"
description: "以前的Bounce Balls，放到这了。还没翻译完，再等等吧"
tags: ["gadgets"]
categories: "gadgets"
draft: true
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: false
ShowReadingTime: false
---

# Bounce Balls

---

## Introduction

### Welcome to the Balls Universe

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

### -> [Click here](/oldsite/Balls/BounceBalls.html) to enter the old balls universe

### -> [Click here](/oldsite/Balls/PureBalls.html) to enter the BRAND NEW balls universe

### -> [Click here](/oldsite/WoodBlock/WoodBlock.html) to beat the wooden fish to gain merits🙏

### -> [Click here](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io/raw/gh-pages/WoodBlock/%E6%9C%A8%E9%B1%BC_1.0.0.apk) to download WoodBlock app(for Android)

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
    * Press F12 to open the console, `balls[i]` corresponds to each ball. You can assign a valid value to its `mess`/`radius`/`x`/`y`/`vx`/`vy` (eg. `balls[0].mess = 114514;`) , and there is usually no restrictions about that. <del>But use that carefully in case it breaks your browser</del>

### Ⅱ. Brand New Balls Universe

1. 本模式为全屏纯享版，采用了全新的UI设计，适合作为壁纸或者对界面比较挑剔的有艺术眼光的优秀的你！
2. 左上角为当前球数统计，支持单击直接快速批量改变小球数量，UI还在优化中
3. 右上角点击设置图标可以打开设置菜单，单击其他地方/设置图标/Save/Cancel可以关闭菜单。上下滚一滚？目前可以自定义的变量几乎都在那儿了
    * ⚠️**ATTENTION**: All your settings will only take effects after you **SAVE them**!
4. 相信你已经看完了初代模拟器的操作指南(right?)，在这个版本中所有的双击操作都作为开关直接呈现，避免了记不住的尴尬
5. 限制说明：在这个版本中，我们加入了一些限制，以 <del>限制你的作恶能力</del> 尽力呈现最好的使用体验，主要有如下几点：
    * Universe模式与Gravity模式不可得兼（什么你说你在卡门线分不清在地表还是在宇宙？不知道，听不清，不在乎🙉）；
    * Gravity模式下强制加入了能量损失（毕竟都在地面上了，也得入乡随俗吧），当你关闭Gravity模式，Energy Loss会自动恢复至开启Gravity之前时的状态<del>（好贴心！他真的，我哭死）</del>
    * Ground Pointing模式和Shake模式不可得兼，因为Ground Pointing采集的加速度包括了你死命摇手机时产生的加速度 <del>所以不必画蛇添足，脱裤裤放屁</del> 如果想打开Shake模式，请先关闭Ground Pointing
    * **重点**：在小球上**按住**鼠标可以控制并拖动小球横冲直撞，而在没有小球的地方**按住**鼠标会制造一个新的小球（并暂停所有运动），拖动鼠标可以控制其大小（极限值取决于你设置的最大/最小球半径），如果不想控制大小的话单击会默认创造和上一次一样大的小球

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

- Your screen's width and height (window.innerWidth, window.innerHeight). It's used to determine display size, default number of balls, etc;
- Your device's acceleration sensor data
(DeviceMotionEvent.acceleration, \*.accelerationIncludingGravity), it's used to determine the ball acceleration in Ground Pointing mode and Shake mode

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

Wow you are still reading! So can you [Star me on Github](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io)?

**[Raise Your Issues and Report Bugs Here!](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io/issues)**

---
