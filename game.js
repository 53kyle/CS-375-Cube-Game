import * as THREE from 'three';

// game state variables
let score = 0;
let speed = 0.15;
let movingLeft = false;
let movingRight = false;
let gamePaused = false;
let gameOver = false;

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
            messageText.innerHTML = "";
        }
        else if (!gameOver) {
            gamePaused = true;
            messageText.innerHTML = "Game Paused (Press 'esc' to Unpause)";
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
scene.background = new THREE.Color( 0x87CEEB );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 30;
camera.position.y = 1;

// used to generate a random position and color for each cube
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function renderCube() {
    // render more cubes the faster the player's moving
    for (let i = 0.0; i < speed; i += 0.1) {
        const boxGeometry = new THREE.BoxGeometry(1.5,1.5,1.5);
        const boxCollision = new THREE.Box3();

        let randomColorSelector = getRandomInt(3);
        let randomColor = 0x000000;
        if (randomColorSelector == 0) {
            randomColor = 0xFF0000;
        }
        else if (randomColorSelector == 1) {
            randomColor = 0x00FF00;
        }
        else {
            randomColor = 0x0000FF;
        }

        const boxMaterial = new THREE.MeshBasicMaterial({color: randomColor});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.z = camera.position.z - 80 + getRandomInt(10);
        box.position.x = getRandomInt(1000) - 500 + camera.position.x;
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
            }
        }, 700/speed);
    }
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
	 0.0, 0.25,  1.0, // 1
	 0.75,  -1.0,  0.75, // 2
	 0.0,  -1.0,  1.0, // 3
] );

const playerIndices = [
	2, 1, 3,
	3, 1, 0,
];

playerGeometry.setIndex( playerIndices );
playerGeometry.setAttribute( 'position', new THREE.BufferAttribute( playerVertices, 3 ) );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
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
        if (camera.rotation.z <= 0.3 && movingRight && !movingLeft && !gameOver) {
            camera.rotation.z += 0.015;
        }
        else if (camera.rotation.z >= -0.3 && movingLeft && !movingRight && !gameOver) {
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
            camera.position.x += 0.15;
        }
        else if (movingLeft && !movingRight && !gameOver) {
            camera.position.x -= 0.15;
        }
    
        // tie the player model & floor to the camera's movement and rotation
        player.position.z = camera.position.z - 5;
        player.position.x = camera.position.x;
        player.rotation.y = camera.rotation.z;
        floor.position.z = camera.position.z;

        renderCube();

        renderer.render(scene, camera);

        // gradually speed up as game progesses
        if (speed <= 0.5 && !gameOver) {
            speed += 0.00001;
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
            if (playerCollision.intersectsBox(collisionArray[x]) && score > 200) {
                gameOver = true;
                player.removeFromParent();
                messageText.innerHTML = "Game Over (Reload Page to Play Again)";
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
  