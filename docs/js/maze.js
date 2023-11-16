// generate maze
let size = 20;
let easy = 1.6;
let start = false;
const type = {
    start: -1,
    end: -2,
    cell: 0,
    wall: 1,
    obstacle: 2,
    prop: 3,
    monster: 4,
    key: 5,
    path: 114514,
};
const typeColor = {
    [type.start]: 'yellow',
    [type.end]: 'blue',
    [type.cell]: 'white',
    [type.wall]: 'black',
    [type.obstacle]: 'orange',
    [type.prop]: 'green',
    [type.monster]: 'red',
    [type.key]: 'purple',
    [type.path]: 'grey',
};

window.onload = function () {
    addListeners();
    // startGame();
};

function generateMaze(rows, columns) {
    const offset = 1;
    let maze = [];
    let start = [1, 1];
    let end = [rows - 1, columns - 1];
    for (let i = 0; i < rows; i++) {
        maze.push(Array(columns).fill(1));
    }


    function createPath(x, y) {
        maze[x][y] = 0;

        const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        directions.sort(() => Math.random() - 0.5);

        for (let i = 0; i < directions.length; i++) {
            const [dx, dy] = directions[i];
            const newX = x + dx * 2;
            const newY = y + dy * 2;

            if (newX >= 0 && newX < rows && newY >= 0 && newY < columns && maze[newX][newY] === 1) {
                maze[x + dx][y + dy] = 0;
                createPath(newX, newY);
            }
        }
    }


    function shiftMaze(offset) {
        maze.forEach(row => {
            row.unshift(...Array(offset).fill(1));
        });
        for (let i = 0; i < offset; i++) {
            maze.unshift(Array(columns + offset).fill(1));
        }

        if (rows % 2 === 1) {
            maze.push(Array(columns+1).fill(1));
        }
        if(columns % 2 === 1) {
            maze.forEach(row => {
                row.push(1);
            });
        }
    }
    createPath(0, 0);
    shiftMaze(offset);
    maze[start[0]][start[1]] = -1;
    maze[end[0]][end[1]] = -2;

    return maze;
}

function addListeners() {
    document.getElementById('startGame').addEventListener('click', startGame);
    document.getElementById('showHelp').addEventListener('click', showHelp);
    document.getElementById('easyBar').addEventListener('change', changeEasy);
    document.getElementById('sizeBar').addEventListener('change', changeSize);
    document.getElementById('closeBtn').addEventListener('click', showHelp);
}

function changeEasy() {
    easy = getEasy();
    document.getElementById('easyLabel').innerHTML = easy;
    // generateMap(size, easy);
}

function changeSize() {
    size = getSize();
    document.getElementById('sizeLabel').innerHTML = size;
    // generateMap(size, easy);
}

function getEasy() {
    return Number(document.getElementById('easyBar').value);
}

function getSize() {
    return Number(document.getElementById('sizeBar').value);
}

function startGame() {
    easy = getEasy();
    size = getSize();
    let map = generateMap(size, easy);
    window.onresize = function () {
        // drawMaze(map);
    }
    start = true;
    let { path, collected, monsters, cost } = findPath([1, 1], [size - 1, size - 1], map);
    cost = cost || path.length - 5 * collected + 8 * monsters;
    path.forEach(pos => {
        if (map[pos[0]][pos[1]] === type.cell) {
            map[pos[0]][pos[1]] = type.path;
        }
    });
    // drawMaze(map);
    // console.log(collected, monsters, cost);
    return map;
}

function generateMap(size, easy) {
    let maze = generateMaze(size, size);
    const monsters = Math.ceil((size * size / 2000) * easy);
    const props = Math.ceil((size * size / 1800) * easy);
    const breaks = Math.ceil(size * size / (1.6 * easy));
    const keys = 2;
    // console.log(props, monsters, breaks);
    generateObjs(maze, monsters, type.monster);
    generateObjs(maze, props, type.prop);
    generateObjs(maze, breaks, type.cell);
    generateObjs(maze, keys, type.key);
    start = false;
    return maze;
}

function drawMaze(maze) {
    const mazeContainer = document.getElementById('maze-container');
    mazeContainer.innerHTML = '';
    mazeContainer.style.margin = 'auto';
    mazeContainer.style.width = 0.8 * mazeContainer.parentElement.clientWidth + 'px';
    mazeContainer.style.height = mazeContainer.style.width;
    const mazeWidth = mazeContainer.clientWidth / maze[0].length + 'px';
    mazeContainer.style.display = 'grid';
    mazeContainer.style.gridTemplateColumns = `repeat(${maze[0].length}, ${mazeWidth})`;
    mazeContainer.style.gridTemplateRows = `repeat(${maze.length}, ${mazeWidth})`;

    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            const cell = document.createElement('div');
            cell.style.width = mazeWidth;
            cell.style.height = mazeWidth;
            cell.style.backgroundColor = typeColor[maze[i][j]];
            mazeContainer.appendChild(cell);
        }
    }
}

// generate props in maze randomly
function generateObjs(maze, props, typeNumber) {
    let propsCount = 0;
    let positCount = 0;
    let condition = false;
    while (propsCount < props && positCount < 2 * maze.length * maze[0].length) {
        const x = Math.floor(Math.random() * (maze.length - 2)) + 1;
        const y = Math.floor(Math.random() * (maze[0].length - 2)) + 1;

        const inCorner = maze[x - 1][y] + maze[x + 1][y] !== 0 && maze[x][y - 1] + maze[x][y + 1] !== 0;
        const inEdge = maze[x - 1][y] + maze[x + 1][y] !== 0 || maze[x][y - 1] + maze[x][y + 1] !== 0;
        const nextToSame = maze[x - 1][y] === typeNumber || maze[x + 1][y] === typeNumber || maze[x][y - 1] === typeNumber || maze[x][y + 1] === typeNumber;

        if (typeNumber === type.monster) {
            condition = maze[x][y] === 0 && inCorner && !nextToSame;
        }
        else if (typeNumber === type.cell){
            condition = maze[x][y] === 1 && inEdge && !inCorner;
        }
        else {
            condition = maze[x][y] === 0 && !nextToSame;
        }
        if (condition) {
            maze[x][y] = typeNumber;
            propsCount++;
        }
        positCount++;
    }
}

function showHelp() {
    const mask = document.getElementById('mask');
    const help = document.getElementById('help');
    if (help.style.display === 'none') {
        mask.style.display = 'block';
        help.style.display = 'block';
    }
    else {
        mask.style.display = 'none';
        help.style.display = 'none';
    }
}

// function resize() {
//     if (start) {
//         drawMaze(generateMap(size, easy));
//     }
// }

function findPath(curPos, targetPos, maze) {
    // 定义节点类
    class Node {
        constructor(x, y, g, h, cost, collected, monsters) {
            this.x = x;
            this.y = y;
            this.g = g;
            this.h = h;
            this.f = g + h;
            this.cost = cost;
            this.parent = null;
            this.collected = collected;
            this.monsters = monsters;
        }
    }

    // 计算两个节点之间的曼哈顿距离
    function manhattanDistance(node1, node2) {
        return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
    }

    // 获取节点的邻居
    function getNeighbors(node) {
        const neighbors = [];
        const directions = [[-1, 0], [0, -1], [1, 0], [0, 1]]; // 上、左、下、右
        const cost = {
            [type.cell]: 1,
            [type.prop]: -5,
            [type.monster]: 8,
        }

        for (const dir of directions) {
            const newX = node.x + dir[0];
            const newY = node.y + dir[1];

            if (newX >= 0 && newX < maze.length && newY >= 0 && newY < maze[0].length && maze[newX][newY] !== 1) {
                const newNode = new Node(newX, newY, 0, 0, cost[maze[newX][newY]], node.collected, node.monsters);
                if (maze[newX][newY] === type.prop) {
                    newNode.collected++;
                }
                if (maze[newX][newY] === type.monster) {
                    newNode.monsters++;
                }
                neighbors.push(newNode);
            }
        }

        return neighbors;
    }

    // 寻找最小F值的节点
    function findMinNode(openSet) {
        let minNode = openSet[0];

        for (const node of openSet) {
            if (node.f < minNode.f) {
                minNode = node;
            }
        }

        return minNode;
    }

    // 主要算法
    const startNode = new Node(curPos[0], curPos[1], 0, 0, 0, 0, 0);
    const targetNode = new Node(targetPos[0], targetPos[1], 0, 0, 0, 0, 0);

    const openSet = [startNode];
    const closedSet = [];

    while (openSet.length > 0) {
        const currentNode = findMinNode(openSet);

        if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
            // 找到路径，构建路径数组
            const path = [];
            let current = currentNode;
            while (current !== null) {
                path.unshift([current.x, current.y]);
                current = current.parent;
            }
            return {
                path,
                collected: currentNode.collected,
                monsters: currentNode.monsters,
                totalCost: currentNode.g
            }
        }

        // 移动当前节点到关闭集
        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.push(currentNode);

        const neighbors = getNeighbors(currentNode);

        for (const neighbor of neighbors) {
            if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            const tentativeG = currentNode.g + neighbor.cost;

            if (!openSet.includes(neighbor) || tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.h = manhattanDistance(neighbor, targetNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // 无法找到路径
    return null;
}

export { generateMap, generateMaze, findPath }
