function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export { randInt, deg2rad };