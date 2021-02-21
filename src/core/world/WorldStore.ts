import create from 'zustand';
import * as THREE from "three";
import { WorldRenderer } from './WorldRenderer';
import { World, Chunk, Position } from '.';


type IndexedType<T> = { [key: string]: T };

type IWorldStore = {
    // currentWorld: World;
    chunks: IndexedType<Chunk>;
    chunkMeshes: IndexedType<THREE.BufferGeometry>;
    emptyMeshes: IndexedType<boolean>;
    getChunkMeshes: (world: World, chunkPosition: Position, renderDistance: number, renderHeight: number) => THREE.BufferGeometry[];
    loadChunks: (world: World, chunkPosition: Position, renderDistance: number, renderHeight: number) => void;
    generateChunkMeshes: (world: World, chunkPosition: Position, renderDistance: number, renderHeight: number) => void;
}

function getPositionKey(position: Position) {
    return `${position.x},${position.y},${position.z}`;
}

function getAdjacent(pos: Position, chunks: IndexedType<Chunk>, adjacent: Chunk[]): boolean {

    let key;
    for (let [dim, val] of Object.entries(pos)) {
        for (let delta of [-1, 1]) {
            key = getPositionKey({ ...pos, [dim]: val + delta })
            if (!chunks.hasOwnProperty(key)) {
                return false;
            }
            adjacent.push(chunks[key]);
        }
    }
    return true;
}

export const worldStore = create<IWorldStore>((set, get) => ({

    currentWorld: null,
    chunks: {},
    chunkMeshes: {},
    emptyMeshes: {},

    getChunkMeshes: (world, chunkPosition, renderDistance, renderHeight) => {

        let output = [];
        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                for (let y = -renderHeight; y <= renderHeight; y++) {
                    const key = getPositionKey({ 
                        x: chunkPosition.x + x, 
                        y: chunkPosition.y + y, 
                        z: chunkPosition.z + z
                    });
                    if (key in get().chunkMeshes) {
                        output.push(get().chunkMeshes[key]);
                    }
                }
            }
        }

        return output;
    },

    getChunkMeshesTransient: () => {

    },

    loadChunks: (world, chunkPosition, renderDistance, renderHeight) => {
        let created = 0;
        let chunks: IndexedType<Chunk> = {};
        console.time('setState loadchunks');

        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                for (let y = -renderHeight; y <= renderHeight; y++) {

                    // If i used a hash here, might be better... oh well
                    const id = `${chunkPosition.x + x},${chunkPosition.y + y},${chunkPosition.z + z}`;
                    if (!get().chunks.hasOwnProperty(id) && !chunks.hasOwnProperty(id)) {
                        const chunk: Chunk = world.createChunk({
                            x: chunkPosition.x + x, 
                            y: chunkPosition.y + y, 
                            z: chunkPosition.z + z
                        });
                        chunks[id] = chunk;
                        created++;
                    }
                }
            }
        }
        
        console.log(Object.keys(get().chunks).length, created)
        set(state => ({ chunks: { ...state.chunks, ...chunks }}));
        console.timeEnd('setState loadchunks')
    },

    generateChunkMeshes: (world: World, chunkPosition, renderDistance, renderHeight) => {
        const chunks = get().chunks;
        let meshes: IndexedType<THREE.BufferGeometry> = {};
        let empty: IndexedType<boolean> = {}; 

        let i = 0;

        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                for (let y = -renderHeight; y <= renderHeight; y++) {

                    const chunk = get().chunks[getPositionKey({
                        x: chunkPosition.x + x,
                        y: chunkPosition.y + y,
                        z: chunkPosition.z + z
                    })];

                    // Empty, contains only air
                    if (!chunk || chunk.isEmpty) {
                        continue;
                    }
                    
                    const pos: Position = chunk.position;
                    const id = getPositionKey(pos);
                    if (get().emptyMeshes.hasOwnProperty(id)) {
                        continue;
                    }
                    if (!get().chunkMeshes.hasOwnProperty(id)) {

                        // Get adjacent, ignore ones that do not have all surrounding chunks.
                        let adjacent: Chunk[] = [];
                        let success = getAdjacent(pos, chunks, adjacent);
                        if (!success) {
                            continue;
                        }

                        // Not empty but not visible at all.
                        let mesh = WorldRenderer.generateBufferMeshFromChunk(world, chunk, adjacent);
                        if (mesh.getAttribute('position').array.length === 0) {
                            empty[id] = true;
                        } else {
                            meshes[id] = mesh;
                            i++;
                        }
                    }
                }
            }
        }
  
        console.log("Rendered ", i, " chunks");
        set(state => ({ 
            chunkMeshes: { ...state.chunkMeshes, ...meshes },
            emptyMeshes: { ...state.emptyMeshes, ...empty }
        }));
    }
}));
