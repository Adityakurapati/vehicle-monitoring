const { InfluxDB } = require("@influxdata/influxdb-client");

export async function generateMockData(points: number) {
  // InfluxDB setup
  const token = "onboarding-arduinoWizard-token-1745320424205";
  const url = "us-east-1-1.aws.cloud2.influxdata.com";
  const org = "2430acfaf34becd3";
  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  // Determine the time range based on points
  const now = new Date();
  let startTime;

  if (points === 24) {
    // Last 24 hours
    startTime = new Date(now.getTime() - 24 * 3600000);
  } else if (points === 7) {
    // Last 7 days
    startTime = new Date(now.getTime() - 7 * 86400000);
  } else {
    // Default to days
    startTime = new Date(now.getTime() - points * 86400000);
  }

  const formattedStartTime = startTime.toISOString();

  // Flux query to get temperature data
  const fluxQuery = `
    from(bucket: "weather")
      |> range(start: ${formattedStartTime})
      |> filter(fn: (r) => r._measurement == "environment")
      |> filter(fn: (r) => r._field == "temperature")
      |> limit(n: ${points})
  `;

  // Create a promise-based function for the InfluxDB query
  const fetchTemperatureData = () => {
    return new Promise((resolve, reject) => {
      const tempData = [];

      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          tempData.push({
            timestamp: new Date(o._time).getTime(),
            temperature: o._value,
          });
        },
        error(error) {
          console.error("InfluxDB query error:", error);
          reject(error);
        },
        complete() {
          resolve(tempData);
        },
      });
    });
  };

  try {
    // Fetch real temperature data from InfluxDB
    const temperatureData = await fetchTemperatureData();

    // Sort temperature data by timestamp
    temperatureData.sort((a, b) => a.timestamp - b.timestamp);

    // Generate complete dataset with real temperature and mock data for other fields
    const data = [];

    // If we got fewer points than requested, we'll need to fill in
    const timeInterval = points === 24 ? 3600000 : 86400000;

    for (let i = 0; i < points; i++) {
      const time = new Date(now.getTime() - (points - i - 1) * timeInterval);
      const timestamp = time.getTime();

      // Find closest temperature reading
      let temperature;
      const exactMatch = temperatureData.find(
        (item) => item.timestamp === timestamp
      );

      if (exactMatch) {
        // If we have an exact timestamp match
        temperature = exactMatch.temperature;
      } else {
        // Find the closest reading or generate mock temperature
        const closest = temperatureData.reduce(
          (prev, curr) => {
            return Math.abs(curr.timestamp - timestamp) <
              Math.abs(prev.timestamp - timestamp)
              ? curr
              : prev;
          },
          { timestamp: 0, temperature: 0 }
        );

        if (
          closest.timestamp !== 0 &&
          Math.abs(closest.timestamp - timestamp) < timeInterval
        ) {
          temperature = closest.temperature;
        } else {
          // Generate mock temperature if no close match
          const baseTemp = 70 + Math.sin(i / (points / 4)) * 10;
          temperature = Math.floor(baseTemp + (Math.random() * 5 - 2.5));
        }
      }

      // Generate mock data for other metrics
      const baseVoltage = 12.5 + Math.sin(i / (points / 6)) * 0.5;
      const baseRPM = 3000 + Math.sin(i / (points / 3)) * 1000;
      const baseTilt = 5 + Math.sin(i / (points / 5)) * 10;
      const baseSpeed = 50 + Math.sin(i / (points / 4)) * 30;
      const baseWeight = 1250 + Math.sin(i / (points / 7)) * 150;

      const voltage = parseFloat(
        (baseVoltage + (Math.random() * 0.4 - 0.2)).toFixed(1)
      );
      const current = Math.floor(10 + Math.random() * 5);
      const rpm = Math.floor(baseRPM + (Math.random() * 400 - 200));
      const tilt = Math.floor(baseTilt + (Math.random() * 4 - 2));
      const speed = Math.floor(baseSpeed + (Math.random() * 10 - 5));
      const weight = Math.floor(baseWeight + (Math.random() * 50 - 25));

      data.push({
        time: time.toLocaleTimeString(),
        timestamp,
        temperature,
        voltage,
        current,
        rpm,
        tilt,
        speed,
        weight,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating data:", error);

    // Fallback to fully mock data if InfluxDB query fails
    console.log("Falling back to mock data");
    return generateFallbackMockData(points);
  }
}

// Fallback function with the original mock data logic
function generateFallbackMockData(points: number) {
  const data = [];
  const now = new Date();

  for (let i = 0; i < points; i++) {
    const time = new Date(
      now.getTime() -
        (points - i - 1) *
          (points === 24 ? 3600000 : points === 7 ? 86400000 : 86400000)
    );

    const baseTemp = 70 + Math.sin(i / (points / 4)) * 10;
    const baseVoltage = 12.5 + Math.sin(i / (points / 6)) * 0.5;
    const baseRPM = 3000 + Math.sin(i / (points / 3)) * 1000;
    const baseTilt = 5 + Math.sin(i / (points / 5)) * 10;
    const baseSpeed = 50 + Math.sin(i / (points / 4)) * 30;
    const baseWeight = 1250 + Math.sin(i / (points / 7)) * 150;

    const temperature = Math.floor(baseTemp + (Math.random() * 5 - 2.5));
    const voltage = parseFloat(
      (baseVoltage + (Math.random() * 0.4 - 0.2)).toFixed(1)
    );
    const current = Math.floor(10 + Math.random() * 5);
    const rpm = Math.floor(baseRPM + (Math.random() * 400 - 200));
    const tilt = Math.floor(baseTilt + (Math.random() * 4 - 2));
    const speed = Math.floor(baseSpeed + (Math.random() * 10 - 5));
    const weight = Math.floor(baseWeight + (Math.random() * 50 - 25));

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
    });
  }

  return data;
}
