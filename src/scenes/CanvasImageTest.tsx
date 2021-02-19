import React, { useRef, useEffect } from 'react';
import { PerlinNoiseGenerator } from '../core/texture-engine/Texture';
import { WhiteNoise } from '../core/texture-engine/textures/WhiteNoise';
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
        // const gen = new PerlinNoiseGenerator(1000);
        const gen = new WhiteNoise({ seed: 1000 });
        // const noise = new Noise(1000);

        let offset = 0;
        let frame = -1;
        const tilingPeriod = 2;
        const scale = 5;

        function renderLoop() {
            if (canvas === null || !context) {
                return;
            }
            for (let x = 0; x < canvas.width; x++) {
                for (let y = 0; y < canvas.height; y++) {
    
                    let mx = Math.cos(x / canvas.width * 2 * Math.PI * tilingPeriod);
                    let my = Math.sin(x / canvas.width * 2 * Math.PI * tilingPeriod);
                    let mz = Math.cos(y / canvas.height * 2 * Math.PI * tilingPeriod);
                    let mw = Math.sin(y / canvas.height * 2 * Math.PI * tilingPeriod);

                    // let value =  128 * (1 + gen.generate4D(mx * scale + offset, my * scale + offset, mz * scale + offset, mw * scale + offset));
                    // let value =  128 * (1 + gen.generate4D(mx + offset, my + offset, mz + offset, mw + offset));
                    let value =  256 * ( gen.generate2D(x + offset, y));
                    // console.log(value)
                    // let value = 128 * (1 + noise.perlin2(x / 20, y / 20));
                    if (value > 128)
                        value /= 1.2
    
                    let cell = (x + y * canvas.width) * 4;;
                    data[cell] = data[cell + 1] = data[cell + 2] = value;
                    data[cell + 3] = 255;
                }
            }
            context.putImageData(image, 0, 0);
            offset += 0.2;
            frame = requestAnimationFrame(renderLoop)
        }
        renderLoop()

        return () => cancelAnimationFrame(frame)
    }, [])

    const style = {
        width: 800,
        height: 800,
    };

    return <canvas width={128} height={128} style={{...style, imageRendering: 'pixelated' }} ref={ref}/>;
}