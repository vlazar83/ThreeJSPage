/*!
 * Start Bootstrap - Grayscale v7.0.1 (https://startbootstrap.com/theme/grayscale)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
 */
//
// Scripts
//

function runAnimation() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  //Load background texture
  const loaderTexture = new THREE.TextureLoader();
  loaderTexture.load("./model/background.jpeg", function (texture) {
    scene.background = texture;
  });

  var loader = new THREE.GLTFLoader();

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  var model = null;
  //scene.add(cube);

  loader.load(
    "./model/scene.gltf",
    function (gltf) {
      model = gltf.scene.children[0];
      model.receiveShadow = false; //default
      scene.add(model);
      console.log("thiss", model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  camera.position.set(0, 0, 20);

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  light.position.set(100, 10, 0);
  light.castShadow = false; // default false
  scene.add(light);
  scene.background = new THREE.Color(0xffffff);

  scene.traverse(function (child) {
    if (child.material) {
      child.material.needsUpdate = true;
    }
  });

  const animate = function () {
    requestAnimationFrame(animate);

    model.rotation.x += 0.01;
    model.rotation.y += 0.01;
    model.rotation.z += 0.01;

    renderer.render(scene, camera);
  };

  function updateCamera(ev) {
    let div1 = document.getElementById("div1");
    camera.position.x = 20 - window.scrollY / 400.0;
    camera.position.z = 20 - window.scrollY / 400.0;
  }

  window.addEventListener("scroll", updateCamera);

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
