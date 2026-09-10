/**
 * Consistent JSON response helpers.
 * Always wraps in { success, data } or { success, message } envelope per api-contract.md
 */

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const successPaginated = (res, data, pagination) => {
  return res.status(200).json({ success: true, data, pagination });
};

const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { success, successPaginated, error };
