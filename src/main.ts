import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PickHelper from './PickHelper';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import './style.css';

const App = () => {
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
  camera.position.set(15, 25, 0);

  // Parent camera to obj so we can spin the object and move camera
  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  // Add grid and mouse controls
  const gridHelper = new THREE.GridHelper(200, 50);
  const pickHelper = new PickHelper();
  scene.add(gridHelper);
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
      camera.position.set(15, 25, 0);
    });
  }
  function init() {
    const geometry = new THREE.BoxGeometry(10, 1, 10);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(0, 10, 0);
    render();
  }

  function render() {
    uniforms.u_time.value = clock.getElapsedTime();
    pickHelper.pick(scene, camera);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  setupCanvasEvents();
  init();
};

App();