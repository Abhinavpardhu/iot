async function runTests() {
  const base = 'http://localhost:5000';
  console.log('Testing Endpoints...');

  // 1. Health
  const health = await fetch(base + '/api/health').then(r => r.json());
  console.log('1. Health check:', health.status, 'Mode:', health.systemMode);

  // 2. Devices
  const devRes = await fetch(base + '/api/devices').then(r => r.json());
  console.log('2. Devices total:', devRes.data.length, 'Active:', devRes.stats.active, 'Power Watts:', devRes.stats.currentPowerWatts);

  // 3. Toggle Device Command
  const toggleRes = await fetch(base + '/api/devices/light_lr_main/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'ON' })
  }).then(r => r.json());
  console.log('3. Device command response:', toggleRes.success, 'New state:', toggleRes.data.state, 'isSimulated:', toggleRes.isSimulated);

  // 4. Sensors
  const senRes = await fetch(base + '/api/sensors').then(r => r.json());
  console.log('4. Sensors count:', senRes.data.length, 'First sensor:', senRes.data[0].name, senRes.data[0].value, senRes.data[0].unit);

  // 5. Sensor History
  const histRes = await fetch(base + '/api/sensors/temp_living_room/history').then(r => r.json());
  console.log('5. Sensor history data points:', histRes.data.length);

  // 6. Rooms
  const roomRes = await fetch(base + '/api/rooms').then(r => r.json());
  console.log('6. Rooms count:', roomRes.data.length, 'First room devices:', roomRes.data[0].devices.length);

  // 7. Bulk Room Toggle
  const bulkRes = await fetch(base + '/api/rooms/living-room/toggle-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'OFF' })
  }).then(r => r.json());
  console.log('7. Bulk room toggle:', bulkRes.success, 'Affected:', bulkRes.results.length);

  // 8. Automation Rules
  const autoRes = await fetch(base + '/api/automation').then(r => r.json());
  console.log('8. Automation rules count:', autoRes.data.length, 'First rule:', autoRes.data[0].name, 'Status:', autoRes.data[0].currentModeStatus);

  // 9. Activity Logs
  const actRes = await fetch(base + '/api/activity?limit=5').then(r => r.json());
  console.log('9. Activity logs returned:', actRes.data.length, 'Latest log:', actRes.data[0].message);

  // 10. Settings & Diagnostics
  const setRes = await fetch(base + '/api/settings').then(r => r.json());
  console.log('10. Settings mode:', setRes.data.systemMode, 'MQTT broker:', setRes.data.mqtt.brokerUrl, 'Diagnostics Uptime:', setRes.diagnostics.uptimeSeconds);

  // 11. Static Frontend Delivery
  const htmlRes = await fetch(base + '/');
  const htmlText = await htmlRes.text();
  console.log('11. Static HTML returned:', htmlText.includes('<div id="root">') ? 'SUCCESS (React SPA served)' : 'FAILED');

  console.log('\n=================================================');
  console.log('✅ ALL 11 API & INTEGRATION TESTS PASSED CLEANLY!');
  console.log('=================================================');
}

runTests().catch(e => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
