---
author: Yang
date: "2023-03-02T17:04:18+08:00"
lastmod: "2023-07-04T15:37:14+08:00"
description: "一些Hugo shortcodes模板和效果测试"
title: "Hugo Shortcodes"
summary: "为什么大家都不愿意把shortcode的style sheet写出来呢（恼"
tags: ["post", "Hugo", "shortcodes"]
categories: "post"
# cover: 
#    image: "images/.jpg"
draft: true
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

很久之前就想找一些有用的Hugo shortcodes模板，但是Google半天也只有官方提供的那几个示例，虽说授人以渔无可非议，但是全是渔网{{< blockdel >}}袜🤤{{< /blockdel >}}没有鱼也不行啊，这样我怎么知道你到底能不能钓上来🐟呢？所以我打算在这里尽力收集一些有用的shortcodes，都是可以<del>拎包入住顺手牵羊</del>直接copy去用的现成轮子。

## 一. Tips

就是一些提示信息，效果如下：

{{< alert class="success" >}}
**Success!** Your text is here, 成功了, 可以使用*markdown*！
{{</ alert >}}

{{< alert class="info" >}}
**Info!**  

- 字体使用sans-serif。
- margin调整的是整个alert的margin，padding调整的是alert内部的padding！
- 支持深色模式切换哦
{{</ alert >}}

{{< alert class="warning" >}}
**Warning!** tip里面的段落下间距调整为了`0.6*var(--content-gap)`。
{{</ alert >}}

{{< alert class="danger" >}}
**Danger!** 以上是我自己定义的样式，参考了bootstrap，你可以定义自己喜欢的方案。
{{</ alert >}}

**使用方法：**

1. 在`layouts/shortcodes`下新建`alert.html`文件，内容如下：

    ```go
    <div class="alert alert-{{ with .Get "class" }}{{.}}{{end}}" role="alert">
        <text>
            {{ .Inner | markdownify }}
        </text>
    </div>
    ```

2. 在`assets/css`下新建`alert.css`文件，内容如下：

    ```css
    .alert {
        font-family: -apple-system,
            BlinkMacSystemFont,
            segoe ui,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            open sans,
            helvetica neue,
            sans-serif;
        border-radius: var(--radius);
        margin: 20px 0;
        padding: 0.8rem 1rem;
    }

    .alert-success {
        border-color: #73cc74;
        background-color: #ebffe5;
        color: #488049;
    }

    .dark .alert-success {
        border-color: #73cc74;
        background-color: #488049;
        color: #ebffe5;
    }
    ```

    这里只给出了`alert-success`的样式和基本的一些配置，具体的细节和其他样式可以照猫画虎，至于配色可以DIY或者打开控制台copy一下（或者甚至可以让Copilot来帮你配）。

3. 在markdown文件中如下使用：

    ```go
    {{</* alert class="success" */>}}
    **Success!** Your text is here。
    {{</* /alert */>}}

    {{</* alert class="info" */>}}
    **Info!**  
    这里写一些提示信息。
    {{</* /alert */>}}
    ```

    输出效果如下：

    {{< alert class="success" >}}
**Success!** Your text is here。
    {{</ alert >}}

    {{< alert class="info" >}}
**Info!**  
这里写一些提示信息。
    {{</ alert >}}

## 二. 删除块

删除块，效果如👉：
{{< blockdel >}}
这是一段被删除的文字，在鼠标**悬停**时会显示原文字。
{{</ blockdel >}}

**使用方法：**

1. 在`layouts/shortcodes`下新建`blockdel.html`文件，内容如下：

    ```go
    <span class="blockdel">
        {{ .Inner | markdownify }}
    </span>
    ```

2. 在`assets/css`下新建`blockdel.css`文件，内容如下：

    ```css
    .post-content .blockdel {
        color: transparent;
        border-radius: 4px;
        background-color: var(--content);
        transition: 0.3s;
    }

    .post-content .blockdel:hover {
        color: unset;
        background-color: transparent;
    }
    ```

3. 在markdown文件中如下使用：

    ```go
    {{</* blockdel */>}}
    这是一段被删除的文字，在鼠标**悬停**时会显示原文字。
    {{</* /blockdel */>}}
    ```

    输出效果如下：

    {{< blockdel >}}
这是一段被删除的文字，在鼠标**悬停**时会显示原文字。
    {{</ blockdel >}}

## 三. 荧光笔

或者叫颜色文字，效果如👉：
{{< color-text color="#ddffdd" >}}
绿色荧光笔，深色模式有蒙版效果。
{{</ color-text >}}  
好像内置的highlight就是这个功能？我忘了，明天研究一下。

**使用方法：**

1. 在`layouts/shortcodes`下新建`color-text.html`文件，内容如下：

    ```go
    {{ $color := .Get "color" | safeCSS }}
    <span class="color-text"style="background-color: {{ $color }};">
        <text>
            {{- .Inner | markdownify -}}
        </text>
    </span>
    ```

2. 在`assets/css`下新建`color-text.css`文件，内容如下：

    ```css
    .color-text {
    border-radius: 4px;
    }

    .dark .color-text text {
        border-radius: 4px;
        background-color: #000;
        opacity: 0.5;
    }
    ```

3. 在markdown文件中如下使用：

    ```go
    {{</* color-text color="#ddffdd" */>}}
    绿色荧光笔，深色模式有蒙版效果。
    {{</* /color-text */>}}
    ```

    输出效果如下：

    {{< color-text color="#ddffdd" >}}
绿色荧光笔，深色模式有蒙版效果。
    {{</ color-text >}}

## 四. 展开块

展开块，默认样式的效果如👇：

{{< collapse summary="默认样式" >}}
下拉三角的矢量图和部分样式启发来自[@ouuan老师的博客](https://ouuan.moe/post/2023/03/thuse)，特此感谢。
{{</collapse>}}

自定义的效果如👇：

{{< collapse1 summary="自定义样式" >}}
这里是隐藏内容
{{</collapse1>}}

可以看到，自定义的效果并不尽如人意，height的变化总有个延迟，大概是没办法确定height的具体数值，所以transition的动画效果会卡顿。这里先给出默认样式的代码：

**使用方法：**

1. 在`layouts/shortcodes`下新建`collapse.html`文件，内容如下：

    ```go
    {{ if .Get "summary" }}
    {{ else }}
    {{ warnf "missing value for param 'summary': %s" .Position }}
    {{ end }}
    <p>
    <details {{ if (eq (.Get "openByDefault" ) true) }} open=true {{ end }}>
        <summary class="custom-collapse">
            <div class="collapse-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1rem" height="1rem">
                    <path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42Z" />
                </svg>
            </div>
            <span class="collapse-title">
                {{ .Get "summary" | markdownify }}
            </span>
        </summary>
    {{- .Inner | markdownify -}}
    </details>
    </p>
    ```

2. 在`assets/css`下新建`collapse.css`文件，内容如下：

    ```css
    .post-content details {
        font-size: 1rem;
        background-color: var(--code-bg);
        border-radius: var(--radius);
        padding: 0.8rem 0.5rem;
        margin: 0.5rem 0;
    }

    .post-content summary {
        display: flex;
        cursor: pointer;
        align-items: center;
    }

    .post-content details[open] > summary {
        margin-bottom: 0.5em;
    }

    .post-content .collapse-title {
        font-weight: bold;
        user-select: none;
        margin-left: 0.2em;
    }

    .post-content .collapse-arrow {
        display: inline-flex;
        margin: 2px;
        transform: rotate(-90deg);
        transition: transform 0.15s;
    }

    .post-content details[open] > summary > .collapse-arrow {
        transform: rotate(0deg);
    }
    ```

3. 在markdown文件中如下使用：

    ```go
    {{</* collapse summary="默认样式标题" */>}}
    默认样式内容
    {{</* /collapse */>}}
    ```

    输出效果如下：

    {{< collapse summary="默认样式标题" >}}
默认样式内容
    {{</ collapse >}}

## 五. 网易云音乐

插入网易云音乐的iframe，效果如👇：

{{< netease "1903991886" "0" >}}

**使用方法：**

1. 在layouts/shortcodes下新建netease.html文件，内容如下：

    ```go
    <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id={{ .Get 0 }}&auto={{ .Get 1 }}&height=66"></iframe>
    ```

2. 在markdown文件中如下使用：

    ```go
    {{</* netease "1903991886" "0" */>}}
    ```

    其中第一个参数是歌曲id，第二个参数是是否自动播放，0为否，1为是。由于浏览器的安全策略，自动播放可能会失效。当然也可以直接将音乐软件中生成的iframe代码复制到markdown文件中，效果是一样的。

    另外也可以用[MetingJS](https://github.com/metowolf/MetingJS)，支持网易云和QQ音乐，使用方法可以参照官方给出的示例，很简单。

后期考虑做成侧边栏或者底部的播放器，这样可以更方便地控制音乐的播放。

## TODO

这里我想完成的shortcodes主要来自[消夏绿的博客](https://tin6.com/post/several-hugo-shortcoeds-samples/)，奈何没有源码，只能自己一点点扒了。

- [x] 自定义样式的展开块
- [ ] Gallery
- [ ] 个性化blockquote

太难了，css实在是太难了，web前端实在是太难了。
