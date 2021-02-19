import World from './World';

// Need to encode / specify additional top / side textures. I.e. grass block in mc
export interface BlockType {
    id: number;
    name: String;
}

// data.length() === CHUNK_SIZE^3
export interface Chunk {
    position: Position
    data: BlockType[];
    isEmpty?: boolean; 
}

export const BLOCK_AIR : BlockType = {
    id: 0,
    name: "BLOCK_AIR"
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

export { World };