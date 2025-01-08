---
author: Yang
date: "2024-09-05T14:59:18+08:00"
lastmod: "2024-09-05T15:04:39+08:00"
description: "Vercel not only supports the deployment of static websites but also server-side functions and even databases"
title: "Deploy flask api with Vercel"
summary: "Long live the Vercel!"
tags: ["flask", "Vercel"]
categories: "post"
# cover: 
#    image: "images/.jpg"
draft: false
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

## Reason

When working on the summer training assignment, I considered that some classmates might find it inconvenient to deploy on GitHub Pages, so I also provided an alternative method using [Vercel](https://vercel.com/). However, I hadn't personally deployed a project on Vercel before, so I took this opportunity to give it a try. I soon discovered that Vercel not only supports the deployment of front-end static pages but also allows the addition of server-side functions or database backends. So, while I was using GPT to help write front-end code, I also explored how to deploy a Flask backend on Vercel. Incidentally, I had previously created a simple [Chinese Lorem Ipsum Generator](https://github.com/SunnyCloudYang/Chinese-lorem-ipsum) for filling text areas when writing an Android demo for my internship, so I decided to use that project as a test case.

## Preparations

First, you'll need a front-end page (which can be pure HTML or a framework like React or Vue, or you can leave it all to Flask), a Flask backend, and a Vercel account. For the front-end, I simply let GPT generate it using the Website Generator, iterating until I got a satisfactory result. You can check out the specific conversation [here](https://chatgpt.com/share/9c17dca4-a681-4371-9814-5a60b994984d). The front-end doesn’t use any complex frameworks—just Bootstrap and some basic JS—but GPT seemed to not fully grasp the Bootstrap styling library, so it added a lot of extra CSS. Given the site's very simple structure (it’s only one page), I decided to leave it as is.

I chose Flask for the backend mainly because the text generator was written in Python, and I had previously used Flask to write some RESTful APIs, so it was a perfect fit. Vercel's server-side functions support many runtimes, including Node.js, Go, Python, Ruby, and more, making Python a convenient choice. I simply copied my original script and had GPT rewrite it in a Flask format, made a few tweaks to the request paths, and ended up with a functioning Flask project.

## Deployment

First, you need to create a project on Vercel, import the Git repository where your project resides, and wait for Vercel to automatically detect the project type and deploy it. Up to this point, the process is the same as deploying a static site. Next, create a folder named `api` in the root directory of your project. Vercel will automatically recognize this folder as the Functions folder and set up the appropriate runtime, installing dependencies based on the `requirements.txt` file in the **root directory**. Then, create a file named `app.py` inside the folder—this will be the entry point for your Flask project. Finally, add a `rewrites` field to the `vercel.json` file to redirect all requests starting with `/api/` to this Flask function, like so:

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

At first, I thought the redirected path was relative to the `api` folder, so I started the routes in `app.py` with `/`. However, the path is actually relative to the project root, so the routes in `app.py` should start with `/api/`, just like in a normal Flask project. Additionally, I initially used the `route` rule, which only responded when accessing `/api/app/` and returned the `app.py` file as plain text! After some troubleshooting, I found that using the `rewrites` method allows it to work properly. I haven’t deeply researched the difference between these two rules yet, but for now, I’ll leave it as is and look into it later when I have more time.

At this point, your Flask project should be running correctly. However, it’s important to note that a Serverless Function restarts each time it’s called, recreates its runtime, and reinstalls dependencies, unless the interval between calls is very short. Therefore, the first request may experience a delay. If your project has strict response time requirements, you might want to consider making a pre-request to "warm up" the function.

{{< collapse1 summary="Cold and Hot Boots" >}}
When a Serverless Function boots up from scratch, that is known as a cold boot. When it is re-used, we can say the function was warm.

Re-using a function means the underlying container that hosts it does not get discarded. State, such as temporary files, memory caches, sub-processes, is preserved. This empowers the developer not just to minimize the time spent in the booting process, but to also take advantage of caching data (in memory or filesystem) and memoizing expensive computations.

It is important to note that Serverless Functions, even while the underlying container is hot, cannot leave tasks running. If a sub-process is running by the time the response is returned, the entire container is frozen. When a new invocation happens, if the container is re-used, it is unfrozen, which allows sub-processes to continue running. ([Vercel Documentation](https://vercel.com/docs/infrastructure/compute#serverless-functions))
{{< /collapse1 >}}

Of course, Vercel also provides Edge Functions for simple tasks. These functions run on CDN edge nodes, allowing them to respond to requests more quickly. The details are as follows:

{{< collapse1 summary="Edge Functions" >}}
Edge Functions work in a very similar way to Serverless Functions, but instead of running on a single region, they are copied across the [Edge Network](https://vercel.com/docs/edge-network/overview) and so every time the function is invoked, the region closest to the request will run the function. This results in a much lower latency, and combined with zero cold-start time, allows you to provide personalization at speed.

Edge Functions run after the cache and so are ideal to be used on specific, dynamic parts of your site once the page is loaded, such a date-picker with availability or a weather component on your site. This response can be cached on the [Edge Network](https://vercel.com/docs/edge-network/overview) making future invocations even faster.

It is important to note that [Edge Functions](https://vercel.com/docs/functions/edge-functions) are just one solution and not a "one size fits all" solution. It is possible that the database for your site sits far from the Edge server. That means that even though the edge function can be invoked quickly, it might take twice as long to get the data than if the function was located closer to the data. In this scenario, you may want to use a Serverless Function.

See the [regional Edge Functions invocation](https://vercel.com/docs/functions/edge-functions#regional-edge-function-invocation) documentation to learn more. ([Vercel Documentation](https://vercel.com/docs/infrastructure/compute#edge-functions))
{{< /collapse1 >}}

## Results

The final result looks something like this: {{< color-text color="#ddffdd">}}[Chinese Lorem Ipsum](https://chinese-lorem-ipsum.vercel.app/){{</ color-text >}}

## Conclusion

Vercel provides a very convenient one-stop deployment service. It not only supports the deployment of static websites but also server-side functions and even databases. This is very handy for small projects—you don’t need to buy a server or configure an environment, and you can focus solely on developing the project itself. Of course, Vercel has some limitations, such as function execution time cannot exceed 10 seconds, no long-running tasks, and no persistent state, so it may not be suitable for larger projects. However, for small projects or ones that are front-end/back-end separated, Vercel is an excellent choice.

Alright, that’s the end of this half-copilot, half self-written article. It’s starting to feel more like a cheap AI generated blog, which confirms that writing tech blogs isn’t really my thing. I hope this rambling has been somewhat helpful, and that my Lorem Ipsum generator brings you some fun. If you have any questions or suggestions, feel free to leave a comment—I’ll respond as soon as I can, since I’ve got nothing better to do. Goodbye!
