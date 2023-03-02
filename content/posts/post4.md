---
author: Yang
date: "2023-03-02T17:04:18+08:00"
lastmod: "2023-03-03T00:36:10+08:00"
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

很久之前就像找一些有用的Hugo shortcodes模板，但是Google半天也只有官方提供的那几个示例，虽说授人以渔无可非议，但是全是渔网{{< blockdel >}}袜🤤{{< /blockdel >}}没有鱼也不行啊，这样我怎么知道你到底能不能钓上来🐟呢？所以我打算在这里尽力收集一些有用的shortcodes，都是可以<del>拎包入住顺手牵羊</del>直接copy去用的现成轮子。

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
    <span class="color-text" style="color: {{ with .Get "color" }}{{.}}{{end}}">
        {{ .Inner | markdownify }}
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

当然还没写完，但是为了不熬夜的flag，剩下的等明天再说吧。这些shortcodes写起来其实并不难（如果除去css上的微调的话），但是为什么就是找不到合我心意的模板呢？
