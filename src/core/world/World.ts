import { BlockType, Position, Chunk, BLOCK_AIR } from '.';
import { TerrainGenerator } from '../TerrainGenerator';

export default class World {

    chunkSize: number;
    chunkHeight: number;
    blocks: BlockType[];
    generator: TerrainGenerator;

    constructor(chunkSize: number, chunkHeight: number, blocks: BlockType[], generator: TerrainGenerator) {
        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this.blocks = [BLOCK_AIR, ...blocks];
        this.generator = generator;
    }

    public createChunk(position: Position): Chunk {
        let data = new Array<BlockType>();
        for (let i = 0; i < Math.pow(this.chunkSize, 2) * this.chunkHeight; i++) {
            data.push(this.blocks[0]);
        }
        let chunk: Chunk = { position, data };
        let isEmpty = this.generator.generateChunk(this, chunk);
        chunk.isEmpty = isEmpty;

        return chunk;
    }

    public getChunkLookupKey(x: number, y: number, z: number) {
        return x + (y * this.chunkSize) + (z * this.chunkSize * this.chunkHeight);
    }

    public getBlock(chunk: Chunk, x: number, y: number, z: number) : BlockType {
        return chunk.data[this.getChunkLookupKey(x, y, z)];
    }
}