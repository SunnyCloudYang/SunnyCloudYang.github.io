---
author: Yang
date: "2023-11-15T14:38:58+08:00"
lastmod: "2024-09-08T19:33:48+08:00"
description: "小心哦，不要卡进去了"
title: "后室·Demo"
summary: "如果你卡进来了，请不要惊慌"
tags: ["gadgets"]
categories: "gadgets"
# cover: 
#    image: "images/.jpg"
draft: true
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
js: ["/js/maze.js", "/js/solidMaze.js"]
css: ["/css/maze.css"]
three: true
---

## 后室·Demo

这是一个模仿后室的迷宫类游戏，你需要找到出口，但同时更需要小心这里面的神秘生物。

---

### 基本规则

1. 玩家的基本任务是在地图中找到终点处门的钥匙，以逃出这个危险的迷宫。
2. 在迷宫中随机分布着危险的“实体”，第一关中实体不会移动；从第二关开始，“实体”会在一定范围内追击玩家，他们攻击玩家时会让玩家的“理智值”下降，当降为0时任务失败。从入口到出口可能有多条可行路径，同时在场景中分布着可以增加“理智值”的清醒药水，开门所需的钥匙等道具，玩家必须拿到钥匙，同时也需要选择是否拿取药水使得“理智值”剩余最多，并尽量以最短路径到达终点。
3. 在游戏开始时，你有一定的时间可以观察地图，顶部会显示计算出的参考最短路线，随后你将会进入地图中正式开始游戏。

{{< rawhtml >}}
<div class="stage">
    <div class="menu">
        <div class="menu-item">
            <button type="button" id="startGame">开始游戏</button>
            <button type="button" id="showHelp">游戏帮助</button>
            <div class="slider">
            <label for="easyBar">难度</label>
            <input type="range" id="easyBar" value="40" min="10" max="100" step="5">
            <label for="easyBar" id="easyLabel">40</label>
            </div>
            <div class="slider">
            <label for="sizeBar">尺寸</label>
            <input type="range" id="sizeBar" value="20" min="10" max="40" step="2">
            <label for="sizeBar" id="sizeLabel">20</label>
            </div>
        </div>
    </div>
        <div id="maze-container">
        </div>
    <div class="mask" id="mask" style="display:none;">
    <div id="help" style="display:none;">
        <h1>Help</h1>
        <p>Use arrow keys to move the player.</p>
        <p>Collect props and avoid monsters.</p>
        <p>Props can help you recover.</p>
        <p>Monsters will bite you.</p>
        <p>Good luck!</p>
        <button class="closeBtn" id="closeBtn">Close</button>
    </div>
    </div>
    <div id="solidMaze">
        <i id="fullscreenBtn" class="fa fa-expand" style="position: absolute;margin:10px;right:0;color:rgba(240,240,240,0.8);z-index:999;"></i>
    </div>
</div>
{{< /rawhtml >}}
