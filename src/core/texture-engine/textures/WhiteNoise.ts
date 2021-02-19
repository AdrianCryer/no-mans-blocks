import { ProceduralProperties, ProceduralTexture } from "../ProceduralTexture";
import XXH, { HashObject } from 'xxhashjs';

export class WhiteNoise implements ProceduralTexture {

    properties: ProceduralProperties;
    h: HashObject;

    constructor(properties: ProceduralProperties) {
        this.properties = properties;
        this.h = XXH.h32(properties.seed);
    }

    random(hash: number) {
        return hash / 0xFFFFFFFF;
    }

    generate2D(x: number, y: number): number {
        return this.random(this.hash([x, y]));
    }

    generate4D(x: number, y: number, z: number, w: number): number {
        return this.random(this.hash([x, y, z, w]));
    }

    hash(uints: number[]): number {
        return this.h.update(Buffer.from(uints)).digest().toNumber();
    }
}