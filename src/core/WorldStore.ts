import create from 'zustand';
import * as THREE from "three";
import { World, Chunk, Position } from '.';
import { WorldRenderer } from './WorldRenderer';


type IndexedType<T> = { [key: string]: T };

type IWorldStore = {
    // currentWorld: World;
    chunks: IndexedType<Chunk>;
    chunkMeshes: IndexedType<THREE.Geometry>;
    emptyMeshes: IndexedType<boolean>;
    loadChunks: (world: World, initialChunkPosition: Position, renderDistance: number) => void;
    generateChunkMeshes: (world: World) => void;
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

    loadChunks: (world, position, renderDistance) => {

        let chunks: IndexedType<Chunk> = {};
        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                for (let y = -renderDistance / 2; y <= renderDistance / 2; y++) {

                    // If i used a hash here, might be better... oh well
                    const id = `${position.x + x},${position.y + y},${position.z + z}`;
                    if (!get().chunks.hasOwnProperty(id)) {
                        const chunk: Chunk = world.createChunk({
                            x: x + position.x, 
                            y: y + position.y, 
                            z: z + position.z
                        });
                        chunks[id] = chunk;
                    }
                }
            }
        }
        set(state => ({ chunks: { ...state.chunks, ...chunks }}));
    },

    generateChunkMeshes: (world: World) => {
        const chunks = get().chunks;
        let meshes: IndexedType<THREE.Geometry> = {};
        let empty: IndexedType<boolean> = {}; 

        let i = 0;

        // Use a quadtree maybe?
        for (let chunk of Object.values(chunks)) {

            // Empty, contains only air
            if (chunk.isEmpty) {
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

                // Empty but not visible at all.
                let mesh = WorldRenderer.generateMeshFromChunk(world, chunk, adjacent);
                if (mesh.vertices.length === 0) {
                    empty[id] = true;
                } else {
                    meshes[id] = mesh;
                    i++;
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
