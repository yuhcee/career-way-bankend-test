import SERVERRESPONSE from '@server_response';
import creditCardType from 'credit-card-type';

export default {
  consumerAuth: {},
  cardType: null,
  allowedCards: ['mastercard', 'maestro', 'visa'],
  getError(response) {
    this.consumerAuth = response;
    if (!response?.consumerAuthenticationInformation) {
      throw Error(this.getErrorMessage());
    }
    return true;
  },
  getAuthError(response) {
    this.consumerAuth = response;
    if (response?.errorInformation) {
      throw Error(this.getErrorMessage());
    }
    return true;
  },
  getErrorMessage() {
    return (this.consumerAuth.errorInformation || this.consumerAuth).message;
  },
  validCardType(card) {
    card = creditCardType(card + '');
    this.cardType = card[0].type;
    if (!card || !this.allowedCards.includes(card[0].type)) {
      throw Error(SERVERRESPONSE.CARDNOTSUPPORTED);
    }
    return true;
  },
};