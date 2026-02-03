exports.sendResponse = async(res, code, message, data) => {
  let response = {
    code,
    message,
    body: data ? data : []
  };
  return res.status(code).json(response);
};

exports.sendEmailResponse = (res, file) => {
  return res.redirect(file);
};

exports.errReturned = async (res, err) => {
  
  res.status(400).json({
    code: 400,
    message: err.message || err
  });
}
