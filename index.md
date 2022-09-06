# [Bounce Balls - 帮宝逝海洋球](./BounceBalls.html)

## 介绍

### 欢迎来到第一平行宇宙——[球宇宙](./BounceBalls.html)

### 全新界面，全新体验！

简单来说就是一个只有球的宇宙，可以制造混乱也可以守序善良(反正崩的是你的电脑hiahia(╯`□′)╯炸弹! •••*～●)

## 宇宙架构

宇宙架构说明： Newton力学体系，Galileo变换，SCY式(化名)碰撞方式；

## 传送门

### -> 在这里[进入初代小球模拟器](./BounceBalls.html)！

### -> 在这里[进入全新UI的小球宇宙](./PureBalls.html)！

### -> 在这里[下载BounceBalls的所有文件](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io)


## 使用说明（请认真阅读！）

### Ⅰ. 初代模拟器

1. 单击网页标题（Welcome to balabala...那个）可以查看当前的版本；
2. 输入框<del>(按理说)</del>（现在可以了）可以改变小球数量；
3. Gravity选项加入重力（会默认打开Energy loss），Energy loss加入碰撞墙壁时的能量损失, Universe mode加入万有引力；
4. Custom选项可以自定义小球大小/速度、万有引力常量、背景颜色；
5. 高级隐藏操作：
   * **双击**Gravity打开/关闭跟随重力模式，旋转手机，小球会始终向着地面掉落，默认值为开启
   * **双击**Energy Loss打开/关闭摇晃模式(shake mode)，小球会随着设备摇晃（你晃电脑干嘛呀，电脑可没有加速度计！），默认值为关闭
   * **目前暂时不能同时开启shake mode和gravity follow！**
   * **双击**Universe mode打开/关闭融合模式(merge mode)，大球会吃掉被压进自己内部的小球，默认值为开启
   * **双击**Day mode或者Night mode打开/关闭尾部拖影，看个人爱好了，默认值为关闭
   * <del>**双击**Custom？没有用</del>
6. 在小球内部按下鼠标左键可以控制任意小球，松开鼠标左键可将其释放;
7. 如果卡住了，请刷新页面，这将重新开始；
8. 如果你觉得有时候碰撞过程不河里，<del>emmm，其实我也这么觉得</del> 现在恒河里，不用怀疑；
9. PC端可以容纳的小球数量较多，上限为700，并可以用鼠标移动小球；手机端可以体验体感模式，摇晃或者旋转，简称一起摇摆；
10. 画布右上角的🔒可以锁定屏幕禁止滚动，不知道有什么用，但还是加上吧
11. 超高校级隐藏操作：
    * 打开控制台，`balls[i]`对应的就是每一个小球，有`mess`/`radius`/`x`/`y`/`vx`/`vy`等属性，直接赋值即可突破限制（eg. `balls[0].mess = 114514;`）<del>一般人我都不告诉的</del>

### Ⅱ. 全新小球宇宙

1. 本模式为全屏纯享版，采用了全新的UI设计，适合作为壁纸或者对界面比较挑剔的有艺术眼光的优秀的你！
2. 左上角为当前球数统计，即将支持直接快速批量改变小球数量
3. 右上角点击设置图标可以打开设置菜单，单击其他地方/设置图标/Save/Cancel可以关闭菜单。上下滚一滚？目前可以自定义的变量几乎都在那儿了
    * ⚠️**注意**：设置数据**只有**在点击保存（Save）之后才会生效
4. 相信你已经看完了初代模拟器的操作指南（对吧？），在这个版本中所有的双击操作都作为开关直接呈现，避免了记不住的尴尬
5. 限制说明：在这个版本中，我们加入了一些限制，以 <del>限制你的作恶能力</del> 尽力呈现最好的使用体验，主要有如下几点：
    * Universe模式与Gravity模式不可得兼（什么你说你在卡门线分不清在地表还是在宇宙？不知道，听不清，不在乎🙉）；
    * Gravity模式下强制加入了能量损失（毕竟都在地面上了，也得入乡随俗吧），当你关闭Gravity模式，Energy Loss会自动恢复至开启Gravity之前时的状态<del>（好贴心！他真的，我哭死）</del>
    * Ground Pointing模式和Shake模式不可得兼，因为Ground Pointing采集的加速度包括了你死命摇手机时产生的加速度 <del>所以不必画蛇添足，脱裤裤放屁</del> 如果想打开Shake模式，请先关闭Ground Pointing
    * **重点**：在小球上**按住**鼠标可以控制并拖动小球横冲直撞，而在没有小球的地方**按住**鼠标会制造一个新的小球（并暂停所有运动），拖动鼠标可以控制其大小（极限值取决于你设置的最大/最小球半径），如果不想控制大小的话单击会默认创造和上一次一样大的小球

## 建议

1. 在Universe模式下建议把Graviation const调小一点(suggested: 0.200~0.450)；
2. 上面那条**很重要！！！**

## 特技

1. Bug表演；
2. <del>有时候能量不太守恒</del> 没有的事儿；
3. <del>有时候动量也不太守恒</del> 没有的事儿；
4. 可能同时治疗低血压和高血压；
5. 程序员的事，能叫Bug吗，那是Feature，feature...

## 隐私

本程序不采集任何用户个人数据，也不会将任何数据上传至云端，所有数据处理均在本地进行。所有必需设备参数如下：

* 屏幕宽与高（window.innerWidth，window.innerHeight），用于确定显示大小，默认小球数量等
* 设备加速度传感器数据（DeviceMotionEvent.acceleration, DeviceMotionEvent.accelerationIncludingGravity），用于在Ground Pointing模式和Shake模式中确定小球加速度
* <del>设备旋转传感器（DeviceOrientationEvent），这一项数据并未参与任何计算，已去除</del>

## 鸣谢

1. 对提供源码框架的**Yan同学**（化名）表示**严重感谢！！！** 吃井不忘挖水人！
2. 感谢Edge行而不卡，卡而不死，死而不坏；
3. 感谢头发不离不弃；
4. 感谢牛顿叔叔提供理论支持；
5. 感谢量子力学提供最终解释权。

## 最后

还在看？那点个Star吧~

还有一件事——记得把网址(<https://sunnycloudyang.github.io/>)加入收藏夹！

**[Raise Your Issues and Report Bugs Here!](https://github.com/SunnyCloudYang/SunnyCloudYang.github.io/issues)**

[-> css test page](./test.html)