"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface VehicleModelProps {
  tilt: number
  speed?: number
}

export default function VehicleModel({ tilt, speed = 0 }: VehicleModelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const carRef = useRef<THREE.Group | null>(null)
  const wheelsRef = useRef<THREE.Mesh[]>([])
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(5, 3, 5)
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.autoRotate = false
    controls.autoRotateSpeed = 1
    controlsRef.current = controls

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)

    // Create ground with gradient
    const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32)

    // Create custom shader material for ground
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      metalness: 0.2,
    })

    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x8b5cf6, 0xdddddd)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    // Create car
    const car = new THREE.Group()

    // Car body with gradient material
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4)

    // Create custom shader material for gradient effect
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.5
    body.castShadow = true
    car.add(body)

    // Car cabin
    const cabinGeometry = new THREE.BoxGeometry(1.5, 0.8, 2)
    const cabinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
      transmission: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
    cabin.position.y = 1.15
    cabin.position.z = -0.5
    cabin.castShadow = true
    car.add(cabin)

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32)
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.5,
    })

    const wheelPositions = [
      { x: -1, y: 0.4, z: -1.3 },
      { x: 1, y: 0.4, z: -1.3 },
      { x: -1, y: 0.4, z: 1.3 },
      { x: 1, y: 0.4, z: 1.3 },
    ]

    const wheels: THREE.Mesh[] = []
    wheelPositions.forEach((position) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(position.x, position.y, position.z)
      wheel.castShadow = true
      car.add(wheel)
      wheels.push(wheel)
    })
    wheelsRef.current = wheels

    // Add sensors (represented as small spheres)
    const sensorGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const sensorMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
      }), // Temperature
      new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
      }), // Voltage
      new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5,
      }), // RPM
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.5,
      }), // Tilt
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.5,
      }), // Speed
      new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.5,
      }), // Weight
    ]

    const sensorPositions = [
      { x: 0, y: 0.8, z: -1.5 }, // Temperature (front)
      { x: 0.8, y: 0.3, z: 1.5 }, // Voltage (back right)
      { x: 0, y: 0.3, z: 0 }, // RPM (center)
      { x: -0.8, y: 0.8, z: 0 }, // Tilt (left side)
      { x: 0.8, y: 0.8, z: -1.0 }, // Speed (front right)
      { x: -0.8, y: 0.3, z: 1.5 }, // Weight (back left)
    ]

    sensorPositions.forEach((position, index) => {
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterials[index])
      sensor.position.set(position.x, position.y, position.z)
      car.add(sensor)
    })

    // Add speed trail particles
    const particleCount = 100
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Position particles behind the car
      particlePositions[i * 3] = (Math.random() - 0.5) * 2 // x
      particlePositions[i * 3 + 1] = Math.random() * 0.5 // y
      particlePositions[i * 3 + 2] = Math.random() * 5 + 2 // z (behind car)

      particleSizes[i] = Math.random() * 0.05 + 0.01
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    particles.position.z = 2 // Position behind car
    car.add(particles)

    scene.add(car)
    carRef.current = car

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Animate sensors with pulsing effect
      car.children.forEach((child, index) => {
        if (index >= 5 && index <= 10) {
          // Sensors are at these indices
          const time = Date.now() * 0.001
          const scale = 1 + 0.2 * Math.sin(time * 3 + index)
          child.scale.set(scale, scale, scale)
        }
      })

      // Animate wheels based on speed
      if (wheelsRef.current.length > 0 && speed) {
        const rotationSpeed = speed / 100
        wheelsRef.current.forEach((wheel) => {
          wheel.rotation.x += rotationSpeed
        })
      }

      // Animate particles based on speed
      if (particles && speed > 0) {
        const positions = particles.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < particleCount; i++) {
          // Move particles forward (decreasing z)
          positions[i * 3 + 2] -= (speed / 100) * (Math.random() * 0.1 + 0.05)

          // If particle is too far forward, reset it to behind the car
          if (positions[i * 3 + 2] < -2) {
            positions[i * 3] = (Math.random() - 0.5) * 2 // x
            positions[i * 3 + 1] = Math.random() * 0.5 // y
            positions[i * 3 + 2] = Math.random() * 2 + 2 // z (behind car)
          }
        }

        particles.geometry.attributes.position.needsUpdate = true
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
  }, [speed])

  // Update car tilt based on tilt value
  useEffect(() => {
    if (carRef.current) {
      // Convert tilt to radians and apply rotation with smooth animation
      const tiltRadians = (tilt * Math.PI) / 180

      // Animate the tilt change
      const animate = () => {
        const currentTilt = carRef.current.rotation.z
        const targetTilt = tiltRadians / 3
        const diff = targetTilt - currentTilt

        if (Math.abs(diff) > 0.001) {
          carRef.current.rotation.z += diff * 0.1
          requestAnimationFrame(animate)
        } else {
          carRef.current.rotation.z = targetTilt
        }
      }

      animate()
    }
  }, [tilt])

  return <div ref={containerRef} className="h-full w-full rounded-lg overflow-hidden shadow-inner" />
}
