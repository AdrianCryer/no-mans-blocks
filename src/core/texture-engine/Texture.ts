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

    gradient4D(hash: number, x: number, y: number, z: number, w: number) {
        let h = hash & 31;
        let u = h < 24 ? x : y;
        let v = h < 16 ? y : z;
        let s = h < 8 ? z : w;
        return (h & 1 ? u : -u) + (h & 2 ? v : -v) + (h & 4 ? s : -s);
    }

    generate2D(x: number, y: number): number {
        let fx = Math.floor(x);
        let fy = Math.floor(y);

        let dx = x - fx;
        let dy = y - fy;

        let g1 = this.gradient2D(this.hash([fx, fy]),          dx,      dy);
        let g2 = this.gradient2D(this.hash([fx + 1, fy]),      dx - 1,  dy);
        let g3 = this.gradient2D(this.hash([fx, fy + 1]),      dx,      dy - 1);
        let g4 = this.gradient2D(this.hash([fx + 1, fy + 1]),  dx - 1,  dy - 1);
        
        let u = this.fade(dx);
        return this.lerp(
            this.lerp(g1, g2, u),
            this.lerp(g3, g4, u),
            this.fade(dy)
        );
    }

    
    generate4D(x: number, y: number, z: number, w: number): number {
        let fx = Math.floor(x);
        let fy = Math.floor(y);
        let fz = Math.floor(z);
        let fw = Math.floor(w);

        let dx = x - fx;
        let dy = y - fy;
        let dz = z - fz;
        let dw = w - fw;

        let g1 = this.gradient4D(this.hash([fx, fy, fz, fw]), dx, dy, dz, dw);
        let g2 = this.gradient4D(this.hash([fx + 1, fy, fz, fw]), dx - 1, dy, dz, dw);
        let g3 = this.gradient4D(this.hash([fx, fy + 1, fz, fw]), dx, dy - 1, dz, dw);
        let g4 = this.gradient4D(this.hash([fx + 1, fy + 1, fz, fw]), dx - 1, dy - 1, dz, dw);

        let g5 = this.gradient4D(this.hash([fx, fy, fz + 1, fw]), dx, dy, dz - 1, dw);
        let g6 = this.gradient4D(this.hash([fx + 1, fy, fz + 1, fw]), dx - 1, dy, dz - 1, dw);
        let g7 = this.gradient4D(this.hash([fx, fy + 1, fz + 1, fw]), dx, dy - 1, dz - 1, dw);
        let g8 = this.gradient4D(this.hash([fx + 1, fy + 1, fz + 1, fw]), dx - 1, dy - 1, dz - 1, dw);

        let g9 = this.gradient4D(this.hash([fx, fy, fz, fw + 1]), dx, dy, dz, dw - 1);
        let g10 = this.gradient4D(this.hash([fx + 1, fy, fz, fw + 1]), dx - 1, dy, dz, dw - 1);
        let g11 = this.gradient4D(this.hash([fx, fy + 1, fz, fw + 1]), dx, dy - 1, dz, dw - 1);
        let g12 = this.gradient4D(this.hash([fx + 1, fy + 1, fz, fw + 1]), dx - 1, dy - 1, dz, dw - 1);
        let g13 = this.gradient4D(this.hash([fx, fy, fz + 1, fw + 1]), dx, dy, dz - 1, dw - 1);
        let g14 = this.gradient4D(this.hash([fx + 1, fy, fz + 1, fw + 1]), dx - 1, dy, dz - 1, dw - 1);
        let g15 = this.gradient4D(this.hash([fx, fy + 1, fz + 1, fw + 1]), dx, dy - 1, dz - 1, dw - 1);
        let g16 = this.gradient4D(this.hash([fx + 1, fy + 1, fz + 1, fw + 1]), dx - 1, dy - 1, dz - 1, dw - 1);

        let u = this.fade(dx);
        let v = this.fade(dy);
        let t = this.fade(dz);
        let s = this.fade(dw);

        return this.lerp(
            this.lerp(
                this.lerp(
                    this.lerp(g1, g2, u),
                    this.lerp(g3, g4, u),
                    v
                ),
                this.lerp(
                    this.lerp(g5, g6, u),
                    this.lerp(g7, g8, u),
                    v
                ),
                t
            ),
            this.lerp(
                this.lerp(
                    this.lerp(g9, g10, u),
                    this.lerp(g11, g12, u),
                    v
                ),
                this.lerp(
                    this.lerp(g13, g14, u),
                    this.lerp(g15, g16, u),
                    v
                ),
                t
            ),
            s
        );
    }

    hash(uints: number[]): number {
        return hashlittle(new Uint32Array(uints));
    }
}



class TextureGenerator {

    static noise() {

    }
}