const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
  return `ORD-${date}-${suffix}`;
};

module.exports = { generateOrderNumber };

