import JSEncrypt from "jsencrypt";
import cryptoRandomString from "crypto-random-string";
import { aesEncrypt, aesDecrypt } from "./aes";

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
    private aesIv: string = "";
    private aesKey: string = "";

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
    encryptRequestData(data: object, publicKey: string): EncryptedRequestParam {
        const rsaEncryptor = new JSEncrypt();
        rsaEncryptor.setPublicKey(publicKey);

        // AES-128
        this.aesKey = cryptoRandomString({ length: 16 });
        // Must be 16 Bytes
        this.aesIv = cryptoRandomString({ length: 16 });

        const aesKeyCipher = rsaEncryptor.encrypt(this.aesKey) as string;
        const aesIvCipher = rsaEncryptor.encrypt(this.aesIv) as string;

        return {
            bodyCipher: aesEncrypt(JSON.stringify(data),this.aesKey,this.aesIv),
            ksCipher: aesKeyCipher,
            ivCipher: aesIvCipher
        };
    }

    /**
     * Decrypt the Base64-encoded response ciphertext string into a JSON object.
     * Decryption uses the same symmetric keys(AES key and AES IV) generated in the 
     * previous call to encryptRequestData.
     * @param {string} data the request param object to be encrypted
     * @returns {object|null} the dectypted response object, or null if there isn't a previous call to
     * encryptRequestData.
     * @public
     */
    decryptResponseData(data: string): object|null {
        if (this.aesKey === "" || this.aesIv === "") {
            return null;
        }

        return JSON.parse(aesDecrypt(data,this.aesKey,this.aesIv));
    }
}
