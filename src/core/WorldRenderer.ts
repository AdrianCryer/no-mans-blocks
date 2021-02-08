import * as THREE from "three";
import { Chunk, BlockType, World, BLOCK_AIR } from '.';

/**
 * Houses functions to assist in the world generation.
 */
export class WorldRenderer {

    // chunkSize: number;
    // textureAtlas?: THREE.Texture;

    // constructor(world: World, textureAtlas?: THREE.Texture) {
    //     world = world;
    //     this.chunkSize = world.chunkSize;
    //     this.textureAtlas = textureAtlas;
    // }

    // generateBufferedMeshFromChunk(chunk: Chunk): THREE.BufferGeometry {
    //     return ;
    // }

    // generateChunks

    static generateBufferMeshFromChunk(world: World, chunk: Chunk, adjacent: Chunk[]) : THREE.BufferGeometry {

        const geomtry = new THREE.BufferGeometry();
        const objectMap = [

            // x - 1
            { vertices: [0, 0, 1], normal: [-1, 0, 0], uv: [0, 1] },    // TOP RIGHT
            { vertices: [0, 1, 1], normal: [-1, 0, 0], uv: [1, 1] },    // TOP LEFT
            { vertices: [0, 1, 0], normal: [-1, 0, 0], uv: [1, 0] },    // BOTTOM LEFT
            { vertices: [0, 0, 0], normal: [-1, 0, 0], uv: [0, 0] },    // BOTTOM RIGHT

            
        ];
        
        throw new Error("Not implemented");
    }


    static generateMeshFromChunk(world: World, chunk: Chunk, adjacent: Chunk[]): THREE.Geometry {

        let mesh = new THREE.Geometry();
        const { x, y, z } = chunk.position;
        let offsetX = x * world.chunkSize,
            offsetY = y * world.chunkHeight,
            offsetZ = z * world.chunkSize;

        function renderFace(x: number, y: number, z: number, vertexMap: number[][], uvMap: number[][][]) {

            // Add vertices
            let verts = [];
            for (let [dx, dy, dz] of vertexMap) {
                verts.push(new THREE.Vector3(
                    x + dx + offsetX,
                    y + dy + offsetY,
                    z + dz + offsetZ
                ));
            }
            const vertPosition = mesh.vertices.length;
            mesh.vertices.push(...verts);

            // Create two faces per quad
            mesh.faces.push(
                new THREE.Face3(vertPosition, vertPosition + 1, vertPosition + 2),
                new THREE.Face3(vertPosition + 2, vertPosition + 3, vertPosition)
            );
            // vertPosition += 4;

            // Configure UVs
            mesh.faceVertexUvs[0].push(
                ...uvMap.map(face => face.map(([u, v]) => new THREE.Vector2(u, v)))
            );
        }

        const vertexMapping = [
            [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],       // x - 1
            [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],       // x + 1
            [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],       // y - 1
            [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],       // y + 1
            [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]],       // z - 1
            [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],       // z + 1
            
        ];
        const uvMapping = [
            [ [[1, 0], [1, 1], [0, 1]], [[0, 1], [0, 0], [1, 0]] ],   // x - 1
            [ [[1, 0], [1, 1], [0, 1]], [[0, 1], [0, 0], [1, 0]] ],   // x + 1
            [ [[1, 1], [1, 0], [0, 0]], [[0, 0], [0, 1], [1, 1]] ],   // y - 1
            [ [[1, 0], [1, 1], [0, 1]], [[0, 1], [0, 0], [1, 0]] ],   // y + 1
            [ [[0, 1], [1, 1], [1, 0]], [[1, 0], [0, 0], [0, 1]] ],   // z - 1
            [ [[1, 0], [0, 0], [0, 1]], [[0, 1], [1, 1], [1, 0]] ],   // z + 1
        ];

        for (let z = 0; z < world.chunkSize; z++) {
            for (let x = 0; x < world.chunkSize; x++) {
                for (let y = 0; y < world.chunkHeight; y++) {
                    
                    if (world.getBlock(chunk, x, y, z).id === BLOCK_AIR.id)
                        continue

                    // x + 1
                    if ((x == 0 && world.getBlock(adjacent[0], world.chunkSize - 1, y, z).id === BLOCK_AIR.id) ||
                        x > 0 && world.getBlock(chunk, x - 1, y, z).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[0], uvMapping[0]);
                    }

                    // x- 1
                    if ((x == world.chunkSize - 1 && world.getBlock(adjacent[1], 0, y, z).id === BLOCK_AIR.id) || 
                        x < world.chunkSize - 1 && world.getBlock(chunk, x + 1, y, z).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[1], uvMapping[1]);
                    }

                    // y - 1
                    if ((y == 0 && world.getBlock(adjacent[2], x, world.chunkHeight - 1, z).id === BLOCK_AIR.id) ||
                        y > 0 && world.getBlock(chunk, x, y - 1, z).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[2], uvMapping[2]);
                    }

                    // y + 1
                    if ((y == world.chunkHeight - 1 && world.getBlock(adjacent[3], x, 0, z).id === BLOCK_AIR.id) || 
                        y < world.chunkHeight - 1 && world.getBlock(chunk, x, y + 1, z).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[3], uvMapping[3]);
                    }

                    // z - 1
                    if ((z == 0 && world.getBlock(adjacent[4], x, y, world.chunkSize - 1).id === BLOCK_AIR.id) ||
                        z > 0 && world.getBlock(chunk, x, y, z - 1).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[4], uvMapping[4]);
                    }

                    // z + 1
                    if ((z == world.chunkSize - 1 && world.getBlock(adjacent[5], x, y, 0).id === BLOCK_AIR.id) ||
                        z < world.chunkSize - 1 && world.getBlock(chunk, x, y, z + 1).id === BLOCK_AIR.id) {
                        renderFace(x, y, z, vertexMapping[5], uvMapping[5]);
                    }   
                }
            }
        }

        // Do this manually
        mesh.computeFaceNormals();
        return mesh;
    }
}

interface TextureAtlas {
    file: THREE.Texture;
    
}

// Want a texture atlas per world.
    /**
     * Want:
     *  - Texture atlas per world
     *  - Block types
     *  - Terrain information
     *  - 
     */



// data.length() === CHUNK_SIZE^3

enum FacingDirection {
    PositiveX,
    PositiveY,
    NegativeX,
    NegativeY
}