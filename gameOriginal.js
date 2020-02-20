
var widthTimer;

var blockHeight = 100
var boxinHeight = 88

var canvasWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var canvasHeight = (window.innerHeight > 0) ? window.innerHeight : screen.Height;

var state;


var boxin = null; 

var boxinImages = [null];
var blockType = {"grass":null};
    
var selectedRow;

function preload(){
    blockType["grass"] = loadImage('/grassIII.png')
    boxinImages[0] = loadImage('/Boxin.png')
    boxinImages[1] = loadImage('/Boxin2.png')
}

function setup(){
    /*global createCanvas*/
    createCanvas(canvasWidth, canvasHeight);
    background(255)
    
    boxin = new Boxin(4,4);
    
    state = states["playing"] 
}

//------------------------------------------------------------------------------

var states = {
    "playing":{
        "draw": function(){
            background(255);
            drawLevel();
            boxin.draw();
        },
        "keydown": function(key){
            boxin.move(key)
        }
    }
}

//------------------------------------------------------------------------------

var maps = {};
onkeydown = onkeyup = function(e){
    e = e || event; 
    maps[e.keyCode] = e.type == 'keydown';
    for (var key in maps){
      if (maps[key] == false){
          delete maps[key]
      }
    }
}

function draw(){
    state["draw"]()
    
    for (var keyCode in maps){
        if(keyCode == 38){
            state['keydown']('up')
        }if(keyCode == 39){
            state['keydown']('right')
        }if(keyCode == 40){
            state['keydown']('down')
        }if(keyCode == 37){
            state['keydown']('left')
        }
    }
}

//------------------------------------------------------------------------------

function drawLevel(){
    for (var i=0; i<level.length; i++){
        for (var j=0; j<level[i].length; j++){
            var cell = level[i][j];
            if (cell != 0){
                
                cell.draw()
                
                if (level[i+1]!=undefined && level[i+1][j]!=0){
                    if (level[i][j].depth<level[i+1][j].depth){
                        noStroke()
                        for (var k = 0; k<5;k++){
                            fill(0,0,0,100-(k*20))
                            rect(j*blockHeight,(i*blockHeight)+blockHeight-3-(k*3), blockHeight,3)
                        }
                    }
                }
            }
        }
        for (var j=0; j<level[i].length; j++){
            var cell = level[i][j];
            if (cell != 0){
                //selecting outline
                if (dragging && i == selectedRow && level[i][j-1] == 0){
                    var selectWidth = 1;
                    for (var k=j; k<level[i].length; k++){
                        if (level[i][k+1] != 0 && level[i][k+1] != undefined){
                            selectWidth+=1
                        }else{
                            break
                        }
                    }
                    
                    stroke(200,200,0)
                    strokeWeight(5)
                    noFill()
                    rect(j*blockHeight, i*blockHeight, blockHeight*selectWidth, blockHeight)
                }
                
            }
        }
    }
}

//------------------------------------------------------------------------------

function Boxin(x,y){
    this.x = (x-1)*blockHeight;
    this.y = (y-1)*blockHeight-(blockHeight/4*3);
    this.speed = 5
    
    this.img = boxinImages[0]
    this.width = boxinHeight
    
    this.timer = null
    this.spinning = false
    
    this.draw = function(){
        image(this.img,this.x+((boxinHeight-this.width)/2),this.y,this.width,boxinHeight)
    };
    
    this.move = function(key){
        if (key == "right"){
            if (boxin.spinning == false && boxin.img != boxinImages[1]){
                boxin.spinning = true
                widthTimer = setInterval(function(){
                    if (boxin.width>3){
                        boxin.width-=3
                    }else{
                        boxin.img = boxinImages[1]
                        clearInterval(widthTimer)
                        widthTimer = setInterval(function(){
                            if (boxin.width<boxinHeight){
                                boxin.width+=3
                            }else{
                                boxin.spinning = false
                                clearInterval(widthTimer)
                            }
                        },5)
                    }
                },5)
            }else if(this.spinning == false && this.img == boxinImages[1]){
                this.x += this.speed
            }
        }else if (key == "left"){
            if (boxin.spinning == false && boxin.img != boxinImages[0]){
                boxin.spinning = true
                widthTimer = setInterval(function(){
                    if (boxin.width>3){
                        boxin.width-=3
                    }else{
                        boxin.img = boxinImages[0]
                        clearInterval(widthTimer)
                        widthTimer = setInterval(function(){
                            if (boxin.width<boxinHeight){
                                boxin.width+=3
                            }else{
                                boxin.spinning = false
                                clearInterval(widthTimer)
                            }
                        },5)
                    }
                },5)
            }else if(this.spinning == false && this.img == boxinImages[0]){
                this.x -= this.speed
            }
        }
    }
}

function Block(x,y,depth,type){
    this.x = x*blockHeight
    this.y = y*blockHeight
    this.depth = depth
    this.type = type
    
    //determines the initial x position before movement
    this.initialX = this.x
    
    this.draw = function(){
        image(blockType[this.type], this.x, this.y, blockHeight, blockHeight);
    }
}


var level = [[0, 0, 0, 0],
             [0, 0,new Block(2, 1, 0, "grass"),new Block(3, 1, 0,"grass")],
             [0, 0,new Block(2, 2, 1,"grass"),0],
             [0, new Block(1, 3, 2,"grass"),new Block(2, 3, 2,"grass"),new Block(3, 3, 2,"grass")]];
         
//------------------------------------------------------------------------------

var dragging = false;
var dragStart;

function mousePressed() {
    if (level[Math.floor(mouseY/blockHeight)] != undefined) {
        if (level[Math.floor(mouseY/blockHeight)][Math.floor(mouseX/blockHeight)] != 0 && level[Math.floor(mouseY/blockHeight)][Math.floor(mouseX/blockHeight)] != undefined) {
            dragStart = mouseX
            dragging = true;
            selectedRow = Math.floor(mouseY/blockHeight)
        }
        //saves every
        for (var i=0; i<level[Math.floor(mouseY/blockHeight)].length; i++){
            level[Math.floor(mouseY/blockHeight)][i].initialX = level[Math.floor(mouseY/blockHeight)][i].x
        }
    }
}

function mouseDragged() {
    if (dragging) {
        for (var i=0; i<level[selectedRow].length; i++){
            level[selectedRow][i].x = level[selectedRow][i].initialX - (dragStart - mouseX)
        }
    }
}

function mouseReleased() {
  dragging = false;
}
