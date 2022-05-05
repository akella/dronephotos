// @todo upload 2 photos get data + projection
// put markers on them
import ExifReader from "exifreader";
console.log(ExifReader, "ExifReader");
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import mapboxgl from "mapbox-gl";

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
const { sin, cos, PI, acos, asin, sqrt, atan2, abs } = Math;
var Line = require("three-line2")(THREE);
var BasicShader = require("three-line2/shaders/basic")(THREE);
const {
  fract,
  lerp,
  clamp,
  mapRange,
  clamp01,
  sign,
} = require("canvas-sketch-util/math");

// house
// 49.715026, 23.966039
// -49.71646435825028 23.96490099917372

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import GUI from "lil-gui";
import gsap from "gsap";

import camera from "../camera.glb";

// import photo1 from "../_DJI_0175_0.jpg";
// import photo2 from "../_DJI_0176_1.jpg";
// import photo3 from "../_DJI_0177_2.jpg";
// import photo4 from "../_DJI_0178_3.jpg";
// import photo5 from "../_DJI_0179_4.jpg";
// import photo6 from "../_DJI_0180_5.jpg";
// import photo7 from "../_DJI_0269_6.jpg";

// import house1 from "../DJI_0199.jpg";
// import house2 from "../DJI_0207.jpg";
// import house3 from "../DJI_0208.jpg";

const ASPECT = 1.333;
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
}
function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

function getAzimuth(lat1, lon1, lat2, lon2) {
  let phi1 = deg2rad(lat1);
  let phi2 = deg2rad(lat2);
  let delta = deg2rad(lon1 - lon2);
  var y = Math.sin(delta) * Math.cos(phi2);
  var x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(delta);
  var theta = Math.atan2(y, x);
  return theta + 2.45 * 0;
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
    this.helpers = new THREE.Group();
    this.scene.add(this.helpers);

    this.data = [
      // {
      //   photo: photo2,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716281629,
      //   lon: 23.969627899,
      //   absheight: +360.257,
      //   relheight: 40.1,
      //   Roll: 0.0,
      //   Yaw: 44.1,
      //   Pitch: -89.9,
      //   FlightRollDegree: -5.6,
      //   FlightYawDegree: 6.1,
      //   FlightPitchDegree: -0.6,
      //   x: 3995/5280,
      //   y: 1404/3956,
      // },
      // {
      //   photo: photo1,
      //   lat: "49.715960, 23.969466",
      //   lat: 49.715960258,
      //   lon: 23.969466066,
      //   absheight: 360.857,
      //   relheight: 40.7,
      //   Roll: 0.0,
      //   Yaw: 53.7,
      //   Pitch: -61.3,
      //   FlightRollDegree: -4.8,
      //   FlightYawDegree: 15.5,
      //   FlightPitchDegree: -0.1,
      //   x: 753/1024,
      //   y: 139/767,
      // },
      // {
      //   photo: photo3,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716512309,
      //   lon: +23.969659965,
      //   absheight: +360.257,
      //   relheight: 40.1,
      //   Roll: 0.0,
      //   Yaw: 44.1,
      //   Pitch: -89.9,
      //   FlightRollDegree: -5.5,
      //   FlightYawDegree: 6.0,
      //   FlightPitchDegree: -0.0,
      // },
      // {
      //   photo: photo4,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716493433,
      //   lon: +23.969887883,
      //   absheight: +360.157,
      //   relheight: 40.,
      //   Roll: 0.0,
      //   Yaw: 44.1,
      //   Pitch: -89.9,
      //   FlightRollDegree: -5.2,
      //   FlightYawDegree: 6.1,
      //   FlightPitchDegree: -0.0,
      // },
      // {
      //   photo: photo5,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716494633,
      //   lon: +23.969889327,
      //   absheight: +389.757,
      //   relheight: 69.600,
      //   Roll: 0.0,
      //   Yaw: 44.1,
      //   Pitch: -89.9,
      //   FlightRollDegree: -5.4,
      //   FlightYawDegree: 6.1,
      //   FlightPitchDegree: -0.6,
      //   x: 2570/5280,
      //   y: 3006/3956,
      // },
      // {
      //   photo: photo6,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716498767,
      //   lon: +23.969887784,
      //   absheight: +389.657,
      //   relheight: 69.500,
      //   Roll: 0.0,
      //   Yaw: 59.3,
      //   Pitch: -89.9,
      //   FlightRollDegree: -4.5,
      //   FlightYawDegree: 20.9,
      //   FlightPitchDegree: 1.5,
      // },
      // {
      //   photo: photo7,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.716311060,
      //   lon: +23.969853840,
      //   absheight: +321.357,
      //   relheight: 1.200,
      //   Roll: 0.0,
      //   Yaw: 111.7,
      //   Pitch: -19.4,
      //   FlightRollDegree: -1.4,
      //   FlightYawDegree: 73.3,
      //   FlightPitchDegree: 5.3,
      // },
      // {
      //   photo: house1,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.7156871388889, // +49.715687155
      //   lon: 	23.9700537777778, // +23.970053793
      //   absheight: +328.557,
      //   relheight: +8.400,
      //   Roll: 0.0,
      //   Yaw: -66.9,
      //   Pitch: 	-0.3,
      //   FlightRollDegree: 1.60,
      //   FlightYawDegree: 	-105.3,
      //   FlightPitchDegree: -1.1,
      //     x: 2766/5280,
      //     y: 2085/3956,
      // },
      // {
      //   photo: house2,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.7156321666667, // +49.715632179
      //   lon: 	23.9677818055556, // 	+23.967781816
      //   absheight: +362.157,
      //   relheight: +42.000,
      //   Roll: 0.0,
      //   Yaw: -65.4,
      //   Pitch: 	-0.3,
      //   FlightRollDegree: -20.1,
      //   FlightYawDegree: 	-101.6,
      //   FlightPitchDegree: -1.1,
      //     x: 1823/5280,
      //     y: 2962/3956,
      // },
      // {
      //   photo: house3,
      //   lat: "49.716282, 23.969628",
      //   lat: 49.715579603, // +49.715632179
      //   lon: 	+23.967325274, // 	+23.967781816
      //   absheight: +362.157,
      //   relheight: +42.000,
      //   Roll: 0.0,
      //   Yaw: -60.1,
      //   Pitch: 	-0.3,
      //   FlightRollDegree: 4.1,
      //   FlightYawDegree: 	-99.3,
      //   FlightPitchDegree: -33.1,
      //     x: 1052/5280,
      //     y: 3343/3956,
      // },
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
    this.geometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);
    // this.geometry = new THREE.SphereBufferGeometry(300, 40,40);
    // this.geometry.translate(0,300,0)

    this.ground = new THREE.Mesh(
      this.geometry,
      new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.scene.add(this.ground);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0.5, 0.5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    this.setupsettings();

    this.resize();
    this.render();
    this.setupResize();
    this.addLights();
    this.addDrag();

    this.addObjects();
    this.initGoogleMap();
  }

  initGoogleMap() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWtlbGxhIiwiYSI6ImNsMnRoOW05eDA0YjUzZm8yNnJqd3lpMGoifQ.d6sdMSw6umVeQYYmBOcwrQ";
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/satellite-v9", // style URL
      center: [23.969842139666298, 49.71631425130195],
      zoom: 16,
    });

    // Create a default Marker and add it to the map.
    this.marker = new mapboxgl.Marker()
      .setLngLat([23.969842139666298, 49.71631425130195])
      .addTo(this.map);

    // Create a default Marker, colored black, rotated 45 degrees.
    // const marker2 = new mapboxgl.Marker({ color: 'black', rotation: 45 })
    // .setLngLat([12.65147, 55.608166])
    // .addTo(map);
  }

  buildThickRayFromVector(raydir, origin, color) {
    // let raydir = new THREE.Vector3(0.,0.,1);
    // let origin = new THREE.Vector3(0,1,0);
    let finalColor = color || 0x00ff00;

    const meshline = new MeshLine();

    let curve = new THREE.LineCurve(
      // origin.clone().add(raydir.clone().multiplyScalar(10)),
      origin,
      origin.clone().add(raydir.clone().multiplyScalar(-10))
    );
    const geometry = new THREE.TubeGeometry(curve, 2, 0.005, 8, false);
    const material = new THREE.MeshStandardMaterial({ color: finalColor });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  setupsettings() {
    let that = this;
    this.settings = {
      // progress: 0,
      fov: 57,
      // angle2: 0.01,
      helpers: true,
      photo1: true,
      photo2: true,
      photo3: true,
      photo4: true,
      photo5: true,
      photo6: true,
      clean: () => {
        this.clean(true);
        document.getElementById("previews").replaceChildren();
      },
    };
    this.gui = new GUI();
    // this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "fov", 0, 150, 0.01).onChange(() => {
      this.data.forEach((d) => {
        d.projcamera.fov = this.settings.fov;
        d.projcamera.updateProjectionMatrix();
        d.material.uniforms.textureMatrixProj.value =
          this.makeProjectiveMatrixForLight(d.projcamera, d.cam);
        d.helper.update();
      });
    });

    this.gui.add(this.settings, "photo1").onChange(() => {
      this.toggle(0);
    });
    this.gui.add(this.settings, "photo2").onChange(() => {
      this.toggle(1);
    });
    this.gui.add(this.settings, "photo3").onChange(() => {
      this.toggle(2);
    });
    this.gui.add(this.settings, "photo4").onChange(() => {
      this.toggle(3);
    });
    this.gui.add(this.settings, "photo5").onChange(() => {
      this.toggle(4);
    });
    this.gui.add(this.settings, "photo6").onChange(() => {
      this.toggle(5);
    });

    this.gui.add(this.settings, "helpers").onChange(() => {
      this.helpers.visible = !this.helpers.visible;
    });
    this.gui.add(this.settings, "clean");
  }

  toggle(index) {
    this.data[index].floor.visible = !this.data[index].floor.visible;
    this.data[index].cam.visible = !this.data[index].cam.visible;
    this.data[index].helper.visible = !this.data[index].helper.visible;
    this.data[index].raymesh.visible = !this.data[index].raymesh.visible;
    this.data[index].projected.visible = !this.data[index].projected.visible;
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

  // ====================================
  // ====================================
  // ====================================
  // ====================================
  addObjects() {
    let relative = 40;
    this.data.forEach((d, i) => {
      d.projcamera = new THREE.PerspectiveCamera(
        57,
        window.innerWidth / window.innerHeight,
        0.001,
        1000
      );
      d.projcamera.aspect = ASPECT;

      d.cam = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.06 / 4, 0.06 / 4, 0.1 / 4),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );

      this.scene.add(d.cam);

      d.helper = new THREE.CameraHelper(d.projcamera);
      this.helpers.add(d.helper);

      let az = getAzimuth(
        this.data[0].lat,
        this.data[0].lon,
        d.lat,
        d.lon,
        2.45 * 0
      );
      let dist =
        10 *
        getDistanceFromLatLonInKm(
          this.data[0].lat,
          this.data[0].lon,
          d.lat,
          d.lon
        );

      let secondDrone = new THREE.Vector3(
        Math.sin(az),
        0,
        Math.cos(az)
      ).multiplyScalar(-dist);
      if (i == 0) secondDrone = new THREE.Vector3(0, 0, 0);

      d.cam.position.copy(secondDrone);
      d.cam.position.y = d.relheight / 100;

      let pitch1 = deg2rad(d.Pitch);
      let yaw1 = -deg2rad(d.FlightYawDegree);
      let matPitch = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        pitch1
      );
      // yaw
      let matYaw = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        yaw1
      );
      let finalmat = new THREE.Matrix4().multiplyMatrices(matYaw, matPitch);
      d.cam.rotation.setFromRotationMatrix(finalmat);

      d.material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable",
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          // texture1: { value: new THREE.TextureLoader().load(d.photo) },
          texture1: { value: d.photo },
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
      this.scene.add(d.floor);
      d.floor.rotation.x = Math.PI / 2;

      d.floor.position.y = i * 0.01;
      this.ground.position.y = this.data.length * 0.01;

      let xx = lerp(
        Math.tan(deg2rad(this.settings.fov / 2)) * ASPECT,
        -Math.tan(deg2rad(this.settings.fov / 2)) * ASPECT,
        d.x
      );

      let yy = lerp(
        -Math.tan(deg2rad(this.settings.fov / 2)),
        Math.tan(deg2rad(this.settings.fov / 2)),
        d.y
      );

      let raydir = new THREE.Vector3(xx, yy, 1);
      raydir.applyMatrix4(finalmat);

      d.ray = raydir;

      d.raymesh = this.buildThickRayFromVector(raydir, d.cam.position);
      // @TODO CALCULATE BEARING!
      let v1 = new THREE.Vector2(d.ray.x, d.ray.z);
      d.projected = this.buildThickRayFromVector(
        new THREE.Vector3(raydir.x, 0, raydir.z),
        d.cam.position,
        0x0000ff
      );
      this.scene.add(d.projected);
      let angle = v1.angle();
      d.bearing = angle - Math.PI / 2;
      console.log("bearing", d.bearing);

      this.scene.add(d.raymesh);
    });
    // ==============================================
    // ==============================================
    // ==============================================
    // ==============================================
    // ==============================================

    // TRIANGULATE!!
    if (this.data.length > 1) {
      let point1 = {
        lat: this.data[0].lat,
        lon: this.data[0].lon,
        bearing: this.data[0].bearing,
      };
      let point2 = {
        lat: this.data[1].lat,
        lon: this.data[1].lon,
        bearing: this.data[1].bearing,
      };

      // position RESULT object in scene
      // let intersection = this.intersect(point1,point2)
      // console.log(intersection)
      this.intersectRays(
        this.data[0].cam.position,
        this.data[0].ray,
        this.data[1].cam.position,
        this.data[1].ray
      );
    }
    // end if
  }

  clean(flag) {
    this.data.forEach((d) => {
      this.scene.remove(d.cam);
      this.scene.remove(d.projected);
      this.scene.remove(d.raymesh);
      this.scene.remove(d.floor);
      this.helpers.remove(d.helper);
    });

    this.scene.remove(this.final);

    if (flag) this.data = [];
  }

  intersectRays(originA, rayA, originB, rayB) {
    // find closest points on two rays
    let Nv = rayA.clone().cross(rayB);

    let Na = rayA.clone().cross(Nv).normalize();
    let Nb = rayB.clone().cross(Nv).normalize();

    let Da = rayA.clone().normalize();
    let Db = rayB.clone().normalize();

    let da = originA.clone().sub(originB).dot(Nb) / Da.dot(Nb);
    let db = originB.clone().sub(originA).dot(Na) / Db.dot(Na);

    let ptA = originA.clone().add(Da.multiplyScalar(-da));
    let ptB = originB.clone().add(Db.multiplyScalar(-db));
    console.log(ptA, ptB, "CLOSEST POINT RESULTS");
    this.putBallAt(ptB);

    // offset drone coordinate with meters
    let R = 6378137;

    let dE = -(this.data[0].cam.position.x - ptA.x) * 100;
    let dN = (this.data[0].cam.position.z - ptA.z) * 100;

    let dLat = dN / R;
    let dLon = dE / (R * cos((PI * this.data[0].lat) / 180));

    let latRad = deg2rad(this.data[0].lat);
    let lonRad = deg2rad(this.data[0].lon);

    let lat0 = this.data[0].lat + (dLat * 180) / PI;
    let lon0 = this.data[0].lon + (dLon * 180) / PI;

    console.log("!!!!FINAL=======", lat0, lon0);
    document.getElementById("result").innerHTML =
      "lat:" + lat0 + "," + lon0 + ";";

      this.map.setZoom(16)
      // this.map.flyTo({
      //   // center: [lat0,lon0]
      //   center: [-91.3403, 0.0164]
      // });
      
      this.marker.remove()

      this.marker = new mapboxgl.Marker()
      .setLngLat([lon0,lat0 ])
      .addTo(this.map);

      this.map.flyTo({
          center: [lon0,lat0],
          speed: 2
      });

    // 49.71503061838623 23.965701913328182
    // 49.715030650235846 23.96570190245439
  }

  intersect(point1, point2) {
    let lon1 = deg2rad(point1.lon);
    let lon2 = deg2rad(point2.lon);
    let lat1 = deg2rad(point1.lat);
    let lat2 = deg2rad(point2.lat);
    let crs13 = point1.bearing;
    let crs23 = point2.bearing;
    let crs12, crs21;
    let pi = PI;
    let dst12 =
      2 *
      asin(
        sqrt(
          sin((lat1 - lat2) / 2) ** 2 +
            cos(lat1) * cos(lat2) * sin((lon1 - lon2) / 2) ** 2
        )
      );
    if (sin(lon2 - lon1) < 0) {
      crs12 = acos(
        (sin(lat2) - sin(lat1) * cos(dst12)) / (sin(dst12) * cos(lat1))
      );
      crs21 =
        2 * pi -
        acos((sin(lat1) - sin(lat2) * cos(dst12)) / (sin(dst12) * cos(lat2)));
    } else {
      crs12 =
        2 * pi -
        acos((sin(lat2) - sin(lat1) * cos(dst12)) / (sin(dst12) * cos(lat1)));
      crs21 = acos(
        (sin(lat1) - sin(lat2) * cos(dst12)) / (sin(dst12) * cos(lat2))
      );
    }

    let ang1 = ((crs13 - crs12 + pi) % (2 * pi)) - pi;
    let ang2 = ((crs21 - crs23 + pi) % (2 * pi)) - pi;
    console.log(crs13, crs12, ang1, ang2);

    if (sin(ang1) === 0 && sin(ang2) === 0) {
      console.log("infinity of intersections");
    } else if (sin(ang1) * sin(ang2) < 0) {
      console.log("intersection ambiguous");
    } else {
      ang1 = abs(ang1);
      ang2 = abs(ang2);
      let ang3 = acos(
        -cos(ang1) * cos(ang2) + sin(ang1) * sin(ang2) * cos(dst12)
      );
      let dst13 = atan2(
        sin(dst12) * sin(ang1) * sin(ang2),
        cos(ang2) + cos(ang1) * cos(ang3)
      );
      let lat3 = asin(
        sin(lat1) * cos(dst13) + cos(lat1) * sin(dst13) * cos(crs13)
      );
      let dlon = atan2(
        sin(crs13) * sin(dst13) * cos(lat1),
        cos(dst13) - sin(lat1) * sin(lat3)
      );
      let lon3 = ((lon1 - dlon + pi) % (2 * pi)) - pi;
      this.addBallAt();
    }
  }

  putBallAt(v) {
    this.final = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.02, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    this.final.position.copy(v);
    this.scene.add(this.final);
  }

  addBallAt() {
    let lon = rad2deg(0.4183548261524481);
    let lat = rad2deg(0.86771280627482);
    // let lon = todegrees(deg2rad(23.969627899))
    // let lat = todegrees(deg2rad(49.716281629))
    let az = getAzimuth(this.data[0].lat, this.data[0].lon, lat, lon, 2.45 * 0);

    console.log(lon, lat, this.data[0].lon, this.data[0].lat, " SVER");
    let dist =
      10 *
      getDistanceFromLatLonInKm(this.data[0].lat, this.data[0].lon, lat, lon);

    let interPos = new THREE.Vector3(
      Math.sin(az),
      0,
      Math.cos(az)
    ).multiplyScalar(-dist);

    let final = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.02, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    console.log(interPos, "interPos");
    this.scene.add(final);
    final.position.x = interPos.x;
    final.position.z = interPos.z;
  }

  makeProjectiveMatrixForLight(camera, camobject) {
    camera.position.copy(camobject.position);
    camera.rotation.copy(camobject.rotation);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // camera.updateWorldMatrix();

    var lightMatrix = new THREE.Matrix4();
    var targetPosition = new THREE.Vector3();

    lightMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
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

  addDrag() {
    let drag = document.createElement("div");
    document.body.appendChild(drag);
    drag.style.position = "fixed";
    drag.style.top = "50px";
    drag.style.left = "50px";
    drag.style.width = "300px";
    drag.style.height = "100px";
    drag.style.border = "10px dotted gray";

    drag.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });

    drag.addEventListener("drop", (event) => {
      event.preventDefault();
      this.loadFile(event.dataTransfer.files[0]);
    });
  }

  loadFile(file) {
    const tags = ExifReader.load(file).then((tagresult) => {
      const reader = new FileReader();
      let that = this;

      reader.addEventListener("load", (event) => {
        function imgCallback(event) {
          that.addNewImg(event.target, tagresult); //img
        }
        const img = new Image();
        img.onload = imgCallback;
        img.src = event.target.result;
      });

      reader.readAsDataURL(file);
    });
  }

  updateAll() {
    this.clean();
    this.addObjects();
  }

  addNewImg(img, tags) {
    console.log(tags, "tags");
    let photo = new THREE.Texture(img);
    photo.needsUpdate = true;
    let obj = {
      photo: photo,
      lat: tags.GPSLatitude.description,
      lon: tags.GPSLongitude.description,
      absheight: tags.AbsoluteAltitude.value,
      relheight: tags.RelativeAltitude.value,
      Roll: tags.GimbalRollDegree.value,
      Yaw: tags.GimbalYawDegree.value,
      Pitch: tags.GimbalPitchDegree.value,
      FlightRollDegree: tags.FlightRollDegree.value,
      FlightYawDegree: tags.FlightYawDegree.value,
      FlightPitchDegree: tags.FlightPitchDegree.value,
      x: 0.5,
      y: 0.5,
    };
    this.data.push(obj);

    let previews = document.getElementById("previews");
    let wrap = document.createElement("div");
    let marker = document.createElement("div");
    marker.classList.add("marker");
    let DOMimage = img.cloneNode(true);
    DOMimage.style.height = "200px";
    wrap.appendChild(DOMimage);
    wrap.appendChild(marker);
    previews.appendChild(wrap);
    DOMimage.addEventListener("click", (event) => {
      console.log(event);
      obj.x = event.offsetX / (200 * ASPECT);
      obj.y = event.offsetY / 200;
      marker.style.left = event.offsetX + "px";
      marker.style.top = event.offsetY + "px";
      this.updateAll();
    });

    this.clean();
    this.addObjects();

    // {
    //   photo: house2,
    //   lat: "49.716282, 23.969628",
    //   lat: 49.7156321666667, // +49.715632179
    //   lon: 	23.9677818055556, // 	+23.967781816
    //   absheight: +362.157,
    //   relheight: +42.000,
    //   Roll: 0.0,
    //   Yaw: -65.4,
    //   Pitch: 	-0.3,
    //   FlightRollDegree: -20.1,
    //   FlightYawDegree: 	-101.6,
    //   FlightPitchDegree: -1.1,
    //     x: 1823/5280,
    //     y: 2962/3956,
    // },
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    // this.renderer.render(this.scene, this.data[0].projcamera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
