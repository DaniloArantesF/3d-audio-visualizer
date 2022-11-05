#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
varying float amplitude;
varying vec2 vertexUV;
varying vec3 vertexNormal;

varying float x;
varying float y;
varying float z;

void main() {
  float normalizedZ = abs(z / amplitude);
  gl_FragColor = vec4(.8*(-log(normalizedZ) -1.0), 0.5 -log(normalizedZ) -1.0, 1.0 -log(normalizedZ) -1.0, 1.0);
}