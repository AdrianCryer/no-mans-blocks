import { hashlittle } from "jenkins-hash";
import { ProceduralProperties, ProceduralTexture } from "../ProceduralTexture";
import seedrandom from 'seedrandom';

export class WhiteNoise implements ProceduralTexture {

    properties: ProceduralProperties;
    random: seedrandom.prng;

    constructor(properties: ProceduralProperties) {
        this.properties = properties;
        this.random = seedrandom(properties.seed.toString());
    }

    // random(hash: number) {
        // return this.random.quick();
        // return hash / 0xFFFFFFFF;
        // return Math.random()
    // }

    generate2D(x: number, y: number): number {
        // return this.random(this.hash([x, y]));
        // console.log(this.random.quick());
        return this.random.quick();
        // return 0;
    }

    generate4D(x: number, y: number, z: number, w: number): number {
        // return this.random(this.hash([x, y, z, w]));
        return this.random.quick()
        return 0;
    }

    hash(uints: number[]): number {
        return hashlittle(new Uint32Array(uints));
    }
}