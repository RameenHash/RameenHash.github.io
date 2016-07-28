var type=1;
var color;


var config = {


    apiKey: "AIzaSyBY25gLiZYxIEbNSv0rU3N7AiFmH7baeZQ",
    authDomain: "collaborative-sketch-aa8ca.firebaseapp.com",
    databaseURL: "https://collaborative-sketch-aa8ca.firebaseio.com",
    storageBucket: "",
};

firebase.initializeApp(config);


var pointsData = firebase.database().ref();

var points = [];

function setup() {

    

    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    background(255);
    color=0;
   

    pointsData.on("child_added", function(point) {
        points.push(point.val());
    });

    canvas.mousePressed(drawPoint);
    canvas.mouseMoved(drawPointIfMousePressed);

}





function draw() {
 
    background(255);
    if (type = 1) {


        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            noStroke();
 fill(color);
            ellipse(point.x, point.y, 5, 5);

        }
    }
    else if (type = 2) {
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var previous = points[i - 1];
            strokeWeight(point.width);
            line(point.x, point.y, previous.x, previous.y);
        }
    }

    }



    function drawPoint() {
        pointsData.push({
            x: mouseX,
            y: mouseY
        });
        console.log(type);

    }


    function drawPointIfMousePressed() {
        if (mouseIsPressed) {
            drawPoint();

        }
    }


    $("#saveDrawing").on("click", saveDrawing);

    function saveDrawing() {

        saveCanvas();
    }

    $("#clearDrawing").on("click", clearDrawing);

    function clearDrawing() {
        pointsData.remove();
        points = [];
    }


    // pointsData.on("child_removed", function() {
    //     pointsData.remove();
    //     points = [];
    // })
    $("#type").on("click", type=2);

    function changeType() {

        type = 2;
        console.log(type);
    }
    
    function keyPressed() {
        if (keyCode == 71) {
             color = "green"; 
             console.log(color);
             
            
        }
    else{
        color = 0;
    }
           
        
    }