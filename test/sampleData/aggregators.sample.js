const aggregator = {
  companyName: 'The company 1.0',
  phoneNumber: '09065734215',
  businessYears: 9,
  email: 'thecompany@gmail.com',
  websiteLink: 'www.the-website.com',
  accountNumber: '9039857374',
  bvn: '2635637434',
  percentage: '20.1',
  address: 'No 2 Luke Skywall Street',
  primaryContactName: 'The Primary Name',
  primaryContactTelephone: '08984347322',
  primaryContactPhoneNumber: '08033473333',
  primaryContactEmail: 'theprimary@email.com',
  secondaryContactName: 'The Secondary Name',
  secondaryContactTelephone: '08044334444',
  secondaryContactPhoneNumber: '08055544555',
  secondaryContactEmail: 'thesecondary@email.com',
};

const socialpaySampleAggregator = {
  ...aggregator,
  email: 'socialpay@diu.com',
  companyName: 'SocialPay',
  accountNumer: '1234567890',
};

let sampleAggregators = [];
const pool = [9039857374, 1234567890];
for (let i = 0; i < 5; i++) {
  let accountNumber;
  do {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  } while (pool.includes(accountNumber));
  pool.push(accountNumber);

  const companyName = `aggregator_${i}`;
  const email = `aggregator_${i}@gmail.com`;
  accountNumber = accountNumber.toString();
  sampleAggregators.push({
    ...aggregator,
    companyName,
    email,
    accountNumber,
  });
}

export const AGGREGATOR_PASSWORD = 'testing...';
export { sampleAggregators, socialpaySampleAggregator };
