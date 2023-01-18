import {
  CannonJSPlugin,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  PointLight,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  Texture,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  Button,
  Image,
  TextBlock,
} from "babylonjs-gui";

import * as cannon from "./cannon";

//get canvas
const canvas = document.querySelector("#renderCanvas");

//create engine
const engine = new Engine(canvas, true);

//create scene-Fn

const createScene = () => {
  const scene = new Scene(engine);
  const originalSceneColor = scene.clearColor;
  scene.clearColor = new Color4(0, 0, 0, 1);

  //adding fog
  //   scene.fogMode = Scene.FOGMODE_EXP;
  //   scene.fogDensity = 0.01;

  //   let alpha = 0;
  //   scene.registerBeforeRender(function () {
  //     scene.fogDensity = Math.cos(alpha) / 20;
  //     alpha += 0.01;
  //   });

  //create physics
  window.CANNON = cannon;
  let gravityCannon = -9.81;
  scene.enablePhysics(new Vector3(0, gravityCannon, 0), new CannonJSPlugin());

  //create camera
  const camera = new UniversalCamera("camera", new Vector3(0, 10, 15), scene);
  camera.attachControl(canvas, true);
  camera.setTarget(new Vector3.Zero());
  camera.speed = 0.5;

  //adding "jump" to camera if spacebar was pressed or better with babylon actionmanager?
  // document.onkeydown((event) => {
  //   console.log(event)
  //   if (event.code === "Space") {
  //     camera.position.y++;
  //   }
  // });

  //adding babylon gui
  const userInterface = AdvancedDynamicTexture.CreateFullscreenUI("ui");

  const playButton = Button.CreateSimpleButton("playButton", "Play");
  playButton.width = "100px";
  playButton.height = "25px";
  playButton.background = "green";
  playButton.onPointerClickObservable.add(playGame);

  const gameTitle = new TextBlock();
  gameTitle.text = "Marble Massacre 1";
  gameTitle.color = "red";
  gameTitle.fontSize = "80px";
  gameTitle.top = "-30%";

  userInterface.addControl(gameTitle);
  userInterface.addControl(playButton);

  function playGame() {
    //adding w a s d to camera (can't move the camera when using wasd-keys?)

    // camera.keysUp.push(87)
    // camera.keysDown.push(83)
    // camera.keysLeft.push(65)
    // camera.keysRight.push(68)

    scene.clearColor = originalSceneColor;

    gameTitle.isVisible = false;
    playButton.isVisible = false;

    //camera settings
    // camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1, 1, 1);
    camera.checkCollisions = true;

    //create world light
    const light = new PointLight("lightBulb", new Vector3(4, 10, 5), scene);
    light.intensity = 0.7;

    //create camera light
    const cameraLight = new PointLight("cameraLight", camera.position, scene);
    // cameraLight.parent = camera
    cameraLight.intensity = 0.7;

    //add shadowGenerator
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.setDarkness(0.5);

    //skybox (doesn't work properly, even https://www.babylonjs.com/tools/ibl/ seems
    // not to work with the files from a tutorial)

    // var skybox = MeshBuilder.CreateBox("skyBox", 100.0, scene);

    // var skyboxMaterial = new StandardMaterial("skyBox", scene);
    // skyboxMaterial.backFaceCulling = false;

    // skyboxMaterial.reflectionTexture = new CubeTexture(
    //   "https://i.imgur.com/SMAzB74.png",
    //   scene
    // );
    // skyboxMaterial.reflectionTexture.coordinatesMode =
    //   Texture.SKYBOX_MODE;

    // skyboxMaterial.diffuseColor = new Color3(0, 0, 0);

    // skyboxMaterial.specularColor = new Color3(0, 0, 0);

    // skyboxMaterial.disableLighting = true;
    // skybox.material = skyboxMaterial;

    // const envTex = CubeTexture.CreateFromPrefilteredData("skybox/environment.env", scene)
    // scene.environmentTexture = envTex
    // scene.createDefaultSkybox(envTex, true)

    //create ground
    const ground = MeshBuilder.CreateGround(
      "mainGround",
      { width: 100, height: 100 },
      scene
    );
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 2, restitution: 0.5 },
      scene
    );
    ground.receiveShadows = true;

    const groundMat = new StandardMaterial("groundMat", scene);

    groundMat.diffuseTexture = new Texture(
      "https://i.imgur.com/LhHxERt.jpg",
      scene
    );
    groundMat.bumpTexture = new Texture(
      "https://i.imgur.com/cX8ow78.jpg",
      scene
    );
    groundMat.ambientTexture = new Texture(
      "https://i.imgur.com/cqHIhHW.jpg",
      scene
    );
    groundMat.specularTexture = new Texture(
      "https://i.imgur.com/JkEyH2E.jpg",
      scene
    );

    groundMat.specularPower = 50;
    groundMat.diffuseTexture.uScale = 10;
    groundMat.diffuseTexture.vScale = 10;
    groundMat.bumpTexture.uScale = 10;
    groundMat.bumpTexture.vScale = 10;
    groundMat.invertNormalMapX = true;
    groundMat.invertNormalMapY = true;
    groundMat.ambientTexture.uScale = 10;
    groundMat.ambientTexture.vScale = 10;
    groundMat.specularTexture.uScale = 10;
    groundMat.specularTexture.vScale = 10;

    ground.material = groundMat;
    ground.checkCollisions = true;

    //create bowl
    const bowlProfile = [
      new Vector3(0, 0, 0),
      new Vector3(5, 0, 0),
      new Vector3(5, 2, 0),
      new Vector3(4.5, 2, 0),
      new Vector3(4.5, 1, 0),
      new Vector3(0, 0, 0),
    ];

    const bowl = MeshBuilder.CreateLathe(
      "bowl",
      { shape: bowlProfile, sideOrientation: Mesh.DOUBLESIDE },
      scene
    );
    bowl.position.y = 0.01;

    bowlMaterial = new StandardMaterial("bowlMat", scene);
    bowlMaterial.diffuseTexture = new Texture(
      "https://i.imgur.com/FycL6kx.jpg",
      scene
    );
    bowl.material = bowlMaterial;
    // bowl.material.wireframe = true;

    bowl.physicsImpostor = new PhysicsImpostor(
      bowl,
      PhysicsImpostor.MeshImpostor,
      { mass: 0, friction: 1, restitution: 0.4 }
    );

    bowl.receiveShadows = true;

    //create environment boxes
    const numOfRandomBoxes = 40;
    for (let i = 0; i < numOfRandomBoxes; i++) {
      const randomBoxBlueprint = MeshBuilder.CreateBox(
        "randomBox",
        {
          width: Math.random() * 5,
          height: Math.random() * 5,
          depth: Math.random() * 5,
        },
        scene
      );
      randomBoxBlueprint.isVisible = false;
      let randomX = -50 + Math.ceil(Math.random() * 100);
      let randomY = -50 + Math.ceil(Math.random() * 100);
      let randomZ = -50 + Math.ceil(Math.random() * 100);

      const randomBox = randomBoxBlueprint.clone("randomBox" + i);
      randomBox.isVisible = true;
      shadowGenerator.addShadowCaster(randomBox);
      randomBox.position = new Vector3(randomX, 0, randomZ);
      randomBox.rotation = new Vector3(randomX, randomY, randomX);
      randomBox.checkCollisions = true;
      randomBox.physicsImpostor = new PhysicsImpostor(
        randomBox,
        PhysicsImpostor.BoxImpostor,
        {
          mass: Math.floor(Math.random() * 100),
          friction: Math.floor(1),
          restitution: Math.floor(Math.random()),
        },
        scene
      );
      // const boxMaterial = new StandardMaterial("boxMat", scene);
      // randomBox.material = boxMaterial;
      // randomBox.material.wireframe = true;
    }

    //create marble texture array
    const marbleTextures = [
      "https://i.imgur.com/rAI6iuW.jpg",
      "https://i.imgur.com/qTO7wQt.jpg",
      "https://i.imgur.com/GYCaLZu.jpg",
      "https://i.imgur.com/Oswon16.jpg",
      "https://i.imgur.com/ueQL36I.jpg",
      "https://i.imgur.com/tKI7gMV.jpg",
      "https://i.imgur.com/L2szstE.jpg",
      "https://i.imgur.com/z6cGrF9.jpg",
      "https://i.imgur.com/Tb3JByl.jpg",
      "https://i.imgur.com/NMc9EdG.jpg",
      "https://i.imgur.com/nCTtO99.jpg",
      "https://i.imgur.com/UDgUGEn.jpg",
      "https://i.imgur.com/Hj7MTn7.jpg",
      "https://i.imgur.com/MuvhQYA.jpg",
      "https://i.imgur.com/WnrQgQ9.jpg",
      "https://i.imgur.com/jTyOCzh.jpg",
      "https://i.imgur.com/oOXK2Qe.jpg",
      "https://i.imgur.com/8zocEyB.jpg",
      "https://i.imgur.com/o1QIArq.jpg",
      "https://i.imgur.com/qXEviOO.jpg",
      "https://i.imgur.com/wWYAVRB.jpg",
      "https://i.imgur.com/makTbBy.jpg",
      "https://i.imgur.com/DqXxG4v.jpg",
      "https://i.imgur.com/teOK80l.jpg",
      "https://i.imgur.com/I26xSN3.jpg",
      "https://i.imgur.com/O86OHhQ.jpg",
      "https://i.imgur.com/PemyiqY.jpg",
      "https://i.imgur.com/B03ODBx.jpg",
      "https://i.imgur.com/JHBQWnV.jpg",
      "https://i.imgur.com/1WoG46b.jpg",
      "https://i.imgur.com/FycL6kx.jpg",
      "https://i.imgur.com/ThrgnFI.jpg",
      "https://i.imgur.com/QhU5veG.jpg",
      "https://i.imgur.com/pCTBdQ8.jpg",
      "https://i.imgur.com/j88mbtZ.jpg",
      "https://i.imgur.com/Mdpyg3W.jpg",
      "https://i.imgur.com/GPsJX9x.jpg",
      "https://i.imgur.com/Rf9gFgL.jpg",
      "https://i.imgur.com/B9YTvor.jpg",
      "https://i.imgur.com/aJocFiJ.jpg",
    ];

    //create marbles that drop off on to the bowl

    let numOfMarbles = 20;
    let marbleDiameter = 3;

    const marble = MeshBuilder.CreateSphere(
      "marble",
      { diameter: marbleDiameter },
      scene
    );

    marble.isVisible = false; //make original marble invisible

    // const droppedMarbles = [];
    // let countDropMarblesClicks = 0;

    function dropMarbles() {
      // countDropMarblesClicks++;

      for (let i = 0; i <= numOfMarbles; i++) {
        const m = marble.clone("marble" + i);
        // droppedMarbles.push(m);
        // console.log(m);
        m.isVisible = true;
        m.material = new StandardMaterial("marbleMat" + i, scene);
        m.material.diffuseTexture = new Texture(
          marbleTextures[Math.ceil(Math.random() * 40)],
          scene
        );

        shadowGenerator.addShadowCaster(m);

        m.position.y = 10 + 2 * i;
        m.position.x = Math.ceil(-2 + Math.random() * 5);
        m.physicsImpostor = new PhysicsImpostor(
          m,
          PhysicsImpostor.SphereImpostor,
          { mass: 0.5, friction: 0.5, restitution: 0.5 },
          scene
        );
        m.checkCollisions = true;
        // console.log(droppedMarbles);
      }
    }

    //removing marbles because of frame drops???
    // function removeMarbles() {
    //   //remove marbles that are not in sight
    //   scene.onAfterRenderObservable.add(() => {
    //     for (let i = 0; i <= numOfMarbles * (countDropMarblesClicks + 1); i++) {
    //       droppedMarbles[i].dispose(true)
    //       // if (droppedMarbles[i].position.y < 0) {
    //       //   // console.log(droppedMarbles[i]);
    //       //   droppedMarbles[i].dispose(true);
    //       // }
    //     }
    //   });
    // }

    function marbleMassacre() {
      // countDropMarblesClicks++;

      for (let i = 0; i <= 99; i++) {
        const m = marble.clone("marbleMassacre" + i);
        // droppedMarbles.push(m);
        // console.log(m);
        m.isVisible = true;
        m.material = new StandardMaterial("marbleMatMassacre" + i, scene);
        m.material.diffuseTexture = new Texture(
          marbleTextures[Math.ceil(Math.random() * 40)],
          scene
        );

        shadowGenerator.addShadowCaster(m);
        // m.position.z;
        // m.position.y = 10 + 2 * i;
        // m.position.x = Math.ceil(-2 + Math.random() * 5);
        m.position = new Vector3(
          -50 + Math.ceil(Math.random() * 100),
          30,
          -50 + Math.ceil(-2 + Math.random() * 100)
        );
        m.physicsImpostor = new PhysicsImpostor(
          m,
          PhysicsImpostor.SphereImpostor,
          { mass: 1, friction: 0.5, restitution: 1 },
          scene
        );
        m.checkCollisions = true;
        // console.log(droppedMarbles);
      }
    }

    //create pistol
    const pistolPipe = MeshBuilder.CreateCylinder("pistolPipe", {
      height: 2,
      diameter: 0.5,
    });
    const pistolShaft = MeshBuilder.CreateBox("pistolShaft", {
      width: 1,
      height: 1,
    });
    pistolShaft.position.y = 1.5;

    const pistolBody = MeshBuilder.CreateBox("pistolBody", {
      width: 1.5,
      height: 2,
      depth: 1.5,
    });
    pistolBody.position.y = 2;
    pistolBody.rotation.x = 2;
    const pistolHandle = MeshBuilder.CreateCylinder("pistolHandle", {
      height: 2,
      diameter: 1,
    });
    // pistolHandle.position = pistolBody.position;
    pistolHandle.rotation.z = 1;
    pistolHandle.position.y = -1;
    pistolHandle.position.x = 1;
    pistolPipe.parent = pistolBody;
    pistolPipe.position.y = 2;
    pistolShaft.parent = pistolBody;
    pistolHandle.parent = pistolBody;

    pistolBody.parent = camera;
    pistolBody.position.x = 0.5;
    pistolBody.position.z = 2;
    pistolBody.position.y = -0.6;
    pistolBody.rotation = new Vector3(0, -1.6, -1.2);
    pistolBody.scaling = new Vector3(0.2, 0.2, 0.2);

    //create marbles to throw
    let ballMass = 1;
    let ballRadius = 0.5;
    let ballSpeed = 30;

    //mouse down event and count mousedowns
    const displayClicks = document.querySelector("h1");
    let countClicks = 0;
    scene.onPointerDown = function castRay(event) {
      //change to first-person-camera on pointer down
      if (event.button === 0) engine.enterPointerlock();
      if (event.button === 1) engine.exitPointerlock();

      countClicks++;
      displayClicks.innerText = "marbles shot: " + countClicks;

      //  const b = ball.clone("ball" + countClicks);

      //creating individual marbles because it seems like
      //clones inherit the rotation and therefore change the direction
      //of new clones when they spawn at pointer position

      const ball = MeshBuilder.CreateSphere("sphere" + countClicks, {
        diameter: ballRadius * 2,
        segments: 10,
      });
      const ballMat = new StandardMaterial("ballMat" + countClicks, scene);
      ballMat.diffuseTexture = new Texture(
        marbleTextures[Math.ceil(Math.random() * 9)],
        scene
      );

      ball.material = ballMat;

      ball.position.z = -1000;

      ball.physicsImpostor = new PhysicsImpostor(
        ball,
        PhysicsImpostor.SphereImpostor,
        { mass: ballMass, friction: 0.5, restitution: 0.5 },
        scene
      );

      // ball.receiveShadows = true;
      shadowGenerator.addShadowCaster(ball);
      ball.checkCollisions = true;

      //create pickingRay
      const ray = scene.createPickingRay(
        window.innerWidth / 2,
        window.innerHeight / 2,
        Matrix.Identity(),
        camera
      );

      ball.position = ray.origin;
      const vel = ray.direction.multiplyByFloats(
        ballSpeed,
        ballSpeed,
        ballSpeed
      );
      // console.log(vel);

      ball.physicsImpostor.setLinearVelocity(vel);
      // ball.physicsImpostor.applyImpulse(vel, ball.getAbsolutePosition());
      // ball.physicsImpostor.applyImpulse(Vector3.Zero(), Vector3.Zero())
    };

    //creating ui

    //get dom-elements

    // let DROP_MARBLES = document.querySelector(".drop-marbles");
    // let HOW_MANY_MARBLES = document.querySelector(".how-many-marbles");
    // let SIZE_OF_MARBLES = document.querySelector(".size-of-marbles");
    // let GRAVITY = document.querySelector(".gravity");

    // HOW_MANY_MARBLES.innerHTML = "marbles to drop: " + numOfMarbles;
    // SIZE_OF_MARBLES.innerHTML = "marble size: " + marbleDiameter;
    // GRAVITY.innerHTML = "gravity: " + gravityCannon;

    const dropMarblesButton = Button.CreateSimpleButton(
      "button1",
      "DROP MARBLES"
    );
    dropMarblesButton.width = "100px";
    dropMarblesButton.height = "50px";
    dropMarblesButton.color = "white";
    dropMarblesButton.cornerRadius = 20;
    dropMarblesButton.background = "green";
    dropMarblesButton.left = "-41%";
    dropMarblesButton.top = "-44%";
    dropMarblesButton.onPointerClickObservable.add(dropMarbles);

    // removeMarbles-Button

    // const removeMarblesButton = Button.CreateSimpleButton("button2", "remove Marbles")
    // removeMarblesButton.width = "100px";
    // removeMarblesButton.height = "50px";
    // removeMarblesButton.color = "red";
    // removeMarblesButton.cornerRadius = 20;
    // removeMarblesButton.background = "black";
    // removeMarblesButton.rigth = "-41%";
    // removeMarblesButton.top = "-44%";
    // removeMarblesButton.onPointerClickObservable.add(removeMarbles);

    // userInterface.addControl(removeMarblesButton);
    const marbleMassacreButton = Button.CreateSimpleButton(
      "button2",
      "MARBLE MASSACRE"
    );
    marbleMassacreButton.width = "120px";
    marbleMassacreButton.height = "50px";
    marbleMassacreButton.color = "white";
    marbleMassacreButton.cornerRadius = 20;
    marbleMassacreButton.background = "red";
    marbleMassacreButton.left = "-20%";
    marbleMassacreButton.top = "-44%";
    marbleMassacreButton.onPointerClickObservable.add(marbleMassacre);

    //add buttons to change some properties/values of functions

    //buttons for ballMass
    const ballMassValue = new TextBlock();
    ballMassValue.text = "ball mass: " + ballMass;
    ballMassValue.color = "white";
    ballMassValue.top = "-35%";
    ballMassValue.left = "-41%";

    const plusButton = Button.CreateSimpleButton("plusButton1", "+");
    plusButton.width = "30px";
    plusButton.height = "30px";
    plusButton.color = "black";
    plusButton.background = "white";
    plusButton.cornerRadius = 10;
    plusButton.top = "-30%";
    plusButton.left = "-40%";
    plusButton.onPointerDownObservable.add(function () {
      ballMass++;
      ballMassValue.text = "ball mass: " + ballMass;
    });
    const minusButton = Button.CreateSimpleButton("minusButton1", "-");
    minusButton.width = "30px";
    minusButton.height = "30px";
    minusButton.color = "black";
    minusButton.background = "white";
    minusButton.cornerRadius = 10;
    minusButton.top = "-30%";
    minusButton.left = "-43%";
    minusButton.onPointerDownObservable.add(function () {
      ballMass--;
      ballMassValue.text = "ball mass: " + ballMass;
    });

    //ballRadius
    const ballRadiusValue = new TextBlock();
    ballRadiusValue.text = "ball radius: " + ballRadius;
    ballRadiusValue.color = "white";
    ballRadiusValue.top = "-25%";
    ballRadiusValue.left = "-41%";

    const plusButton2 = Button.CreateSimpleButton("plusButton2", "+");
    plusButton2.width = "30px";
    plusButton2.height = "30px";
    plusButton2.color = "black";
    plusButton2.background = "white";
    plusButton2.cornerRadius = 10;
    plusButton2.top = "-20%";
    plusButton2.left = "-40%";
    plusButton2.onPointerDownObservable.add(function () {
      ballRadius++;
      ballRadiusValue.text = "ball radius: " + ballRadius;
    });
    const minusButton2 = Button.CreateSimpleButton("minusButton2", "-");
    minusButton2.width = "30px";
    minusButton2.height = "30px";
    minusButton2.color = "black";
    minusButton2.background = "white";
    minusButton2.cornerRadius = 10;
    minusButton2.top = "-20%";
    minusButton2.left = "-43%";
    minusButton2.onPointerDownObservable.add(function () {
      ballRadius--;
      ballRadiusValue.text = "ball radius: " + ballRadius;
    });

    //ballSpeed
    const ballSpeedValue = new TextBlock();
    ballSpeedValue.text = "ball speed: " + ballSpeed;
    ballSpeedValue.color = "white";
    ballSpeedValue.top = "-15%";
    ballSpeedValue.left = "-41%";

    const plusButton3 = Button.CreateSimpleButton("plusButton3", "+");
    plusButton3.width = "30px";
    plusButton3.height = "30px";
    plusButton3.color = "black";
    plusButton3.background = "white";
    plusButton3.cornerRadius = 10;
    plusButton3.top = "-10%";
    plusButton3.left = "-40%";

    plusButton3.onPointerDownObservable.add(function () {
      ballSpeed++;
      ballSpeedValue.text = "ball speed: " + ballSpeed;
    });

    const minusButton3 = Button.CreateSimpleButton("minusButton3", "-");
    minusButton3.width = "30px";
    minusButton3.height = "30px";
    minusButton3.color = "black";
    minusButton3.background = "white";
    minusButton3.cornerRadius = 10;
    minusButton3.top = "-10%";
    minusButton3.left = "-43%";
    minusButton3.onPointerDownObservable.add(function () {
      ballSpeed--;
      ballSpeedValue.text = "ball speed: " + ballSpeed;
    });

    //adding middle aiming cross
    const crossAim = new TextBlock();
    crossAim.text = "+";
    crossAim.fontSize = "40";
    crossAim.color = "white";

    userInterface.addControl(crossAim);

    userInterface.addControl(ballMassValue);
    userInterface.addControl(ballRadiusValue);
    userInterface.addControl(ballSpeedValue);

    userInterface.addControl(plusButton);
    userInterface.addControl(minusButton);

    userInterface.addControl(plusButton2);
    userInterface.addControl(minusButton2);

    userInterface.addControl(plusButton3);
    userInterface.addControl(minusButton3);

    userInterface.addControl(dropMarblesButton);
    userInterface.addControl(marbleMassacreButton);
  }

  return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
