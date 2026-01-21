import { useState } from 'react';
import { controlDevice, getDeviceState } from '../utils/api';

function ControlPanel({ sensors, onStateChange }) {
  const [isControlling, setIsControlling] = useState({});
  const [controlErrors, setControlErrors] = useState({});
  const [internalStates, setInternalStates] = useState({});

  // Get controllable sensors
  const controllableSensors = sensors?.filter(s => 
    s.type === 'conveyor' || s.type === 'door' || s.type === 'light'
  ) || [];

  // Get current state (use internal state if available, otherwise sensor state)
  const getCurrentState = (sensor) => {
    const key = `${sensor.deviceId}-${sensor.type}`;
    return internalStates[key] !== undefined ? internalStates[key] : sensor.state;
  };

  // Get control actions based on sensor type and current state
  const getControlActions = (sensor) => {
    const currentState = getCurrentState(sensor);
    const normalizedState = currentState ? currentState.toLowerCase().trim() : null;
    
    if (sensor.type === 'conveyor') {
      if (normalizedState === 'stopped') {
        return [{ label: 'Start', action: 'start', newState: 'running' }];
      } else if (normalizedState === 'running') {
        return [{ label: 'Stop', action: 'stop', newState: 'stopped' }];
      }
    } else if (sensor.type === 'door') {
      if (normalizedState === 'open') {
        return [{ label: 'Close', action: 'close', newState: 'close' }];
      } else if (normalizedState === 'close' || normalizedState === 'closed') {
        return [{ label: 'Open', action: 'open', newState: 'open' }];
      }
    } else if (sensor.type === 'light') {
      if (normalizedState === 'off') {
        return [{ label: 'Turn On', action: 'turn_on', newState: 'on' }];
      } else if (normalizedState === 'on') {
        return [{ label: 'Turn Off', action: 'turn_off', newState: 'off' }];
      }
    }
    return [];
  };

  const handleControl = async (sensor, action, newState) => {
    const key = `${sensor.deviceId}-${sensor.type}`;
    setIsControlling(prev => ({ ...prev, [key]: true }));
    setControlErrors(prev => ({ ...prev, [key]: null }));

    // Optimistically update state immediately
    setInternalStates(prev => ({ ...prev, [key]: newState }));

    try {
      // First, check current state to ensure we're sending the correct action
      const stateCheck = await getDeviceState(sensor.deviceId, sensor.type);
      
      if (!stateCheck.success) {
        // Revert optimistic update on error
        setInternalStates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        setControlErrors(prev => ({ ...prev, [key]: 'Failed to verify current device state' }));
        setIsControlling(prev => ({ ...prev, [key]: false }));
        return;
      }

      // Normalize state to lowercase for comparison
      const currentState = stateCheck.state ? stateCheck.state.toLowerCase().trim() : null;
      
      // Verify the action matches the current state
      let finalAction = action;
      if (sensor.type === 'conveyor') {
        if (action === 'start' && currentState === 'running') {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Conveyor is already running' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
        if (action === 'stop' && currentState === 'stopped') {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Conveyor is already stopped' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
      } else if (sensor.type === 'door') {
        if (action === 'close' && (currentState === 'close' || currentState === 'closed')) {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Door is already closed' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
        if (action === 'open' && currentState === 'open') {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Door is already open' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
      } else if (sensor.type === 'light') {
        if (action === 'turn_on' && currentState === 'on') {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Light is already on' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
        if (action === 'turn_off' && currentState === 'off') {
          setInternalStates(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setControlErrors(prev => ({ ...prev, [key]: 'Light is already off' }));
          setIsControlling(prev => ({ ...prev, [key]: false }));
          return;
        }
      }

      // Send control command with verified action
      const result = await controlDevice(sensor.deviceId, sensor.type, finalAction);
      
      if (result.success) {
        // Trigger refresh to sync with backend
        if (onStateChange) {
          onStateChange();
        }
        // Clear error on success
        setControlErrors(prev => ({ ...prev, [key]: null }));
        // Keep internal state - it will sync with polling eventually
      } else {
        // Revert optimistic update on error
        setInternalStates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        setControlErrors(prev => ({ ...prev, [key]: result.error || 'Failed to control device' }));
      }
    } catch (error) {
      // Revert optimistic update on error
      setInternalStates(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      setControlErrors(prev => ({ ...prev, [key]: error.message || 'Failed to control device' }));
    } finally {
      setIsControlling(prev => ({ ...prev, [key]: false }));
    }
  };

  const formatState = (state) => {
    if (!state) return 'N/A';
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const getLocationName = (deviceId) => {
    return deviceId === 1 ? 'Office' : deviceId === 2 ? 'Factory' : `Device ${deviceId}`;
  };

  const getSensorName = (sensor) => {
    const location = getLocationName(sensor.deviceId);
    return `${location} - ${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}`;
  };

  const getButtonColor = (sensorType) => {
    if (sensorType === 'conveyor') return 'bg-orange-500 hover:bg-orange-600';
    if (sensorType === 'door') return 'bg-purple-500 hover:bg-purple-600';
    if (sensorType === 'light') return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };

  if (controllableSensors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Device Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {controllableSensors.map((sensor) => {
          const key = `${sensor.deviceId}-${sensor.type}`;
          const controlActions = getControlActions(sensor);
          const currentState = getCurrentState(sensor);
          const isControllingThis = isControlling[key] || false;
          const error = controlErrors[key];

          return (
            <div
              key={key}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {getSensorName(sensor)}
                </h3>
                <div className="text-lg font-bold text-gray-800">
                  Status: {formatState(currentState)}
                </div>
              </div>

              {controlActions.length > 0 && (
                <div className="space-y-2">
                  {controlActions.map((controlAction) => (
                    <button
                      key={controlAction.action}
                      onClick={() => handleControl(sensor, controlAction.action, controlAction.newState)}
                      disabled={isControllingThis}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors text-white ${
                        isControllingThis
                          ? 'bg-gray-300 cursor-not-allowed'
                          : getButtonColor(sensor.type)
                      }`}
                    >
                      {isControllingThis ? 'Processing...' : controlAction.label}
                    </button>
                  ))}
                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ControlPanel;
