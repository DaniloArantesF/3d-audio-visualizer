uniform vec2 u_resolution;
uniform float u_time;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
	vec2 st = vertexUV;
  float y = st.x;

  vec3 color = vec3(y);
  color = vec3(1.0,1.0,0.0);

	gl_FragColor = vec4(color,1.0);
}