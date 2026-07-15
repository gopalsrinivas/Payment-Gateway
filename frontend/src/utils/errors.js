export const getSafeErrorMessage = (error) => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  if (typeof error.message === "string") return error.message;
  return "Something went wrong";
};

export const normalizeApiError = (error) => {
  const response = error?.response;
  const data = response?.data || {};
  const errors = Array.isArray(data.errors) ? data.errors : [];
  const fieldMessages = errors.map((item) => item?.message).filter(Boolean);
  return {
    message: fieldMessages[0] || data.message || getSafeErrorMessage(error),
    summary: data.message || getSafeErrorMessage(error),
    statusCode: data.statusCode || response?.status || 0,
    requestId: data.requestId,
    errors,
  };
};

export const getErrorMessage = (error) => normalizeApiError(error).message;

export const fieldErrorsFromApi = (error) =>
  normalizeApiError(error).errors.reduce((result, item) => {
    if (item.field) result[item.field] = item.message;
    return result;
  }, {});
