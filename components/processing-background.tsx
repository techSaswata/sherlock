"use client"

import { useEffect, useRef, useState } from "react"

export function ProcessingBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    let animationId: number
    let THREE: any
    let scene: any
    let camera: any
    let renderer: any
    let particlesMesh: any
    let linesMesh: any
    let shapes: any[] = []

    const init = async () => {
      try {
        // Dynamically import Three.js only on client
        THREE = await import("three")
        
        if (!containerRef.current) return

        // Scene setup
        scene = new THREE.Scene()

        // Camera setup
        camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        )
        camera.position.z = 30

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        containerRef.current.appendChild(renderer.domElement)

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry()
        const particlesCount = 800
        const posArray = new Float32Array(particlesCount * 3)
        const colors = new Float32Array(particlesCount * 3)

        const primaryColor = new THREE.Color(0x84cc16)
        const secondaryColor = new THREE.Color(0x22d3ee)
        const accentColor = new THREE.Color(0x818cf8)

        for (let i = 0; i < particlesCount * 3; i += 3) {
          posArray[i] = (Math.random() - 0.5) * 100
          posArray[i + 1] = (Math.random() - 0.5) * 100
          posArray[i + 2] = (Math.random() - 0.5) * 100

          const colorChoice = Math.random()
          let color: any
          if (colorChoice < 0.5) {
            color = primaryColor
          } else if (colorChoice < 0.8) {
            color = secondaryColor
          } else {
            color = accentColor
          }

          colors[i] = color.r
          colors[i + 1] = color.g
          colors[i + 2] = color.b
        }

        particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
        particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.3,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        })

        particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
        scene.add(particlesMesh)

        // Create connecting lines
        const linesGeometry = new THREE.BufferGeometry()
        const linePositions: number[] = []
        const lineColors: number[] = []

        for (let i = 0; i < 40; i++) {
          const x1 = (Math.random() - 0.5) * 80
          const y1 = (Math.random() - 0.5) * 80
          const z1 = (Math.random() - 0.5) * 80
          const x2 = x1 + (Math.random() - 0.5) * 20
          const y2 = y1 + (Math.random() - 0.5) * 20
          const z2 = z1 + (Math.random() - 0.5) * 20

          linePositions.push(x1, y1, z1, x2, y2, z2)

          const color = Math.random() < 0.5 ? primaryColor : secondaryColor
          lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b)
        }

        linesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3))
        linesGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3))

        const linesMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
        })

        linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)
        scene.add(linesMesh)

        // Create geometric shapes
        const geometries = [
          new THREE.TetrahedronGeometry(2, 0),
          new THREE.OctahedronGeometry(2, 0),
          new THREE.IcosahedronGeometry(2, 0),
        ]

        for (let i = 0; i < 4; i++) {
          const geometry = geometries[Math.floor(Math.random() * geometries.length)]
          const material = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? primaryColor : secondaryColor,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
          )
          shapes.push(mesh)
          scene.add(mesh)
        }

        // Mouse movement
        let mouseX = 0
        let mouseY = 0

        const handleMouseMove = (event: MouseEvent) => {
          mouseX = (event.clientX / window.innerWidth) * 2 - 1
          mouseY = -(event.clientY / window.innerHeight) * 2 + 1
        }

        window.addEventListener("mousemove", handleMouseMove)

        // Animation loop
        const clock = new THREE.Clock()

        const animate = () => {
          const elapsedTime = clock.getElapsedTime()

          // Rotate particles
          if (particlesMesh) {
            particlesMesh.rotation.y = elapsedTime * 0.05
            particlesMesh.rotation.x = elapsedTime * 0.03
          }

          // Rotate lines
          if (linesMesh) {
            linesMesh.rotation.y = elapsedTime * 0.02
            linesMesh.rotation.x = -elapsedTime * 0.03
          }

          // Rotate shapes
          shapes.forEach((shape, index) => {
            shape.rotation.x = elapsedTime * (0.3 + index * 0.1)
            shape.rotation.y = elapsedTime * (0.2 + index * 0.1)
            shape.position.y += Math.sin(elapsedTime + index) * 0.01
          })

          // Camera movement
          camera.position.x += (mouseX * 5 - camera.position.x) * 0.05
          camera.position.y += (mouseY * 5 - camera.position.y) * 0.05
          camera.lookAt(scene.position)

          renderer.render(scene, camera)
          animationId = requestAnimationFrame(animate)
        }

        animate()

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
          camera.updateProjectionMatrix()
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        }

        window.addEventListener("resize", handleResize)

        // Cleanup function
        return () => {
          window.removeEventListener("mousemove", handleMouseMove)
          window.removeEventListener("resize", handleResize)
          if (animationId) {
            cancelAnimationFrame(animationId)
          }
          if (containerRef.current && renderer?.domElement) {
            try {
              containerRef.current.removeChild(renderer.domElement)
            } catch (e) {
              // Ignore if already removed
            }
          }
          renderer?.dispose()
        }
      } catch (err) {
        console.error("Error initializing 3D background:", err)
        setError(true)
      }
    }

    const cleanup = init()

    return () => {
      cleanup.then((cleanupFn) => {
        if (cleanupFn) cleanupFn()
      })
    }
  }, [])

  if (error) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
    )
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 opacity-30"
      style={{ pointerEvents: "none" }}
    />
  )
}
