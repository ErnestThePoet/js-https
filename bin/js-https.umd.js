(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jsencrypt'), require('crypto-random-string'), require('crypto-es')) :
typeof define === 'function' && define.amd ? define(['jsencrypt', 'crypto-random-string', 'crypto-es'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["js-https"] = factory(global.JSEncrypt, global.cryptoRandomString, global.CryptoES));
})(this, (function (JSEncrypt, cryptoRandomString, CryptoES) { 'use strict';

function aesEncrypt(text, aesKey, aesIv) {
  var cipherObj = CryptoES.AES.encrypt(CryptoES.enc.Utf8.parse(text), CryptoES.enc.Utf8.parse(aesKey), {
    iv: CryptoES.enc.Utf8.parse(aesIv),
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7
  });
  return cipherObj.ciphertext.toString(CryptoES.enc.Base64);
}
function aesDecrypt(text, aesKey, aesIv) {
  var plainTextObj = CryptoES.AES.decrypt(text, CryptoES.enc.Utf8.parse(aesKey), {
    iv: CryptoES.enc.Utf8.parse(aesIv),
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7
  });
  return plainTextObj.toString(CryptoES.enc.Utf8);
}

/**
 * Create a new JsHttps object. Note that the symmetric key used in
 * decryptResponseData is generated from the closest previous call to
 * encryptRequestData. encryptRequestData and decryptResponseData
 * must be called in pair for the same request.
 * @constructor
 */
var JsHttps = /** @class */function () {
  function JsHttps() {
    this.aesIv = "";
    this.aesKey = "";
  }
  /**
   * Encrypt the request param object and return an object
   * containing RSA-encrypted symmetric keys(AES key and AES IV)
   * and AES128-encrypted request param object JSON string.
   * All ciphertexts are Base64-encoded strings.
   * @param {object} data the request param object to be encrypted
   * @param {string} publicKey the pem encoded RSA public key string(with or without header/footer)
   * @returns {EncryptedRequestParam} the cipher object
   * @public
   */
  JsHttps.prototype.encryptRequestData = function (data, publicKey) {
    var rsaEncryptor = new JSEncrypt();
    rsaEncryptor.setPublicKey(publicKey);
    // AES-128
    this.aesKey = cryptoRandomString({
      length: 16
    });
    // Must be 16 Bytes
    this.aesIv = cryptoRandomString({
      length: 16
    });
    var aesKeyCipher = rsaEncryptor.encrypt(this.aesKey);
    var aesIvCipher = rsaEncryptor.encrypt(this.aesIv);
    return {
      bodyCipher: aesEncrypt(JSON.stringify(data), this.aesKey, this.aesIv),
      ksCipher: aesKeyCipher,
      ivCipher: aesIvCipher
    };
  };
  /**
   * Decrypt the Base64-encoded response ciphertext string into a JSON object.
   * Decryption uses the same symmetric keys(AES key and AES IV) generated in the
   * previous call to encryptRequestData.
   * @param {string} data the request param object to be encrypted
   * @returns {object|null} the dectypted response object, or null if there isn't a previous call to
   * encryptRequestData.
   * @public
   */
  JsHttps.prototype.decryptResponseData = function (data) {
    if (this.aesKey === "" || this.aesIv === "") {
      return null;
    }
    return JSON.parse(aesDecrypt(data, this.aesKey, this.aesIv));
  };
  return JsHttps;
}();

return JsHttps;

}));
