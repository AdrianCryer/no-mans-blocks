import React, { useRef, useCallback, useEffect, createRef, Suspense } from "react"
import { Canvas } from "react-three-fiber"
import { Sky, PointerLockControls } from "@react-three/drei"
import { Physics } from "@react-three/cannon"
import { Player } from "../prefabs/Player"
import { Ground } from "../prefabs/Ground"
import { Box } from "../prefabs/Box"

let player = createRef()


export const TestScene = (props) => {
    console.log("rendered scene")
    
    const initialPlayer = {
		position: [0, 10, 0],
		scale: [10, 10, 10]
    }
    
    let player = useRef()

    useEffect(() => {
		let frame = undefined
		let lastCalledTime = Date.now()

		function renderLoop() {
            let delta = (Date.now() - lastCalledTime) / 1000
            if (delta > 1) {
                console.log(player.current.position)
                lastCalledTime = Date.now()
            }
			frame = requestAnimationFrame(renderLoop)
		}
		renderLoop()

		return () => cancelAnimationFrame(frame)
	}, [])

    return (
        <>
            <Sky sunPosition={[100, 100, 100]} />
            <color attach="background" args={['lightblue']} />
            <hemisphereLight intensity={0.35} />
            <spotLight position={[100, 100, 100]} angle={0.8} penumbra={1} intensity={1.5} castShadow />

            <Physics 
                gravity={[0, -18, 0]}
                tolerance={0}
                iterations={50}
                broadphase={"SAP"}
            >
                <Player {...initialPlayer} ref={player}/>
                <Ground />
                <Box position={[10, 5.5, 0]} />
                <Box position={[10, 0.5, 0]} />
            </Physics>
            <PointerLockControls maxPolarAngle={Math.PI - Math.PI / 16} minPolarAngle={Math.PI / 16}/>
        </>
    )
}