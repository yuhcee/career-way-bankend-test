'use strict';

/*
* Merchant configuration properties are taken from Configuration module
*/

// common parameters
const AuthenticationType = 'http_signature';
const RunEnvironment = 'cybersource.environment.SANDBOX';

const MerchantId = '12031990';

// http_signature parameters
const MerchantKeyId = 'd7586f75-8c78-43b6-a3b0-8a413e9eaf94';
const MerchantSecretKey = '8A+y8GeI3iaWePhd/2OVX4gqnRl4uI4f2XP+0iSG3Ug=';
// jwt parameters
const KeysDirectory = 'Resource';
const KeyFileName = 'testrest';
const KeyAlias = 'testrest';
const KeyPass = 'testrest';

// logging parameters
const EnableLog = true;
const LogFileName = 'social_pay_cybersource_log' + new Date().getTime();
const LogDirectory = '../../../log';
const LogfileMaxSize = '5242880'; //10 MB In Bytes

// Constructor for Configuration
function Configuration() {

  var configObj = {
    'authenticationType': AuthenticationType,
    'runEnvironment': RunEnvironment,

    'merchantID': MerchantId,
    'merchantKeyId': MerchantKeyId,
    'merchantsecretKey': MerchantSecretKey,

    'keyAlias': KeyAlias,
    'keyPass': KeyPass,
    'keyFileName': KeyFileName,
    'keysDirectory': KeysDirectory,

    'enableLog': EnableLog,
    'logFilename': LogFileName,
    'logDirectory': LogDirectory,
    'logFileMaxSize': LogfileMaxSize
  };
  return configObj;

}

module.exports = Configuration;