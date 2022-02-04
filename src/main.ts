import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PickHelper from './PickHelper';
import vertexShader from './shaders/vertex.vs.glsl';
import fragmentShader from './shaders/fragment.fs.glsl';
import './style.css';

const App = () => {
  let audioContext: AudioContext, audioElement:HTMLAudioElement, analyser: AnalyserNode, source: MediaElementAudioSourceNode;
  let dataArray = new Uint8Array();

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const uniforms = {
    u_resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      type: 'v2',
    },
    u_time: {
      type: 'f',
      value: 0.0,
    },
    u_mouse: { value: { x: 0, y: 0 } },
    u_data_arr: { type: "float[64]", value: dataArray, },
    u_amplitude: { value: 1.5 }
  };
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#app_view') as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const clock = new THREE.Clock();
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(25, 80, 0);

  // Parent camera to obj so we can spin the object and move camera
  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  // Add grid and mouse controls
  const gridHelper = new THREE.GridHelper(200, 50);
  const pickHelper = new PickHelper();
  //scene.add(gridHelper);
  const controls = new OrbitControls(camera, renderer.domElement);

  function setupCanvasEvents() {
    const canvasContainer = document.getElementById(
      'app_view'
    ) as HTMLCanvasElement;

    canvasContainer.addEventListener('mousemove', (event) => {
      uniforms.u_mouse.value.x = event.clientX;
      uniforms.u_mouse.value.y = event.clientY;
    });

    // Update canvas if window is resized
    document.addEventListener('resize', () => {
      renderer.setSize(
        canvasContainer.offsetWidth,
        canvasContainer.offsetHeight
      );
      const camera = new THREE.PerspectiveCamera(
        75,
        canvasContainer.offsetWidth / canvasContainer.offsetHeight,
        0.1,
        1000
      );
      camera.position.set(55, 25, 0);
    });
  }

  // play
  const init = () => {
    setupAudioContext()
    const geometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
      wireframe: true,
    });
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.rotation.x = Math.PI / 2;
    planeMesh.scale.x = 2;
    planeMesh.scale.y = 2;
    planeMesh.scale.z = 2;
    planeMesh.position.y = 8;
    scene.add(planeMesh);

    audioContext.resume()
    render();
  }

  const setupAudioContext = () => {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById('audio') as HTMLAudioElement;
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  const render = () => {
    analyser.getByteFrequencyData(dataArray);
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_data_arr.value = dataArray;
    pickHelper.pick(scene, camera);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  setupCanvasEvents();
  init();
};

App();