import Joi from '@hapi/joi';
import { joyValidate } from './helpers';
import CustomResponse from '../utils/CustomResponse';
import db from '../database/models';

const { PaymentType } = db;

export const validateNewPaymentType = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const paymentTypeSchema = Joi.object({
      name: Joi.string().trim().required(),
    });
    error = await joyValidate(paymentTypeSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { name } = req.body;
    if (name) {
      const paymentType = await PaymentType.findOne({
        where: { name: name.toLowerCase() },
      });
      if (paymentType) {
        const error = `payment type '${name.toLowerCase()}' has already been created. Duplicate name is not allowed`;
        return Res.status(400).encryptAndSend({ error });
      }
    }

    req.body.name = name.toLowerCase();
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validatePaymentTypeUpdate = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const paymentTypePatchSchema = Joi.object({
      name: Joi.string().trim().required(),
      id: Joi.number().integer().min(1).required(),
    });
    error = await joyValidate(paymentTypePatchSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { name } = req.body;
    if (name) {
      const paymentType = await PaymentType.findOne({
        where: { name: name.toLowerCase() },
      });
      if (paymentType && `${req.params.id}` !== `${paymentType.id}`) {
        const error = `payment type '${name.toLowerCase()}' has already been created. Duplicate name is not allowed`;
        return Res.status(400).encryptAndSend({ error });
      }
    }

    req.body.name = name.toLowerCase();
    return next();
  } catch (error) {
    return next(error.message);
  }
};
