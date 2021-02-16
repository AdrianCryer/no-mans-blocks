declare module 'jenkins-hash' {
    // import { hashlittle } from 'jenkins-hash';


    export function hashlittle(buffer: Array, initialValue: number): number;
}