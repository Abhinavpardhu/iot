import storage from './storageService.js';

class AutomationEngine {
  constructor() {
    this.io = null;
    this.iotService = null;
    this.lastTriggerTimes = new Map();
  }

  init(io, iotService) {
    this.io = io;
    this.iotService = iotService;
  }

  /**
   * Evaluate automation rules against an updated sensor reading.
   * @param {Object} sensor - the updated sensor object
   */
  async evaluateSensor(sensor) {
    const rules = storage.getRules().filter(r => r.isEnabled && r.triggerSensorId === sensor.id);
    const settings = storage.getSettings();

    for (const rule of rules) {
      const isMatch = this.checkCondition(sensor.value, rule.condition, rule.threshold);
      if (isMatch) {
        // Prevent flood triggering: 10-second debounce per rule
        const now = Date.now();
        const lastTrigger = this.lastTriggerTimes.get(rule.id) || 0;
        if (now - lastTrigger < 10000) {
          continue;
        }
        this.lastTriggerTimes.set(rule.id, now);

        await this.executeRule(rule, sensor);
      }
    }
  }

  checkCondition(currentVal, condition, threshold) {
    const numCurrent = Number(currentVal);
    const numThreshold = Number(threshold);

    switch (condition) {
      case 'greater_than':
        return numCurrent > numThreshold;
      case 'less_than':
        return numCurrent < numThreshold;
      case 'equals':
        return numCurrent === numThreshold;
      default:
        return false;
    }
  }

  async executeRule(rule, triggeringSensor) {
    const targetDevice = storage.getDeviceById(rule.targetDeviceId);
    if (!targetDevice) return;

    // Check if target is already in the target state
    if (targetDevice.state === rule.targetState) {
      return;
    }

    const isHardwareMode = storage.getSettings().systemMode === 'hardware';
    const ruleMode = isHardwareMode ? 'hardware_active' : 'demo_only';

    // Update rule metadata
    storage.updateRule(rule.id, {
      lastTriggered: new Date().toISOString(),
      mode: ruleMode
    });

    // Execute device state change through IoT service
    let success = false;
    if (this.iotService) {
      try {
        const result = await this.iotService.sendCommand(targetDevice.id, rule.targetState, {
          source: 'automation',
          ruleName: rule.name
        });
        success = result.success;
      } catch (err) {
        console.error(`[AutomationEngine] Failed executing rule ${rule.name}:`, err.message);
      }
    } else {
      // Fallback direct storage update
      storage.updateDevice(targetDevice.id, { state: rule.targetState });
      success = true;
    }

    // Log the automation trigger event
    const log = storage.addLog({
      type: 'AUTOMATION_TRIGGER',
      deviceName: targetDevice.name,
      room: targetDevice.room,
      message: `Triggered by "${rule.name}": ${triggeringSensor.name} read ${triggeringSensor.value} ${triggeringSensor.unit}. Set to ${rule.targetState}.`,
      status: success ? 'info' : 'warning',
      isSimulated: !isHardwareMode
    });

    // Notify clients via Socket.IO
    if (this.io) {
      this.io.emit('activity:new', log);
      this.io.emit('rule:triggered', {
        ruleId: rule.id,
        ruleName: rule.name,
        targetDeviceId: targetDevice.id,
        state: rule.targetState,
        mode: ruleMode,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const automationEngine = new AutomationEngine();
export default automationEngine;
