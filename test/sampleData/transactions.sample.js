let sampleTransactions = [];
const transaction = {
  transactionId: '0000000000000001',
  amount: '1000.00',
  cardHolder: 'cardHolder? ask Dan',
  ip: '? ask Dan',
  mid: undefined,
  type: undefined,
  status: undefined,
};

const pad = (n, width = 3, z = 0) =>
  (String(z).repeat(width) + String(n)).slice(String(n).length);

for (let i = 1; i < 11; i++) {
  const transactionId = pad(i, 16, 0);
  // const mid = 'ACCESSNG' + pad(i, 6, 0);
  sampleTransactions.push({ ...transaction, transactionId });
}

export { sampleTransactions };
