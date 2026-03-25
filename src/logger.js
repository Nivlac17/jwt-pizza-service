const config = require('./config');

class Logger {
  httpLogger = (req, res, next) => {
    let send = res.send;
    res.send = (resBody) => {
      const logData = {
        authorized: !!req.headers.authorization,
        path: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        reqBody: JSON.stringify(req.body),
        resBody: JSON.stringify(resBody),
      };
      const level = this.statusToLogLevel(res.statusCode);
      this.log(level, 'http', logData);
      res.send = send;
      return res.send(resBody);
    };
    next();
  };

  log(level, type, logData) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    const labels = { component: config.logging.source, level: level, type: type };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };

    this.sendLogToGrafana(logEvent);
  }

  statusToLogLevel(statusCode) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

sanitize(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => this.sanitize(item));
  }

  if (typeof data === 'object') {
    const copy = { ...data };

    for (const key of Object.keys(copy)) {
      const lower = key.toLowerCase();

      if (
        lower.includes('password') ||
        lower.includes('token') ||
        lower.includes('jwt') ||
        lower.includes('secret') ||
        lower.includes('apikey') ||
        lower === 'authorization'
      ) {
        copy[key] = '*****';
      } else if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = this.sanitize(copy[key]);
      }
    }

    return copy;
  }

  return data;
}




  sendLogToGrafana(event) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    const body = JSON.stringify(event);
    fetch(`${config.logging.endpointUrl}`, {
      method: 'post',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.logging.accountId}:${config.logging.apiKey}`,
      },
    }).then((res) => {
      if (!res.ok) console.log('Failed to send log to Grafana');
    });
  }
}
module.exports = new Logger();