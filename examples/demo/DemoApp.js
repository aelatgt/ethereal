import AppBase from './AppBase';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
// import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { GlobalAdaptivityDemo } from './demos/GlobalAdaptivityDemo';
import { SphericalCoordinate, Q_IDENTITY, V_010, V_111 } from 'ethereal';
import * as ethereal from 'ethereal';
export class DemoApp extends AppBase {
    constructor() {
        super();
        this.ethereal = ethereal;
        this.system = ethereal.createSystem(this.camera);
        this.publicUrl = process.env.PUBLIC_URL ?? '/';
        this.gltfLoader = new GLTFLoader();
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        // gltfExporter = new GLTFExporter()
        this.room = new THREE.Object3D();
        this.demos = [];
        this.plane = new THREE.PlaneGeometry;
        this.surfaceWallA = new THREE.Mesh(this.plane);
        this.surfaceWallB = new THREE.Mesh(this.plane);
        this.surfaceWallC = new THREE.Mesh(this.plane);
        this.surfaceWallD = new THREE.Mesh(this.plane);
        this.surfaceAboveBed = new THREE.Mesh(this.plane);
        // viewTarget!: THREE.Object3D
        // belowRoomViewTarget = new THREE.Object3D()
        // roomViewTarget = new THREE.Object3D()
        this.dollyPosition = new THREE.Vector3;
        this.dollyOrientation = new THREE.Quaternion;
        this.cameraVerticalDegrees = 0;
        this.cameraHorizonalDegrees = 0;
        this.cameraDistance = 1;
        this.cameraWorldUp = false;
        this.resolution = new THREE.Vector2;
        // const dracoLoader = new DRACOLoader
        // dracoLoader.setDecoderPath(`${this.publicUrl}static/draco/`)
        // this.gltfLoader.setDRACOLoader(dracoLoader)
        // setup scene
        this.loadRoom();
        this.loadSky();
        this.setupLights();
        this.camera.rotateZ(Math.PI);
        const createRoomAdapter = () => {
            const adapter = this.system.getAdapter(this.room);
            const layout = adapter.createLayout();
            layout.orientation = Q_IDENTITY;
            layout.local.centerX = { meters: 0 };
            layout.local.centerZ = { meters: 0 };
            layout.local.bottom = { meters: 0 };
            layout.local.height = { meters: 6 };
            layout.aspect = 'preserve-3d';
            adapter.onUpdate = () => {
            };
            adapter.onLayout = () => {
            };
        };
        const createDollyAdapter = () => {
            const adapter = this.system.getAdapter(this.dolly);
            this.dolly.position.set(0, -10, 0);
            adapter.transition.duration = 1.5;
            adapter.onUpdate = () => {
                adapter.bounds.target.setFromCenterAndSize(this.dollyPosition, V_111);
                adapter.orientation.target.copy(this.dollyOrientation);
            };
        };
        const createCameraAdapter = () => {
            const adapter = this.system.getAdapter(this.camera);
            const spherical = new SphericalCoordinate;
            adapter.transition.duration = 0.2;
            adapter.onUpdate = () => {
                if (!this.xrPresenting) {
                    const dollyState = this.system.getState(this.dolly);
                    spherical.setWithDegrees(this.cameraHorizonalDegrees, this.cameraVerticalDegrees, this.cameraDistance);
                    spherical.toCartesianPosition(this.camera.position);
                    if (this.cameraWorldUp)
                        this.camera.up.set(0, 1, 0);
                    else
                        this.camera.up.set(0, 1, 0).applyQuaternion(dollyState.worldOrientation);
                    this.camera.lookAt(dollyState.worldPosition);
                }
            };
        };
        createRoomAdapter();
        createDollyAdapter();
        createCameraAdapter();
        let scrollFactor = 0;
        this.onUpdate = (event) => {
            this.resolution.set(this.renderer.domElement.width, this.renderer.domElement.height);
            if (!this.xrPresenting) {
                scrollFactor = document.body.scrollTop / document.body.clientHeight;
                cameraMovement: {
                    this.cameraHorizonalDegrees = -this.pointer.x * 80;
                    this.cameraVerticalDegrees = -this.pointer.y * 80;
                    if (scrollFactor < 0.03) {
                        this.dollyPosition.set(0, -30, 0);
                        this.dollyOrientation.setFromAxisAngle(V_010, -Math.PI / 4);
                        this.cameraVerticalDegrees = -89;
                        this.cameraWorldUp = true;
                        this.cameraDistance = 1;
                        break cameraMovement;
                    }
                    this.cameraWorldUp = false;
                    this.cameraDistance = 20;
                    if (scrollFactor > 0.03) {
                        this.dollyPosition.set(0, 2, 0);
                        this.dollyOrientation.setFromAxisAngle(V_010, Math.PI / 4);
                    }
                }
            }
            this.system.viewFrustum.setFromPerspectiveProjectionMatrix(this.camera.projectionMatrix);
            this.system.update(event.deltaTime, event.elapsedTime);
        };
        this.onEnterXR = (event) => {
            // this.treadmill.enterXR(event)
        };
        this.onExitXR = (event) => {
            // this.ui.data.xrMode = false
        };
        // add demos
        this.demos.push(new GlobalAdaptivityDemo(this));
        // this.renderer.gammaInput = true
        // this.renderer.gammaOutput = true
        this.renderer.gammaFactor = 2.2;
    }
    loadSky() {
        const path = `${this.publicUrl}static/textures/skies/space5/`;
        const format = ".jpg";
        const urls = [
            path + "px" + format, path + "nx" + format,
            path + "py" + format, path + "ny" + format,
            path + "pz" + format, path + "nz" + format
        ];
        this.sky = this.cubeTextureLoader.load(urls, (textureCube) => {
            this.scene.background = textureCube;
        });
    }
    loadRoom() {
        this.scene.add(this.room);
        this.gltfLoader.load(`${this.publicUrl}static/models/stylized_room/scene-lowpoly.gltf`, (gltf) => {
            const roomMesh = gltf.scene.children[0];
            roomMesh.material = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                // envMap: this.sky,
                // reflectivity: 0.99,
                // refractionRatio: 0.1,
                // depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
            });
            const edgeGeometry = new THREE.EdgesGeometry(roomMesh.geometry, 15);
            const lineGeometry = new LineSegmentsGeometry().setPositions(edgeGeometry.attributes.position.array);
            const lineMaterial = new LineMaterial({ color: 0x656565, linewidth: 1.5 });
            const roomLines = new LineSegments2(lineGeometry, lineMaterial);
            roomMesh.add(roomLines);
            this.room.add(gltf.scene);
            const roomLinesAdapter = this.system.getAdapter(roomLines);
            roomLinesAdapter.onUpdate = () => {
                lineMaterial.resolution = this.resolution;
            };
            const roomAdapter = this.system.nodeAdapters.get(this.room);
            roomAdapter.metrics.invalidateIntrinsicBounds();
        });
    }
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xaaaaaa, 1);
        const directionalLight = new THREE.DirectionalLight(0x88bbff, 1);
        directionalLight.position.set(1, 1, 2);
        directionalLight.target.position.copy(this.scene.position);
        this.scene.add(directionalLight);
        this.scene.add(ambientLight);
    }
}
const app = new DemoApp();
app.start().catch((e) => {
    console.error(e);
    alert(e);
});
Object.assign(window, { THREE, app });
