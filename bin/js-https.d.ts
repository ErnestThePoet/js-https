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
     * Encrypt the request data object and return an object
     * containing RSA-encrypted symmetric key(AES key and AES IV)
     * and AES128-encrypted request data object JSON string.
     * All ciphertexts are Base64-encoded strings.
     * @param {object} data the request data object to be encrypted.
     * @param {string} publicKey the pem encoded RSA public key string
     * (header and footer are optional, '\n' at the end of each line
     * are also optional).
     * @returns {EncryptedRequestParam} the cipher object.
     * @public
     */
    encryptRequestData(data: object, publicKey: string): EncryptedRequestParam;
    /**
     * Decrypt the Base64-encoded response ciphertext string into a JSON object.
     * Decryption uses the same symmetric key(AES key and AES IV) generated in the
     * previous call to encryptRequestData.
     * @param {string} data the Base64-encoded response ciphertext encrypted by
     * server using AES128 with the same symmetric key used to encrypt request data.
     * @returns {object|null} the decrypted response object, or null if there
     * isn't a previous call to encryptRequestData.
     * @public
     */
    decryptResponseData(data: string): object | null;
}
export {};
