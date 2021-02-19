
export interface ProceduralTexture {
    properties: ProceduralProperties;
    generate2D(x: number, y: number): number;
    generate4D(x: number, y: number, z: number, w: number): number;
}

export interface ProceduralProperties {
    seed: number;
    [x: string]: any;
}