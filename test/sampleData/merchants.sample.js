let sampleMerchants = [];
const merchant = {
  companyName: 'The Company1.0',
  phoneNumber: '09065734215',
  businessYears: 9,
  email: 'theemail2@email.com',
  websiteLink: 'www.the-website.com',
  accountNumber: '19039857375',
  bvn: '2635637434',
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

const pull = [];
for (let i = 0; i < 5; i++) {
  let accountNumber;
  do {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  } while (pull.includes(accountNumber));
  pull.push(accountNumber);

  const companyName = `merchant_${i}`;
  const email = `merchant_${i}@gmail.com`;
  accountNumber = accountNumber.toString();
  sampleMerchants.push({ ...merchant, companyName, email, accountNumber });
}

const MERCHANT_PASSWORD = 'testing...';

export { sampleMerchants, MERCHANT_PASSWORD };
