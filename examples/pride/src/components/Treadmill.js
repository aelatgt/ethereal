import * as THREE from 'three';
import * as CANNON from 'cannon';
import CreateSTLLoader from 'three-stl-loader';
const STLLoader = CreateSTLLoader({ ...THREE });
import AdaptiveProperty from '../lib/AdaptiveProperty';
// import {SpatialMetrics, SimplifiedHull} from '../lib/SpatialMetrics'
// import {quaternions, V_001} from '../lib/SpatialUtils'
// import {SpatialLayout} from '../lib/SpatialLayout'
// import KinematicMetrics from '../lib/KinematicMetrics'
import { makeTextSprite } from '../lib/label-utils';
export default class Treadmill {
    constructor(app) {
        this.app = app;
        this.snubberObject = new THREE.Object3D;
        this._snubberRoot = new THREE.Object3D;
        this.grid = new THREE.GridHelper(1, 10);
        // cameraMetrics = SpatialMetrics.get(this.app.camera)
        // annotationViewpoint = new THREE.Camera
        // annotationViewpointMetrics = SpatialMetrics.get(this.annotationViewpoint)
        // cameraTargetKinematics = new KinematicMetrics(this.app.camera, this.snubberObject)
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffa500,
            depthTest: false,
        });
        this._scratchMatrix = new THREE.Matrix4;
        this.annotations = [
            {
                text: 'TEST',
                anchorPoint: [0, 0, 0],
            },
            {
                text: 'Part A',
                anchorPoint: [-0.18, 0.06, 0.09],
            },
            {
                text: 'Part B',
                anchorPoint: [0.05, 0.05, 0.12],
            },
            {
                text: 'Part C',
                anchorPoint: [-0.1, 0.05, 0.11],
            },
            {
                text: 'Part D',
                anchorPoint: [0.14, -0.22, -0.06],
            },
            {
                text: 'Part E',
                anchorPoint: [0.11, 0, 0.1],
            },
            {
                text: 'Part F',
                anchorPoint: [-0.06, -0.04, 0.02],
            },
        ];
        this.annotationState = new Map;
        // facing = new AdaptiveProperty({
        //     metric: () => this.cameraMetrics.getVisualOffsetOf(this.snubberObject),
        //     zones: [
        //         {state: 'true', threshold: 12, delay: 100},
        //         60,
        //         {state: 'false', threshold: 12, delay: 100},
        //     ],
        // })
        // visualSize = new AdaptiveProperty({
        //     metric: () => this.cameraMetrics.getVisualFrustumOf(this.snubberObject).diagonal,
        //     zones: [
        //         {state: 'small', threshold: 20, delay: 100},
        //         20,
        //         {state: 'medium', threshold: 20, delay: 100},
        //         45,
        //         {state: 'large', threshold: 20, delay: 100},
        //     ],
        // })
        // annotationOcclusions = new AdaptiveProperty({
        //     metric: () => this.physicsWorld.contacts.length,
        //     zones: [
        //         {state: 'few', threshold: 0, delay: 100},
        //         this.annotations.length,
        //         {state: 'many', threshold: 0, delay: 100},
        //     ],
        // })
        // cameraLinearSpeed = new AdaptiveProperty({
        //     metric: () => this.cameraTargetKinematics.linearSpeed,
        //     zones: [
        //         {state: 'still', threshold: 0.05, delay: 400},
        //         0.15,
        //         {state: 'moving', threshold: 0.01, delay: 100},
        //     ],
        // })
        // cameraAngularSpeed = new AdaptiveProperty({
        //     metric: () => this.cameraTargetKinematics.angularSpeed,
        //     zones: [
        //         {state: 'still', threshold: 1, delay: 400},
        //         30,
        //         {state: 'moving', threshold: 1, delay: 100},
        //     ],
        // })
        this.state = new AdaptiveProperty.CompositeState(this);
        this.stlLoader = new STLLoader();
        this.physicsWorld = new CANNON.World;
        this.CENTRAL_REPULSION_FORCE = 20;
        this.VIEW_DEPENDENT_REPULSION_FORCE = 40;
        this.ANNOTATION_REPULSION_FACTOR = 0.4;
        this.VIEW_DEPENDENT_ANNOTATION_REPULSION_FACTOR = 0.5;
        this._force = new CANNON.Vec3;
        this._cameraWorldPosition = new THREE.Vector3;
        this._directionA = new THREE.Vector3;
        this._directionB = new THREE.Vector3;
        this.snubberTargetPosition = new THREE.Vector3(); //.set(0,0,-1)
        // this.annotationViewpoint.position.set(0, 0, 2)
        this.snubberObject.add(this._snubberRoot);
        // this._snubberRoot.add(this.annotationViewpoint)
        this._snubberRoot.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
        this._snubberRoot.scale.setScalar(0.01);
        this.snubberObject.name = 'snubber';
        // this.annotationViewpoint.name = 'annotationViewpoint'
        // this.grid.rotateX(Math.PI / 2)
        // this.snubberObject.add(this.grid)
        this.snubberMeshPromise = new Promise((resolve) => {
            this.stlLoader.load('./static/fullSnubberSimplified.stl', (snubberGeometry) => {
                snubberGeometry.computeBoundsTree();
                const snubberMaterial = new THREE.MeshNormalMaterial();
                const snubberMesh = new THREE.Mesh(snubberGeometry, snubberMaterial);
                this.snubberMesh = snubberMesh;
                this.snubberMesh.scale.setScalar(0.01);
                // this.snubberMesh.rotateZ(Math.PI)
                this._snubberRoot.add(snubberMesh);
                // const hull = SimplifiedHull.get(snubberMesh.geometry)
                // const hullMesh = new THREE.Mesh(hull, new THREE.MeshBasicMaterial({
                //     color: 0xF3A2B0,
                //     wireframe: true
                // }))
                // hullMesh.layoutIgnore = true
                // this.snubberMesh.add(hullMesh)
                resolve(snubberMesh);
            });
        });
        // Create a physics bodies for each annotation
        for (const annotation of this.annotations) {
            const annotationObject = new THREE.Object3D();
            const contentObject = makeTextSprite(annotation.text, { pixelRatio: window.devicePixelRatio / 2 });
            annotationObject.add(contentObject);
            const anchorObject = new THREE.Object3D();
            anchorObject.position.set(...annotation.anchorPoint);
            anchorObject.add(new THREE.Mesh(new THREE.SphereGeometry(0.005)));
            this._snubberRoot.add(anchorObject);
            // this.snubberObject.add(annotationObject)
            // anchorObject.layout.forceBoundsExclusion = true
            // annotationObject.layout.forceBoundsExclusion = true
            const canvas = contentObject.material.map.image;
            const anchorBody = new CANNON.Body({
                mass: 0,
                position: new CANNON.Vec3(0, 0, 0).set(...annotation.anchorPoint),
            });
            anchorBody.collisionResponse = false;
            const annotationBody = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(0, 0, 0).set(...annotation.anchorPoint),
                shape: new CANNON.Box(new CANNON.Vec3(canvas.width * 0.01, canvas.height * 0.01, 1)),
                linearDamping: 1,
                angularDamping: 1,
            });
            annotationBody.collisionResponse = false;
            this.physicsWorld.addBody(anchorBody);
            this.physicsWorld.addBody(annotationBody);
            const spring = new CANNON.Spring(anchorBody, annotationBody, {
                restLength: 0.15,
                stiffness: 200,
                damping: 1,
            });
            const lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3);
            lineGeometry.vertices.push(new THREE.Vector3);
            const lineMaterial = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff, linewidth: 3 });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            lineMaterial.depthWrite = false;
            line.frustumCulled = false;
            this.app.scene.add(line);
            const lineGeometry2 = new THREE.Geometry();
            lineGeometry2.vertices.push(new THREE.Vector3);
            lineGeometry2.vertices.push(new THREE.Vector3);
            const lineMaterial2 = lineMaterial.clone();
            const lineDepthWriting = new THREE.Line(lineGeometry2, lineMaterial2);
            lineMaterial2.depthWrite = true;
            lineDepthWriting.frustumCulled = false;
            this.app.scene.add(lineDepthWriting);
            this.annotationState.set(annotation, {
                spring,
                anchorBody,
                annotationBody,
                anchorObject,
                contentObject,
                annotationObject,
                lineDepthWriting,
                line,
            });
        }
        this.initDefault();
    }
    initDefault() {
        this.snubberTargetPosition.set(0, 0, -1);
        //.setScalar(0)
        // this.treadmillObject.position.set(0,0,-1)
        // this.treadmillObject.rotateZ(Math.PI)
    }
    async enterXR(evt) {
        const { session, vuforia } = this.app;
        if (!session || !vuforia) {
            this.initDefault();
            return;
        }
        if (session)
            session.addEventListener('end', () => {
                this.initDefault();
            });
        // const dataSetId = await vuforia.fetchDataSet('/Treadmill.xml')
        // const trackables = await vuforia.loadDataSet(dataSetId)
        const dataSetId = await vuforia.fetchDataSet('/Treadmill.xml');
        const trackables = await vuforia.loadDataSet(dataSetId);
        const treadmillAnchor = trackables.get('treadmill');
        this.treadmillAnchorObject = this.app.getXRObject3D(treadmillAnchor);
        this.snubberTargetPosition.set(0.033, -0.062, 0.018);
        // Add a box to the trackable image
        const imageSize = treadmillAnchor.size;
        const box = new THREE.Mesh(new THREE.BoxGeometry(imageSize.x, imageSize.y, 0.001), new THREE.MeshPhongMaterial({
            color: '#DDFFDD',
            opacity: 0.5,
            transparent: true,
        }));
        box.visible = false;
        this.treadmillAnchorObject.add(box);
        const treadmillImage = new THREE.Object3D;
        treadmillImage.add(this.snubberObject);
        treadmillImage.scale.setScalar(imageSize.y / 2);
        this.treadmillAnchorObject.add(treadmillImage);
        // treadmillImage.add(this._snubberRoot)
        // this._snubberRoot.position.set(0.33, -0.92, 0.18)
        vuforia.activateDataSet(dataSetId);
    }
    update(event) {
        // this.updateAnnotations(event.deltaTime)
        // this.cameraTargetKinematics.update(event.deltaTime)
        // this.state.update(event.deltaTime)
        // if (this.facing.changedTo('false')) {
        //     console.log('facing: false')
        // }
        // if (this.facing.changedTo('true')) {
        //     console.log('facing: true')
        // }
        // if (this.visualSize.changedTo('small')) {
        //     console.log('visualSize: small')
        // }
        // if (this.visualSize.changedTo('medium')) {
        //     console.log('visualSize: medium')
        // }
        // if (this.visualSize.changedTo('large')) {
        //     console.log('visualSize: large')
        // }
        // if (this.cameraLinearSpeed.changedTo('still')) {
        //     console.log(`linear speed: still`)
        // }
        // if (this.cameraAngularSpeed.changedTo('still')) {
        //     console.log(`angular speed: still`)
        // }
        // if (this.cameraLinearSpeed.changedTo('moving')) {
        //     console.log(`linear speed: moving`)
        // }
        // if (this.cameraAngularSpeed.changedTo('moving')) {
        //     console.log(`angular speed: moving`)
        // }
        // // if (this.state.changingTo({cameraLinearSpeed: 'still', cameraAngularSpeed: 'still'})) {
        //     // console.log(`total speed: still`)
        //     this._snubberRoot.updateMatrixWorld(false)
        //     const worldToTargetSpace = this._scratchMatrix.getInverse(this._snubberRoot.matrixWorld)
        //     this.annotationViewpoint.copy(this.app.camera, false)
        //     this.annotationViewpoint.applyMatrix(worldToTargetSpace)
        // // }
    }
}
