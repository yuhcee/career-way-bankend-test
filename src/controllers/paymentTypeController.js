import db from '../database/models';
import CustomResponse from '../utils/CustomResponse';

const { PaymentType } = db;

export const createPaymentType = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const paymentType = await PaymentType.create(req.body);
    return Res.status(200).encryptAndSend({
      message: 'successfully created',
      data: paymentType,
    });
  } catch (error) {
    return next(`createPaymentType Error: ${error.message}`);
  }
};

export const getAllPaymentTypes = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const paymentTypes = await PaymentType.findAll();
    return Res.status(200).encryptAndSend({
      message: 'successful',
      data: paymentTypes,
    });
  } catch (error) {
    return next(`getAllPaymentTypes Error: ${error.messag}`);
  }
};

export const updatePaymentType = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { id } = req.params;
    const paymentType = await PaymentType.findOne({ where: { id } });
    if (!paymentType) {
      const error = `no payment type matches the id of ${id}`;
      return Res.status(404).encryptAndSend({ error });
    }
    await paymentType.update(req.body);
    return Res.status(200).encryptAndSend({
      message: 'update successful',
      data: paymentType,
    });
  } catch (error) {
    return next(`Error updateing payment type: ${error.message}`);
  }
};

export const deletePaymentType = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { id } = req.params;
    const paymentType = await PaymentType.findOne({ where: { id } });
    if (!paymentType) {
      const error = `no payment type matches the id of ${id}`;
      return Res.status(404).encryptAndSend({ error });
    }
    await paymentType.destroy();
    return Res.status(200).encryptAndSend({
      message: 'payment type deleted',
      data: paymentType,
    });
  } catch (error) {
    return next(`error deleting payment type: ${error.message}`);
  }
};
