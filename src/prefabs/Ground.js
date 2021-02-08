import * as THREE from "three"
import React from "react"
import { useLoader } from "react-three-fiber"
import { usePlane } from "@react-three/cannon"
// import grass from "./assets/grass.jpg"

export const Ground = (props) => {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
    // const texture = useLoader(THREE.TextureLoader, grass)
    // texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    // texture.repeat.set(100, 100)
    return (
        <mesh ref={ref} receiveShadow>
            <planeBufferGeometry attach="geometry" args={[100, 100]} />
            <meshStandardMaterial color="green" />
            {/* <shadowMaterial attach="material" color="#171717" /> */}
        </mesh>
    )
}
