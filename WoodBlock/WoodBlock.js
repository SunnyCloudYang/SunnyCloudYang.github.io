document.body.style.cursor="url(./src/cursor.ico),auto";
const woodBlock = document.getElementById("WoodBlock");
woodBlock.onmouseenter = function (event) {
    woodBlock.style.scale = "1.1";
};
woodBlock.onmouseleave = function (event) {
    woodBlock.style.scale = "1";
};
woodBlock.onmousedown = function (event) {
    woodBlock.style.scale = "1.0";
    woodBlock.onmouseup = function (event) {
        woodBlock.style.scale = "1.1";
    };
    audio.currentTime = 0;
    audio.play();
    MeritsPlus();
    console.log(document.getElementById("main").childNodes);
};

function MeritsPlus() {
    let merits = document.createElement("p");
    merits.innerHTML = "功德+999";
    merits.style.position = "absolute";
    merits.style.top = "calc(50% - 180px)";
    merits.style.left = "calc(50% + 180px)";
    merits.style.fontSize = "24px";
    merits.style.color = "white";
    merits.style.fontWeight = "bold";
    document.getElementById("main").appendChild(merits);
    let t = 0;
    setInterval(() => {
        merits.style.opacity = 1 - 0.05 * t;
        merits.style.top = "calc(50% - 180px - " + 5 * t + "px)";
        t++;
    }, 50);
    setTimeout(() => {
        document.getElementById("main").removeChild(merits);
    }, 1000);
}
