var enemy;
var isGameOver;
var player;
var playerImage;
var enemies = [];
var enemyImage;
var backgroundImage;

function preload() {
   playerImage = loadImage("plane.png");
   enemyImage = loadImage("bird.jpg");
   backgroundImage = loadImage("cloud.png")
}

function setup() {
   createCanvas(window.innerWidth, window.innerHeight);

   player = createSprite(width / 2, height - 25, 0, 0);
   player.addImage(playerImage);
   for (var i = 0; i <= 5; i++) {
      var enemy = createSprite(width / 2, 0, 0, 0);
      enemy.addImage(enemyImage);
      enemies.push(enemy);
   }
   // enemy.rotationSpeed = 4.0;

   isGameOver = false;


}

function gameOver() {
   background(0);
   textAlign(CENTER);
   fill("white");
   text("Game Over!", width / 2, height / 2);
   text("Click anywhere to try again", width / 2, 3 * height / 4);
}



function draw() {
   if (isGameOver) {
      gameOver();


   }
   else {
      background(backgroundImage);

      if (keyDown(RIGHT_ARROW) && player.position.x < (width - (playerImage.width / 2))) {
         player.position.x += 5;
      }

      if (keyDown(LEFT_ARROW) && player.position.x > (playerImage.width / 2)) {
         player.position.x -= 5;
      }

      for (var i = 0; i < enemies.length; i++) {
         var enemy = enemies[i]
         console.log(enemy)
         if (enemy.overlap(player)) {
            isGameOver = true;
         }
         enemy.position.y = enemy.position.y + 3;

         if (enemy.position.y > height) {
            enemy.position.y = 0;
            enemy.position.x = random(5, width - 5);
         }
      }

      drawSprites();
   }
}

function mouseClicked() {
   if (isGameOver) {
      for (var i = 0; i < enemies.length; i++) {
         var enemy = enemies[i]

         enemy.position.x = width / 2;
         enemy.position.y = 0;
      }
      isGameOver = false;
      player.position.x = width / 2;
      player.position.y = height - (playerImage.height / 2);
   }
}