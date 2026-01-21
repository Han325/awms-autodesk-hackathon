const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const sensorFetcher = require('./services/sensorFetcher');
const ruleEngine = require('./services/ruleEngine');
const notificationService = require('./services/notificationService');
const workOrderService = require('./services/workOrderService');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api', apiRoutes);

// Poll sensors every 5 seconds
const POLL_INTERVAL = 5000;

async function pollAndProcess() {
  try {
    const sensorData = await sensorFetcher.fetchAllSensors();
    const evaluations = ruleEngine.evaluateAll(sensorData);
    
    for (const evaluation of evaluations) {
      if (evaluation.tier !== 'NORMAL') {
        // Check if there's already an open work order for this issue
        const hasOpenWO = workOrderService.hasOpenWorkOrder(evaluation.deviceId, evaluation.sensor);
        
        // Only create notification if there's no open work order
        // (work orders are created for critical issues, so if one exists, we've already addressed it)
        if (!hasOpenWO) {
          notificationService.addNotification(evaluation);
          
          // Create work order for critical issues
          if (evaluation.tier === 'CRITICAL') {
            workOrderService.createWorkOrder(evaluation);
          }
        }
      }
    }
  } catch (error) {
    console.error('Polling error:', error.message);
  }
}

// Start polling
setInterval(pollAndProcess, POLL_INTERVAL);
pollAndProcess(); // Initial poll

app.listen(PORT, () => {
  console.log(`Middleware running on http://localhost:${PORT}`);
});
