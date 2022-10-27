interface EncryptedRequestParam {
    bodyCipher: string;
    ksCipher: string;
    ivCipher: string;
}
/**
 * Create a new JsHttps object. Note that the symmetric key used in
 * decryptResponseData is generated from the closest previous call to
 * encryptRequestData. encryptRequestData and decryptResponseData
 * must be called in pair for the same request.
 * @constructor
 */
export default class JsHttps {
    private aesIv;
    private aesKey;
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
    encryptRequestData(data: object, publicKey: string): EncryptedRequestParam;
    /**
     * Decrypt the Base64-encoded response ciphertext string into a JSON object.
     * Decryption uses the same symmetric keys(AES key and AES IV) generated in the
     * previous call to encryptRequestData.
     * @param {string} data the request param object to be encrypted
     * @returns {object|null} the dectypted response object, or null if there isn't a previous call to
     * encryptRequestData.
     * @public
     */
    decryptResponseData(data: string): object | null;
}
export {};
