
function printTxt(txt){
    fill(0)
    stroke(0)
    strokeWeight(2)
    text(txt,0,100,100)
}

var widthTimer;

var canvasWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var canvasHeight = (window.innerHeight > 0) ? window.innerHeight : screen.Height;

var blockHeight = canvasWidth/12
// var blockHeight = canvasHeight/8
var boxinHeight = 88/100*blockHeight

var state;


var boxin = null; 
var controlBall = null; 

var boxinImages = [null, null];
var blockType = {"grass":null,"treeI":null,"treeII":null};
    
var selectedRow;
var intFace = {
    "controlBall": null,
    "controlHole": null
}

function preload(){
    blockType["grass"] = loadImage('/images/grassIII.png')
    blockType["treeI"] = loadImage('/images/treeI.png')
    blockType["treeII"] = loadImage('/images/treeII.png')
    boxinImages[0] = loadImage('/images/Boxin.png')
    boxinImages[1] = loadImage('/images/Boxin2.png')
    intFace["controlBall"] = loadImage('/images/controlBall.png')
    intFace["controlHole"] = loadImage('/images/controlHole.png')
}

function setup(){
    /*global createCanvas*/
    createCanvas(canvasWidth, canvasHeight);
    background(255)
    
    boxin = new Boxin(4,4);
    controlBall = new ControlBall(canvasWidth/8,canvasHeight/4*3,canvasHeight/8);
    
    state = states["playing"] 
}

//------------------------------------------------------------------------------

var states = {
    "playing":{
        "draw": function(){
            background(255);
            drawLevel();
            drawInterface();
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
    
    if (mouseIsPressed){
        if (controlling) {
            var distance = (Math.abs(canvasWidth/8 - mouseX)**2 + Math.abs(canvasHeight/4*3 - mouseY)**2)**0.5
            
            var angle =  0
            if ((mouseX - canvasWidth/8) >= 0){
                angle = Math.atan((canvasHeight/4*3 - mouseY)/(mouseX - canvasWidth/8)) * (180/Math.PI) 
            }else{
                // console.log(Math.atan((canvasHeight/4*3 - controlBall.y)/(canvasWidth/8 - controlBall.x)) * (180/Math.PI) + 180)
                angle = Math.atan((canvasHeight/4*3 - mouseY)/(mouseX - canvasWidth/8)) * (180/Math.PI) + 180
            }
            
            if (distance < canvasHeight/10){
                controlBall.x = mouseX
                controlBall.y = mouseY
            }else{
                console.log(angle)
                controlBall.x = canvasWidth/8 + (Math.cos(angle * (Math.PI / 180))) * (canvasHeight/10)
                //not sure why is works with -sin
                controlBall.y = canvasHeight/4*3 + (-Math.sin(angle * (Math.PI / 180))) * (canvasHeight/10)
            }
            
            
            if (distance > canvasHeight/14){
                if (angle > -22.5 && angle < 22.5){
                    state['keydown']('right')
                }else if (angle > 22.5 && angle < 67.5){
                    state['keydown']('right')
                    state['keydown']('up')
                }else if (angle > 67.5 && angle <  + 112.5){
                    state['keydown']('up')
                }else if (angle > 112.5 && angle <  + 157.5){
                    state['keydown']('left')
                    state['keydown']('up')
                }else if (angle > 157.5 && angle <  + 202.5){
                    state['keydown']('left')
                }
            }
        
        }
        //can simultaniously drag and move at the same time
        if (dragging){
            for (var i=0; i<level[selectedRow].length; i++){
                level[selectedRow][i].x = level[selectedRow][i].initialX - (dragStart - mouseX)
            }
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

function drawInterface(){
    image(intFace["controlHole"],canvasWidth/8 - canvasHeight/8,canvasHeight/4*3 - canvasHeight/8,canvasHeight/4,canvasHeight/4)
    stroke(255);
    strokeWeight(20)
    line(canvasWidth/8, canvasHeight/4*3, controlBall.x, controlBall.y)
    controlBall.draw()
}

//------------------------------------------------------------------------------

function Boxin(x,y){
    this.x = (x-1)*blockHeight;
    this.y = (y-1)*blockHeight-(blockHeight/4*4);
    
    this.img = boxinImages[0]
    this.width = boxinHeight
    
    this.spinTimer = null
    this.spinning = false
    //---//
    this.jumpTimer = null
    this.canJump = true
    
    this.speedY = 0;
    this.speedX = blockHeight/30
    this.colliding = false;
    
    this.draw = function(){
        image(this.img,this.x+((boxinHeight-this.width)/2),this.y,this.width,boxinHeight)
    };
    
    this.move = function(key){
        if (key == "right"){
            if (boxin.spinning == false && boxin.img != boxinImages[1]){
                boxin.spinning = true
                this.spinTimer = setInterval(function(){
                    if (boxin.width>3){
                        boxin.width-=3
                    }else{
                        boxin.img = boxinImages[1]
                        clearInterval(boxin.spinTimer)
                        boxin.spinTimer = setInterval(function(){
                            if (boxin.width<boxinHeight){
                                boxin.width+=3
                            }else{
                                boxin.spinning = false
                                clearInterval(boxin.spinTimer)
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
                this.spinTimer = setInterval(function(){
                    if (boxin.width>3){
                        boxin.width-=3
                    }else{
                        boxin.img = boxinImages[0]
                        clearInterval(boxin.spinTimer)
                        boxin.spinTimer = setInterval(function(){
                            if (boxin.width<boxinHeight){
                                boxin.width+=3
                            }else{
                                boxin.spinning = false
                                clearInterval(boxin.spinTimer)
                            }
                        },5)
                    }
                },5);
            }else if(this.spinning == false && this.img == boxinImages[0]){
                this.x -= this.speedX;
            }
        }else if (key == "up"){
            if (this.canJump){
                if (this.speedY == 0 && this.colliding){
                    this.speedY = -10;
                    this.canJump = false
                    this.jumpTimer = setInterval(function(){
                        boxin.canJump = true
                        clearInterval(boxin.jumpTimer)
                    },1000)
                }
            }
        }
    };
    
    this.update = function(){
        
        this.colliding = false;
        for (var i=0; i<level.length; i++){
            for (var j=0; j<level[i].length; j++){
                stroke(255,0,0)
                strokeWeight(5)
                //little more space of boxin's --/__\_\--
                var displacement = boxinHeight/8
                if (this.y+boxinHeight + this.speedY > level[i][j].y+(blockHeight/8) && this.y+boxinHeight <= level[i][j].y+(blockHeight/8)){
                    if ((level[i][j].x < this.x+displacement && level[i][j].x+blockHeight >= this.x+displacement) ||
                        (level[i][j].x < this.x+boxinHeight-displacement && level[i][j].x+blockHeight >= this.x+boxinHeight-displacement)){
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
             [new Block(1, 3, 2,"grass", true),new Block(2, 3, 2,"grass", true),new Block(3, 3, 2,"grass", true),new Block(4, 3, 2,"grass", true),new Block(5, 3, 2,"grass", true)],
             [new Block(1, 4, 2,"grass", true),new Block(2, 4, 2,"grass", true),new Block(3, 4, 2,"grass", true),new Block(4, 4, 2,"grass", true),new Block(5, 4, 2,"grass", true)],
             [new Block(5, 0, 2,"treeI", true),new Block(5, 1, 2,"treeII", true),new Block(5, 2, 2,"treeI", true)]];
         
function ControlBall(x, y, length){
    this.x = x
    this.y = y
    this.length = length
    
    this.draw = function(){
        image(intFace["controlBall"],this.x - (this.length/2), this.y - (this.length/2), this.length, this.length)
    }
}
//------------------------------------------------------------------------------

var dragging = false;
var controlling = false;
var dragStart;

function mousePressed() {
    if ((Math.abs(canvasWidth/8 - mouseX)**2 + Math.abs(canvasHeight/4*3 - mouseY)**2)**0.5 < canvasHeight/10){
        controlBall.x = mouseX
        controlBall.y = mouseY
        controlling = true;
    }else if (level[Math.floor(mouseY/blockHeight)] != undefined) {
        for (var i=0; i<level[Math.floor(mouseY/blockHeight)].length; i++){
            if (level[Math.floor(mouseY/blockHeight)][i].x < mouseX && level[Math.floor(mouseY/blockHeight)][i].x+blockHeight >= mouseX && level[Math.floor(mouseY/blockHeight)][i].movable){
                dragStart = mouseX
                dragging = true;
                selectedRow = Math.floor(mouseY/blockHeight)
            }
        }
        for (var i=0; i<level[Math.floor(mouseY/blockHeight)].length; i++){
            level[Math.floor(mouseY/blockHeight)][i].initialX = level[Math.floor(mouseY/blockHeight)][i].x
        }
    }
    
  // prevent default dragging
  return false;
}

function mouseReleased() {
  dragging = false;
  controlling = false;
  controlBall.x = canvasWidth/8
  controlBall.y = canvasHeight/4*3
}
