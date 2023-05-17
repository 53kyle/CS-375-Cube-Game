import * as THREE from 'three';

// game state variables
let score = 0;
let speed = 0.25;
let movingLeft = false;
let movingRight = false;
let gamePaused = false;
let gameOver = false;
let debugMode = false;

// arrays for managing collision
const boxArray = new Array();
const collisionArray = new Array();

// enable keyboard controls
document.addEventListener('keydown', function (event) {
    if (event.key == "a" || event.key == "ArrowLeft") {
        movingLeft = true;
    }
    if (event.key == "d" || event.key == "ArrowRight") {
        movingRight = true;
    }
    if (event.key == "Escape" || event.key == "p" ) {
        if (gamePaused) {
            gamePaused = false;
            if (debugMode) {
                messageText.innerHTML = "DEBUG MODE ON";
            }
            else {
                messageText.innerHTML = "";
            }
        }
        else if (!gameOver) {
            gamePaused = true;
            if (debugMode) {
                messageText.innerHTML = "DEBUG MODE ON\nGame Paused (Press 'esc' to Unpause)";
            }
            else {
                messageText.innerHTML = "Game Paused (Press 'esc' to Unpause)";
            }
        }
    }
    if (event.key == "`" ) {
        if (debugMode) {
            debugMode = false;
            if (gamePaused) {
                messageText.innerHTML = "Game Paused (Press 'esc' to Unpause)";
            }
            else if (gameOver) {
                messageText.innerHTML = "Game Over (Reload Page to Play Again)";
            }
            else {
                messageText.innerHTML = ""
            }
        }
        else {
            debugMode = true;
            if (gamePaused) {
                messageText.innerHTML = "DEBUG MODE ON\nGame Paused (Press 'esc' to Unpause)";
            }
            else if (gameOver) {
                messageText.innerHTML = "DEBUG MODE ON\nGame Over (Reload Page to Play Again)";
            }
            else {
                messageText.innerHTML = "DEBUG MODE ON";
            }
        }
    }
}, false);

document.addEventListener('keyup', function (event) {
    if (event.key == "a" || event.key == "ArrowLeft") {
        movingLeft = false;
    }
    if (event.key == "d" || event.key == "ArrowRight") {
        movingRight = false;
    }
}, false);

// get text from HTML
const scoreText = document.getElementById('score-text');
const messageText = document.getElementById('message-text');

// general three JS setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x87CEEB, 95, 120 );
scene.background = new THREE.Color( 0x87CEEB );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 30;
camera.position.y = 1.5;

// used to generate a random position and color for each cube
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function renderCube() {
    // render more cubes the faster the player's moving

        const boxGeometry = new THREE.BoxGeometry(1.5,1.5,1.5);
        const boxCollision = new THREE.Box3();

        // get random color for the cube
        let randomColorSelector = getRandomInt(16581375);
        randomColor = 0x000000;
        randomColor += randomColorSelector;

        const boxMaterial = new THREE.MeshBasicMaterial({color: randomColor});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.z = camera.position.z - 120 + getRandomInt(10);
        let xDomain = 300 - (speed*100);
        box.position.x = getRandomInt(xDomain) - xDomain/2 + camera.position.x;
        box.geometry.computeBoundingBox();
        scene.add(box);
        boxArray.push(box);
        collisionArray.push(boxCollision);

        // remove any unneeded cubes for performance purposes
        boxGeometry.dispose();
        boxMaterial.dispose();
        window.setTimeout( function() {
            if (!gamePaused && !gameOver) {
                box.removeFromParent();
                boxArray.splice(0, 1);
                collisionArray.splice(0, 1);
                console.log(boxArray.length);
            }
        }, 1000*(1/speed));

}

// create the floor
const floorGeometry = new THREE.PlaneGeometry( 1000, 1000 );
const floorMaterial = new THREE.MeshBasicMaterial({color:0x424242});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI/2;
floor.position.y = -0.75
scene.add(floor);

// create the player model
const playerGeometry = new THREE.BufferGeometry();
const playerVertices = new Float32Array( [
	 -0.75, -1.0,  0.75, // 0
	 0.0, 0.15,  1.0, // 1
	 0.75,  -1.0,  0.75, // 2
	 0.0,  -1.0,  1.0, // 3
] );

const playerIndices = [
	2, 1, 3,
	3, 1, 0,
];

playerGeometry.setIndex( playerIndices );
playerGeometry.setAttribute( 'position', new THREE.BufferAttribute( playerVertices, 3 ) );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
const player = new THREE.Mesh( playerGeometry, playerMaterial );
player.rotation.x = -Math.PI/2;
player.position.y = -1.0;

const playerCollision = new THREE.Box3();
player.geometry.computeBoundingBox();

scene.add(player)

function animate() {
    if (!gamePaused) {
        // move forward constantly
        camera.position.z -= speed;

        // rotate camera & player model when moving left or right
        if (camera.rotation.z <= 0.2 && movingRight && !movingLeft && !gameOver) {
            camera.rotation.z += 0.015;
        }
        else if (camera.rotation.z >= -0.2 && movingLeft && !movingRight && !gameOver) {
            camera.rotation.z -= 0.015;
        }
        else if (camera.rotation.z.toFixed(3) < 0.000 && (!(movingLeft && !movingRight) || gameOver)) {
            camera.rotation.z += 0.015;
        }
        else if (camera.rotation.z.toFixed(3) > 0.000 && (!(movingRight && !movingLeft) || gameOver)) {
            camera.rotation.z -= 0.015;
        }
    
        // move left or right
        if (movingRight && !movingLeft && !gameOver) {
            camera.position.x += 0.1 + speed/3;
        }
        else if (movingLeft && !movingRight && !gameOver) {
            camera.position.x -= 0.1 + speed/3;
        }
    
        // tie the player model & floor to the camera's movement and rotation
        player.position.z = camera.position.z - 5;
        player.position.x = camera.position.x;
        player.rotation.y = camera.rotation.z;
        floor.position.x = camera.position.x;
        floor.position.z = camera.position.z;

        if (score % (6 - Math.floor(speed*10)) == 0) {
            renderCube();
        }

        renderer.render(scene, camera);

        // gradually speed up as game progesses
        if (speed <= 0.5 && !gameOver) {
            speed += 0.00003;
        }
        else if (gameOver && speed > 0) {
            // smoothly slow down when game is over
            speed -= 0.002;
        }
        else if (speed < 0) {
            speed = 0;
        }

        // check for collisions
        playerCollision.copy( player.geometry.boundingBox ).applyMatrix4( player.matrixWorld );
        
        for (const x in collisionArray) {
            collisionArray[x].copy( boxArray[x].geometry.boundingBox ).applyMatrix4( boxArray[x].matrixWorld );
            if (playerCollision.intersectsBox(collisionArray[x]) && score > 200 && !debugMode) {
                gameOver = true;
                player.removeFromParent();
                if (debugMode) {
                    messageText.innerHTML = "DEBUG MODE ON\nGame Over (Reload Page to Play Again)";
                }
                else {
                    messageText.innerHTML = "Game Over (Reload Page to Play Again)";
                }
            }
        }

        // increase score by one for every frame
        if (!gameOver) {
            score += 1;
        }
    
        scoreText.innerHTML = "Score: " + score;
    }
}

renderer.setAnimationLoop(animate);
  