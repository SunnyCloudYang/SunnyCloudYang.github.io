document.body.style.cursor = "url(./src/cursor.ico),auto";
const woodBlock = document.getElementById("WoodBlock");
let imgWidth = woodBlock.style.width;
let imgHeight = woodBlock.style.height;
let mobile = false;
window.onload = function () {
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width < 500) {
        imgWidth = width - 180;
        imgHeight = (width - 180) * 0.76;
        woodBlock.style.width = imgWidth + "px";
        woodBlock.style.height = imgHeight + "px";
        mobile = true;
    }
    woodBlock.onmouseenter = !mobile ? function (event) {
        woodBlock.style.scale = "1.05";
    } : null;

    woodBlock.onmouseleave = !mobile ? function (event) {
        woodBlock.style.scale = "1";
    } : null;

    !mobile ? woodBlock.onmousedown = function (event) {
        woodBlock.style.scale = "1.0";
        woodBlock.onmouseup = function (event) {
            woodBlock.style.scale = "1.05";
        };
        audio.currentTime = 0;
        audio.play();
        MeritsPlus();
    } : woodBlock.ontouchstart = function (event) {
        event.preventDefault();
        woodBlock.style.scale = "1.0";
        audio.currentTime = 0;
        audio.play();
        MeritsPlus();
        woodBlock.ontouchend = function (event) {
            woodBlock.style.scale = "1.05";
        };
    };
};



function MeritsPlus() {
    let merits = document.createElement("p");
    merits.innerHTML = "功德+999";
    merits.style.position = "absolute";
    merits.style.top = !mobile ? "calc(50% - 180px)" : "calc(50% - " + (imgHeight / 2 + 75) + "px)";
    merits.style.left = !mobile ? "calc(50% + 180px)" : "calc(50% + " + (imgWidth / 2 - 15) + "px)";
    merits.style.fontSize = "24px";
    merits.style.color = "white";
    merits.style.fontWeight = "bold";
    document.getElementById("main").appendChild(merits);
    let t = 0;
    setInterval(() => {
        merits.style.opacity = 1 - 0.02 * t;
        merits.style.top = !mobile ? "calc(50% - 180px - " + 2 * t + "px)" : "calc(50% - " + (imgHeight / 2 + 75) + "px - " + 2 * t + "px)";
        t++;
    }, 16);
    setTimeout(() => {
        document.getElementById("main").removeChild(merits);
    }, 2000);
}
