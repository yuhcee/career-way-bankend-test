/* eslint-disable import/no-unresolved */
import db from '@models';
import moment from 'moment';
import { Op } from 'sequelize';
import processPayment from '@shared/services/processPayment';
import SERVERRESPONSE from '@server_response';
import settings from '@settings';
import creditCardType from 'credit-card-type';
import CheckPayerAuthEnrollmentRequest from '@service/enrollmentCheck';

export default {
 consumerAI: {},
 
};