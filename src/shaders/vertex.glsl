varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  // Pass uv data to fragment shader
  vertexUV = uv;
  vertexNormal = normalize(normalMatrix * normal);

  // Update vertex position
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}