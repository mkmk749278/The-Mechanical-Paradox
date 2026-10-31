import * as THREE from 'three';
import {feaRamp} from '../brand';

// FEA-style stress shading (owner's blueprint §2.3 rule 3; PLAYBOOK §8.5). The colour is a von Mises stress value
// mapped through the brand ramp: deep navy → cyan → yellow → red → deep red, blooming at the notch, crack root or
// contact patch. The field is an honest model, not decoration: each hotspot is a stress concentration with a peak
// factor (Kt from a source, or ILLUSTRATIVE on screen) that falls off with distance like 1 / (1 + (d / r)²), on top of
// the nominal stress. When a film has a real FE result, bake it into a vertex attribute `stress` (0–1) and set
// `useAttribute` instead.

export const MAX_HOTSPOTS = 6;

export type Hotspot = {
	position: THREE.Vector3;
	/** Peak stress as a fraction of the ramp's top (0–1). */
	peak: number;
	/** Fall-off radius in scene units. */
	radius: number;
};

const rampGlsl = (): string => {
	const c = feaRamp.map((hex) => new THREE.Color(hex));
	const v = (col: THREE.Color) => `vec3(${col.r.toFixed(4)}, ${col.g.toFixed(4)}, ${col.b.toFixed(4)})`;
	return `
vec3 feaRamp(float s) {
	s = clamp(s, 0.0, 1.0);
	vec3 c0 = ${v(c[0])}; vec3 c1 = ${v(c[1])}; vec3 c2 = ${v(c[2])}; vec3 c3 = ${v(c[3])}; vec3 c4 = ${v(c[4])};
	if (s < 0.25) return mix(c0, c1, smoothstep(0.0, 0.25, s));
	if (s < 0.5) return mix(c1, c2, smoothstep(0.25, 0.5, s));
	if (s < 0.78) return mix(c2, c3, smoothstep(0.5, 0.78, s));
	return mix(c3, c4, smoothstep(0.78, 1.0, s));
}`;
};

const vertex = `
attribute float stress;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vStress;
void main() {
	vec4 w = modelMatrix * vec4(position, 1.0);
	vWorld = w.xyz;
	vNormal = normalize(mat3(modelMatrix) * normal);
	vStress = stress;
	gl_Position = projectionMatrix * viewMatrix * w;
}`;

const fragment = `
uniform vec3 uHot[${MAX_HOTSPOTS}];
uniform float uPeak[${MAX_HOTSPOTS}];
uniform float uRadius[${MAX_HOTSPOTS}];
uniform int uCount;
uniform float uNominal;
uniform float uLoad;        // 0–1: the load ramps up with the story
uniform float uUseAttribute;
uniform vec3 uLightDir;
uniform float uContours;    // number of iso-stress bands drawn as thin lines (0 = none)
varying vec3 vWorld;
varying vec3 vNormal;
varying float vStress;
${rampGlsl()}
void main() {
	float s = uNominal;
	for (int i = 0; i < ${MAX_HOTSPOTS}; i++) {
		if (i >= uCount) break;
		float d = distance(vWorld, uHot[i]) / uRadius[i];
		s = max(s, uNominal + (uPeak[i] - uNominal) / (1.0 + d * d));
	}
	s = mix(s, vStress, uUseAttribute) * uLoad;
	vec3 col = feaRamp(s);
	if (uContours > 0.0) {
		float band = fract(s * uContours);
		float w = fwidth(s * uContours);
		col = mix(col * 0.55, col, smoothstep(0.0, w * 1.5, band));
	}
	float lambert = 0.55 + 0.45 * max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
	gl_FragColor = vec4(col * lambert, 1.0);
}`;

export const makeFeaMaterial = (hotspots: Hotspot[], nominal = 0.12, contours = 10): THREE.ShaderMaterial => {
	const hot = Array.from({length: MAX_HOTSPOTS}, (_, i) => hotspots[i]?.position ?? new THREE.Vector3());
	return new THREE.ShaderMaterial({
		vertexShader: vertex,
		fragmentShader: fragment,
		uniforms: {
			uHot: {value: hot},
			uPeak: {value: Array.from({length: MAX_HOTSPOTS}, (_, i) => hotspots[i]?.peak ?? 0)},
			uRadius: {value: Array.from({length: MAX_HOTSPOTS}, (_, i) => hotspots[i]?.radius ?? 1)},
			uCount: {value: Math.min(hotspots.length, MAX_HOTSPOTS)},
			uNominal: {value: nominal},
			uLoad: {value: 1},
			uUseAttribute: {value: 0},
			uLightDir: {value: new THREE.Vector3(0.4, 0.8, 0.6)},
			uContours: {value: contours},
		},
	});
};

/** Geometry without a `stress` attribute still needs one for the shader to compile cleanly. */
export const ensureStressAttribute = (g: THREE.BufferGeometry): THREE.BufferGeometry => {
	if (!g.getAttribute('stress')) {
		g.setAttribute('stress', new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count), 1));
	}
	return g;
};
