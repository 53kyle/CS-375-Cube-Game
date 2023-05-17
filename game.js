import * as THREE from 'three';

// game state variables
let score = 0;
let speed = 0.5;
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
scene.fog = new THREE.Fog( 0x87CEEB, 130, 150 );
scene.background = new THREE.Color( 0x87CEEB );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 30;
camera.position.y = 3;

// used to generate a random position and color for each cube
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getCubePosition() {
    // get random position for cube to spawn at
    var canSpawnHere = true;
    let xDomain = 280 - (speed*50);
    let x = getRandomInt(xDomain) - xDomain/2 + camera.position.x;
    let y = 0.0;
    let z = camera.position.z - 150 + getRandomInt(10);
    let position = new THREE.Vector3;
    for (const box in boxArray) {
        // if cube with position will penetrate the bounds of another, we need to throw away that position
        if ((x >= boxArray[box].position.x - 1 && x <= boxArray[box].position.x + 1) && (z >= boxArray[box].position.z - 1 && z <= boxArray[box].position.z + 1)) {
            canSpawnHere = false;
        }
    }
    if (!canSpawnHere) {
        // get new random position
        return getCubePosition();
    }
    position.x = x;
    position.y = y;
    position.z = z;
    return position;
}

function renderCube() {
    // render more cubes the faster the player's moving

        const boxGeometry = new THREE.BoxGeometry(1.5,1.5,1.5);
        const boxCollision = new THREE.Box3();

        // get random color for the cube
        let randomColorSelector = getRandomInt(16581375);
        randomColor = 0x000000;
        randomColor += randomColorSelector;

        const boxMaterial = new THREE.MeshLambertMaterial({color: randomColor});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);

        let position = getCubePosition();
        box.position.x = position.x;
        box.position.z = position.z;
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
            }
        }, 1500*(1/speed));

}

// create the floor
const floorGeometry = new THREE.PlaneGeometry( 500, 300 );
const floorMaterial = new THREE.MeshLambertMaterial({color:0x303030});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI/2;
floor.position.y = -0.75
scene.add(floor);

// create the player model
const playerGeometry = new THREE.BufferGeometry();
const playerVertices = new Float32Array( [
	 -0.75, -1.0,  0.75, // 0
	 0.0, -0.5,  1.0, // 1
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

// add some lighting to the scene
var light = new THREE.PointLight(0xFFFFFF);
light.position.set(0, 50, 0);
scene.add(light);

function animate() {
    if (!gamePaused) {
        // move forward constantly
        camera.position.z -= speed;

        // rotate camera & player model when moving left or right
        if (camera.rotation.z <= 0.15 && movingRight && !movingLeft && !gameOver) {
            camera.rotation.z += 0.01;
        }
        else if (camera.rotation.z >= -0.15 && movingLeft && !movingRight && !gameOver) {
            camera.rotation.z -= 0.01;
        }
        else if (camera.rotation.z.toFixed(3) < 0.000 && (!(movingLeft && !movingRight) || gameOver)) {
            camera.rotation.z += 0.01;
        }
        else if (camera.rotation.z.toFixed(3) > 0.000 && (!(movingRight && !movingLeft) || gameOver)) {
            camera.rotation.z -= 0.01;
        }
    
        // move left or right
        if (movingRight && !movingLeft && !gameOver) {
            camera.position.x += 0.1 + speed/4;
        }
        else if (movingLeft && !movingRight && !gameOver) {
            camera.position.x -= 0.1 + speed/4;
        }
    
        // tie the player model, floor and light to the camera's movement and rotation
        player.position.z = camera.position.z - 6;
        player.position.x = camera.position.x;
        player.rotation.y = camera.rotation.z;
        floor.position.x = camera.position.x;
        floor.position.z = camera.position.z;
        light.position.x = camera.position.x;
        light.position.z = camera.position.z + 20;

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
  