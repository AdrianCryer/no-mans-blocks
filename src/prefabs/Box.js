import React, { useEffect, useState } from "react";
import { useBox } from "@react-three/cannon";

export const Box = (props) => {
    const [color, setColor] = useState("white");
    const [cubeRef, api] = useBox(() => ({
        mass: 1,
        args: [0.5, 0.5, 0.5],
        material: {
            friction: 1,
            restitution: 0
        },
        ...props
    }));

    return (
        <mesh ref={cubeRef} castShadow layers={props.layers}>
            <boxBufferGeometry args={[0.5, 0.5, 0.5]} />
            <meshLambertMaterial color={color} />
        </mesh>
    );
};
