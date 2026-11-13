
import * as THREE from "three";

// ========================================
// CYBER WITH DARK - 3D CITY ENVIRONMENT
// ========================================

const container = document.getElementById("scene-container");
const fallback = document.getElementById("scene-fallback");

let renderer;
let scene;
let camera;
let character;
let animationId;

const clock = new THREE.Clock();
const pointer = new THREE.Vector2(0, 0);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ========================================
// INITIALIZE THREE.JS
// ========================================

function initializeScene() {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#111c30");
    scene.fog = new THREE.FogExp2("#111c30", 0.018);

    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      180
    );

    camera.position.set(0, 5.2, 13);
    camera.lookAt(0, 1, -5);

    renderer = new THREE.WebGLRenderer({
      antialias: window.innerWidth < 1200,
      alpha: false
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    createLighting();
    createGround();
    createRoad();
    createBuildings();
    createStreetLights();
    createCharacter();
    createAtmosphere();

    window.addEventListener("resize", resizeScene);
    window.addEventListener("pointermove", movePointer);

    animate();
  } catch (error) {
    console.error("3D scene initialization failed:", error);
    fallback.hidden = false;
  }
}

// ========================================
// LIGHTING
// ========================================

function createLighting() {
  const ambient = new THREE.HemisphereLight(
    "#9dcaff",
    "#101525",
    2.0
  );

  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(
    "#8bbaff",
    2.2
  );

  moonLight.position.set(-8, 15, 8);
  scene.add(moonLight);

  const cyanLight = new THREE.PointLight(
    "#00d9ff",
    35,
    35
  );

  cyanLight.position.set(0, 5, -8);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(
    "#6d52ff",
    24,
    30
  );

  purpleLight.position.set(8, 5, -18);
  scene.add(purpleLight);
}

// ========================================
// GROUND
// ========================================

function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(150, 150);

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: "#111a2b",
    roughness: 0.85,
    metalness: 0.15
  });

  const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.position.z = -35;

  scene.add(ground);
}

// ========================================
// ROAD
// ========================================

function createRoad() {
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 140),
    new THREE.MeshStandardMaterial({
      color: "#202b3b",
      roughness: 0.75,
      metalness: 0.2
    })
  );

  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -45);
  scene.add(road);

  // Road edge strips
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: "#00bce8"
  });

  [-5, 5].forEach((x) => {
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.04, 140),
      edgeMaterial
    );

    edge.position.set(x, 0.035, -45);
    scene.add(edge);
  });

  // Dashed road markings
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: "#8aa4bd"
  });

  for (let z = 8; z > -110; z -= 7) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.025, 3),
      lineMaterial
    );

    marker.position.set(0, 0.025, z);
    scene.add(marker);
  }

  // Sidewalks
  const sidewalkMaterial = new THREE.MeshStandardMaterial({
    color: "#26354a",
    roughness: 0.9
  });

  [-6.5, 6.5].forEach((x) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.25, 140),
      sidewalkMaterial
    );

    sidewalk.position.set(x, 0, -45);
    scene.add(sidewalk);
  });
}

// ========================================
// CITY BUILDINGS
// ========================================

function createBuildings() {
  const buildingColors = [
    "#18273b",
    "#1b2d42",
    "#202b43",
    "#17243a",
    "#25324a"
  ];

  const buildingMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.25
  });

  const windowMaterial = new THREE.MeshBasicMaterial({
    color: "#00c9ee"
  });

  for (let z = 5; z >= -105; z -= 11) {
    [-1, 1].forEach((side) => {
      const width = 4 + Math.random() * 4;
      const height = 7 + Math.random() * 16;
      const depth = 5 + Math.random() * 5;
      const x = side * (9 + Math.random() * 4);

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        buildingMaterial.clone()
      );

      building.material.color.set(
        buildingColors[
          Math.floor(Math.random() * buildingColors.length)
        ]
      );

      building.position.set(
        x,
        height / 2,
        z + (Math.random() - 0.5) * 3
      );

      scene.add(building);

      // Cyan windows facing the road
      const facadeX = x - side * (width / 2 + 0.045);

      for (let y = 1.4; y < height - 0.8; y += 2.2) {
        for (let windowZ = -depth / 2 + 0.8;
          windowZ < depth / 2;
          windowZ += 1.5) {

          if (Math.random() > 0.65) continue;

          const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.65, 0.55),
            windowMaterial
          );

          windowMesh.position.set(
            facadeX,
            y,
            building.position.z + windowZ
          );

          scene.add(windowMesh);
        }
      }

      // Rooftop beacon
      if (Math.random() > 0.5) {
        const beacon = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.6, 0.13),
          new THREE.MeshBasicMaterial({
            color: "#00d9ff"
          })
        );

        beacon.position.set(x, height + 0.3, building.position.z);
        scene.add(beacon);
      }
    });
  }
}

// ========================================
// STREET LIGHTS
// ========================================

function createStreetLights() {
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: "#53647a",
    metalness: 0.8,
    roughness: 0.35
  });

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: "#00d9ff"
  });

  for (let z = 4; z >= -100; z -= 16) {
    [-1, 1].forEach((side) => {
      const x = side * 5.7;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.08, 5, 8),
        poleMaterial
      );

      pole.position.set(x, 2.5, z);
      scene.add(pole);

      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.1, 0.35),
        glowMaterial
      );

      lamp.position.set(x, 5, z);
      scene.add(lamp);

      const light = new THREE.PointLight(
        "#00bce8",
        12,
        12
      );

      light.position.set(x, 4.6, z);
      scene.add(light);
    });
  }
}

// ========================================
// 3D WALKING CHARACTER
// ========================================

function createCharacter() {
  character = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: "#142b45",
    roughness: 0.5,
    metalness: 0.25
  });

  const cyanMaterial = new THREE.MeshStandardMaterial({
    color: "#00d9ff",
    emissive: "#006b88",
    emissiveIntensity: 1.5
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: "#101725",
    roughness: 0.7
  });

  // Torso
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.95, 0.45),
    bodyMaterial
  );

  torso.position.y = 1.2;
  character.add(torso);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 20, 20),
    darkMaterial
  );

  head.position.y = 1.94;
  character.add(head);

  // Cyan visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.39, 0.1, 0.34),
    cyanMaterial
  );

  visor.position.set(0, 1.99, 0.22);
  character.add(visor);

  // Backpack
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.65, 0.22),
    darkMaterial
  );

  backpack.position.set(0, 1.25, -0.3);
  character.add(backpack);

  // Arms
  const armGeometry = new THREE.BoxGeometry(0.23, 0.72, 0.25);

  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();

  const leftArmMesh = new THREE.Mesh(armGeometry, bodyMaterial);
  const rightArmMesh = new THREE.Mesh(armGeometry, bodyMaterial);

  leftArmMesh.position.y = -0.35;
  rightArmMesh.position.y = -0.35;

  leftArm.add(leftArmMesh);
  rightArm.add(rightArmMesh);

  leftArm.position.set(-0.52, 1.55, 0);
  rightArm.position.set(0.52, 1.55, 0);

  character.add(leftArm, rightArm);

  // Legs
  const legGeometry = new THREE.BoxGeometry(0.28, 0.8, 0.3);

  const leftLeg = new THREE.Group();
  const rightLeg = new THREE.Group();

  const leftLegMesh = new THREE.Mesh(legGeometry, darkMaterial);
  const rightLegMesh = new THREE.Mesh(legGeometry, darkMaterial);

  leftLegMesh.position.y = -0.4;
  rightLegMesh.position.y = -0.4;

  leftLeg.add(leftLegMesh);
  rightLeg.add(rightLegMesh);

  leftLeg.position.set(-0.22, 0.75, 0);
  rightLeg.position.set(0.22, 0.75, 0);

  character.add(leftLeg, rightLeg);

  character.userData.limbs = {
    leftArm,
    rightArm,
    leftLeg,
    rightLeg
  };

  character.position.set(0, 0, 2);
  scene.add(character);
}

// ========================================
// ATMOSPHERE
// ========================================

function createAtmosphere() {
  const starGeometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 450; i++) {
    positions.push(
      (Math.random() - 0.5) * 90,
      5 + Math.random() * 30,
      -Math.random() * 100
    );
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: "#9bdfff",
      size: 0.12,
      transparent: true,
      opacity: 0.7
    })
  );

  scene.add(stars);
}

// ========================================
// POINTER MOVEMENT
// ========================================

function movePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}

// ========================================
// CAMERA RESIZE
// ========================================

function resizeScene() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

// ========================================
// ANIMATION LOOP
// ========================================

function animate() {
  animationId = requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const time = reducedMotion ? 0 : elapsed;

  // Walking animation
  if (character && !reducedMotion) {
    const limbs = character.userData.limbs;
    const walk = Math.sin(time * 3.2) * 0.38;

    limbs.leftLeg.rotation.x = walk;
    limbs.rightLeg.rotation.x = -walk;

    limbs.leftArm.rotation.x = -walk * 0.65;
    limbs.rightArm.rotation.x = walk * 0.65;

    character.position.y = Math.abs(Math.sin(time * 6.4)) * 0.025;
  }

  // Subtle camera movement
  if (!reducedMotion) {
    camera.position.x +=
      (pointer.x * 0.8 - camera.position.x * 0.02) * 0.015;

    camera.position.y +=
      (5.2 + pointer.y * -0.35 - camera.position.y) * 0.015;
  }

  // Slight movement when the visitor scrolls
  const scrollProgress = Math.min(
    window.scrollY / Math.max(
      document.body.scrollHeight - window.innerHeight,
      1
    ),
    1
  );

  camera.position.z = 13 - scrollProgress * 5;
  camera.lookAt(0, 1, -5 - scrollProgress * 12);

  renderer.render(scene, camera);
}

// ========================================
// MOBILE NAVIGATION
// ========================================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// ========================================
// START
// ========================================

initializeScene();
