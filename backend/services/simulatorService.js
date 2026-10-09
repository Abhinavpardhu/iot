import storage from './storageService.js';
import config from '../config/config.js';

class SimulatorService {
  constructor() {
    this.timer = null;
    this.io = null;
    this.automationEngine = null;
    this.stepCount = 0;
  }

  init(io, automationEngine) {
    this.io = io;
    this.automationEngine = automationEngine;
    this.start();
  }

  start() {
    if (this.timer) clearInterval(this.timer);

    const interval = config.simulator.intervalMs || 3500;
    this.timer = setInterval(() => {
      this.tick();
    }, interval);

    console.log(`[SimulatorService] Demo mode simulator running (interval: ${interval}ms).`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick() {
    const settings = storage.getSettings();
    if (settings.systemMode !== 'demo') {
      return; // Do not simulate if hardware mode is active
    }

    this.stepCount++;

    // 1. Temperature Living Room (Smooth random walk around 24.5 °C)
    this.walkSensor('temp_living_room', 24.5, 0.2, 19.0, 32.0);

    // 2. Humidity Living Room (Around 53%)
    this.walkSensor('humidity_living_room', 53.0, 0.4, 35.0, 75.0);

    // 3. Bedroom Temperature (Around 22.5 °C)
    this.walkSensor('temp_bedroom', 22.5, 0.15, 18.0, 30.0);

    // 4. Bedroom Humidity (Around 48%)
    this.walkSensor('humidity_bedroom', 48.0, 0.35, 30.0, 70.0);

    // 5. Ambient Light LDR (Around 350 lux with gentle variation)
    this.walkSensor('light_living_room', 380, 12, 50, 950);

    // 6. Kitchen Gas MQ-2 (Normal 20-35 ppm, occasional spike)
    const gasBase = 25;
    this.walkSensor('gas_kitchen', gasBase, 1.5, 15, 60);

    // 7. Motion Sensor: Occasional simulated burst every ~8 ticks
    if (this.stepCount % 8 === 0) {
      const motionActive = Math.random() < 0.6 ? 1 : 0;
      const motionSensor = storage.updateSensorReading('motion_living_room', motionActive);
      if (this.io && motionSensor) {
        this.io.emit('sensor:updated', motionSensor);
        if (motionActive === 1) {
          const log = storage.addLog({
            type: 'SENSOR_UPDATE',
            deviceName: 'HC-SR501 PIR Sensor',
            room: 'Living Room',
            message: 'Simulated motion activity detected in living room zone.',
            status: 'info',
            isSimulated: true,
          });
          this.io.emit('activity:new', log);
        }
      }
      if (motionSensor && this.automationEngine) {
        this.automationEngine.evaluateSensor(motionSensor);
      }
    } else if (this.stepCount % 8 === 2) {
      // Clear motion
      const motionSensor = storage.updateSensorReading('motion_living_room', 0);
      if (this.io && motionSensor) {
        this.io.emit('sensor:updated', motionSensor);
      }
    }
  }

  walkSensor(sensorId, targetCenter, deltaStep, minLimit, maxLimit) {
    const sensor = storage.getSensorById(sensorId);
    if (!sensor) return;

    const current = sensor.value;
    // Bias towards targetCenter + slight random deviation
    const pull = (targetCenter - current) * 0.05;
    const noise = (Math.random() - 0.5) * deltaStep * 2;
    let nextVal = current + pull + noise;

    if (nextVal < minLimit) nextVal = minLimit;
    if (nextVal > maxLimit) nextVal = maxLimit;

    const updated = storage.updateSensorReading(sensorId, nextVal);

    if (this.io && updated) {
      this.io.emit('sensor:updated', updated);
    }

    if (this.automationEngine && updated) {
      this.automationEngine.evaluateSensor(updated);
    }
  }
}

export const simulatorService = new SimulatorService();
export default simulatorService;
