uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
varying vec4 vTexCoords;
varying vec4 texCoordProj; // for projective texturing
void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	// gl_FragColor = vec4(vUv,0.0,1.);

	// vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;
	// vec4 outColor = texture(texture1, uv);
	vec4 temp = texCoordProj;
	// temp.y*=1.33;t
	// texCoordProj.y*=2.;
	vec4 im1 = temp.q < 0.0 ? vec4(1.0, 0.0, 0.0, 1.0) : texture2DProj( texture1, temp); // for projective texturing

	// gl_FragColor = temp(texture1, uv);
	vec2 uvuv = temp.xy/texCoordProj.z;

	// if((texCoordProj.x>0.5) || (texCoordProj.x<-0.0) || (texCoordProj.y<-0.0) || (texCoordProj.y>0.5)) {
		if(uvuv.x>1. || uvuv.x<0. || uvuv.y<0. || uvuv.y>1.){
		gl_FragColor = vec4(1.,0.3,0.,1.);
		discard;
		
	} else{
		gl_FragColor = im1;

		// gl_FragColor = vec4(fract(texCoordProj.x));


	}
	gl_FragColor.a = 0.5;

	// gl_FragColor = vec4(fract(texCoordProj.xy/texCoordProj.z),0.,1.);
}