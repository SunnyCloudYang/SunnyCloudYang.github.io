---
author: Yang
date: "2023-03-02T17:04:18+08:00"
lastmod: "2023-03-02T19:25:09+08:00"
description: "一些Hugo shortcodes模板和效果测试"
title: "Hugo Shortcodes"
summary: "为什么大家都不愿意把shortcode的style写出来呢（恼"
tags: ["diary"]
categories: "diary"
# cover: 
#    image: "images/.jpg"
draft: true
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

很久之前就像找一些有用的shortcodes模板，但是Google半天也只有官方提供的那几个示例，虽说授人以渔无可非议，但是全是渔网没有鱼也不行啊，这样我怎么知道你到底能不能钓上来🐟呢？所以我打算在这里尽力收集一些有用的shortcodes，都是可以<del>拎包入住顺手牵羊</del>直接copy去用的现成轮子。

## Tips

就是一些提示信息

{{< alert class="success" >}}
**Success!** Your text is here, 成功了！
{{</ alert >}}

{{< alert class="info" >}}
**Info!**  
- 字体使用sans-serif。  
- margin调整的是整个alert的margin，padding调整的是alert内部的padding！
{{</ alert >}}

{{< alert class="warning" >}}
**Warning!** tip里面的段落下间距调整为了`0.6*var(--content-gap)`。
{{</ alert >}}

{{< alert class="danger" >}}
**Danger!** Your text is here, 可以使用*markdown*。
{{</ alert >}}
