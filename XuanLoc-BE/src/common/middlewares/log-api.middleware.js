export const logAPI = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip;

  const message = `[${new Date().toISOString()}] ${method} ${url} - ${ip}`;
  console.log(message);

  next();
};