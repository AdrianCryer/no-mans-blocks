import React, { useEffect, useRef, useState, createRef, useMemo } from "react"
import { useSphere } from "@react-three/cannon"
import { useThree, useFrame } from "react-three-fiber"
import * as THREE from "three"

const SPEED = 7
const keys = { KeyW: "forward", KeyS: "backward", KeyA: "left", KeyD: "right", Space: "jump" }
const moveFieldByKey = (key) => keys[key]
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

const usePlayerControls = () => {
    const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false, jump: false })
    useEffect(() => {
        const handleKeyDown = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }))
        const handleKeyUp = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }))
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("keyup", handleKeyUp)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("keyup", handleKeyUp)
        }
    }, [])
    return movement
}

export const Player = React.forwardRef((props, entityRef) => {
    // let entity = useRef()
    
    const [ref, api] = useSphere(() => ({ 
        mass: 1, 
        type: "Dynamic", 
        ...props 
    }), entityRef)
    const { forward, backward, left, right, jump } = usePlayerControls()
    const { camera } = useThree()

    const velocity = useRef([0, 0, 0])

    // let playerApi = usePlayerStore()
    // playerApi.state.velocity.set()

    useEffect(() => void api.velocity.subscribe((v) => (velocity.current = v)), [api])
    useFrame(() => {
        camera.position.copy(ref.current.position.clone().add(new THREE.Vector3(0, 1, 0)))
        frontVector.set(0, 0, Number(backward) - Number(forward))
        sideVector.set(Number(left) - Number(right), 0, 0)
        
        let cameraFacing = new THREE.Quaternion();
        camera.getWorldQuaternion(cameraFacing)

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyQuaternion(cameraFacing)
        
        // Stop camera pitch from affecting speed
        direction.y = 0
        direction.normalize()
                .multiplyScalar(SPEED)
        
        api.velocity.set(direction.x, velocity.current[1], direction.z)

        if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05) 
            api.velocity.set(velocity.current[0], 15, velocity.current[2])
    })
    return <mesh ref={ref} />
})
