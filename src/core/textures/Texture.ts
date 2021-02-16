import { hashlittle } from "jenkins-hash";


export interface Texture {
    size: number;

}

interface TextureProperty {
    name: String;
}

// Want to somehow measure a bunch of properties
// Blend
// Smoothness
// Tiling
// 
/**
 * TextureAnalyser
 */

export class PerlinNoiseGenerator {

    seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a: number, b: number, t: number): number {
        return (1 - t) * a + t * b;
    }

    gradient2D(hash: number, x: number, y: number) {
        let h = hash & 7;
        let u = h < 4 ? x : y;
        let v = 2 * (h < 4 ? y : x);
        return (h & 1 ? u : -u) + (h & 2 ? v : -v);
    }

    generate2D(x: number, y: number): number {
        let fx = Math.floor(x);
        let fy = Math.floor(y);
        let dx = x - fx;
        let dy = y - fy;

        let u = this.fade(dx);
        const offset = 0xdeadbeef; 

        let g1 = this.gradient2D(hashlittle(new Uint8Array([fx, fy])),          dx,      dy);
        let g2 = this.gradient2D(hashlittle(new Uint8Array([fx + 1, fy])),      dx - 1,  dy);
        let g3 = this.gradient2D(hashlittle(new Uint8Array([fx, fy + 1])),      dx,      dy - 1);
        let g4 = this.gradient2D(hashlittle(new Uint8Array([fx + 1, fy + 1])),  dx - 1,  dy - 1);

        return this.lerp(
            this.lerp(g1, g2, u),
            this.lerp(g3, g4, u),
            this.fade(dy)
        );
    }

    
    generate4D(x: number, y: number, z: number, w: number) {

    }
}



class TextureGenerator {

    static noise() {

    }
}