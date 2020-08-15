'use strict';
/*
 * Merchant configuration properties are taken from Configuration module
 */
// common parameters
const AuthenticationType = 'http_signature';
const RunEnvironment = process.env.CYBERSOURCE_API;
const MerchantId = process.env.CYBERSOURCE_MERCHANT_ID;

// http_signature parameters
const MerchantKeyId = process.env.CYBERSOURCE_MERCHANT_KEY_ID;
const MerchantSecretKey = process.env.CYBERSOURCE_MERCHANT_SECRET_KEY;
 
// logging parameters
const EnableLog = true;
const LogFileName = process.env.LOG_FILENAME + new Date().getTime();
const LogDirectory = process.env.LOG_DIRECTORY;
//10 MB In Bytes
const LogfileMaxSize = process.env.LOG_FILE_MAX_SIZE; 

// Constructor for Configuration
function Configuration() {
  var configObj = {
    authenticationType: AuthenticationType,
    runEnvironment: RunEnvironment,
    merchantID: MerchantId,
    merchantKeyId: MerchantKeyId,
    merchantsecretKey: MerchantSecretKey,
    enableLog: EnableLog,
    logFilename: LogFileName,
    logDirectory: LogDirectory,
    logFileMaxSize: LogfileMaxSize,
  };
  return configObj;
}
module.exports = Configuration;
