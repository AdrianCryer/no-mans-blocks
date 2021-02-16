import React, { useRef, useEffect } from 'react';
import { PerlinNoiseGenerator } from '../core/textures/Texture';
let { Noise } = require('noisejs'); 

export const CanvasImageTest = (props: any) => {
    const ref = useRef<HTMLCanvasElement>(null);
    
    
    useEffect(() => {

        const canvas = ref.current;
        const context = canvas?.getContext('2d');
        if (canvas === null || !context) {
            return;
        }

        context.imageSmoothingEnabled = false;
        let image = context.createImageData(canvas.width, canvas.height);
        let data = image.data;

        const gen = new PerlinNoiseGenerator(1000);
        const noise = new Noise(1000);

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {

                // let value = 255 * Math.random();
                // let value = 256 * gen.generate2D(x / 5, y / 5);
                console.log(gen.generate2D(x / 5, y / 5))
                let value =  128 * (1 + gen.generate2D(x / 5, y / 5));
                // let value = 128 * (1 + noise.perlin2(x / 5, y / 5));

                let cell = (x + y * canvas.width) * 4;;
                data[cell] = data[cell + 1] = data[cell + 2] = value;
                data[cell + 3] = 255;
            }
        }
        context.putImageData(image, 0, 0);
    }, [])

    const style = {
        width: 800,
        height: 800,
    };

    return <canvas width={64} height={64} style={{...style, imageRendering: 'pixelated' }} ref={ref}/>;
}