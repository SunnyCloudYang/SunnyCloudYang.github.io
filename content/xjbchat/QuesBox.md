---
author: Yang
date: "2023-03-24T00:05:45+08:00"
lastmod: "2023-05-28T14:43:40+08:00"
description: ""
title: "随便问，随缘答"
summary: ""
# cover: 
#    image: "images/.jpg"
draft: false
comments: true
hideMeta: false
searchHidden: true
ShowBreadCrumbs: true
ShowReadingTime: false
---

自由选择，随心发问。类GPT，主打一个瞎jb聊。

<!-- ![无意义100问](/images/100questions.jpg) -->

<div id="quesdiv">
    <iframe id="quesbox"
        src="https://closed.social/askMe/candonothing/emzzthalacpwnuow/"
        frameborder="0"
        width="100%"
        scrolling="auto"
        object-fit="cover"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
    </iframe>
</div>

<script>
    const quesbox = document.getElementById("quesbox");
    window.addEventListener("message", function(event) {
        if (event.origin !== "https://closed.social")
            return;
        if (event.data.type === "resize" && event.data.height) {
            quesbox.style.height = event.data.height + "px";
        }
    }, false);

    quesbox.onload = function() {
        quesbox.contentWindow.postMessage({
            type: "init",
            height: quesbox.clientHeight
        }, "https://closed.social");
    };
</script>
