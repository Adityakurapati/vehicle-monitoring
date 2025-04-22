"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface ThreeDPieChartProps {
  data: { name: string; value: number }[]
  colors: string[]
}

export default function ThreeDPieChart({ data, colors }: ThreeDPieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)
    scene.background.opacity = 0
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 5)
    cameraRef.current = camera

    // Initialize renderer with transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0) // Transparent background
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.autoRotate = true
    controls.autoRotateSpeed = 2
    controlsRef.current = controls

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create 3D pie chart
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let startAngle = 0

    data.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2
      const endAngle = startAngle + angle

      // Create pie slice geometry
      const pieGeometry = new THREE.BufferGeometry()
      const vertices = []
      const center = new THREE.Vector3(0, 0, 0)

      // Add center vertex
      vertices.push(center.x, center.y, center.z)

      // Add vertices for arc
      const segments = 32
      const angleStep = angle / segments

      for (let i = 0; i <= segments; i++) {
        const currentAngle = startAngle + i * angleStep
        const x = Math.cos(currentAngle)
        const y = Math.sin(currentAngle)
        vertices.push(x, y, 0)
      }

      // Create faces
      const indices = []
      for (let i = 1; i <= segments; i++) {
        indices.push(0, i, i + 1)
      }

      pieGeometry.setIndex(indices)
      pieGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
      pieGeometry.computeVertexNormals()

      // Create material with color
      const color = new THREE.Color(colors[index])
      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        specular: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
      })

      // Create mesh and add to scene
      const pieMesh = new THREE.Mesh(pieGeometry, material)

      // Extrude the pie slice for 3D effect
      const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      }

      // Create shape for extrusion
      const shape = new THREE.Shape()
      shape.moveTo(0, 0)

      for (let i = 0; i <= segments; i++) {
        const currentAngle = startAngle + i * angleStep
        const x = Math.cos(currentAngle)
        const y = Math.sin(currentAngle)
        shape.lineTo(x, y)
      }

      shape.lineTo(0, 0)

      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      const extrudeMesh = new THREE.Mesh(extrudeGeometry, material)

      // Add slight offset for each slice for "exploded" view
      const midAngle = startAngle + angle / 2
      const offsetX = Math.cos(midAngle) * 0.1
      const offsetY = Math.sin(midAngle) * 0.1
      extrudeMesh.position.set(offsetX, offsetY, 0)

      // Add to scene
      scene.add(extrudeMesh)

      // Update start angle for next slice
      startAngle = endAngle
    })

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)

      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      rendererRef.current?.dispose()
    }
  }, [data, colors])

  return <div ref={containerRef} className="h-full w-full" />
}
