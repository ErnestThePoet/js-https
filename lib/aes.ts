import CryptoJS from "crypto-js";

export function aesEncrypt(text: string, aesKey: string, aesIv: string): string {
    const cipherObj = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(text),
        CryptoJS.enc.Utf8.parse(aesKey), {
        iv: CryptoJS.enc.Utf8.parse(aesIv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return cipherObj.ciphertext.toString(CryptoJS.enc.Base64);
}

export function aesDecrypt(text: string, aesKey: string, aesIv: string): string {
    const plainTextObj = CryptoJS.AES.decrypt(
        text,
        CryptoJS.enc.Utf8.parse(aesKey), {
        iv: CryptoJS.enc.Utf8.parse(aesIv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return plainTextObj.toString(CryptoJS.enc.Utf8);
}