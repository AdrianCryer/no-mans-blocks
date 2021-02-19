import { BlockType, Chunk, World } from './world';
let { Noise } = require('noisejs');     // Typescript defs not working...

export interface TerrainGenerator {
    generateChunk(world: World, chunk: Chunk): boolean;
};

export class PerlinNoiseTerrainGenerator implements TerrainGenerator {

    scaleX: number;
    scaleZ: number;
    height: number;
    generator: any;

    constructor(scaleX: number, scaleZ: number, height: number, seed?: number) {
        this.scaleX = scaleX;
        this.scaleZ = scaleZ;
        this.height = height;
        if (seed === undefined) {
            this.generator = new Noise();
        } else {
            this.generator = new Noise(seed);
        }
    }

    generateCaves() {

    }

    generateChunk(world: World, chunk: Chunk): boolean {
        let isEmpty = true;
        let caveWidthThreshold  = 0.05;

        for (let z = 0; z < world.chunkSize; z++) {
            for (let x = 0; x < world.chunkSize; x++) {
                
                let xPos = x + chunk.position.x * world.chunkSize;
                let zPos = z + chunk.position.z * world.chunkSize;

                let yHeight1 = this.generator.perlin2(xPos / this.scaleX, zPos / this.scaleZ) * this.height
                let yHeight2 = this.generator.perlin2(xPos / 10, zPos / 10) * this.height / 15 
                let height = yHeight1 + yHeight2;

                for (let y = chunk.position.y * world.chunkHeight; y < height; y++) {

                    // Caves
                    // if (this.generator.perlin3(xPos / 100, (y + chunk.position.y * world.chunkSize) / 100, zPos / 100) > caveWidthThreshold) {
                    //     chunk.data[world.getChunkLookupKey(x, y - chunk.position.y * world.chunkSize, z)] = world.blocks[0];
                    //     break;
                    // }
                    if (y - chunk.position.y * world.chunkHeight > world.chunkHeight - 1) {
                        break;
                    }
                    chunk.data[world.getChunkLookupKey(x, y - chunk.position.y * world.chunkHeight, z)] = world.blocks[1];
                    isEmpty = false;
                }
                
            }
        }
        return isEmpty;
    }
};