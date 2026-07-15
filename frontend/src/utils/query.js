export const cleanQueryParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "" && value !== "ALL"),
  );

export const valueOrAll = (value, allowedValues) => (allowedValues.includes(value) ? value : "ALL");
