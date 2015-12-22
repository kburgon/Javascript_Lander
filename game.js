// Global variables
// Canvas area for text
var textCanvas;
// Drawing environment for text canvas
var textContext;

// Canvas area for rocket
var gameCanvas;
// Drawing environment for rocket
var gameContext;

// Rocketsize defined to avoid errors
var rocketSize = 8;

// Adjust as needed
var fontSize = 20;
// Y-Position where to draw rocket message (if needed) in text canvas
var rocketMessagePosition = fontSize;
// Y-coordinates of Rocket height message
var heightTextPosition = rocketMessagePosition + fontSize + 10;
// Y-coordinates of Rocket velocity message
var velocityTextPosition = heightTextPosition + fontSize + 10;
// Y-coordinates of Rocket fuel message
var fuelTextPosition = velocityTextPosition + fontSize + 10;
// X-coordinate of the messages
var messageX = 0;

// Time interval in milliseconds for animation, set as desired
var deltaTimeInterval = 100;

// Is the engine burning?
var burning = false;

// Game class
var game;
// Has the game been initialized?
var initialized = false;

// Has the game already ended?
var gameEnded = false;

// You add this function, and change this context, it is passed
// the height of the rocket.
function drawLander(height, visible) {
  // The y-coordinate goes from 0 to canvas.height, so need to reverse for
  // the rocket appearing to go down.
  var ycoord = gameCanvas.height - height;
  var rocketSize = 8;
  // Rocket is a square, draw it. You should draw a nice rocket.
  if (visible) {
    gameContext.fillStyle = "#FF0000";
    gameContext.fillRect(gameCanvas.width/2, height - rocketSize, rocketSize, rocketSize);
  }
  else {
    gameContext.fillStyle = "#FFFFFF";
    gameContext.fillRect(gameCanvas.width/2 - 1, height - rocketSize - 1, rocketSize + 2, rocketSize + 2);
  }
}

// Draw where to land
function drawSurface(height) {
  // textContext.fillText("Rocket Game", 10, 50);
  message("Rocket Data:", 20);
  gameContext.fillStyle = "#0000FF";
  gameContext.fillRect(0, height, 300, 700);
}

// Display a message
function message(text, ycoord) {
  textContext.clearRect(messageX, ycoord - fontSize, textCanvas.width, fontSize + 10);
  textContext.strokeText(text, 0, ycoord);
}

// The Planet class models a Planet, which has a gravity and
// a ground height.
function Planet(gravity, ground) {
    this.gravity = gravity;
    this.ground = ground;
    this.getGravity = (function() { return this.gravity; });
    this.getGround = (function() { return this.ground; });
}

// The Rocket class models a Rocket, which has a current height
// above a planet, amount of fuel left, current velocity, and
// engine strength
function Rocket(velocity, height, fuel, engine, planet) {
  this.rVelocity = velocity;
  this.rHeight = height;
  this.rPlanet = planet;
  this.rEngine = engine;
  this.amountFuel = fuel;
  // calculates the new height of the rocket based on the new time
  //  and the current velocity and height of the rocket
  this.nextHeight = function(deltaTime) {
    this.rHeight = this.rHeight - (this.rVelocity/(deltaTime * 20));
  }

  // calculates the new velocity of the rocket, based on the
  //   current velocity, deltaTime, and burnRate of the rocket
  this.nextVelocity = function(burnRate, deltaTime) {
    if (this.reachedSurface()) {
      this.rVelocity = 0.0;
    }
    else {
      this.rVelocity = this.rVelocity - (this.rPlanet.getGravity() - burnRate) * deltaTime * 10;
    }
  }

  // returns the height of the rocket
  this.reportHeight = function() {return this.rHeight;}

  // returns the velocity of the rocket
  this.reportVelocity = function() {return this.rVelocity;}

  // returns the current fuel level of the rocket
  this.reportFuel = function() {return this.amountFuel;}
  this.toString = function() {
    return "HEIGHT " + this.rHeight + " \nVelocity " + this.rVelocity
               + " \nFUEL " + this.amountFuel;
  }

  // returns true if the rocket height is greater than or equal
  //   to the height of the planet surface
  this.reachedSurface = function() {
    if (this.rPlanet.ground <= this.rHeight) {
      return true;
    }
    else false;
  }

  // returns true if the rocket reached the ground at a
  //   safe velocity
  this.landed = function(safeVelocity) {
    if (this.rVelocity < safeVelocity) {
      return false;
    }
    else return true;
  }

  // moves the rocket based on the given burn rate and time
  this.move = function(burnRate, deltaTime) {
    var br = burnRate;
    if (this .amountFuel < (br * deltaTime)) {
      br = this.amountFuel / deltaTime;
      this.amountFuel = 0.0;
      }
    else {
      this.amountFuel = this.amountFuel - br * deltaTime * 10;
    }
   this.nextHeight(deltaTime);
   this.nextVelocity(br, deltaTime);
  }

}

// The Game class models a Game, the safeVelocity is the
// velocity within which the rocket can land.  The crashVelocity
// is the Velocity in which the rocket is blasted to smithereens.
function Game(rocket, safeVelocity, crashVelocity) {
  this.rocket = rocket;
  this.deltaTime = deltaTimeInterval / 1000;

  // Rocket explodes if reached surface going faster than this
  this.tooFast = crashVelocity;

// Message if lander crashes
  this.crashedMessage = "Crashed and Burned Sucker!\n";
  this.explodedMessage = "Blasted to Smithereens!\n";
  this.landedMessage = "Landed Safely! One small step for man, one giant leap for mankind\n";

// Safe landing velocity must be between 0 and this number
  this.safeVelocity = safeVelocity;

// The burning power of the rocket:  if on the power is 1.1.
  this.strategy = function() {
    if (burning) return 1.1;
    else return 0;
  }

// This is the function that does the main moves of the game.
//   It checks to see if the engines are on, calculates the
//   position of the rocket, and draws the rocket on the canvas.
//   It also gives an alert if the rocket has reached ground level.
  this.play = function() {
      var burnRate = this.strategy();
      var oldHeight = this.rocket.reportHeight();
      var oldVelocity = this.rocket.reportVelocity();
      var landedSafe = this.rocket.landed(this.safeVelocity);
      var visible;
      this.rocket.move(burnRate, this.deltaTime);
      if (this.rocket.reportHeight() != oldHeight) {
        visible = false;
        drawLander(oldHeight, visible);
      }
      visible = true;
      drawLander(this.rocket.reportHeight(), visible);
      message("HEIGHT " + (this.rocket.rPlanet.getGround() - this.rocket.reportHeight()).toFixed(2), 60);
      message("Velocity " + this.rocket.reportVelocity().toFixed(2), 90);
      message("Fuel " + this.rocket.reportFuel().toFixed(2), 120);
      if (this.rocket.reachedSurface() && !gameEnded) {
        if (landedSafe) alert(this.landedMessage);
        else if (oldVelocity < crashVelocity) alert(this.explodedMessage);
        else alert(this.crashedMessage);
        gameEnded = true;
        noburn();
      }
  }
}

// Functions to turn the engines on/off
function burn() {
  burning = true;
}
function noburn() {
  burning = false;
}

function toggleBurn() {
    if (burning == false) {
        burn();
        document.getElementById("engine").innerHTML = "Burn";
    }
    else {
        noburn();
        document.getElementById("engine").innerHTML = "No burn";
    }
}

// Main function to start the game
function gameStart(restart) {
  if (!initialized || restart) {
    // Initialize the drawing environments
    textCanvas = document.getElementById("textCanvas");
    textContext = textCanvas.getContext("2d");
    textContext.clearRect(0,0,textCanvas.width,textCanvas.height);
    gameCanvas = document.getElementById('gameCanvas');
    gameContext = gameCanvas.getContext("2d");
    gameContext.clearRect(0,0,textCanvas.width,textCanvas.height);
    textContext.font = fontSize + "px Courier"; // Set the font as desired

    // Create a few objects
    var pluto = new Planet(0.5, 200.0);
    var jupiter = new Planet(1.0, 4.0);
    var myRocket = new Rocket(0.0, rocketSize, 100.0, 1.0, pluto);
    drawSurface(pluto.getGround());
    game = new Game(myRocket, -6.0, -10.0);
    noburn();
    initialized = true;
    gameEnded = false;
  }

  // Start the game
  game.play();
  return false;
}

// Animate
setInterval(gameStart, deltaTimeInterval);
