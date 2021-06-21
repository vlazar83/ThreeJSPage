import * as THREE from "./../node_modules/three/build/three.module.js";

let body,
  mainContainer,
  scene,
  renderer,
  camera,
  cameraLookAt = new THREE.Vector3(0, 0, 0),
  cameraTarget = new THREE.Vector3(0, 0, 800),
  windowWidth,
  windowHeight,
  windowHalfWidth,
  windowHalfHeight,
  points,
  mouseX = 0,
  mouseY = 0,
  gui,
  stats,
  contentElement,
  colors = ["#F7A541", "#F45D4C", "#FA2E59", "#4783c3", "#9c6cb7"],
  graphics,
  currentGraphic = 0,
  graphicCanvas,
  gctx,
  canvasWidth = 240,
  canvasHeight = 240,
  graphicPixels,
  particles = [],
  graphicOffsetX = canvasWidth / 2,
  graphicOffsetY = canvasHeight / 4;

// -----------------------
// Setup stage
// -----------------------
const initStage = () => {
  body = document.querySelector("body");
  mainContainer = document.querySelector("#main");
  contentElement = document.querySelector(".intro-content");

  setWindowSize();

  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("mousemove", onMouseMove, false);
};

// -----------------------
// Setup scene
// -----------------------
const initScene = () => {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowWidth, windowHeight);
  mainContainer.appendChild(renderer.domElement);

  scene.background = new THREE.Color(0xffffff);
};

// -----------------------
// Setup camera
// -----------------------
const initCamera = () => {
  const fieldOfView = 75;
  const aspectRatio = windowWidth / windowHeight;
  const nearPlane = 1;
  const farPlane = 3000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera.position.z = 800;
};

// -----------------------
// Setup canvas
// -----------------------
const initCanvas = () => {
  graphicCanvas = document.createElement("canvas");
  graphicCanvas.width = canvasWidth;
  graphicCanvas.height = canvasHeight;
  gctx = graphicCanvas.getContext("2d");
  graphics = document.querySelectorAll(".intro-cell > img");
};

// -----------------------
// Setup light
// -----------------------
const initLights = () => {
  const shadowLight = new THREE.DirectionalLight(0xffffff, 2);
  shadowLight.position.set(20, 0, 10);
  scene.add(shadowLight);

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(-20, 0, 20);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(0, 0, -20);
  scene.add(backLight);
};

// -----------------------
// Setup particles
// -----------------------

function Particle() {
  this.vx = Math.random() * 0.05;
  this.vy = Math.random() * 0.05;
}

Particle.prototype.init = function (i) {
  const particle = new THREE.Object3D();
  const geometryCore = new THREE.SphereGeometry(2, 4, 4);
  const materialCore = new THREE.MeshBasicMaterial({
    color: colors[i % colors.length],
  });

  const box = new THREE.Mesh(geometryCore, materialCore);
  box.geometry.__dirtyVertices = true;
  box.geometry.dynamic = true;

  const pos = getGraphicPos(graphicPixels[i]);
  particle.targetPosition = new THREE.Vector3(pos.x, pos.y, pos.z);

  particle.position.set(
    windowWidth * 0.5,
    windowHeight * 0.5,
    -10 * Math.random() + 20
  );
  randomPos(particle.position);

  //console.log(box);
  //console.log(box.geometry.isBufferGeometry);
  // https://discourse.threejs.org/t/solved-geometry-vertices-is-undefined/3133
  //const positionT = box.geometry.attributes.position;
  //const vectorT = new THREE.Vector3();
  //for (let i = 0, l = positionT.count; i < l; i++) {
  //  vectorT.fromBufferAttribute(positionT, i);
  //  vectorT.applyMatrix4(box.matrixWorld);
  //console.log(vectorT);

  //box.geometry.vertices[i].x += -2 + Math.random() * 4;
  //box.geometry.vertices[i].y += -2 + Math.random() * 4;
  //box.geometry.vertices[i].z += -2 + Math.random() * 4;
  //}

  console.log(box);

  const position = box.geometry.attributes.position;
  const vector = new THREE.Vector3();

  for (let i = 0, l = position.count; i < l; i++) {
    vector.fromBufferAttribute(position, i);
    vector.setX = vector.x - 2 + Math.random() * 4;
    vector.setY = vector.y - 2 + Math.random() * 4;
    vector.setZ = vector.z - 2 + Math.random() * 4;
    vector.applyMatrix4(box.matrixWorld);
    //console.log(vector);
  }

  //for (var i = 0; i < box.geometry.attributes.position.count; i++) {
  //  box.geometry.attributes.position[i].x += -2 + Math.random() * 4;
  //  box.geometry.attributes.position[i].y += -2 + Math.random() * 4;
  //  box.geometry.attributes.position[i].z += -2 + Math.random() * 4;
  //}

  particle.add(box);
  this.particle = particle;
};

Particle.prototype.updateRotation = function () {
  this.particle.rotation.x += this.vx;
  this.particle.rotation.y += this.vy;
};

Particle.prototype.updatePosition = function () {
  this.particle.position.lerp(this.particle.targetPosition, 0.1);
};

function updateParticles() {
  for (var i = 0, l = particles.length; i < l; i++) {
    particles[i].updateRotation();
    particles[i].updatePosition();
  }
}

const getGraphicPos = (pixel) => {
  const posX = (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * 3;
  const posY = (pixel.y - graphicOffsetY - Math.random() * 4 - 2) * 3;
  const posZ = -20 * Math.random() + 40;

  return { x: posX, y: posY, z: posZ };
};

const setParticles = () => {
  for (let i = 0; i < graphicPixels.length; i++) {
    if (particles[i]) {
      const pos = getGraphicPos(graphicPixels[i]);
      particles[i].particle.targetPosition.x = pos.x;
      particles[i].particle.targetPosition.y = pos.y;
      particles[i].particle.targetPosition.z = pos.z;
    } else {
      const p = new Particle();
      p.init(i);
      scene.add(p.particle);
      particles[i] = p;
    }
  }

  for (let i = graphicPixels.length; i < particles.length; i++) {
    randomPos(particles[i].particle.targetPosition, true);
  }

  console.log("Total Particles: " + particles.length);
};

// -----------------------
// Random position
// -----------------------

function randomPos(vector, outFrame = false) {
  const radius = outFrame ? windowWidth * 2 : windowWidth * -2;
  const centerX = 0;
  const centerY = 0;

  // ensure that p(r) ~ r instead of p(r) ~ constant
  const r = windowWidth + radius * Math.random();
  const angle = Math.random() * Math.PI * 2;

  // compute desired coordinates
  vector.x = centerX + r * Math.cos(angle);
  vector.y = centerY + r * Math.sin(angle);
  vector.z = Math.random() * windowWidth;
}

// -----------------------
// Update canvas
// -----------------------

const updateGraphic = () => {
  const img = graphics[currentGraphic];
  gctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  const gData = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
  graphicPixels = [];

  for (let i = gData.length; i >= 0; i -= 4) {
    if (gData[i] == 0) {
      const x = (i / 4) % canvasWidth;
      const y = canvasHeight - Math.floor(Math.floor(i / canvasWidth) / 4);

      if (x && x % 2 == 0 && y && y % 2 == 0) {
        graphicPixels.push({
          x: x,
          y: y,
        });
      }
    }
  }

  for (let i = 0; i < particles.length; i++) {
    randomPos(particles[i].particle.targetPosition);
  }

  setTimeout(() => {
    setParticles();
  }, 500);
};

// -----------------------
// Setup background objects
// -----------------------

const initBgObjects = () => {
  for (let i = 0; i < 40; i++) {
    createBgObject(i);
  }
};

const createBgObject = (i) => {
  const geometry = new THREE.SphereGeometry(10, 6, 6);
  const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  const x = Math.random() * windowWidth * 2 - windowWidth;
  const y = Math.random() * windowHeight * 2 - windowHeight;
  const z = Math.random() * -2000 - 200;
  sphere.position.set(x, y, z);
};

// -----------------------
// Setup slider
// -----------------------

const initSlider = () => {
  const elem = document.querySelector(".intro-carousel");

  const flkty = new Flickity(elem, {
    // options
    cellAlign: "center",
    pageDots: false,
    wrapAround: true,
    resize: true,
  });

  function listener() {
    currentGraphic = flkty.selectedIndex;
    updateGraphic();
    console.log(flkty.selectedIndex);
  }

  flkty.on("select", listener);
};

const onMouseMove = (event) => {
  mouseX = event.clientX - windowHalfWidth;
  mouseY = event.clientY - windowHalfHeight;
  cameraTarget.x = (mouseX * -1) / 2;
  cameraTarget.y = mouseY / 2;
};

const onWindowResize = () => {
  setWindowSize();

  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
};

const setWindowSize = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  windowHalfWidth = windowWidth / 2;
  windowHalfHeight = windowHeight / 2;
};

const animate = () => {
  requestAnimationFrame(animate);
  updateParticles();
  camera.position.lerp(cameraTarget, 0.2);
  camera.lookAt(cameraLookAt);
  render();
};

const render = () => {
  renderer.render(scene, camera);
};

initStage();
initScene();
initCanvas();
initCamera();
initSlider();
initBgObjects();
updateGraphic();
animate();

/*!
 * Start Bootstrap - Grayscale v7.0.1 (https://startbootstrap.com/theme/grayscale)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
 
//
// Scripts
//

function runAnimation() {
  let body,
    mainContainer,
    scene,
    renderer,
    camera,
    cameraLookAt = new THREE.Vector3(0, 0, 0),
    cameraTarget = new THREE.Vector3(0, 0, 800),
    windowWidth,
    windowHeight,
    windowHalfWidth,
    windowHalfHeight,
    points,
    mouseX = 0,
    mouseY = 0,
    gui,
    stats,
    contentElement,
    colors = ["#F7A541", "#F45D4C", "#FA2E59", "#4783c3", "#9c6cb7"],
    graphics,
    currentGraphic = 0,
    graphicCanvas,
    gctx,
    canvasWidth = 240,
    canvasHeight = 240,
    graphicPixels,
    particles = [],
    graphicOffsetX = canvasWidth / 2,
    graphicOffsetY = canvasHeight / 4;

  // -----------------------
  // Setup stage
  // -----------------------
  const initStage = () => {
    body = document.querySelector("body");
    mainContainer = document.querySelector("#main");
    contentElement = document.querySelector(".intro-content");

    setWindowSize();

    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("mousemove", onMouseMove, false);
  };

  // -----------------------
  // Setup scene
  // -----------------------
  const initScene = () => {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);
    mainContainer.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0xffffff);
  };

  // -----------------------
  // Setup camera
  // -----------------------
  const initCamera = () => {
    const fieldOfView = 75;
    const aspectRatio = windowWidth / windowHeight;
    const nearPlane = 1;
    const farPlane = 3000;
    camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    camera.position.z = 800;
  };

  // -----------------------
  // Setup canvas
  // -----------------------
  const initCanvas = () => {
    graphicCanvas = document.createElement("canvas");
    graphicCanvas.width = canvasWidth;
    graphicCanvas.height = canvasHeight;
    gctx = graphicCanvas.getContext("2d");
    graphics = document.querySelectorAll(".intro-cell > img");
  };

  // -----------------------
  // Setup light
  // -----------------------
  const initLights = () => {
    const shadowLight = new THREE.DirectionalLight(0xffffff, 2);
    shadowLight.position.set(20, 0, 10);
    scene.add(shadowLight);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(-20, 0, 20);
    scene.add(light);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(0, 0, -20);
    scene.add(backLight);
  };

  // -----------------------
  // Setup particles
  // -----------------------

  function Particle() {
    this.vx = Math.random() * 0.05;
    this.vy = Math.random() * 0.05;
  }

  Particle.prototype.init = function (i) {
    const particle = new THREE.Object3D();
    const geometryCore = new THREE.SphereGeometry(2, 4, 4);
    const materialCore = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
    });

    const box = new THREE.Mesh(geometryCore, materialCore);
    box.geometry.__dirtyVertices = true;
    box.geometry.dynamic = true;

    const pos = getGraphicPos(graphicPixels[i]);
    particle.targetPosition = new THREE.Vector3(pos.x, pos.y, pos.z);

    particle.position.set(
      windowWidth * 0.5,
      windowHeight * 0.5,
      -10 * Math.random() + 20
    );
    randomPos(particle.position);

    //console.log(box);
    for (var i = 0; i < box.geometry.attributes.normal.array.length; i++) {
      box.geometry.attributes.normal.array[i].x += -2 + Math.random() * 4;
      box.geometry.attributes.normal.array[i].y += -2 + Math.random() * 4;
      box.geometry.attributes.normal.array[i].z += -2 + Math.random() * 4;
    }

    particle.add(box);
    this.particle = particle;
  };

  Particle.prototype.updateRotation = function () {
    this.particle.rotation.x += this.vx;
    this.particle.rotation.y += this.vy;
  };

  Particle.prototype.updatePosition = function () {
    this.particle.position.lerp(this.particle.targetPosition, 0.1);
  };

  function updateParticles() {
    for (var i = 0, l = particles.length; i < l; i++) {
      particles[i].updateRotation();
      particles[i].updatePosition();
    }
  }

  const getGraphicPos = (pixel) => {
    const posX = (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * 3;
    const posY = (pixel.y - graphicOffsetY - Math.random() * 4 - 2) * 3;
    const posZ = -20 * Math.random() + 40;

    return { x: posX, y: posY, z: posZ };
  };

  const setParticles = () => {
    for (let i = 0; i < graphicPixels.length; i++) {
      if (particles[i]) {
        const pos = getGraphicPos(graphicPixels[i]);
        particles[i].particle.targetPosition.x = pos.x;
        particles[i].particle.targetPosition.y = pos.y;
        particles[i].particle.targetPosition.z = pos.z;
      } else {
        const p = new Particle();
        p.init(i);
        scene.add(p.particle);
        particles[i] = p;
      }
    }

    for (let i = graphicPixels.length; i < particles.length; i++) {
      randomPos(particles[i].particle.targetPosition, true);
    }

    console.log("Total Particles: " + particles.length);
  };

  // -----------------------
  // Random position
  // -----------------------

  function randomPos(vector, outFrame = false) {
    const radius = outFrame ? windowWidth * 2 : windowWidth * -2;
    const centerX = 0;
    const centerY = 0;

    // ensure that p(r) ~ r instead of p(r) ~ constant
    const r = windowWidth + radius * Math.random();
    const angle = Math.random() * Math.PI * 2;

    // compute desired coordinates
    vector.x = centerX + r * Math.cos(angle);
    vector.y = centerY + r * Math.sin(angle);
    vector.z = Math.random() * windowWidth;
  }

  // -----------------------
  // Update canvas
  // -----------------------

  const updateGraphic = () => {
    const img = graphics[currentGraphic];
    gctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    const gData = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    graphicPixels = [];

    for (let i = gData.length; i >= 0; i -= 4) {
      if (gData[i] == 0) {
        const x = (i / 4) % canvasWidth;
        const y = canvasHeight - Math.floor(Math.floor(i / canvasWidth) / 4);

        if (x && x % 2 == 0 && y && y % 2 == 0) {
          graphicPixels.push({
            x: x,
            y: y,
          });
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      randomPos(particles[i].particle.targetPosition);
    }

    setTimeout(() => {
      setParticles();
    }, 500);
  };

  // -----------------------
  // Setup background objects
  // -----------------------

  const initBgObjects = () => {
    for (let i = 0; i < 40; i++) {
      createBgObject(i);
    }
  };

  const createBgObject = (i) => {
    const geometry = new THREE.SphereGeometry(10, 6, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    const x = Math.random() * windowWidth * 2 - windowWidth;
    const y = Math.random() * windowHeight * 2 - windowHeight;
    const z = Math.random() * -2000 - 200;
    sphere.position.set(x, y, z);
  };

  // -----------------------
  // Setup slider
  // -----------------------

  const initSlider = () => {
    const elem = document.querySelector(".intro-carousel");

    const flkty = new Flickity(elem, {
      // options
      cellAlign: "center",
      pageDots: false,
      wrapAround: true,
      resize: true,
    });

    function listener() {
      currentGraphic = flkty.selectedIndex;
      updateGraphic();
      console.log(flkty.selectedIndex);
    }

    flkty.on("select", listener);
  };

  const onMouseMove = (event) => {
    mouseX = event.clientX - windowHalfWidth;
    mouseY = event.clientY - windowHalfHeight;
    cameraTarget.x = (mouseX * -1) / 2;
    cameraTarget.y = mouseY / 2;
  };

  const onWindowResize = () => {
    setWindowSize();

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(windowWidth, windowHeight);
  };

  const setWindowSize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    windowHalfWidth = windowWidth / 2;
    windowHalfHeight = windowHeight / 2;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    updateParticles();
    camera.position.lerp(cameraTarget, 0.2);
    camera.lookAt(cameraLookAt);
    render();
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  initStage();
  initScene();
  initCanvas();
  initCamera();
  initSlider();
  initBgObjects();
  updateGraphic();
  animate();
}

window.addEventListener("DOMContentLoaded", (event) => {
  // Navbar shrink function
  var navbarShrink = function () {
    const navbarCollapsible = document.body.querySelector("#mainNav");
    if (!navbarCollapsible) {
      return;
    }
    if (window.scrollY === 0) {
      navbarCollapsible.classList.remove("navbar-shrink");
    } else {
      navbarCollapsible.classList.add("navbar-shrink");
    }
  };

  // Shrink the navbar
  navbarShrink();

  // Shrink the navbar when page is scrolled
  document.addEventListener("scroll", navbarShrink);

  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector("#mainNav");
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: "#mainNav",
      offset: 74,
    });
  }

  // Collapse responsive navbar when toggler is visible
  const navbarToggler = document.body.querySelector(".navbar-toggler");
  const responsiveNavItems = [].slice.call(
    document.querySelectorAll("#navbarResponsive .nav-link")
  );
  responsiveNavItems.map(function (responsiveNavItem) {
    responsiveNavItem.addEventListener("click", () => {
      if (window.getComputedStyle(navbarToggler).display !== "none") {
        navbarToggler.click();
      }
    });
  });
});
*/
