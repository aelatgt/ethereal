import{S as e,e as t,O as s,P as i,W as n,C as a,I as r,E as o,R as h,N as c,f as d,g as l,h as m,B as p,i as u,j as g,V as y,k as w,D as x,l as f,m as v,n as E,M as b,q as P,r as L,T as R,G as S,s as M,u as T,Q as A,v as O,x as z,L as U,y as j,z as D,A as W,F as X}from"./vendor.js";import{W as I,V as C,e as F,c as k,a as _,Q as H,b as B,S as V}from"./ethereal.js";window.addEventListener("vrdisplayconnect",(e=>{e.display}),!1);var Y=new e;Y.showPanel(1),document.body.appendChild(Y.dom);class q extends class{constructor(){this.container=new s,this.view=new s}}{constructor(e){super(),this.app=e,this.orientedContainerTop=new s,this.logoLayer=new I(`\n        <div id="logo" class=${f({display:"inline",color:"rgb(180,120,250)",font:'400 100px/1.3 "Berkshire Swash"',textShadow:"3px 3px 0 #000,\n                        -1px -1px 0 #000,  \n                        1px -1px 0 #000,\n                        -1px 1px 0 #000,\n                        1px 1px 0 #000"})}>ethereal.js</div>\n    `),this.infoLayer=new I(`\n        <div id="info" class=${f({display:"inline",color:"white",fontSize:"20px",textShadow:"3px 3px 0 #000,\n                        -1px -1px 0 #000,  \n                        1px -1px 0 #000,\n                        -1px 1px 0 #000,\n                        1px 1px 0 #000"})}></div>\n    `,{pixelRatio:1}),this.logoOccluders=[],this._euler=new v,this.currentInfoText="";const t=t=>{const s=new L,i=new L(1,1,1),n=Math.random(),a=Math.random()-.5,r=Math.random()-.5,o=Math.random()-.5;let h=0;const c=new L(7*(.5-Math.random()),7*(.5-Math.random()),7*(.5-Math.random()));t.position.copy(c);const d=e.system.getAdapter(t);d.onUpdate=()=>{h+=d.system.deltaTime*n,s.x=a*Math.sin(h),s.y=r*Math.sin(h),s.z=o*Math.cos(h),s.multiplyScalar(5),s.add(c),d.bounds.target.setFromCenterAndSize(s,i)}},i=new E;for(let s=0;s<10;s++){const e=new b(i);this.container.add(e),this.logoOccluders.push(e),t(e)}(()=>{this.container.add(this.orientedContainerTop);const t=e.system.getAdapter(this.orientedContainerTop),s=t.createLayout();s.local.centerX={meters:0},s.local.centerZ={meters:0},s.local.centerY={percent:50},t.onUpdate=()=>{s.orientation=e.system.getState(this.container).viewAlignedOrientation}})();(()=>{const t=this.logoLayer;t.contentMesh.material.side=P,this.container.add(t);const s=e.system.getAdapter(t);s.transition.duration=.8,s.transition.delay=.4,s.transition.debounce=.2;const i=s.createLayout();i.local.left={gt:{percent:-50}},i.local.right={lt:{percent:50}},i.local.bottom={percent:50,meters:1},i.local.bottom={percent:50,meters:1},i.local.centerZ=[{percent:-50},{percent:50}],i.visual.diagonal={gt:{degrees:5}},i.aspect="preserve-3d",i.visual.left={gt:{percent:-50}},i.visual.right={lt:{percent:50}},i.visual.bottom={gt:{percent:-50}},i.visual.top={lt:{percent:50}},i.objectives.unshift({evaluate:e=>0-(e.occludingPercent+e.occludedPercent)**4}),s.onUpdate=()=>{i.orientation=e.system.getState(this.container).viewAlignedOrientation,t.update()},s.bounds.start.setFromCenterAndSize(C,C)})()}}const Z=new class extends class{constructor(){this.scene=new t,this.dolly=new s,this.camera=new i,this.renderer=new n({antialias:!1,alpha:!0,logarithmicDepthBuffer:!0}),this.clock=new a,this.imageLoader=new r,this.composer=new o(this.renderer),this.renderPass=new h(this.scene,this.camera),this.normalPass=new c(this.scene,this.camera,{resolutionScale:1}),this.areaImage=this.imageLoader.load(d.areaImageDataURL),this.searchImage=this.imageLoader.load(d.searchImageDataURL),this.smaaEffect=new d(this.searchImage,this.areaImage,l.ULTRA),this.ssaoEffect=new m(this.camera,this.normalPass.renderTarget.texture,{blendFunction:p.MULTIPLY,samples:11,rings:4,distanceThreshold:0,distanceFalloff:1,rangeThreshold:0,rangeFalloff:1,luminanceInfluence:.2,radius:18,scale:.6,bias:.8}),this.bloomEffect=new u,this.effectPass=new g(this.camera,this.smaaEffect,this.ssaoEffect),this.pointer=new y,this.raycaster=new w,this.xrObjects=new Map,this.loaded=new Promise((e=>{x.onLoad=()=>{e()}})),this.webLayers=new Set,this.animate=()=>{if(Y.begin(),!this.xrPresenting){const e=this.renderer.domElement;this._setSize(e.clientWidth,e.clientHeight,.6*window.devicePixelRatio)}const e=Math.min(this.clock.getDelta(),1/60);this.update(e),this.composer.render(e),Y.end()},this._wasPresenting=!1,this.update=e=>{if(this.xrPresenting){this._wasPresenting=!0;const e=this.renderer.xr.getCamera(this.camera).cameras[0];this.camera.matrix.identity(),this.camera.applyMatrix4(e.matrix),this.camera.projectionMatrix.copy(e.projectionMatrix),this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix),this.camera.updateMatrixWorld(!0)}else{this._wasPresenting&&(this._wasPresenting=!1,this._exitXR());const e=this.renderer.domElement,t=e.clientWidth/e.clientHeight;this.camera.aspect=t,this.camera.near=.001,this.camera.far=1e5,this.camera.updateProjectionMatrix()}if(this.session)for(const t of this.xrObjects.values()){const e=t.xrCoordinateSystem,s=e.getTransformTo(this.frameOfReference);s?(t.matrixAutoUpdate=!1,t.matrix.fromArray(s),t.updateMatrixWorld(!0),t.parent!==this.scene&&(this.scene.add(t),console.log("added xrObject "+e.uid||""))):t.parent&&(this.scene.remove(t),console.log("removed xrObject "+e.uid||""))}this.raycaster.setFromCamera(this.pointer,this.camera),this.clock.elapsedTime,this.onUpdate({type:"update",deltaTime:e,elapsedTime:this.clock.elapsedTime})},this.lastResize=-1/0,this.lastWidth=window.innerWidth,this.lastHeight=window.innerHeight,this.timeSinceLastResize=1/0,this.onUpdate=e=>{},this.onEnterXR=e=>{},this.onExitXR=e=>{},this.scene.add(this.dolly),this.dolly.add(this.camera);const e=this.renderer;document.documentElement.append(this.renderer.domElement),e.domElement.style.position="fixed",e.domElement.style.zIndex="-1",e.domElement.style.width="100%",e.domElement.style.height="100%",e.domElement.style.top="0",document.documentElement.addEventListener("mousemove",(function(e){f(e.clientX,e.clientY)})),document.documentElement.addEventListener("touchmove",(function(e){e.touches.length>1&&(e.preventDefault(),f(e.touches[0].clientX,e.touches[0].clientY))}),{passive:!1}),document.documentElement.addEventListener("touchstart",(function(e){e.touches.length>1&&(f(e.touches[0].clientX,e.touches[0].clientY),v(e))}),{passive:!1}),document.documentElement.addEventListener("touchend",(function(e){}),{passive:!1}),document.documentElement.addEventListener("click",(function(e){v(e)}),!1),window.addEventListener("vrdisplaypresentchange",(e=>{this.xrPresenting||this._exitXR()}),!1),document.documentElement.style.width="100%",document.documentElement.style.height="100%";const f=(e,t)=>{this.pointer.x=e/document.documentElement.offsetWidth*2-1,this.pointer.y=-t/document.documentElement.offsetHeight*2+1};const v=e=>{for(const t of this.webLayers){const s=t.hitTest(this.raycaster.ray);s&&(s.target.dispatchEvent(new e.constructor(e.type,e)),s.target.focus(),console.log("hit",s.target,s.layer))}}}registerWebLayer(e){e.interactionRays=[this.raycaster.ray],this.webLayers.add(e)}getXRObject3D(e){let t=this.xrObjects.get(e);return t||(t=new s,t.xrCoordinateSystem=e,this.xrObjects.set(e,t),t)}async start(){return await this.loaded,this.renderPass.renderToScreen=!0,this.composer.addPass(this.renderPass),this.renderer.setAnimationLoop(this.animate),this.enterXR().then((()=>{document.documentElement.style.backgroundColor="transparent"})).catch((()=>{}))}get xrPresenting(){return this.renderer.xr.isPresenting}async enterXR(){if(this.xrPresenting)return;const e="local";this.renderer.xr.setReferenceSpaceType(e);const t=async t=>{this.session&&this.session.end(),this.session=t,this.renderer.xr.setSession(t),this.frameOfReference=await t.requestFrameOfReference(e),t.addEventListener("end",(()=>{this.session=void 0,this.frameOfReference=void 0,this.renderer.vr.setSession(null),this._exitXR()})),this._enterXR()};return navigator.xr.requestDevice().then((e=>e.requestSession({immersive:!0,type:"augmentation"}).then(t)))}_enterXR(){this.renderer.xr.enabled=!0,this.onEnterXR({type:"enterxr"})}_exitXR(){this.renderer.xr.enabled=!1,this.onExitXR({type:"exitxr"})}_setSize(e,t,s=1){e===this.lastWidth&&t===this.lastHeight||(this.lastWidth=e,this.lastHeight=t,this.lastResize=performance.now()),this.timeSinceLastResize=performance.now()-this.lastResize,this.timeSinceLastResize>2e3&&(this.renderer.setSize(e,t,!1),this.composer.setSize(e,t,!1),this.renderer.setPixelRatio(s),this.lastResize=-1/0)}}{constructor(){super(),this.ethereal=F,this.system=k(this.camera),this.publicUrl="/",this.gltfLoader=new S,this.cubeTextureLoader=new M,this.room=new s,this.demos=[],this.plane=new T,this.surfaceWallA=new b(this.plane),this.surfaceWallB=new b(this.plane),this.surfaceWallC=new b(this.plane),this.surfaceWallD=new b(this.plane),this.surfaceAboveBed=new b(this.plane),this.dollyPosition=new L,this.dollyOrientation=new A,this.cameraVerticalDegrees=0,this.cameraHorizonalDegrees=0,this.cameraDistance=1,this.cameraWorldUp=!1,this.resolution=new y,this.loadRoom(),this.loadSky(),this.setupLights(),this.camera.rotateZ(Math.PI);(()=>{const e=this.system.getAdapter(this.room),t=e.createLayout();t.orientation=H,t.local.centerX="0 m",t.local.centerZ="0 m",t.local.bottom="0 m",t.local.height="6 m",t.aspect="preserve-3d",e.onUpdate=()=>{},e.onPostUpdate=()=>{}})(),(()=>{const e=this.system.getAdapter(this.dolly);this.dolly.position.set(0,-10,0),e.transition.duration=1.5,e.onUpdate=()=>{e.bounds.target.setFromCenterAndSize(this.dollyPosition,B),e.orientation.target.copy(this.dollyOrientation)}})(),(()=>{const e=this.system.getAdapter(this.camera),t=new V;e.transition.duration=.2,e.onUpdate=()=>{if(!this.xrPresenting){const e=this.system.getState(this.dolly);t.setWithDegrees(this.cameraHorizonalDegrees,this.cameraVerticalDegrees,this.cameraDistance),t.toCartesianPosition(this.camera.position),this.cameraWorldUp?this.camera.up.set(0,1,0):this.camera.up.set(0,1,0).applyQuaternion(e.worldOrientation),this.camera.lookAt(e.worldPosition)}}})();let e=0;this.onUpdate=t=>{this.resolution.set(this.renderer.domElement.width,this.renderer.domElement.height),this.xrPresenting||(e=document.body.scrollTop/document.body.clientHeight,this.cameraHorizonalDegrees=80*-this.pointer.x,this.cameraVerticalDegrees=80*-this.pointer.y,e<.03?(this.dollyPosition.set(0,-30,0),this.dollyOrientation.setFromAxisAngle(_,-Math.PI/4),this.cameraVerticalDegrees=-89,this.cameraWorldUp=!0,this.cameraDistance=1):(this.cameraWorldUp=!1,this.cameraDistance=20,e>.03&&(this.dollyPosition.set(0,2,0),this.dollyOrientation.setFromAxisAngle(_,Math.PI/4)))),this.system.viewFrustum.setFromPerspectiveProjectionMatrix(this.camera.projectionMatrix),this.system.update(t.deltaTime,t.elapsedTime)},this.onEnterXR=e=>{},this.onExitXR=e=>{},this.demos.push(new q(this)),this.renderer.gammaFactor=2.2}loadSky(){const e=`${this.publicUrl}static/textures/skies/space5/`,t=".jpg",s=[e+"px"+t,e+"nx"+t,e+"py"+t,e+"ny"+t,e+"pz"+t,e+"nz"+t];this.sky=this.cubeTextureLoader.load(s,(e=>{this.scene.background=e}))}loadRoom(){this.scene.add(this.room),this.gltfLoader.load(`${this.publicUrl}static/models/stylized_room/scene-lowpoly.gltf`,(e=>{const t=e.scene.children[0];t.material=new O({color:13421772,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1});const s=new z(t.geometry,15),i=(new U).setPositions(s.attributes.position.array),n=new j({color:6645093,linewidth:1.5}),a=new D(i,n);t.add(a),this.room.add(e.scene);this.system.getAdapter(a).onUpdate=()=>{n.resolution=this.resolution};this.system.nodeAdapters.get(this.room).metrics.invalidateIntrinsicBounds()}))}setupLights(){const e=new W(11184810,1),t=new X(8961023,1);t.position.set(1,1,2),t.target.position.copy(this.scene.position),this.scene.add(t),this.scene.add(e)}};Z.start().catch((e=>{console.error(e),alert(e)})),Object.assign(window,{THREE:R,app:Z});