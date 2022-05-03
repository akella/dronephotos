import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import GUI from "lil-gui";
import gsap from "gsap";

import camera from "../camera.glb";

import photo1 from "../DJI_0175_0_.jpg";
import photo2 from "../DJI_0176_1_.jpg";

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
};

function getAzimuth(lat1, lon1, lat2, lon2) {
  let phi1 = deg2rad(lat1);
  let phi2 = deg2rad(lat2);
  let delta = deg2rad(lon1 - lon2);
  var y = Math.sin(delta) * Math.cos(phi2);
  var x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(delta);
  var theta = Math.atan2(y, x);
  console.log(theta)
  return theta ;
}

function todegrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

// Distance:	0.03758 km (to 4 SF*)
// Initial bearing:	018° 02′ 06″
// -18.034994423158963
// Final bearing:	018° 02′ 06″
// Midpoint:	49° 42′ 58″ N, 023° 58′ 10″ E

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.data = [
      {
        photo: photo1,
        lat: "49.715960, 23.969466",
        lat: 49.715960258,
        lon: 23.969466066,
        absheight: 360.857,
        relheight: 40.7,
        Roll: 0.0,
        Yaw: 53.7,
        Pitch: -61.3,
        FlightRollDegree: -4.8,
        FlightYawDegree: 15.5,
        FlightPitchDegree: -0.1,
      },
      {
        photo: photo2,
        lat: "49.716282, 23.969628",
        lat: 49.716281629,
        lon: 23.969627899,
        absheight: +360.257,
        relheight: 40.1,
        Roll: 0.0,
        Yaw: 44.1,
        Pitch: -89.9,
        FlightRollDegree: -5.6,
        FlightYawDegree: 6.1,
        FlightPitchDegree: -0.6,
      },
    ];

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x111111, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);
    this.loader = new GLTFLoader();

    // this.loader.load(camera,(gltf)=>{
    //   this.cam = gltf.scene.getObjectByName('Box001__0')
    //   console.log(this.cam)
    //   // this.cam.scale.setScalar(0.001)
    //   this.cam.lookAt(0,2,1)
    //   this.scene.add(this.cam)

    // })
    this.geometry = new THREE.PlaneBufferGeometry(10, 10,100,100);

    this.ground = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color:0x999999,wireframe: true}));
    this.ground.rotation.x = -Math.PI/2
    this.scene.add(this.ground)
    this.data.forEach((d,i)=>{
      d.projcamera = new THREE.PerspectiveCamera(
        48,
        window.innerWidth / window.innerHeight,
        0.001,
        1000
      );
      d.projcamera.aspect = 1.33

      d.cam = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.06, 0.06, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );

      this.scene.add(d.cam)

      d.helper = new THREE.CameraHelper( d.projcamera );
      this.scene.add( d.helper );
      

      let az = getAzimuth(
        this.data[0].lat,
        this.data[0].lon,
        d.lat,
        d.lon
      );
      let dist =
        10 *
        getDistanceFromLatLonInKm(
          this.data[0].lat,
          this.data[0].lon,
          d.lat,
          d.lon
        );
        // console.log(dist,az,'loop')

      let secondDrone = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(dist);
      if(i==0) secondDrone = new THREE.Vector3(0,0,0);

      d.cam.position.copy(secondDrone)

      let pitch1 = deg2rad(d.Pitch);
      let yaw1 = -deg2rad(d.Yaw);
      let matPitch = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        pitch1
      );
      // yaw
      let matYaw = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        yaw1
      );
      let finalmat = new THREE.Matrix4().multiplyMatrices(matYaw, matPitch)
      d.cam.rotation.setFromRotationMatrix(finalmat);



      d.material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable",
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          texture1: { value: new THREE.TextureLoader().load(photo1) },
          resolution: { value: new THREE.Vector4() },
          textureMatrixProj: {
            type: "m4",
            value: this.makeProjectiveMatrixForLight(d.projcamera, d.cam),
          },
        },
        // wireframe: true,
        transparent: true,
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      d.floor = new THREE.Mesh(this.geometry, d.material);
      this.scene.add(d.floor)
      d.floor.rotation.x = Math.PI / 2;

      let height = d.relheight / 100;
      d.floor.position.y = -height + i*0.01;
      this.ground.position.y = -height - this.data.length*0.01;

    })
    // ==============================================
    // ==============================================
    // ==============================================
    // ==============================================
    // ==============================================

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.projcamera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    

    this.projcamera2 = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.projcamera.aspect = 1.33
    this.projcamera2.aspect = 1.33
    this.helper = new THREE.CameraHelper( this.projcamera );
    this.helper2 = new THREE.CameraHelper( this.projcamera2 );
    // this.scene.add( this.helper );
    // this.scene.add( this.helper2 );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0.5, 0.5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    this.settings();
    // this.addDrones();
    // this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.addLights();
  }

  settings() {
    let that = this;
    this.settings = {
      // progress: 0,
      fov: 48,
      // angle2: 0.01,
    };
    this.gui = new GUI();
    // this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "fov", 0, 150, 0.01).onChange(() => {

      this.data.forEach(d=>{
        d.projcamera.fov = this.settings.fov
        d.projcamera.updateProjectionMatrix();
        d.material.uniforms.textureMatrixProj.value = this.makeProjectiveMatrixForLight(d.projcamera,d.cam);
        d.helper.update()
      })
      // this.projcamera.fov = this.settings.fov;
      // this.projcamera2.fov = this.settings.fov;

      // this.projcamera.updateProjectionMatrix();
      // this.projcamera2.updateProjectionMatrix();
      // this.material.uniforms.textureMatrixProj.value = this.makeProjectiveMatrixForLight(this.projcamera,this.cam1);
      // this.material2.uniforms.textureMatrixProj.value = this.makeProjectiveMatrixForLight(this.projcamera2,this.cam2);

      // this.helper.update()
      // this.helper2.update()
    });
    // this.gui.add(this.settings, "angle2", 0, Math.PI * 2, 0.01).onChange(() => {
    //   this.material.uniforms.textureMatrixProj.value = this.makeProjectiveMatrixForLight(this.projcamera,this.cam1);
    //   this.material2.uniforms.textureMatrixProj.value = this.makeProjectiveMatrixForLight(this.projcamera2,this.cam2);
    // });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        texture1: { value: new THREE.TextureLoader().load(photo1) },
        resolution: { value: new THREE.Vector4() },
        projPosition: { value: this.projcamera.position.clone() },
        modelMatrixCamera: { value: this.projcamera.matrixWorld.clone() },
        projectionMatrixCamera: {
          value: this.projcamera.projectionMatrix.clone(),
        },
        viewMatrixCamera: { value: this.projcamera.matrixWorldInverse.clone() },
        textureMatrixProj: {
          type: "m4",
          value: that.makeProjectiveMatrixForLight(this.projcamera, this.cam1),
        },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.material2 = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        texture1: { value: new THREE.TextureLoader().load(photo2) },
        resolution: { value: new THREE.Vector4() },
        projPosition: { value: this.projcamera2.position.clone() },
        textureMatrixProj: {
          type: "m4",
          value: that.makeProjectiveMatrixForLight(this.projcamera2,this.cam2),
        },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneBufferGeometry(10, 10,100,100);
    // this.geometry = new THREE.SphereBufferGeometry(1, 30,30);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.plane2 = new THREE.Mesh(this.geometry, this.material2);
    this.ground = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color:0x999999,wireframe: true}));
    this.plane.rotation.x = Math.PI / 2;
    this.plane2.rotation.x = Math.PI / 2;
    this.ground.rotation.x = Math.PI / 2;
    this.scene.add(this.plane);
    this.scene.add(this.plane2);
    this.scene.add(this.ground);
    let height = this.data[0].relheight / 100;
    this.plane.position.y = -height;
    this.ground.position.y = -height - 0.01;
    this.plane2.position.y = -height + 0.01;
  }

  addDrones() {
    this.cam = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.06, 0.06, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    // this.scene.add(this.cam)
    // this.cam.lookAt(0,1,0)

    let height = this.data[0].relheight / 100;
    // this.plane.position.y = -height;

    let az = getAzimuth(
      this.data[0].lat,
      this.data[0].lon,
      this.data[1].lat,
      this.data[1].lon
    );
    let dist =
      10 *
      getDistanceFromLatLonInKm(
        this.data[0].lat,
        this.data[0].lon,
        this.data[1].lat,
        this.data[1].lon
      );
      console.log(dist)

    let secondDrone = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(dist);

    this.cam1 = this.cam.clone();

    this.cam2 = this.cam.clone();
    this.scene.add(this.cam1);
    this.scene.add(this.cam2);
    this.cam2.position.copy(secondDrone);

    let pitch1 = deg2rad(this.data[0].Pitch);
    let yaw1 = -deg2rad(this.data[0].Yaw);
    let pitch2 = deg2rad(this.data[1].Pitch);
    let yaw2 = -deg2rad(this.data[1].Yaw);

   let matPitch = new THREE.Matrix4().makeRotationAxis(
     new THREE.Vector3(1, 0, 0),
     pitch1
   );
   // yaw
   let matYaw = new THREE.Matrix4().makeRotationAxis(
     new THREE.Vector3(0, 1, 0),
     yaw1
   );
   let finalmat = new THREE.Matrix4().multiplyMatrices(matYaw, matPitch)
   this.cam1.rotation.setFromRotationMatrix(finalmat);

   let matPitch2 = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      pitch2
    );
    // yaw
    let matYaw2 = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      yaw2
    );
    let finalmat2 = new THREE.Matrix4().multiplyMatrices(matYaw2, matPitch2)
    this.cam2.rotation.setFromRotationMatrix(finalmat2);

  }


// ====================================
// ====================================
// ====================================
// ====================================
  makeProjectiveMatrixForLight(camera,camobject) {

    camera.position.copy(camobject.position);
    camera.rotation.copy(camobject.rotation);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // camera.updateWorldMatrix();

    var lightMatrix = new THREE.Matrix4();
    var targetPosition = new THREE.Vector3();


    lightMatrix.set(
      0.5,0.0,0.0,0.5,
      0.0,0.5,0.0,0.5,
      0.0,0.0,0.5,0.5,
      0.0,0.0,0.0,1.0
    );

    lightMatrix.multiply(camera.projectionMatrix);
    lightMatrix.multiply(camera.matrixWorldInverse);
    return lightMatrix;
  }

  addLights() {
    const light1 = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.1 * Math.PI);
    light2.position.set(-0.5, 0, 0.866); // ~60º
    this.scene.add(light2);

    // const light3  = new THREE.DirectionalLight(0xffffff, 0.1 * Math.PI);
    // light3.position.set(0.5, 0.5, 0.866); // ~60º
    // this.scene.add( light3 );

    // const light4  = new THREE.DirectionalLight(0xffffff, 0.2 * Math.PI);
    // light4.position.set(0.5, -0.5, 0.866); // ~60º
    // this.scene.add( light4 );

    //   const light4  = new THREE.DirectionalLight(0xffffff, 0.2 * Math.PI);
    //   light4.position.set(0, 0,3); // ~60º
    //   this.scene.add( light4 );
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
