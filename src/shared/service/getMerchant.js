import db from '@models';

export const byAPIKey = async  (apiKey) => {
  try {
    if (apiKey === null) return null;
    const merchant = await db.Merchant.findOne({ where: { apiKey } }); 
    return merchant;
  } catch (e) {
    return false;
  }
};