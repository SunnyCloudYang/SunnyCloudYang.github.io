---
author: Yang
date: "2024-08-27T00:56:30+08:00"
lastmod: "2024-09-03T23:29:36+08:00"
description: "当你需要一个不用数据库的后端和一个已经完成的前端时，可以使用 Vercel 很方便地一站式部署这两个项目，免去买服务器的麻烦"
title: "在 Vercel 上免费部署一个 flask 后端"
summary: "胡言乱语地部署一个胡言乱语生成器"
tags: ["vercel", "flask"]
categories: "diary"
# cover: 
#    image: "images/.jpg"
draft: false
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

## 缘由

在留暑培作业的时候，考虑到有些同学可能不方便部署到 GitHub Pages，所以也留了一个部署到 [Vercel](https://vercel.com/) 的方式，但我自己实际上还没有正式在 Vercel 上部署过项目，所以就趁着这个机会试一试。接着发现 Vercel 不仅提供了前端静态页面的部署，还可以添加函数式或者数据库后端，于是一边 PUA 着 GPT 写前端的代码，一边研究了一下如何在 Vercel 上部署一个 flask 后端。刚好前一阵实习写 Android 的 demo 的时候写了一个简单的[中文乱数假文生成器（Chinese Lorem Ipsum）](https://github.com/SunnyCloudYang/Chinese-lorem-ipsum)，用来填充文本区域充当示例，所以就拿这个项目来试一试。

## 准备工作

首先，你需要一个前端页面（可以是纯 HTML 或者 React、Vue 等框架，当然没有也可以，通通交给 flask 处理），一个 flask 后端，以及一个 Vercel 账号。这里前端页面我是直接让GPT写的，使用的是 Website Generator，在不断迭代中得到了一个还可以的效果，具体对话过程可以看[这里](https://chatgpt.com/share/9c17dca4-a681-4371-9814-5a60b994984d)。前端并没有使用什么框架，只用了 Bootstrap 和一些简单的 JS，但是 GPT 似乎对于Bootstrap样式库的理解不够深入，所以加入了很多额外的css样式，不过鉴于网站的结构非常简单，也只有一个页面，所以暂且就这样吧。

后端选择 flask主要是因为那个文本生成器是用 Python 写的，而且之前也用 flask 写过一些 RESTful API，刚好一拍而合。Vercel 的函数式后端支持很多运行时，有 Node.js、Go、Python、Ruby 等等，所以选择 Python 也是很方便的。这里我直接把原先的脚本复制给 GPT 让他重写为 flask 的形式，然后稍微修改了一下请求路径，就得到了一个可以运行的 flask 项目。

## 部署

首先，你需要在 Vercel 上创建一个项目，导入这个项目所在的 Git 仓库，然后等待 Vercel 自动检测项目类型并部署即可，到这里和部署静态网站的步骤都是一样的。接着，在项目根目录下创建一个名为`api`的文件夹，Vercel 可以自动识别这个文件夹为 Functions 文件夹，并配置相应的运行时和依据**根目录**下的`requirements.txt`安装依赖。接着在其中创建一个 `app.py` 文件，这个文件就是你的 flask 项目的入口文件。最后需要在 `vercel.json` 文件中添加`rewrites`字段，将所有 `/api/` 开头的请求重定向到这个 flask 函数上，就像这样：

```json
{
    "rewrites": [
        {
            "source": "/api/(.*)",
            "destination": "/api/app"
        }
    ]
}
```

我起初以为重定向后的路径是相对于`api`文件夹的，所以在`app.py`中的路由也是以`/`开头的，但实际上路径依然是相对于项目根目录的，所以`app.py`中的路由应该是以`/api/`开头的，和正常的 flask 项目一样。另外我最初使用的是`route`规则，结果只有访问`/api/app/`的时候能拿到响应，而且返回的是`app.py`这个文本文件！着实让我费了一番周折，最后才发现使用`rewrites`方法就可以正常访问了。至于这两个规则之间的区别，我还没有深入研究，暂时先知其然吧，待有时间了再细究。

这时候你的 flask 项目应该已经可以正常运行了，但是要注意的是 Serverless Function 会在每次调用的时候重新启动，创建运行时并安装依赖，除非调用的间隔很短，所以第一次访问的时候可能会有一些延迟。如果是对响应时间有要求的项目，可以考虑提前发起一次预请求，让 Functions 提前启动。

{{< collapse summary="Cold and Hot Boots" >}}
When a Serverless Function boots up from scratch, that is known as a cold boot. When it is re-used, we can say the function was warm.

Re-using a function means the underlying container that hosts it does not get discarded. State, such as temporary files, memory caches, sub-processes, is preserved. This empowers the developer not just to minimize the time spent in the booting process, but to also take advantage of caching data (in memory or filesystem) and memoizing expensive computations.

It is important to note that Serverless Functions, even while the underlying container is hot, cannot leave tasks running. If a sub-process is running by the time the response is returned, the entire container is frozen. When a new invocation happens, if the container is re-used, it is unfrozen, which allows sub-processes to continue running. ([Vercel Documentation](https://vercel.com/docs/infrastructure/compute#serverless-functions))
{{< /collapse >}}

当然 Vercel 中还为一些简单的函数提供了 Edge Functions，这些函数会在 CDN 边缘节点上运行，可以更快地响应请求，具体说明如下：

{{< collapse summary="Edge Functions" >}}
Edge Functions work in a very similar way to Serverless Functions, but instead of running on a single region, they are copied across the [Edge Network](https://vercel.com/docs/edge-network/overview) and so every time the function is invoked, the region closest to the request will run the function. This results in a much lower latency, and combined with zero cold-start time, allows you to provide personalization at speed.

Edge Functions run after the cache and so are ideal to be used on specific, dynamic parts of your site once the page is loaded, such a date-picker with availability or a weather component on your site. This response can be cached on the [Edge Network](https://vercel.com/docs/edge-network/overview) making future invocations even faster.

It is important to note that [Edge Functions](https://vercel.com/docs/functions/edge-functions) are just one solution and not a "one size fits all" solution. It is possible that the database for your site sits far from the Edge server. That means that even though the edge function can be invoked quickly, it might take twice as long to get the data than if the function was located closer to the data. In this scenario, you may want to use a Serverless Function.

See the [regional Edge Functions invocation](https://vercel.com/docs/functions/edge-functions#regional-edge-function-invocation) documentation to learn more. ([Vercel Documentation](https://vercel.com/docs/infrastructure/compute#edge-functions))
{{< /collapse >}}

## 成果

最终的效果大概长这样：{{< color-text color="#ddffdd">}}[Chinese Lorem Ipsum](https://chinese-lorem-ipsum.vercel.app/){{</ color-text >}}

## 总结

Vercel 提供了一个非常方便的一站式部署服务，不仅可以部署静态网站，还可以部署函数式后端，甚至是数据库。这对于一些小型项目来说是非常方便的，不用再去购买服务器，配置环境，只需要专注于项目本身的开发。当然，Vercel 也有一些限制，比如函数的运行时间不能超过 10s，不能有长时间运行的任务，不能有持久化的状态等等，所以对于一些大型项目来说可能并不适用。但是对于一些小型项目，或者一些前后端分离的项目，Vercel 是一个非常好的选择。

好了，这篇半copilot半自己写的文章就到这里了，CSDN的味道也是越来越浓了，看来我确实不太适合写技术博客。希望这篇胡言乱语能对你有所帮助，也希望我的这个胡言乱语生成器能给你带来一些乐趣。如果有什么问题或者建议，欢迎在评论区留言，我会尽快回复，反正闲着也是闲着。再见！
