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
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    generate2D(x: number, y: number): number {
        let fx = Math.floor(x);
        let fy = Math.floor(y);
        let fracx = x - fx;
        let fracy = y - fy;

        let u = this.fade(x);
        const offset = 0xdeadbeef; 

        let g1 = this.gradient2D(hashlittle(new Uint16Array([fx, fy]), offset), fracx, fracy);
        let g2 = this.gradient2D(hashlittle(new Uint16Array([fx + 1, fy]), offset), fracx - 1, fracy);
        let g3 = this.gradient2D(hashlittle(new Uint16Array([fx, fy + 1]), offset), fracx, fracy - 1);
        let g4 = this.gradient2D(hashlittle(new Uint16Array([fx + 1, fy + 1]), offset), fracx - 1, fracy - 1);

        return this.lerp(
            this.lerp(g1, g2, u),
            this.lerp(g3, g4, u),
            this.fade(y)
        );
    }

    
    generate4D(x: number, y: number, z: number, w: number) {

    }
}



class TextureGenerator {

    static noise() {

    }
}