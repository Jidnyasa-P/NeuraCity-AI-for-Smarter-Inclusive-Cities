// ========== THREE.JS 3D CITY SIMULATION ==========

let scene, camera, renderer, buildings = [], drones = [], dataPackets = [];
let cityContainer;

function init3DCity() {
    cityContainer = document.getElementById('threejs-container');
    if (!cityContainer) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0A0F1F, 10, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / 400,
        0.1,
        1000
    );
    camera.position.set(0, 15, 35);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, 400);
    renderer.setClearColor(0x0A0F1F, 0.3);
    cityContainer.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x00D4FF, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00D4FF, 1.5, 50);
    pointLight1.position.set(10, 20, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x20E3B2, 1.5, 50);
    pointLight2.position.set(-10, 20, -10);
    scene.add(pointLight2);

    // Create city grid
    createCityBuildings();
    createFlyingDrones();
    createDataPackets();
    createGround();

    // Animation loop
    animate3DCity();

    // Handle window resize
    window.addEventListener('resize', onWindowResize3D);
}

function createCityBuildings() {
    const buildingPositions = [
        { x: -15, z: -10, height: 8, color: 0x00D4FF },
        { x: -10, z: -8, height: 12, color: 0x20E3B2 },
        { x: -5, z: -12, height: 6, color: 0x00D4FF },
        { x: 0, z: -10, height: 15, color: 0x8B5CF6 },
        { x: 5, z: -11, height: 10, color: 0x20E3B2 },
        { x: 10, z: -9, height: 7, color: 0x00D4FF },
        { x: 15, z: -13, height: 9, color: 0x20E3B2 },
        { x: -12, z: 5, height: 11, color: 0x8B5CF6 },
        { x: -6, z: 6, height: 8, color: 0x00D4FF },
        { x: 0, z: 8, height: 13, color: 0x20E3B2 },
        { x: 7, z: 7, height: 9, color: 0x00D4FF },
        { x: 13, z: 5, height: 6, color: 0x8B5CF6 },
    ];

    buildingPositions.forEach((pos, index) => {
        // Building body
        const geometry = new THREE.BoxGeometry(2, pos.height, 2);
        const material = new THREE.MeshStandardMaterial({
            color: pos.color,
            emissive: pos.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.85
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.set(pos.x, pos.height / 2, pos.z);
        building.castShadow = true;
        building.userData.originalColor = pos.color;
        building.userData.pulseOffset = index * 0.5;

        scene.add(building);
        buildings.push(building);

        // Building edges (wireframe glow)
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.6
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        building.add(wireframe);

        // Windows (small glowing lights)
        for (let i = 0; i < 3; i++) {
            const windowGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
            const windowMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: Math.random() > 0.5 ? 0.8 : 0.3
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(
                Math.random() * 1.5 - 0.75,
                (i - 1) * (pos.height / 4),
                1.1
            );
            building.add(window);
        }
    });
}

function createFlyingDrones() {
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.9
        });

        const drone = new THREE.Mesh(geometry, material);
        drone.position.set(
            Math.random() * 30 - 15,
            Math.random() * 10 + 10,
            Math.random() * 20 - 10
        );

        // Add glow
        const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        drone.add(glow);

        drone.userData.speed = 0.01 + Math.random() * 0.02;
        drone.userData.angle = Math.random() * Math.PI * 2;
        drone.userData.radius = 8 + Math.random() * 7;

        scene.add(drone);
        drones.push(drone);
    }
}

function createDataPackets() {
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.OctahedronGeometry(0.2);
        const material = new THREE.MeshBasicMaterial({
            color: 0x20E3B2,
            transparent: true,
            opacity: 0.7
        });

        const packet = new THREE.Mesh(geometry, material);
        packet.position.set(
            Math.random() * 25 - 12.5,
            Math.random() * 15 + 5,
            Math.random() * 20 - 10
        );

        packet.userData.velocity = {
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.03,
            z: (Math.random() - 0.5) * 0.05
        };

        scene.add(packet);
        dataPackets.push(packet);
    }
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(60, 60);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x0A0F1F,
        transparent: true,
        opacity: 0.3
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Grid lines
    const gridHelper = new THREE.GridHelper(60, 30, 0x00D4FF, 0x00D4FF);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

function animate3DCity() {
    requestAnimationFrame(animate3DCity);

    const time = Date.now() * 0.001;

    // Animate building pulses
    buildings.forEach((building, index) => {
        const pulse = Math.sin(time * 2 + building.userData.pulseOffset) * 0.5 + 0.5;
        building.material.emissiveIntensity = 0.2 + pulse * 0.3;
    });

    // Animate drones orbiting
    drones.forEach(drone => {
        drone.userData.angle += drone.userData.speed;
        drone.position.x = Math.cos(drone.userData.angle) * drone.userData.radius;
        drone.position.z = Math.sin(drone.userData.angle) * drone.userData.radius;
        drone.rotation.y += 0.05;
    });

    // Animate data packets
    dataPackets.forEach(packet => {
        packet.position.x += packet.userData.velocity.x;
        packet.position.y += packet.userData.velocity.y;
        packet.position.z += packet.userData.velocity.z;

        // Bounce back if out of bounds
        if (Math.abs(packet.position.x) > 15) packet.userData.velocity.x *= -1;
        if (packet.position.y > 20 || packet.position.y < 5) packet.userData.velocity.y *= -1;
        if (Math.abs(packet.position.z) > 15) packet.userData.velocity.z *= -1;

        packet.rotation.x += 0.02;
        packet.rotation.y += 0.03;
    });

    // Gentle camera rotation
    camera.position.x = Math.sin(time * 0.1) * 2;
    camera.lookAt(0, 5, 0);

    renderer.render(scene, camera);
}

function onWindowResize3D() {
    if (!cityContainer) return;
    camera.aspect = window.innerWidth / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, 400);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init3DCity, 500);
    });
} else {
    setTimeout(init3DCity, 500);
}
