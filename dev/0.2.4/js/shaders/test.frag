// --------------------------------------------------------- 
// author: Michael Willian dax-soft@live.com
// Change colors toward other color (rgb)
// --------------------------------------------------------- 

precision highp float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec3 tcolor;
uniform float u_time;
uniform float tred;
uniform float tgreen;
uniform float tblue;

// --------------------------------------------------------- 
// rand 
// --------------------------------------------------------- 
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}



void main(void){
    vec4 color = texture2D(uSampler, vTextureCoord);

    // Un-premultiply alpha before applying the color matrix. See issue #3539.
    if (color.a > 0.0) {
        color.rgb /= color.a;
    }


    //color.r =  red * (sin(u_time));
    color.r = tred * (sin(u_time));
    // color.g = green;
    // color.b = blue;


    // Premultiply alpha again.
    color.rgb *= color.a;

    gl_FragColor = color;
}