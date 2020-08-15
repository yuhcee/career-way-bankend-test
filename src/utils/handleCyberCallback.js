export const handleCallback = function (res) {
  return async (err, data, response) => {
    if (err || data.status !== 'AUTHORIZED') {
      return res.json({
        type: 'error',
        data: { data, response, err },
      });
    }

    return res.json({
      type: 'success',
      data: { data, response, err },
    });
  };
};
