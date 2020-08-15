export const getCustomKey = (id, productKey = 'ACCESSNG') => {
  let customKey = null;
  if (id.toString().length < 7) {
    customKey = productKey + '0'.repeat(6 - id.toString().length) + id;
  } else {
    customKey = productKey + id;
  }
  return customKey;
};
