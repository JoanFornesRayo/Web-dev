// ------------------- <HELPERS> -------------------

function randomInt(mult) {
    return Math.floor(Math.random() * mult)
}

function child(parent, child) {
    parent.appendChild(child);
}

function alert(title, s, alertType) {
    let head = document.getElementById("alert-title");
    let content = document.getElementById("alert-message");
    head.textContent = title;
    content.textContent = s;
    let e = document.getElementById("alert");
    switch (alertType) {
        case "finish":
        case "succes":
        case "win":
            e.style.backgroundColor = "#4ff43c";
            break;
        case "warning":
        case "warn":
        case "tie":
            e.style.backgroundColor = "#f3bb00";
            break;
        default:
            e.style.backgroundColor = "#f44336";
            break;
    }
    e.style.display = "";
}

function undisplayAlert() {
    let e = document.getElementById("alert");
    e.style.display = "none";
}

// ------------------- </HELPERS> -------------------

// ------------------- <GAME ID="UGLY"> -------------------

class Game {

    static restart() {
        undisplayAlert();
        this.set(this.rows, this.cols, this.numBombs)
    }

    static set(rows, cols, numBombs) {
        this.dirs = [
            [-1, -1], [+0, -1], [+1, -1],
            [-1, +0], [+1, -0],
            [-1, +1], [+0, +1], [+1, +1]
        ];
        this.totalOpen = 0;
        this.finish = false;
        this.firstTurn = true;
        if (numBombs > rows * cols) return;
        this.numBombs = numBombs;
        this.rows = rows;
        this.cols = cols;
        this.board = new Array(rows);
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(cols);
        }
        this.generate();
        this.setupDisplay();
        this.squareAll();
    }

    static squareAll() {
        let cw = document.querySelectorAll(".box");
        for (let i = 0; i < cw.length; i++) {
            cw[i].style.height = cw[i].offsetWidth + "px";
        }
    }

    static generate() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = new Box(i, j);
            }
        }
    }

    static bombsGeneration() {
        let numBombs = this.numBombs;
        let rows = this.rows;
        let cols = this.cols;
        while (numBombs > 0) {
            let row = randomInt(rows);
            let col = randomInt(cols);

            if (this.isMine(row, col) || this.isUsed(row, col)) continue;
            this.getBox(row, col).isMine = true;
            numBombs--;
        }
    }

    static setupDisplay() {
        let rows = this.rows;
        let cols = this.cols;
        let game = document.getElementById("minesweeper");
        game.innerHTML = "";

        for (let i = 0; i < rows; i++) {
            let row = document.createElement("div");
            row.classList.add("row");
            for (let j = 0; j < cols; j++) {
                let col = document.createElement("div");
                col.classList.add("box");
                col.id = "box-" + i + "-" + j;
                col.setAttribute("onclick", "Game.open(" + i + ", " + j + ")");
                child(row, col);
            }
            child(game, row);
        }
    }

    static outOfBounds(x, y) {
        return x < 0 || y < 0 || x > this.rows - 1 || y > this.cols - 1;
    }

    static open(x, y) {
        undisplayAlert();

        if (this.finish) {
            this.restart();
        }

        let dirs = this.dirs;
        let totalMines = 0;

        if (this.isUsed(x, y)) {
            alert("Warning!", "This box is already used!", "warn");
            return;
        } else {
            this.getBox(x, y).isUsed = true;
        }

        if (this.firstTurn) {
            this.bombsGeneration();
            this.firstTurn = false;
        }

        if (this.isMine(x, y)) {
            this.lost();
            return;
        }

        for (let i = 0; i < dirs.length; i++) {
            let dir = dirs[i];
            let row = dir[0] + x;
            let col = dir[1] + y;

            if (this.outOfBounds(row, col)) {
                continue;
            }
            if (this.isMine(row, col)) {
                totalMines++;
            }
        }

        this.displayElement(x, y, totalMines);

        this.totalOpen++;
        this.win();
        if (totalMines === 0) {
            this.openNear(x, y);
        }
    }

    static displayElement(x, y, totalMines) {
        let element = Box.getBoxElement(x, y);
        element.style.borderColor = "#f3bb00";
        element.innerText = "" + totalMines;
    }

    static openNear(x, y) {
        let dirs = this.dirs;
        for (let i = 0; i < dirs.length; i++) {
            let dir = dirs[i];
            let row = dir[0] + x;
            let col = dir[1] + y;

            if (this.outOfBounds(row, col) || this.isUsed(row, col)) {
                continue;
            }
            this.open(row, col);
        }
    }

    static isUsed(x, y) {
        return this.getBox(x, y).isUsed;
    }

    static isMine(x, y) {
        return this.getBox(x, y).isMine;
    }

    static getBox(x, y) {
        return this.board[x][y];
    }

    static lost() {
        this.lostStyle();
        alert("OOOH!", "YOU FOUND A MINE!");
        this.finish = true;
    }

    static win() {
        if (this.totalOpen !== this.rows * this.cols - this.numBombs) return;
        let borderColor = "#4ff43c";
        this.styleBorders(borderColor);
        alert("WINNER!", "YOU WIN THE GAME!", "win");
        this.finish = true;
    }

    static lostStyle() {
        let borderColor = "#7a201e";
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.isMine(i, j)) {
                    let element = Box.getBoxElement(i, j);
                    element.style.backgroundColor = "#b82f2b";
                    element.style.borderColor = borderColor;
                }
            }
        }

        this.styleBorders(borderColor);
    }

    static styleBorders(borderColor){
        let borderWidth = "5px";
        let cols = this.cols;
        let rows = this.rows;

        let top = Box.getRow(cols, 0);
        let bot = Box.getRow(cols, rows - 1);
        let left = Box.getCol(rows, 0);
        let right = Box.getCol(rows, cols - 1);

        for (let i = 0; i < top.length; i++) {
            top[i].style.borderTopColor = borderColor;
            top[i].style.borderTopWidth = borderWidth;
        }

        for (let i = 0; i < bot.length; i++) {
            bot[i].style.borderBottomColor = borderColor;
            bot[i].style.borderBottomWidth = borderWidth;
        }

        for (let i = 0; i < left.length; i++) {
            left[i].style.borderLeftColor = borderColor;
            left[i].style.borderLeftWidth = borderWidth;
        }

        for (let i = 0; i < right.length; i++) {
            right[i].style.borderRightColor = borderColor;
            right[i].style.borderRightWidth = borderWidth;
        }
    }
}

// ------------------- </GAME> -------------------