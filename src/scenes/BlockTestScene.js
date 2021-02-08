import React, { useRef, useEffect, useMemo, Suspense } from 'react'
import { useLoader } from "react-three-fiber"
import { Sky, OrbitControls, FlyControls } from "@react-three/drei"
import * as THREE from "three"
import { Noise } from "noisejs"
import grass from '../assets/grass_debug.jpg'
import { WorldRenderer } from '../core/WorldRenderer'

const WORLD_SIZE = 128
const CHUNK_SIZE = 128

function Box(props) {
    const mesh = useRef()
    const geom = useMemo(() => new THREE.BoxBufferGeometry(1, 1, 1))

    return (
        <>
            <mesh
                {...props}
                ref={mesh}
                scale={[1, 1, 1]}
            >
                <boxBufferGeometry args={[1, 1, 1]} />
                <meshStandardMaterial 
                    polygonOffset={true} 
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                    color={Math.random() > 0.05 ? 'green' : 'darkgreen'} 
                />
            </mesh>
            {props.debug !== false && (
                <lineSegments
                    {...props}
                >
                    <edgesGeometry attach="geometry" args={[geom]}/>
                    <lineBasicMaterial color="lightgreen" attach="material"/>
                </lineSegments>
            )}
        </>
    )
}

function WireframeOverlay(props) {
    const geom = useMemo(() => props.geom)
    return (
        <lineSegments
            {...props}
        >
            <edgesGeometry attach="geometry" args={[geom]}/>
            <lineBasicMaterial color="lightgreen" attach="material"/>
        </lineSegments>
    )
}


function ChunkBorder(props) {
    const geom = useMemo(() => new THREE.BoxBufferGeometry(props.chunkSize, props.chunkSize, props.chunkSize))
    return (
        <lineSegments
            {...props}
        >
            <edgesGeometry attach="geometry" args={[geom]}/>
            <lineBasicMaterial color="red" attach="material" />
        </lineSegments>
    )
}

function generateRandom(blocks, frequency) {
    for (let z = 0; z < WORLD_SIZE; z++) {
        for (let y = 0; y < WORLD_SIZE; y++) {
            for (let x = 0; x < WORLD_SIZE; x++) {
                blocks[x + y * WORLD_SIZE + z * WORLD_SIZE * WORLD_SIZE] = (Math.floor(frequency * Math.random()) === 0)
            }
        }
    }
}

function generateSphere(blocks) {
    let radius = Math.ceil(CHUNK_SIZE / 2) + (CHUNK_SIZE % 2 == 0 ? 0.5 : 0)

    // let center = [radius, radius]
    for (let z = 0; z < WORLD_SIZE; z++) {
        for (let y = 0; y < WORLD_SIZE; y++) {
            for (let x = 0; x < WORLD_SIZE; x++) {
                if (Math.pow(x - radius + 1, 2) + Math.pow(y - radius + 1, 2) + Math.pow(z - radius + 1, 2) < radius * radius) {
                    blocks[x + y * WORLD_SIZE + z * WORLD_SIZE * WORLD_SIZE] = true
                }
            }
        }
    }
}


function generatePerlinNoiseTerrain(blocks, height=10) {

    // Needs to be unbounded
    let noise = new Noise(Math.random());

    // for (let z = 0; z < WORLD_SIZE; z++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            // console.log(noise.get(x, y, z))
            // let display = false
            // if (y < CHUNK_SIZE / 3) {
            //     display = true
            // } else {
            //     // display = (noise.perlin2(x, z) * height > (y + CHUNK_SIZE / 3) * 4)
                
            // }
            // if (y == 1) {
            //     display = true
            // } else {
            //     display = noise.perlin2(x / 100, z / 100) * height > 0
            // }

            let yHeight1 = noise.perlin2(x / 100, z / 100) * height
            let yHeight2 = noise.perlin2(x / 10, z / 10) * height / 15 
            let yHeight = yHeight1 + yHeight2
            for (let y = 0; y < yHeight; y++) {
                blocks[x + y * WORLD_SIZE + z * WORLD_SIZE * WORLD_SIZE] = true
            }
            blocks[x + z * WORLD_SIZE * WORLD_SIZE] = true
        }
    }
}
// }


function getBlock(blocks, x, y, z) {
    return blocks[x + y * WORLD_SIZE + z * WORLD_SIZE * WORLD_SIZE]
}

function generateMesh(blocks) {
    let mesh = new THREE.Geometry()
    let currVert = 0

    for (let z = 0; z < WORLD_SIZE; z++) {
        for (let y = 0; y < WORLD_SIZE; y++) {
            for (let x = 0; x < WORLD_SIZE; x++) {
                
                if (!getBlock(blocks, x, y, z))
                    continue

                // x - 1
                if (x > 0 && !getBlock(blocks, x - 1, y, z)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x, y, z + 1),     
                        new THREE.Vector3(x, y + 1, z + 1),
                        new THREE.Vector3(x, y + 1, z),
                        new THREE.Vector3(x, y, z)
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                        [ new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 0) ]
                    )
                    currVert += 4
                }

                // x + 1
                if (x < WORLD_SIZE - 1 && !getBlock(blocks, x + 1, y, z)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x + 1, y, z),   
                        new THREE.Vector3(x + 1, y + 1, z),
                        new THREE.Vector3(x + 1, y + 1, z + 1),
                        new THREE.Vector3(x + 1, y, z + 1)
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                        [ new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 0) ]
                    )
                    currVert += 4
                }

                // y - 1
                if (y > 0 && !getBlock(blocks, x, y - 1, z)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x,     y, z),   
                        new THREE.Vector3(x + 1, y, z),
                        new THREE.Vector3(x + 1, y, z + 1),
                        new THREE.Vector3(x,     y, z + 1)
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0) ],
                        [ new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1) ]
                    )
                    currVert += 4
                }

                // y + 1
                if (y < WORLD_SIZE - 1 && !getBlock(blocks, x, y + 1, z)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x, y + 1, z + 1),   
                        new THREE.Vector3(x + 1, y + 1, z + 1),
                        new THREE.Vector3(x + 1, y + 1, z),
                        new THREE.Vector3(x, y + 1, z )
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                        [ new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 0) ]
                    )
                    currVert += 4
                }
                
                // z - 1
                if (z > 0 && !getBlock(blocks, x, y, z - 1)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x, y + 1, z),   
                        new THREE.Vector3(x + 1, y + 1, z),
                        new THREE.Vector3(x + 1, y, z),
                        new THREE.Vector3(x, y, z )
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(0, 1), new THREE.Vector2(1, 1), new THREE.Vector2(1, 0) ],
                        [ new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1) ]
                    )
                    currVert += 4
                }

                // z + 1
                if (z < WORLD_SIZE - 1 && !getBlock(blocks, x, y, z + 1)) {

                    // Add vertices
                    mesh.vertices.push(
                        new THREE.Vector3(x,      y,      z + 1),   
                        new THREE.Vector3(x + 1,  y,      z + 1),
                        new THREE.Vector3(x + 1,  y + 1,  z + 1),
                        new THREE.Vector3(x,      y + 1,  z + 1)
                    )
                    mesh.faces.push(
                        new THREE.Face3(currVert, currVert + 1, currVert + 2),
                        new THREE.Face3(currVert + 2, currVert + 3, currVert)
                    )
                    mesh.faceVertexUvs[0].push(
                        [ new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1) ],
                        [ new THREE.Vector2(0, 1), new THREE.Vector2(1, 1), new THREE.Vector2(1, 0) ]
                    )
                    currVert += 4
                }
            }
        }
    }

    mesh.computeFaceNormals();
    return mesh
}


export const BlockTestScene = (props) => {

    // Setup blocks
    // const world : World {
    //     chunkSize: CHUNK_SIZE,
    //     blocks: [
    //         new
    //     ]
    // }
    
    // generateSphere(blocks)
    const chunk = useMemo(() => {
        let blocks = new Array(Math.pow(WORLD_SIZE, 3) + 10);
        
        // renderer = new WorldRenderer()
        generatePerlinNoiseTerrain(blocks, CHUNK_SIZE / 3)
        return generateMesh(blocks)
    })
    const position = [
        - CHUNK_SIZE / 2,
        - CHUNK_SIZE / 2,
        - CHUNK_SIZE / 2
    ]
    const texture = useLoader(THREE.TextureLoader, grass)
    const grassTexture = useMemo(() => new THREE.MeshStandardMaterial({ map: texture }), [])

    return (
        <>
            <Sky sunPosition={[100, 100, 100]} scale={[WORLD_SIZE, WORLD_SIZE, WORLD_SIZE]}/>
            <color attach="background" args={['lightblue']} />
            <hemisphereLight intensity={0.2} />
            <spotLight position={[100, 100, 100]} angle={0.8} penumbra={1} intensity={1.1} castShadow />
            <FlyControls movementSpeed={25} rollSpeed={0.5}/>
            <ChunkBorder chunkSize={CHUNK_SIZE} position={[0, 0, 0]} />
            <mesh args={[chunk, grassTexture]} position={position}>
                {/* <meshStandardMaterial 
                    attach='material'
                    polygonOffset={true} 
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                    color={Math.random() > 0.05 ? 'green' : 'darkgreen'} 
                /> */}
            </mesh>
            {/* <WireframeOverlay geom={chunk} position={position}/> */}
            {/* {blocks.map((shouldRender, i) => {
                if (shouldRender) {
                    let position = [
                        i % WORLD_SIZE - CHUNK_SIZE / 2 + 0.5,
                        Math.floor(i / WORLD_SIZE) % WORLD_SIZE - CHUNK_SIZE / 2 + 0.5,
                        Math.floor(i / WORLD_SIZE / WORLD_SIZE) - CHUNK_SIZE / 2 + 0.5
                    ]
                    return <Box key={i} position={position} />
                }
            })} */}
            <axesHelper args={[100]}/>
        </>
    )
}
