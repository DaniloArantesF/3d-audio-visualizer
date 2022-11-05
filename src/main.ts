import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertexShader from './shaders/vertex.vs.glsl';
import fragmentShader from './shaders/fragment.fs.glsl';
import './style.css';

const App = () => {
  let audioContext: AudioContext,
    analyser: AnalyserNode,
    source: MediaElementAudioSourceNode;
  let dataArray = new Uint8Array();
  const audio = new Audio();
  const container = document.getElementById('app');
  container?.appendChild(audio);

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const meshSegments = 128;
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
    u_data_arr: { type: `float[${meshSegments}]`, value: dataArray },
    u_amplitude: { value: 1.5 },
  };
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas') as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const clock = new THREE.Clock();
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // camera.position.set(0, 30, 50);
  camera.position.set(0, 30, 40);

  // Parent camera to obj so we can spin the object and move camera
  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  // Add mouse controls
  const controls = new OrbitControls(camera, renderer.domElement);

  function setupEvents() {
    const canvasContainer = document.getElementById(
      'app_view',
    ) as HTMLCanvasElement;

    // Handle file upload
    const fileInput = document.getElementById('fileIn');
    fileInput?.addEventListener('change', async function (event) {
      const el = event.target as HTMLInputElement;
      if (el && el.files) {
        const file = el.files[0];
        audio.src = URL.createObjectURL(file);
        audio.load();
      }
    });

    // Setup audio context when file is loaded
    audio.onloadeddata = () => {
      setupAudioContext();
    };

    audio.addEventListener('play', () => {
      audioContext.resume();
      audio.play();
    });

    canvasContainer.addEventListener('mousemove', (event) => {
      uniforms.u_mouse.value.x = event.clientX;
      uniforms.u_mouse.value.y = event.clientY;
    });

    const loadDefaultButton = document.getElementById('load-default');
    loadDefaultButton?.addEventListener('click', () => {
      loadDefaultSong();
    });

    // Update canvas if window is resized
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.position.set(0, 30, 40);
    });
  }

  // play
  function init() {
    audio.controls = true;

    const geometry = new THREE.PlaneGeometry(
      meshSegments / 2,
      meshSegments / 2,
      meshSegments,
      meshSegments,
    );
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
      wireframe: true,
    });
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.rotation.x = Math.PI / 2;
    planeMesh.position.y = 8;
    scene.add(planeMesh);

    render();
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    source = audioContext.createMediaElementSource(audio);

    // exposes audio time and frequency data
    analyser = audioContext.createAnalyser();

    // pipe audio source through analyzer
    source.connect(analyser);

    // output audio to default speaker device
    analyser.connect(audioContext.destination);
    analyser.fftSize = meshSegments * 4; // sampling rate

    // array holding 8-bit integers representing frequencies
    // analyser.frequencyBinCount is equal to fftSize / 2
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    console.log(dataArray.length);
  }

  function render() {
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
    }

    // Update uniforms
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_data_arr.value = dataArray;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function loadDefaultSong() {
    audio.src = './song.mp3';
    audio.load();
  }

  setupEvents();
  init();
};

App();
