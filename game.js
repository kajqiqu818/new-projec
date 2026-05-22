// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== INPUT =====
let input = {up:false,down:false,left:false,right:false};

function press(k){ input[k]=true }
function release(){ input={up:false,down:false,left:false,right:false} }

// ===== PLAYER =====
let player = {
    x:500, y:500,
    size:32,
    speed:3,
    hp:100,
    dir:"down",
    inventory:[]
};

// ===== TIME SYSTEM =====
let time = 0;
let day = true;

// ===== MAP =====
const TILE = 32;
let map = [];

for(let y=0;y<100;y++){
    let row=[];
    for(let x=0;x<100;x++){
        row.push(Math.random()>0.2 ? "grass":"tree");
    }
    map.push(row);
}

// ===== NPC CLASS =====
class NPC {
    constructor(name,x,y,dialog){
        this.name=name;
        this.x=x;
        this.y=y;
        this.dialog=dialog;
        this.step=0;
        this.moveTimer=0;
    }

    update(){
        this.moveTimer--;
        if(this.moveTimer<=0){
            this.x += (Math.random()-0.5)*50;
            this.y += (Math.random()-0.5)*50;
            this.moveTimer = 120;
        }
    }

    draw(){
        ctx.fillStyle="orange";
        ctx.fillRect(this.x,this.y,40,40);
    }
}

// ===== NPC LIST =====
let npcs = [
    new NPC("Nobita",600,600,[
        "Tớ cần bảo bối Doraemon!",
        "Đi tìm Doraemon giúp tớ!"
    ]),
    new NPC("Shizuka",800,800,[
        "Cậu đến rồi à 😊",
        "Tớ tin cậu!"
    ]),
    new NPC("Doraemon",1000,500,[
        "Đây là bảo bối nè!",
        "Bạn nhận: Cánh cửa thần kỳ"
    ])
];

// ===== QUEST =====
let quest = {
    step:0
};

// ===== DIALOG =====
let dialogBox = document.getElementById("dialogBox");
let nameUI = document.getElementById("name");
let textUI = document.getElementById("text");
let nextBtn = document.getElementById("next");

let currentNPC=null;

function openDialog(npc){
    currentNPC=npc;
    npc.step=0;

    nameUI.innerText=npc.name;
    textUI.innerText=npc.dialog[0];

    dialogBox.style.display="block";
}

nextBtn.onclick=()=>{
    currentNPC.step++;

    if(currentNPC.step < currentNPC.dialog.length){
        textUI.innerText=currentNPC.dialog[currentNPC.step];
    } else {
        dialogBox.style.display="none";
        handleQuest(currentNPC);
    }
};

// ===== QUEST LOGIC =====
function handleQuest(npc){
    if(npc.name==="Nobita") quest.step=1;
    if(npc.name==="Doraemon" && quest.step===1){
        player.inventory.push("Cửa thần kỳ");
        saveGame();
        alert("Đã nhận bảo bối!");
    }
}

// ===== SAVE =====
function saveGame(){
    localStorage.setItem("save", JSON.stringify(player));
}

// ===== LOAD =====
function loadGame(){
    let data = localStorage.getItem("save");
    if(data){
        player = JSON.parse(data);
    }
}
loadGame();

// ===== UPDATE =====
function update(){

    if(input.up) player.y -= player.speed;
    if(input.down) player.y += player.speed;
    if(input.left) player.x -= player.speed;
    if(input.right) player.x += player.speed;

    // NPC update
    npcs.forEach(n=>n.update());

    // check gần NPC
    npcs.forEach(n=>{
        let dist = Math.hypot(player.x-n.x, player.y-n.y);
        if(dist < 60){
            openDialog(n);
        }
    });

    // day night
    time++;
    if(time>1000){
        day = !day;
        time=0;
    }
}

// ===== DRAW =====
function draw(){

    ctx.fillStyle = day ? "#6ccf5f" : "#1a3d1a";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // map
    for(let y=0;y<map.length;y++){
        for(let x=0;x<map[y].length;x++){
            ctx.fillStyle = map[y][x]==="grass" ? "#4caf50" : "#2e7d32";
            ctx.fillRect(
                x*TILE - player.x + canvas.width/2,
                y*TILE - player.y + canvas.height/2,
                TILE,TILE
            );
        }
    }

    // NPC
    npcs.forEach(n=>{
        ctx.fillStyle="orange";
        ctx.fillRect(
            n.x - player.x + canvas.width/2,
            n.y - player.y + canvas.height/2,
            40,40
        );
    });

    // PLAYER
    ctx.fillStyle="blue";
    ctx.fillRect(canvas.width/2,canvas.height/2,player.size,player.size);
}

// ===== LOOP =====
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();