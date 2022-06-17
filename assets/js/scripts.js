const root = document.querySelector(":root");
const title = document.getElementById("title");
const graphEl = document.getElementById("graph");
const leaderboardEl = document.getElementById("leaderboard");
const racerEl = document.getElementById("racer");
const score = document.getElementById("score");
const livesEl = document.getElementById("lives");
const pauseEl = document.getElementById("pause");
const howEl = document.getElementById("how");
const statusEl = document.getElementById("status");

const hide = "hide";

let menuIndex = 0;
const menuStructure = ["begin", "story", "racer", "row", "skill", "track", "game"];
const menus = [...document.getElementsByClassName("menu")];

const btnNext = [...document.getElementsByClassName("menu__next")];
const btnBack = [...document.getElementsByClassName("menu__back")];
const btnStart = [...document.getElementsByClassName("game__start")];
const btnMenu = [...document.getElementsByClassName("menu__btn")];
const btnPause = document.getElementById("btnPause");

const audHover = document.getElementById("audHover");
const audNext = document.getElementById("audNext");
const audBack = document.getElementById("audBack");

const keysTopRowLeft = ["Q", "W", "E", "R", "T"] ;
const keysTopRowRight = ["Y", "U", "I", "O", "P"];
const keysHomeRowLeft = ["A", "S", "D", "F", "G",];
const keysHomeRowRight = ["H", "J", "K", "L", ";", "'"];
const keysBottomRowLeft = ["Z", "X", "C", "V", "B"];
const keysBottomRowRight = ["N", "M", ",", ".", "/"];
const keysNumberRowLeft = ["`", "1", "2", "3", "4", "5"];
const keysNumberRowRight = ["6", "7", "8", "9", "0", "-", "="];

let activeRowLeft = [];
let activeRowRight = [];
let activeRowListener = "";
let scoreFn = undefined;
let activeScore = 0;

document.addEventListener('DOMContentLoaded', () => {

    btnMenu.forEach(btn => {
        btn.addEventListener('click', function() {

            if (btn.textContent === "Leaderboards") {

                // Leaderboards Button
                leaderboardEl.classList.remove(hide);
                title.classList.add(hide);
                menuBegin.classList.add(hide);

            } else if (btn.textContent === "How To Play") {

                // How To Play Button
                howEl.classList.remove(hide);
                pauseEl.classList.add(hide);
                title.classList.add(hide);
                menuBegin.classList.add(hide);
                
            } else if (btn.textContent === "Continue") {

                // Game paused, Continue button
                pauseEl.classList.add(hide);
                graphEl.classList.remove(graphClazz("pause"));

            } else if (btn.textContent === "Exit to Main Menu") {

                // Game paused, Exit button
                showTitle();
                graphEl.className = "";
                graphEl.classList.add("graph");
                racerEl.classList.remove(racerClazz("ready"));
                [...statusEl.childNodes].forEach(child => child.textContent = "");
                menuIndex = 0;
                activeScore = 0;
                score.textContent = "0000000";
                clearInterval(scoreFn);

            } else if (graphEl.classList.contains(graphClazz("pause"))) {
                
                // Game paused, How To Play back button 
                howEl.classList.add(hide);
                pauseEl.classList.remove(hide);

            } else {
                // Other back buttons
                showTitle();
            }
        });
    });

    btnNext.forEach(btn => {
        btn.addEventListener('click', function() {
            let item = menuStructure[menuIndex];
            updateStatus(item, btn.textContent.trim());
            menuIndex++;
            hideTitle(menuIndex);
            hideMenus();
            item = menuStructure[menuIndex];
            showMenu(item);
        });
    });

    btnBack.forEach(btn => {
        btn.addEventListener('click', function() {
            let item = menuStructure[menuIndex];
            menuIndex--;
            hideTitle(menuIndex);
            hideMenus();
            item = menuStructure[menuIndex];
            updateStatus(item, "");
            showMenu(item);
        });
    });

    btnStart.forEach(btn => {
        btn.addEventListener('click', function() {

            updateStatus("track", btn.textContent.trim());

            const racer = document.getElementById("statusRacer").innerText.trim().toLowerCase();
            const row = document.getElementById("statusRow").textContent.replace(" Row", "").toLowerCase();
            const difficulty = document.getElementById("statusSkill").innerText.trim().toLowerCase();
            const track = btn.id;

            hideMenus();
            graphEl.classList.add(graphClazz("out"));
            
            // load racer image
            setupRacer(racer);

            // load row compatibility
            setupRowKeys(row);

            // update lives
            setupLives(difficulty);

            // fade into game with "timers"
            setTimeout(() => {
                graphEl.classList.remove(graphClazz("out"));
                graphEl.classList.add(graphClazz("game"), graphClazz(track), graphClazz(racer), graphClazz(row), graphClazz(difficulty));
                setTimeout(() => {
                    racerEl.classList.add(racerClazz("ready"));
                    setTimeout(() => {
                        // start score
                        scoreFn = setInterval(scoreInterval, 100);
                    }, 500);
                }, 3600);
            }, 2000);
        });
    });

    btnPause.addEventListener("click", function() {
        pauseGame();
    });

});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case "ArrowLeft":
            if (racerEl.classList.contains(racerClazz("mid"))) {
                racerEl.classList.remove(racerClazz("mid"));
                racerEl.classList.add(racerClazz("left"));
            } else if (racerEl.classList.contains(racerClazz("right"))) {
                racerEl.classList.remove(racerClazz("right"));
                racerEl.classList.add(racerClazz("mid"));
            }
            updateLeftKey();
            break;
        case "ArrowRight":
            if (racerEl.classList.contains(racerClazz("mid"))) {
                racerEl.classList.remove(racerClazz("mid"));
                racerEl.classList.add(racerClazz("right"));
            } else if (racerEl.classList.contains(racerClazz("left"))) {
                racerEl.classList.remove(racerClazz("left"));
                racerEl.classList.add(racerClazz("mid"));
            }
            updateRightKey();
            break;
        case "Space":
            console.log("space pressed");
            break;
        case "Escape":
            if (graphEl.classList.contains(graphClazz("game")) && 
                !graphEl.classList.contains(graphClazz("pause"))) {
                pauseGame();
            };
            break;
    }
});

function showTitle() {
    leaderboardEl.classList.add(hide);
    howEl.classList.add(hide);
    pauseEl.classList.add(hide);
    graphEl.classList.remove(graphClazz("pause"));
    title.classList.remove(hide);
    menuBegin.classList.remove(hide);
}

function scoreInterval() {
    activeScore = activeScore + 10;
    score.textContent = String(activeScore).padStart(7, "0");
}

function updateStatus(item, text) {
    const status = document.getElementById(`status${item[0].toUpperCase() + item.slice(1)}`);
    if (status) {
        status.innerText = text.includes("_") ? text.substring(5).trim() : text;
    }
}

function hideTitle(index) {
    index === 0 ? title.classList.remove(hide) : title.classList.add(hide)
}

function showMenu(item) {
    document.getElementById(`menu${item[0].toUpperCase() + item.slice(1)}`).classList.remove(hide);
}

function hideMenus() {
    menus.forEach(menu => menu.classList.add(hide));
}

function pauseGame() {
    pauseEl.classList.remove(hide);
    graphEl.classList.add(graphClazz("pause"));
}

function setupRowKeys(row) {

    // setup active
    switch (row) {
        case "top":
            activeRowLeft = keysTopRowLeft;
            activeRowRight = keysTopRowRight;
        break;
        case "home":
            activeRowLeft = keysHomeRowLeft;
            activeRowRight = keysHomeRowRight;
        break;
        case "bottom":
            activeRowLeft = keysBottomRowLeft;
            activeRowRight = keysBottomRowRight;
        break;
        case "number":
            activeRowLeft = keysNumberRowLeft;
            activeRowRight = keysNumberRowRight;
        break;
        default:
            activeRowLeft = keysHomeRowLeft;
            activeRowRight = keysHomeRowRight;
    }
    
    // update starting prompts
    updateLeftKey();
    updateRightKey();

    // setup listeners
    switch (row) {
        case "top":
            
        break;
        case "home":
            
        break;
        case "bottom":
            
        break;
        case "number":
            
        break;
        default:
            
    }
}

function updateLeftKey() {
    promptLeft.innerText = activeRowLeft[activeRowLeft.length * Math.random() | 0];
}

function updateRightKey() {
    promptRight.innerText = activeRowRight[activeRowRight.length * Math.random() | 0];
}

function setupLives(difficulty) {
    let amount = 0;
    switch (difficulty) {
        case "easy":
            amount = 6;
        break;
        case "normal":
            amount = 4;
        break;
        case "hard":
            amount = 2;
        break;
        case "extreme":
            amount = 1;
        break;
        default:
            amount = 3;
    }
    livesEl.textContent = amount;
}

function setupRacer(racer) {
    const id = `imgRacer`;
    const path = `./assets/img/`;
    document.getElementById(`${id}Left`).src = `${path}${racer}_left.png`;
    document.getElementById(`${id}Mid`).src = `${path}${racer}_mid.png`;
    document.getElementById(`${id}Right`).src = `${path}${racer}_right.png`;
    document.getElementById(`${id}Lives`).src = `${path}${racer}_spin.gif`;
}

function graphClazz(clazz) {
    return `graph--${clazz}`;
}

function racerClazz(clazz) {
    return `racer--${clazz}`;
}