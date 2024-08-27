---
author: Yang
date: "2024-08-27T00:56:30+08:00"
lastmod: "2024-08-28T01:34:35+08:00"
expire: "2024-08-28T01:34:35+08:00"
description: "当你需要一个不用数据库的后端和一个已经完成的前端时，可以使用vercel很方便地一站式部署这两个项目，免去买服务器的麻烦"
title: "在vercel上免费部署一个flask后端"
summary: "vercel，白嫖之神，免费之光"
tags: ["vercel", "flask"]
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

## 缘由



在留暑培作业的时候，考虑到有些同学可能不方便部署到GitHub Pages，所以留了一个部署到vercel的方式，但我自己实际上还没有正式在Vercel上部署过项目，所以就趁着这个机会试一试。接着发现Vercel不仅提供了前端静态页面的部署，还可以添加函数式或者数据库后端，于是一边PUA着GPT一边研究了一下如何在Vercel上部署一个flask后端。
