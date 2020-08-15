const validFor = 'This code is valid for 20mins.';
export const accountVerification = (code) => {
  return `Your Account Verification Code is: ${code}.
  ${validFor}`;
};

export const accountReset = (code) => {
  return `Your account reset code is: ${code}.
  ${validFor}`;
};