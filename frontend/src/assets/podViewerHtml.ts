// Embedded Three.js pod viewer — used as WebView source={{ html: POD_VIEWER_HTML }}
export const POD_VIEWER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>Pod Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f172a; overflow: hidden; }
    canvas { display: block; width: 100vw; height: 100vh; }
    #label {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.55);
      font-family: -apple-system, sans-serif;
      font-size: 12px;
      pointer-events: none;
      text-align: center;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div id="label">Tap a zone to see stats</div>

  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
      }
    }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 15, 30);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5, 6, 8);
    camera.lookAt(0, 0, 0);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x4fc3f7, 1.5, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // ── Helper: create a named box mesh ────────────────────────────────────
    function makeBox(name, w, h, d, color, x, y, z) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 })
      );
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

    // ── Floor ──────────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Walls (semi-transparent, non-interactive) ──────────────────────────
    [
      [8, 3, 0.1,  0, 1.5, -4, 0],
      [0.1, 3, 8, -4, 1.5,  0, 0],
      [0.1, 3, 8,  4, 1.5,  0, 0],
    ].forEach(([w, h, d, x, y, z]) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.8, transparent: true, opacity: 0.45 })
      );
      m.position.set(x, y, z);
      m.receiveShadow = true;
      scene.add(m);
    });

    // Grid
    const grid = new THREE.GridHelper(8, 16, 0x1e3a5f, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // ── Interactive Zones ──────────────────────────────────────────────────
    const interactiveMeshes = [];

    // Desk (blue)
    interactiveMeshes.push(makeBox('desk', 2.5, 0.12, 1.2, 0x2563eb, -1.5, 0.7, -1.5));
    ['','',' ',' '].forEach(() => {}); // legs
    makeBox('desk', 0.1, 0.7, 0.1, 0x1e40af, -2.6, 0.35, -2.0);
    makeBox('desk', 0.1, 0.7, 0.1, 0x1e40af, -0.4, 0.35, -2.0);
    makeBox('desk', 0.1, 0.7, 0.1, 0x1e40af, -2.6, 0.35, -1.0);
    makeBox('desk', 0.1, 0.7, 0.1, 0x1e40af, -0.4, 0.35, -1.0);
    interactiveMeshes.push(makeBox('desk', 0.08, 0.8, 0.6, 0x0f172a, -1.5, 1.2, -1.9)); // monitor

    // Meeting Table (green)
    interactiveMeshes.push(makeBox('meeting_table', 2.8, 0.1, 1.6, 0x059669, 1.0, 0.6, 0.5));
    makeBox('meeting_table', 0.6, 0.06, 0.6, 0x065f46, 0.2, 0.45, 1.6);
    makeBox('meeting_table', 0.6, 0.06, 0.6, 0x065f46, 1.0, 0.45, 1.6);
    makeBox('meeting_table', 0.6, 0.06, 0.6, 0x065f46, 1.8, 0.45, 1.6);
    makeBox('meeting_table', 0.6, 0.06, 0.6, 0x065f46, 1.0, 0.45, -0.6);

    // Lighting panel (yellow, ceiling)
    interactiveMeshes.push(makeBox('lighting', 1.5, 0.08, 1.5, 0xf59e0b, 0, 2.9, -2));
    const glowLight = new THREE.PointLight(0xfef3c7, 0.8, 4);
    glowLight.position.set(0, 2.7, -2);
    scene.add(glowLight);

    // Fan / AC (cyan, wall-mounted)
    interactiveMeshes.push(makeBox('fan', 0.9, 0.5, 0.2, 0x0891b2, 3.0, 2.4, -2.5));
    makeBox('fan', 0.6, 0.04, 0.04, 0x0e7490, 3.0, 2.4, -2.3);
    makeBox('fan', 0.04, 0.6, 0.04, 0x0e7490, 3.0, 2.4, -2.3);

    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0.5, 0);

    // ── Raycaster & tap handling ───────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let selectedMesh = null;

    function onTap(clientX, clientY) {
      pointer.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length === 0) return;

      const hit = hits[0].object;
      if (selectedMesh) {
        selectedMesh.material.emissive.set(0x000000);
        selectedMesh.material.emissiveIntensity = 0;
      }
      hit.material.emissive.set(0xffffff);
      hit.material.emissiveIntensity = 0.18;
      selectedMesh = hit;

      document.getElementById('label').textContent =
        hit.name.replace('_', ' ').toUpperCase();

      const msg = JSON.stringify({ area: hit.name });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(msg);
      }
    }

    renderer.domElement.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        onTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: true });

    renderer.domElement.addEventListener('click', (e) => onTap(e.clientX, e.clientY));

    // ── Resize ─────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Render loop ────────────────────────────────────────────────────────
    (function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();
  </script>
</body>
</html>`;
