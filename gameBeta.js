
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
            boxin.update();
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
                
            cell.draw()
        }
    }
    if (dragging){
        for (var i=0; i<level[selectedRow].length; i++){
            
            //if the cell behind the iterated box is not undefined (box at left edge), check if behind box is directly next to the iterated box
            if (level[selectedRow][i-1] != undefined ){
                if (level[selectedRow][i].cellX-1 > level[selectedRow][i-1].cellX)  {  
                    var selectWidth = 1;
                    for (var j=i; j<level[selectedRow].length-1; j++){
                        if (level[selectedRow][j].cellX-1 >= level[selectedRow][j+1].cellX){
                            selectWidth+=1
                        }else{
                            break
                        }
                    }
                    stroke(200,200,0)
                    strokeWeight(5)
                    noFill()
                    rect(level[selectedRow][i].x, selectedRow*blockHeight, blockHeight*selectWidth, blockHeight)
                }
            }else{
                var selectWidth = 1;
                for (var j=i; j<level[selectedRow].length-1; j++){
                    if (level[selectedRow][j].cellX >= level[selectedRow][j+1].cellX-1){
                        selectWidth+=1
                    }else{
                        break
                    }
                }
                stroke(200,200,0)
                strokeWeight(5)
                noFill()
                rect(level[selectedRow][i].x, selectedRow*blockHeight, blockHeight*selectWidth, blockHeight)
            }
        }
    }
}

//------------------------------------------------------------------------------

function Boxin(x,y){
    this.x = (x-1)*blockHeight;
    this.y = (y-1)*blockHeight-(blockHeight/4*4);
    this.speedX = 5
    
    this.img = boxinImages[0]
    this.width = boxinHeight
    
    this.timer = null
    this.spinning = false
    
    this.speedY = 0;
    this.colliding = false;
    
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
                this.x += this.speedX
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
                },5);
            }else if(this.spinning == false && this.img == boxinImages[0]){
                this.x -= this.speedX;
            }
        }else if (key == "up"){
            if (this.speedY == 0 && this.colliding){
                this.speedY = -10;
            }
        }
    };
    
    this.update = function(){
        
        this.colliding = false;
        for (var i=0; i<level.length; i++){
            for (var j=0; j<level[i].length; j++){
                stroke(255,0,0)
                strokeWeight(5)
                if (this.y+boxinHeight + this.speedY > level[i][j].y+(blockHeight/8) && this.y+boxinHeight <= level[i][j].y+(blockHeight/8)){
                    if (level[i][j].x < this.x+(boxinHeight/2) && level[i][j].x+blockHeight >= this.x+(boxinHeight/2)){
                        this.colliding = true
                    }
                }
            }
        }
        
        if (!this.colliding){
            this.y += this.speedY;
            this.speedY += 0.5;
        }else{
            this.speedY = 0;
        }
    }
}

function Block(x,y,depth,type,movable){
    //checker for the nexting blocks
    this.cellX = x
    
    this.x = x*blockHeight
    this.y = y*blockHeight
    this.depth = depth
    this.type = type
    
    this.movable = movable
    
    //determines the initial x position before movement
    this.initialX = this.x
    
    this.draw = function(){
        image(blockType[this.type], this.x, this.y, blockHeight, blockHeight);
    }
}

//this is a matrix, but also not really. two different blocks with same y can exit in.
//each list in the list indicates the boxes that moves in a group.
var level = [[],
             [new Block(2, 1, 0, "grass", false),new Block(3, 1, 0,"grass", false)],
             [new Block(2, 2, 1,"grass", true), new Block(4, 2, 1,"grass", true)],
             [new Block(1, 3, 2,"grass", true),new Block(2, 3, 2,"grass", true),new Block(3, 3, 2,"grass", true)]];
         
//------------------------------------------------------------------------------

var dragging = false;
var dragStart;

function mousePressed() {
    if (level[Math.floor(mouseY/blockHeight)] != undefined) {
        for (var i=0; i<level[Math.floor(mouseY/blockHeight)].length; i++){
            if (level[Math.floor(mouseY/blockHeight)][i].x < mouseX && level[Math.floor(mouseY/blockHeight)][i].x+blockHeight >= mouseX && level[Math.floor(mouseY/blockHeight)][i].movable){
                dragStart = mouseX
                dragging = true;
                selectedRow = Math.floor(mouseY/blockHeight)
            }
        }
        // if (level[Math.floor(mouseY/blockHeight)][Math.floor(mouseX/blockHeight)] != 0 && level[Math.floor(mouseY/blockHeight)][Math.floor(mouseX/blockHeight)] != undefined) {
        //     dragStart = mouseX
        //     dragging = true;
        //     selectedRow = Math.floor(mouseY/blockHeight)
        // }
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
