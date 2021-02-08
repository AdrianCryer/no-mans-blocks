import { useRef, useEffect, Suspense } from "react"
import { Canvas } from "react-three-fiber"
import { WorldGenerationTest } from "./scenes/WorldGenerationTest"


function App(props: any) {
	const { game } = props
	const debugRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let frame: number = -1;
		let lastCalledTime = Date.now()
		let fps = 0

		function renderLoop() {
			let delta = (Date.now() - lastCalledTime) / 1000
			lastCalledTime = Date.now()
			fps = 1 / delta
			if (debugRef.current !== null) {
				debugRef.current.innerText = 'FPS ' + fps.toFixed()
			}
			frame = requestAnimationFrame(renderLoop)
		}
		renderLoop()

		return () => cancelAnimationFrame(frame)
	}, [])

	return (
		<>
			<div ref={debugRef} className="fps" />
			<Canvas concurrent shadowMap gl={{ alpha: false }} camera={{ fov: 80 }}>
				<Suspense fallback="LOADING">
					<WorldGenerationTest />
				</Suspense>
			</Canvas>
		</>
	)
}

export default function EntryPoint() {

	let game = useRef()

	// Handle substriptions.

	return <App game={game} />;
}