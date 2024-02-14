const constructError = (err) => {
  let error = {};
  error["errCode"] = err.response !== undefined ? err.response.status : "";
  let errMsg = "";

  errMsg =
    err.response !== undefined && err.response.statusText !== undefined
      ? err.response.statusText
      : errMsg;

  errMsg = err.message !== undefined ? err.message : errMsg;

  errMsg =
    err.response !== undefined &&
    err.response.data !== undefined &&
    err.response.data.message !== undefined
      ? err.response.data.message
      : errMsg;

  errMsg =
    err.response !== undefined &&
    err.response.data !== undefined &&
    err.response.data.error !== undefined
      ? err.response.data.error
      : errMsg;

  error["errMsg"] = errMsg;
  return error;
};

export { constructError };
