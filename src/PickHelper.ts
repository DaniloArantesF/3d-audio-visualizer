import * as THREE from 'three';

interface Position {
  x: number;
  y: number;
}

class PickHelper {
  pickPosition: Position;
  raycaster: THREE.Raycaster;
  pickedObject: THREE.Object3D | null;
  pickedObjectSavedColor: number;
  canvas: HTMLCanvasElement;

  constructor() {
    this.pickPosition = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
    this.canvas = document.getElementById('app_view') as HTMLCanvasElement;

    window.addEventListener('mousemove', this.setPickPosition);
    window.addEventListener('mouseout', this.clearPickPosition);
    window.addEventListener('mouseleave', this.clearPickPosition);
  }

  pick(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    if (this.pickedObject) {
      this.pickedObject = null;
    }

    // Cast a ray through frustum at mouse position
    this.raycaster.setFromCamera(this.pickPosition, camera);

    // Get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);

    if (intersectedObjects.length) {
      if (intersectedObjects[0].object.type === 'GridHelper') return;
      // Pick the closest object (will be the first)
      this.pickedObject = intersectedObjects[0].object;
      //console.log(this.pickedObject);
    }
  }

  getCanvasRelativePosition = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left),
      y: (event.clientY - rect.top),
    };
  };

  setPickPosition = (event: MouseEvent) => {
    const pos = this.getCanvasRelativePosition(event);

    // Get relative position, stretch it by 2 and move it left by 1
    this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
    this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1; // Need to reflect Y
  };

  clearPickPosition = () => {
    this.pickPosition.x = Number.NEGATIVE_INFINITY;
    this.pickPosition.y = Number.NEGATIVE_INFINITY;
  };
}

export default PickHelper;
