import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import api from '../services/api';
import socket from '../services/socket';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [rules, setRules] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState({
    systemMode: 'demo',
    tempUnit: 'C',
    mqtt: { connected: false, brokerUrl: '' },
    demoSettings: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [notifications, setNotifications] = useState([]);
  const [pendingToggles, setPendingToggles] = useState(new Set());

  // Notification helper
  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setNotifications(prev => [{ id, message, type }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Fetch all initial data
  const refreshData = useCallback(async () => {
    try {
      const [devRes, senRes, roomRes, ruleRes, actRes, setRes] = await Promise.all([
        api.getDevices().catch(() => ({ data: [] })),
        api.getSensors().catch(() => ({ data: [] })),
        api.getRooms().catch(() => ({ data: [] })),
        api.getRules().catch(() => ({ data: [] })),
        api.getActivity(30).catch(() => ({ data: [] })),
        api.getSettings().catch(() => ({ data: { systemMode: 'demo', tempUnit: 'C' } }))
      ]);

      if (devRes.data) setDevices(devRes.data);
      if (senRes.data) setSensors(senRes.data);
      if (roomRes.data) setRooms(roomRes.data);
      if (ruleRes.data) setRules(ruleRes.data);
      if (actRes.data) setActivityLogs(actRes.data);
      if (setRes.data) setSettings(setRes.data);
    } catch (err) {
      console.error('[HomeContext] Refresh data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    refreshData();

    function onConnect() {
      setIsSocketConnected(true);
    }

    function onDisconnect() {
      setIsSocketConnected(false);
    }

    function onInitState(data) {
      if (data.devices) setDevices(data.devices);
      if (data.sensors) setSensors(data.sensors);
      if (data.rooms) setRooms(data.rooms);
      if (data.rules) setRules(data.rules);
      if (data.settings) setSettings(data.settings);
      if (data.recentLogs) setActivityLogs(data.recentLogs);
      setIsLoading(false);
    }

    function onDeviceUpdated(updatedDevice) {
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    }

    function onSensorUpdated(updatedSensor) {
      setSensors(prev => prev.map(s => s.id === updatedSensor.id ? updatedSensor : s));
    }

    function onNewActivity(newLog) {
      setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }

    function onRuleTriggered(event) {
      addNotification(`Automation Triggered: "${event.ruleName}" (${event.mode === 'demo_only' ? 'Demo' : 'Hardware'})`, 'info', 5000);
      setRules(prev => prev.map(r => r.id === event.ruleId ? { ...r, lastTriggered: event.timestamp } : r));
    }

    function onMqttStatus(status) {
      setSettings(prev => ({
        ...prev,
        mqtt: {
          ...prev.mqtt,
          connected: status.connected
        }
      }));
      if (status.connected) {
        addNotification('Connected to MQTT Broker', 'success');
      } else if (status.error) {
        addNotification(`MQTT Error: ${status.error}`, 'error');
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('init:state', onInitState);
    socket.on('device:updated', onDeviceUpdated);
    socket.on('sensor:updated', onSensorUpdated);
    socket.on('activity:new', onNewActivity);
    socket.on('rule:triggered', onRuleTriggered);
    socket.on('system:mqtt_status', onMqttStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('init:state', onInitState);
      socket.off('device:updated', onDeviceUpdated);
      socket.off('sensor:updated', onSensorUpdated);
      socket.off('activity:new', onNewActivity);
      socket.off('rule:triggered', onRuleTriggered);
      socket.off('system:mqtt_status', onMqttStatus);
    };
  }, [refreshData, addNotification]);

  // Optimistic Device Toggle
  const toggleDevice = useCallback(async (deviceId, targetState) => {
    const originalDevice = devices.find(d => d.id === deviceId);
    if (!originalDevice) return;

    // 1. Optimistically update local UI state
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, state: targetState } : d));
    setPendingToggles(prev => new Set(prev).add(deviceId));

    try {
      // 2. Dispatch command to backend
      const res = await api.toggleDevice(deviceId, targetState);

      // In demo mode or hardware mode, update with server confirmed device
      if (res.data) {
        setDevices(prev => prev.map(d => d.id === deviceId ? res.data : d));
      }

      if (res.isSimulated) {
        // Label clearly as simulated action
        addNotification(`[Demo Mode] ${originalDevice.name} switched to ${targetState} (Simulated)`, 'info', 3000);
      } else {
        addNotification(`[Hardware] ${originalDevice.name} switched to ${targetState}`, 'success', 3000);
      }
    } catch (err) {
      // 3. Rollback on failure!
      console.error(`Toggle failed for ${deviceId}:`, err);
      setDevices(prev => prev.map(d => d.id === deviceId ? originalDevice : d));
      addNotification(`Failed to toggle ${originalDevice.name}: ${err.message}`, 'error', 5000);
    } finally {
      setPendingToggles(prev => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }
  }, [devices, addNotification]);

  // Bulk room toggle
  const toggleRoomAll = useCallback(async (roomId, targetState) => {
    try {
      await api.toggleRoomAll(roomId, targetState);
      addNotification(`All appliances in room switched to ${targetState}`, 'info');
      refreshData();
    } catch (err) {
      addNotification(`Failed to switch room appliances: ${err.message}`, 'error');
    }
  }, [addNotification, refreshData]);

  // Temperature unit formatter
  const formatTemp = useCallback((celsiusValue) => {
    if (celsiusValue === undefined || celsiusValue === null) return '--';
    if (settings.tempUnit === 'F') {
      const f = (celsiusValue * 9 / 5) + 32;
      return `${f.toFixed(1)} °F`;
    }
    return `${Number(celsiusValue).toFixed(1)} °C`;
  }, [settings.tempUnit]);

  const value = {
    devices,
    sensors,
    rooms,
    rules,
    activityLogs,
    settings,
    setSettings,
    isLoading,
    isSocketConnected,
    pendingToggles,
    notifications,
    toggleDevice,
    toggleRoomAll,
    formatTemp,
    refreshData,
    addNotification,
    dismissNotification,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}

export default HomeContext;
