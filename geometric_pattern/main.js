var NUM_CIRCLES = 12;
var x;
var circleDiameter;
var circleRadius;
var y;
var rVal;
var gVal;
var bVal;

function setup() {
    createCanvas(480, 600)
    
    frameRate(5);
    
    circleDiameter = width/NUM_CIRCLES;
    circleRadius = circleDiameter/2;

    rVal = 255;
    gVal = 0;
    bVal = 0;
    
    function draw() {
    var isShifted = false;

    
     y = height;
    while (y >= 0) {
   
   
    }
    
   if (isShifted) {
       x = circleRadius;
   } else {
       x = 0;
   }
   
   
   while (x <= width) {
    fill(color(rVal, gVal, bVal)); 
    stroke(color(rVal, gVal, bVal));
    ellipse(x, y, circleDiameter, circleDiameter); 
        
        x = x + circleDiameter;
        // rVal = rVal - 1 
        // gVal = gVal + 2;
        // bVal = bVal + 1;
    }
    
    y = y - circleRadius;
    isShifted = !isShifted;
    rVal = (rVal + 254) % 256;
    gVal = (gVal + 7) % 256;
    bVal = (bVal + 3) % 256;
    }
    mouseClicked();
}

function keyPressed() {
    if (keyCode === 115 || keyCode === 83) {
        saveCanvas('geometricPattern', 'ping');
        }
    return false;
    
    }

function mouseClicked() {
        console.log("working");
        console.log(x); 
        x = 300 
 while (x > 200) {
    fill(color(rVal, gVal, bVal)); 
    stroke(color(rVal, gVal, bVal));
    ellipse(x, y, circleDiameter, circleDiameter); 
        
        x = x + circleDiameter;
 }
}