function CategorizationInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Notification Categorization System</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Categorize Notifications</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our system uses rule-based evaluation to categorize sensor alerts into three tiers based on severity and impact:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-600 mb-2">CRITICAL</h4>
                  <p className="text-gray-700 text-sm">
                    Immediate action required. These alerts indicate conditions that pose safety risks, risk equipment damage, or halt production. 
                    Examples: Temperature exceeding critical thresholds, conveyor stopped, humidity outside critical range.
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    <strong>Action:</strong> Automatically generates a work order for immediate attention.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-600 mb-2">WARNING</h4>
                  <p className="text-gray-700 text-sm">
                    Conditions approaching critical thresholds or requiring monitoring. These alerts indicate potential issues that should be addressed soon.
                    Examples: Temperature approaching critical threshold, door left open, humidity outside optimal range.
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    <strong>Action:</strong> Monitor closely and address proactively.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-600 mb-2">INFO</h4>
                  <p className="text-gray-700 text-sm">
                    Informational messages about system state changes. These alerts provide visibility into system operations.
                    Examples: Light turned off, normal state changes.
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    <strong>Action:</strong> For awareness only, no immediate action required.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Category Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">TEMPERATURE_THRESHOLD</h4>
                  <p className="text-gray-700 text-sm">
                    Alerts triggered when temperature readings exceed predefined thresholds. Different thresholds apply for office vs factory environments.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">HUMIDITY_THRESHOLD</h4>
                  <p className="text-gray-700 text-sm">
                    Alerts triggered when humidity levels fall outside optimal or critical ranges, which may indicate equipment malfunction or environmental issues.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">EQUIPMENT_STATE</h4>
                  <p className="text-gray-700 text-sm">
                    Alerts triggered by changes in equipment operational state, such as conveyor stops, door positions, or light status.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Future Enhancements with AI & ML</h3>
              <p className="text-gray-800 text-sm leading-relaxed">
                In the future, we plan to enhance this system with artificial intelligence and machine learning capabilities:
              </p>
              <ul className="list-disc list-inside text-gray-700 text-sm mt-2 space-y-1">
                <li><strong>Predictive Analytics:</strong> ML models will learn optimal thresholds per location, time of day, and seasonal patterns</li>
                <li><strong>Pattern Recognition:</strong> Detect anomalies and patterns that indicate potential failures before they occur</li>
                <li><strong>Smart Routing:</strong> Optimize notification routing to reduce false positives and improve response times</li>
                <li><strong>Predictive Maintenance:</strong> Predict maintenance needs and optimize work order scheduling</li>
                <li><strong>Adaptive Thresholds:</strong> Automatically adjust thresholds based on historical data and operational patterns</li>
              </ul>
              <p className="text-gray-700 text-sm mt-3">
                The current categorization system provides structured data that will serve as training data for future ML models, 
                enabling continuous improvement in alert accuracy and operational efficiency.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategorizationInfoModal;
