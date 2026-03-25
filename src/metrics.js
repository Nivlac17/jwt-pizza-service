const config = require('./config');
const os = require('os');


// Metrics stored in memory
const requests = {};

let totalRequests = 0;

// Requests by HTTP method since process start
const requestsByMethod = {
  GET: 0,
  POST: 0,
  PUT: 0,
  DELETE: 0,
  OTHER: 0,
};


let purchaseCount = 0;
let purchaseSuccessCount = 0;
let purchaseFailureCount = 0;
let purchaseLatencyTotalMs = 0;
let purchaseRevenueTotal = 0;


let requestLatencyTotalMs = 0;
let requestLatencyCount = 0;

let authAttempts = 0;
let authSuccess = 0;
let authFailure = 0;

function authAttempt(success) {
  authAttempts += 1;

  if (success) {
    authSuccess += 1;
  } else {
    authFailure += 1;
  }
}


function requestTracker(req, res, next) {
  totalRequests += 1;

  const method = requestsByMethod[req.method] !== undefined ? req.method : 'OTHER';
  requestsByMethod[method] += 1;

  next();
}


function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}


function pizzaPurchase(success, latencyMs, price) {
  purchaseCount += 1;
  purchaseLatencyTotalMs += latencyMs;

  if (success) {
    purchaseSuccessCount += 1;
    purchaseRevenueTotal += price;
  } else {
    purchaseFailureCount += 1;
  }
}


function requestLatencyTracker(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - start;

    // count total latency by route + method
    requestLatencyTotalMs += latencyMs;
    requestLatencyCount += 1;
  });

  next();
}



setInterval(() => {
  const metrics = [];

  metrics.push(
    createMetric('http_requests_total', totalRequests, '1', 'sum', 'asInt', {
      metric_type: 'Total',
    })
  );

  Object.keys(requestsByMethod).forEach((method) => {
    metrics.push(
      createMetric('http_requests_total', requestsByMethod[method], '1', 'sum', 'asInt', {
        method,
      })
    );
  });


    // CPU usage
  metrics.push(
    createMetric('system_cpu_usage_percent', getCpuUsagePercentage(), '%', 'gauge', 'asDouble', {
      source: config.source,
    })
  );

  // Memory usage
  metrics.push(
    createMetric('system_memory_usage_percent', getMemoryUsagePercentage(), '%', 'gauge', 'asDouble', {
      source: config.source,
    })
  );

  // Pizza Purchase Metrics
  metrics.push(
    createMetric('pizza_purchases_total', purchaseCount, '1', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('pizza_purchases_success_total', purchaseSuccessCount, '1', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('pizza_purchases_failure_total', purchaseFailureCount, '1', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('pizza_purchase_latency_ms_total', purchaseLatencyTotalMs, 'ms', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('pizza_purchase_revenue_total', purchaseRevenueTotal, '$', 'sum', 'asDouble', {})
  );



    // Total Latancy  
    metrics.push(
    createMetric('http_request_latency_ms_total', requestLatencyTotalMs, 'ms', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('http_request_count_total', requestLatencyCount, '1', 'sum', 'asInt', {})
  );


  // Auth Metrics
  metrics.push(
    createMetric('auth_attempts_total', authAttempts, '1', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('auth_success_total', authSuccess, '1', 'sum', 'asInt', {})
  );

  metrics.push(
    createMetric('auth_failure_total', authFailure, '1', 'sum', 'asInt', {})
  );

    sendMetricToGrafana(metrics);
  }, 10000);



// ----good-------
function createMetric(metricName, metricValue, metricUnit, metricType, valueType, attributes) {
  attributes = { ...attributes, source: config.source };

  const metric = {
    name: metricName,
    unit: metricUnit,
    [metricType]: {
      dataPoints: [
        {
          [valueType]: metricValue,
          timeUnixNano: Date.now() * 1000000,
          attributes: [],
        },
      ],
    },
  };

  Object.keys(attributes).forEach((key) => {
    metric[metricType].dataPoints[0].attributes.push({
      key: key,
      value: { stringValue: attributes[key] },
    });
  });

  if (metricType === 'sum') {
    metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
    metric[metricType].isMonotonic = true;
  }

  return metric;
}

// ----good-------
function sendMetricToGrafana(metrics) {
  const body = {
    resourceMetrics: [
      {
        scopeMetrics: [
          {
            metrics,
          },
        ],
      },
    ],
  };

  fetch(config.endpointUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${config.accountId}:${config.apiKey}`, 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error('Error pushing metrics:', error);
    });
}

module.exports = { requestTracker , requestLatencyTracker , pizzaPurchase, authAttempt};