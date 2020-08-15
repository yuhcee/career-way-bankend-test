import creditCardType from 'credit-card-type';

export function cardValidator(cardNo) {
  let value = cardNo + '';
  // accept only digits, dashes or spaces
  if (/[^0-9-\s]+/.test(value)) return false;

  // The Luhn Algorithm. It's so pretty.
  let nCheck = 0,
    bEven = false;
  value = value?.replace(/\D/g, '');
  for (let n = value.length - 1; n >= 0; n--) {
    let cDigit = value.charAt(n),
      nDigit = parseInt(cDigit, 10);
    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }
    nCheck += nDigit;
    bEven = !bEven;
  }
  return nCheck % 10 === 0;
}
export default async (cardNo) => {
  try {
    if (!cardValidator(cardNo)) {
      return false;
    }
    // TODO: Validate for Access Bank Card Here
   
    // if this is access return 1.
   
    // TODO: Validate for Verve Card
    await creditCardType.addCard({
      niceType: 'Verve',
      type: 'new-card',
      patterns: [50600, 65200], 
      lengths: [16, 19],
      code: {
        name: 'CVV',
        size: 4
      }
    });
   
    const card = await creditCardType(cardNo + '');
    console.log('\n', card, '\n====================<<<<<<<<<<');
    return card.type !== 'Verve' ? 3 : 2;
  } catch (error) {
    console.log(error, ')))))))))))))))))');
    return error.message;
  }
};