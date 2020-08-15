const processPurchase = require('./service');
import { handleCallback } from '../../utils/handleCyberCallback';

export const pay = async (req, res) => {
  try {
    processPurchase(req.body, handleCallback(res));
  } catch (error) {
    return res.json({ error });
  }
};
