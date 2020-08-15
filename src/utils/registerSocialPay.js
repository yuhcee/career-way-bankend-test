const db = require('../database/models');
const bcrypt = require('bcryptjs');
const {
  sequelize,
  Aggregator,
  AggregatorPrimaryContact,
  AggregatorPassword,
  AggregatorPasswordHistory,
} = db;

const {
  SOCIALPAY_COMPANY_NAME,
  SOCIALPAY_PHONE_NO,
  SOCIALPAY_BUSINESS_YEARS,
  SOCIALPAY_EMAIL,
  SOCIALPAY_WEBSITE_LINK,
  SOCIALPAY_ACCOUNT_NO,
  SOCIALPAY_BVN,
  SOCIALPAY_ADDRESS,
  SOCIALPAY_PRIMARY_CONTACT_NAME,
  SOCIALPAY_PRIMARY_CONTACT_TELEPHONE,
  SOCIALPAY_PRIMARY_CONTACT_PHONE_NO,
  SOCIALPAY_PRIMARY_CONTACT_EMAIL,
  SOCIALPAY_PASSWORD,
  BCRYPT_SALT_VALUE,
} = process.env;

async function registerSocialPay() {
  let t = await sequelize.transaction();
  try {
    const socialPay = await Aggregator.findOne({
      where: { email: SOCIALPAY_EMAIL },
    });
    if (socialPay) {
      return true;
    }

    const aggregator = {
      companyName: SOCIALPAY_COMPANY_NAME,
      phoneNumber: SOCIALPAY_PHONE_NO,
      businessYears: SOCIALPAY_BUSINESS_YEARS,
      email: SOCIALPAY_EMAIL,
      websiteLink: SOCIALPAY_WEBSITE_LINK,
      accountNumber: SOCIALPAY_ACCOUNT_NO,
      bvn: SOCIALPAY_BVN,
      address: SOCIALPAY_ADDRESS,
    };

    const primaryContactDetails = {
      name: SOCIALPAY_PRIMARY_CONTACT_NAME,
      telephone: SOCIALPAY_PRIMARY_CONTACT_TELEPHONE,
      phoneNumber: SOCIALPAY_PRIMARY_CONTACT_PHONE_NO,
      email: SOCIALPAY_PRIMARY_CONTACT_EMAIL,
    };

    const password = bcrypt.hashSync(
      SOCIALPAY_PASSWORD,
      Number(BCRYPT_SALT_VALUE)
    );

    const result = await Aggregator.create(
      { ...aggregator, isVerified: true },
      {
        transaction: t,
      }
    );

    const { id: aggregatorId } = result.dataValues;

    await AggregatorPrimaryContact.create(
      { ...primaryContactDetails, aggregatorId },
      { transaction: t }
    );

    await AggregatorPassword.create(
      { password, aggregatorId },
      { transaction: t }
    );
    await AggregatorPasswordHistory.create(
      { password, aggregatorId },
      { transaction: t }
    );

    await t.commit();

    return true;
  } catch (error) {
    await t.rollback();
    return false;
  }
}

module.exports = registerSocialPay;
