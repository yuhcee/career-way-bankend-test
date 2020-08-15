import db from '../database/models';
const { Aggregator, Merchant } = db;
export const joyValidate = async (schema, req) => {
  try {
    await schema.validateAsync({
      ...req.body,
      ...req.query,
      ...req.params,
    });
    return null;
  } catch (error) {
    return error.message;
  }
};

export const catchUniqueViolations = async (req, table, fields) => {
  try {
    const model = { aggregators: Aggregator, merchants: Merchant };
    const id = table === 'merchants' ? 'merchantId' : 'aggregatorId';
    if (table !== 'merchants' && table !== 'aggregators') {
      throw new Error(
        '"table" parameter is must be either "merchants" or "aggregators"'
      );
    }
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = req.body[field];
      // console.log({ id, model: model[table], field, value });
      if (value) {
        const record = await model[table].findOne({
          where: { [field]: value },
        });
        if (record && record.id !== req.params[id]) {
          return `a record with ${field} '${value}' already exists.`;
        }
      }
    }
    return null;
  } catch (error) {
    // console.log(error);
    throw new Error(
      `Error in "catchUniqueViolation" helper function: ${error.message}`
    );
  }
};

export const destructureRequestBody = (requestBody) => {
  try {
    return {
      mainDetails: {
        companyName: requestBody.companyName,
        phoneNumber: requestBody.phoneNumber,
        email: requestBody.email,
        businessYears: requestBody.businessYears,
        websiteLink: requestBody.websiteLink,
        accountNumber: requestBody.accountNumber,
        bvn: requestBody.bvn,
        percentage: requestBody.percentage,
        address: requestBody.address,
        bankType: requestBody.bankType,
        businessType: requestBody.businessType,
        cardPercentageCharge: requestBody.cardPercentageCharge,
        accountPercentageCharge: requestBody.accountPercentageCharge,
        region: requestBody.region,
        capAmount: requestBody.capAmount,
      },
      primaryContactDetails: {
        name: requestBody.primaryContactName,
        email: requestBody.primaryContactEmail,
        phoneNumber: requestBody.primaryContactPhoneNumber,
        telephone: requestBody.primaryContactTelephone,
      },
      secondaryContactDetails: {
        name: requestBody.secondaryContactName,
        email: requestBody.secondaryContactEmail,
        phoneNumber: requestBody.secondaryContactPhoneNumber,
        telephone: requestBody.secondaryContactTelephone,
      },
    };
  } catch (error) {
    return error.message;
  }
};

export const checkUserStatus = (user, subject = 'your account') => {
  if (!user.isVerified) {
    return `${subject} has not been verified`;
  } else if (!user.isActive) {
    return `${subject} has been deactivated; please contact adminstrator`;
  } else if (user.pending) {
    return `${subject} has not been approved; please contact administrator`;
  } else {
    return null;
  }
};

export const isEmptyObject = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;
