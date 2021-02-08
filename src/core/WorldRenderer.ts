import * as THREE from "three";
import { Chunk, World, BLOCK_AIR, Position } from '.';

type Vertex = {
    pos: [x: number, y: number, z: number];
    normal: [x: number, y: number, z: number];
    uv: [u: number, v: number];
}

const vertexMap: { [key: string]: Vertex[] } = {
    'x+1': [
        { pos: [1, 1, 1], normal: [1, 0, 0], uv: [1, 1] },            // TOP LEFT 2
        { pos: [1, 0, 1], normal: [1, 0, 0], uv: [0, 1] },          // TOP RIGHT 1
        { pos: [1, 1, 0], normal: [1, 0, 0], uv: [1, 0] },            // BOTTOM LEFT 3
        { pos: [1, 0, 0], normal: [1, 0, 0], uv: [0, 0] },            // BOTTOM RIGHT 4
    ],          
    'x-1': [
        { pos: [0, 1, 0], normal: [-1, 0, 0], uv: [1, 1] },             // TOP LEFT 2
        { pos: [0, 0, 0], normal: [-1, 0, 0], uv: [0, 1] },     // TOP RIGHT 1
        { pos: [0, 1, 1], normal: [-1, 0, 0], uv: [1, 0] },             // BOTTOM LEFT 3
        { pos: [0, 0, 1], normal: [-1, 0, 0], uv: [0, 0] },          // BOTTOM RIGHT 4
    ],            
    'y+1':[
        { pos: [1, 1, 0], normal: [0, 1, 0], uv: [1, 1] },            // TOP LEFT 2
        { pos: [0, 1, 0], normal: [0, 1, 0], uv: [0, 1] },     // TOP RIGHT 1
        { pos: [1, 1, 1], normal: [0, 1, 0], uv: [1, 0] },            // BOTTOM LEFT 3
        { pos: [0, 1, 1], normal: [0, 1, 0], uv: [0, 0] },           // BOTTOM RIGHT 4
    ],
    'y-1':[
        { pos: [1, 0, 1], normal: [0, -1, 0], uv: [1, 1] },             // TOP LEFT 2
        { pos: [0, 0, 1], normal: [0, -1, 0], uv: [0, 1] },      // TOP RIGHT 1
        { pos: [1, 0, 0], normal: [0, -1, 0], uv: [1, 0] },             // BOTTOM LEFT 3
        { pos: [0, 0, 0], normal: [0, -1, 0], uv: [0, 0] },           // BOTTOM RIGHT 4
    ], 
    'z+1':[
        { pos: [1, 1, 1], normal: [0, 0, 1], uv: [1, 1] },            // TOP LEFT 2
        { pos: [0, 1, 1], normal: [0, 0, 1], uv: [0, 1] },     // TOP RIGHT 1
        { pos: [1, 0, 1], normal: [0, 0, 1], uv: [1, 0] },            // BOTTOM LEFT 3
        { pos: [0, 0, 1], normal: [0, 0, 1], uv: [0, 0] },          // BOTTOM RIGHT 4
    ], 
    'z-1':[
        { pos: [1, 0, 0], normal: [0, 0, -1], uv: [1, 1] },             // TOP LEFT 2
        { pos: [0, 0, 0], normal: [0, 0, -1], uv: [0, 1] },      // TOP RIGHT 1
        { pos: [1, 1, 0], normal: [0, 0, -1], uv: [1, 0] },             // BOTTOM LEFT 3
        { pos: [0, 1, 0], normal: [0, 0, -1], uv: [0, 0] },          // BOTTOM RIGHT 4
    ]             
};

function renderFace(faceData: Vertex[], position: Position, offset: Position,
    vertices: number[], normals: number[], uvs: number[], indices: number[]) {
    
    const indexPos = Math.floor(vertices.length / 3);
    for (let { pos, normal, uv } of faceData) {
        vertices.push(
            position.x + offset.x + pos[0],
            position.y + offset.y + pos[1],
            position.z + offset.z + pos[2],
        );
        normals.push(...normal);
        uvs.push(...uv);
    }

    indices.push(
        indexPos,     indexPos + 1, indexPos + 2,
        indexPos + 2, indexPos + 1, indexPos + 3,
    );
}

/**
 * Houses functions to assist in the world generation.
 */
export class WorldRenderer {

    static generateBufferMeshFromChunk(world: World, chunk: Chunk, adjacent: Chunk[]) : THREE.BufferGeometry {

        const offset = { 
            x: chunk.position.x * world.chunkSize,
            y: chunk.position.y * world.chunkHeight,
            z: chunk.position.z * world.chunkSize
        }
        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indicies: number[] = [];
        
        for (let z = 0; z < world.chunkSize; z++) {
            for (let x = 0; x < world.chunkSize; x++) {
                for (let y = 0; y < world.chunkHeight; y++) {
                    
                    if (world.getBlock(chunk, x, y, z).id === BLOCK_AIR.id) 
                        continue;
                    const pos = { x, y, z };
                    // x - 1
                    if ((x == 0 && world.getBlock(adjacent[0], world.chunkSize - 1, y, z).id === BLOCK_AIR.id) ||
                        x > 0 && world.getBlock(chunk, x - 1, y, z).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['x-1'], pos, offset, vertices, normals, uvs, indicies);
                    }

                    // x + 1
                    if ((x == world.chunkSize - 1 && world.getBlock(adjacent[1], 0, y, z).id === BLOCK_AIR.id) || 
                        x < world.chunkSize - 1 && world.getBlock(chunk, x + 1, y, z).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['x+1'], pos, offset, vertices, normals, uvs, indicies);
                    }

                    // y - 1
                    if ((y == 0 && world.getBlock(adjacent[2], x, world.chunkHeight - 1, z).id === BLOCK_AIR.id) ||
                        y > 0 && world.getBlock(chunk, x, y - 1, z).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['y-1'], pos, offset, vertices, normals, uvs, indicies);
                    }

                    // y + 1
                    if ((y == world.chunkHeight - 1 && world.getBlock(adjacent[3], x, 0, z).id === BLOCK_AIR.id) || 
                        y < world.chunkHeight - 1 && world.getBlock(chunk, x, y + 1, z).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['y+1'], pos, offset, vertices, normals, uvs, indicies);
                    }

                    // z - 1
                    if ((z == 0 && world.getBlock(adjacent[4], x, y, world.chunkSize - 1).id === BLOCK_AIR.id) ||
                        z > 0 && world.getBlock(chunk, x, y, z - 1).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['z-1'], pos, offset, vertices, normals, uvs, indicies);
                    }

                    // z + 1
                    if ((z == world.chunkSize - 1 && world.getBlock(adjacent[5], x, y, 0).id === BLOCK_AIR.id) ||
                        z < world.chunkSize - 1 && world.getBlock(chunk, x, y, z + 1).id === BLOCK_AIR.id) {
                        renderFace(vertexMap['z+1'], pos, offset, vertices, normals, uvs, indicies);
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', 
            new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('normal', 
            new THREE.BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', 
            new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indicies);
        // geometry.computeVertexNormals()
        return geometry;
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