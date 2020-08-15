import { ErrorRequestResponse } from '@response';
import settings from '@settings';
import * as getMerchant from '../shared/service/getMerchant';
import server_response from '@server_response';

export default async (req, res, next) => {
  try {
    const merchant =  await getMerchant.byAPIKey(req.headers[settings.CONSTANT.API_KEY]);
    if (!merchant) throw Error(`"${settings.CONSTANT.API_KEY}" not valid`);
    req.body.merchant = merchant;
    next();
  } catch (e) {
    ErrorRequestResponse(res)(e.message, server_response.AUTHORIZATION_ISSUE);
  }
};