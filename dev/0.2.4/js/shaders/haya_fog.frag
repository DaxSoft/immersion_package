precision highp float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform int octaves;
uniform float time;
uniform sampler2D uSampler;
uniform vec2 u_resolution;



float random(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}


void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 fcolor = vec3(0.0);

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }

    fcolor += fbm(st*3.0);

    
    //Premultiply alpha again.
    color.rgb *= color.a;

    gl_FragColor = vec4(fcolor, color.a);


    

    // gl_FragColor = color;
}
