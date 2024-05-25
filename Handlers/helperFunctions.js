const getProductAmountWithoutGST = (grandTotal) => {
  const numerator = grandTotal;
  const percentage = 105;

  const decimal = percentage / 100;

  const result = numerator / decimal;

  return result.toFixed(2);
};

module.exports = {getProductAmountWithoutGST}
