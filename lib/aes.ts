import CryptoES from "crypto-es";

export function aesEncrypt(text: string, aesKey: string, aesIv: string): string {
    const cipherObj = CryptoES.AES.encrypt(
        CryptoES.enc.Utf8.parse(text),
        CryptoES.enc.Utf8.parse(aesKey), {
        iv: CryptoES.enc.Utf8.parse(aesIv),
        mode: CryptoES.mode.CBC,
        padding: CryptoES.pad.Pkcs7
    });

    return cipherObj.ciphertext.toString(CryptoES.enc.Base64);
}

export function aesDecrypt(text: string, aesKey: string, aesIv: string): string {
    const plainTextObj = CryptoES.AES.decrypt(
        text,
        CryptoES.enc.Utf8.parse(aesKey), {
        iv: CryptoES.enc.Utf8.parse(aesIv),
        mode: CryptoES.mode.CBC,
        padding: CryptoES.pad.Pkcs7
    });

    return plainTextObj.toString(CryptoES.enc.Utf8);
}