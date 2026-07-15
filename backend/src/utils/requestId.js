let counter = 0;

const createRequestId = () => {
  counter += 1;
  return `REQ-${String(counter).padStart(6, "0")}`;
};

module.exports = { createRequestId };

