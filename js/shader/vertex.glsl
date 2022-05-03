uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;


uniform mat4 viewMatrixCamera;
uniform mat4 projectionMatrixCamera;
uniform mat4 modelMatrixCamera;

varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec4 vTexCoords;



uniform mat4 textureMatrixProj; // for projective texturing
varying vec4 texCoordProj; // for projective texturing


void main() {
  vUv = uv;
  
  texCoordProj = textureMatrixProj * modelMatrix * vec4(position , 1.0);  // for projective texturing
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  vTexCoords = projectionMatrix * viewMatrix * vWorldPosition;
}