export function generateMockData(points: number) {
  const data = []
  const now = new Date()

  for (let i = 0; i < points; i++) {
    // Calculate time going backwards from now
    const time = new Date(
      now.getTime() - (points - i - 1) * (points === 24 ? 3600000 : points === 7 ? 86400000 : 86400000),
    )

    // Generate some realistic looking data with trends
    const baseTemp = 70 + Math.sin(i / (points / 4)) * 10
    const baseVoltage = 12.5 + Math.sin(i / (points / 6)) * 0.5
    const baseRPM = 3000 + Math.sin(i / (points / 3)) * 1000
    const baseTilt = 5 + Math.sin(i / (points / 5)) * 10
    const baseSpeed = 50 + Math.sin(i / (points / 4)) * 30
    const baseWeight = 1250 + Math.sin(i / (points / 7)) * 150

    // Add some noise
    const temperature = Math.floor(baseTemp + (Math.random() * 5 - 2.5))
    const voltage = (baseVoltage + (Math.random() * 0.4 - 0.2)).toFixed(1)
    const current = Math.floor(10 + Math.random() * 5)
    const rpm = Math.floor(baseRPM + (Math.random() * 400 - 200))
    const tilt = Math.floor(baseTilt + (Math.random() * 4 - 2))
    const speed = Math.floor(baseSpeed + (Math.random() * 10 - 5))
    const weight = Math.floor(baseWeight + (Math.random() * 50 - 25))

    data.push({
      time: time.toLocaleTimeString(),
      timestamp: time.getTime(),
      temperature,
      voltage,
      current,
      rpm,
      tilt,
      speed,
      weight,
    })
  }

  return data
}
