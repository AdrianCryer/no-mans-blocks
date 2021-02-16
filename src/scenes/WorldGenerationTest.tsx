import { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { useFrame, useLoader } from "react-three-fiber"
import { Sky, OrbitControls, FlyControls } from "@react-three/drei"
import * as THREE from "three";
import { World, BLOCK_AIR, Chunk, Position } from '../core';
import grass from '../assets/grass.jpg';
import { PerlinNoiseTerrainGenerator } from '../core/TerrainGenerator';
import { worldStore } from '../core/WorldStore';
import { PerlinNoiseGenerator } from '../core/textures/Texture';


interface ChunkBorderProps {
    chunkSize: number;
}

function ChunkBorder({ chunkSize }: ChunkBorderProps) {
    const geom = useMemo(() => new THREE.BoxBufferGeometry(chunkSize, chunkSize, chunkSize), [])
    return (
        <lineSegments position={[-chunkSize / 2, -chunkSize / 2, -chunkSize / 2]}>
            <edgesGeometry attach="geometry" args={[geom]}/>
            <lineBasicMaterial color="red" attach="material" />
        </lineSegments>
    )
}

const WORLD_SIZE: number = 256;
const CHUNK_SIZE: number = 16;
const CHUNK_HEIGHT: number = 32;
const RENDER_DISTANCE: number = 8;
const RENDER_HEIGHT: number = 2;

const world: World  = new World(CHUNK_SIZE, CHUNK_HEIGHT, [
    {
        id: 1,
        name: 'BLOCK_GRASS'
    }, 
], new PerlinNoiseTerrainGenerator(50, 50, WORLD_SIZE / 8, 100));


function generateGradientTexture() {
    const width = 32;
    const height = 32;

    const data = new Uint8Array(3 * width * height);
    const colour = new THREE.Color(0xffffff);

    const r = Math.floor( colour.r * 255 );
    const g = Math.floor( colour.g * 255 );
    const b = Math.floor( colour.b * 255 );

    for ( let i = 0; i < width * height; i ++ ) {
        const stride = i * 3;
        data[ stride ] = i / (width * height) * 255;
        data[ stride + 1 ] = g;
        data[ stride + 2 ] = b;
    }

    return new THREE.DataTexture( data, width, height, THREE.RGBFormat );
}

function generatePerlinTexture() {
    const width = 128;
    const height = 128;

    const data = new Uint8Array(3 * width * height);
    const colour = new THREE.Color(0xffffff);

    const r = Math.floor( colour.r * 255 );
    const g = Math.floor( colour.g * 255 );
    const b = Math.floor( colour.b * 255 );

    const generator = new PerlinNoiseGenerator(100);


    for ( let i = 0; i < width * height; i++ ) {
        const stride = i * 3;
        const n = generator.generate2D(i / width / 50, (i % width / 50));
        console.log(n)
        data[ stride ]     = (n * 256);
        data[ stride + 1 ] = (n * 256);
        data[ stride + 2 ] = (n * 256);
    }

    return new THREE.DataTexture( data, width, height, THREE.RGBFormat );
}


export const WorldGenerationTest = (props: any) => {

    const texture = useLoader(THREE.TextureLoader, grass)
    const grassTexture = useMemo(() => new THREE.MeshStandardMaterial({ map: texture }), [])
    const perlinTexture = useMemo(() => new THREE.MeshStandardMaterial({ map: generatePerlinTexture() }), [])

    const player = useRef<FlyControls>();
    const currentChunkPos = useRef({ x: 0, y: 0, z: 0});
    const chunkMeshes = worldStore(state => state.chunkMeshes);

    useFrame(() => {
        if (player.current !== undefined && player.current.object !== undefined) {
            
            let chunkPos = {
                x: Math.floor(player.current.object.position.x / CHUNK_SIZE),
                y: Math.floor(player.current.object.position.y / CHUNK_HEIGHT),
                z: Math.floor(player.current.object.position.z / CHUNK_SIZE)
            };

            if (currentChunkPos.current !== undefined) {
                if (chunkPos.x !== currentChunkPos.current.x ||
                    chunkPos.y !== currentChunkPos.current.y ||
                    chunkPos.z !== currentChunkPos.current.z ) {
                        
                    worldStore.getState().loadChunks(world, chunkPos, RENDER_DISTANCE, RENDER_HEIGHT);
                    worldStore.getState().generateChunkMeshes(world);
                    currentChunkPos.current = chunkPos;
                }
            }
        }
    });

    return (
        <>
            {/* <ambientLight intensity={0.4} /> */}
            <Sky sunPosition={[0, 100, 0]} distance={1000} inclination={0.5} />

            <hemisphereLight intensity={0.1} />
            <spotLight position={[100, 100, 100]} angle={0.8} penumbra={1} intensity={0.8} castShadow />
            <FlyControls ref={player} movementSpeed={20} rollSpeed={0.4} position={[0, 5, 0]}/>
            {/* <OrbitControls listenToKeyEvents={undefined}/> */}
            <Suspense fallback={null}>
                <group>
                    {Object.values(chunkMeshes).map(mesh => <mesh key={mesh.uuid} args={[mesh, perlinTexture]} position={[0, 0, 0]} />)}
                </group>
            </Suspense>
            
            <axesHelper args={[100]}/>
            <ChunkBorder chunkSize={CHUNK_SIZE} />
        </>
    );
}