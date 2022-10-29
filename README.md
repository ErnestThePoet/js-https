# js-https

This project aims to make HTTP Ajax data transmission safer by imitating HTTPS.

[![npm version](https://img.shields.io/npm/v/js-https.svg?style=flat-square)](https://www.npmjs.org/package/js-https)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=js-https&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=js-https)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/js-https?style=flat-square)](https://bundlephobia.com/package/js-https@latest)
[![npm downloads](https://img.shields.io/npm/dm/js-https.svg?style=flat-square)](https://npm-stat.com/charts.html?package=js-https)

## Getting Started


### Installing
Using package manager:

```bash
npm install js-https
# or
yarn add js-https
```

Or include directly in browser:
```html
<script src="https://cdn.jsdelivr.net/npm/js-https@1.0.8/dist/js-https.min.js"></script>
```

### Overview
Now let's gain an insight into how js-https works to provide safety. Imitating HTTPS, js-https has the following workflow:
```
BROWSER                                    SERVER
   |                                          |
   | 1). Request site certificate             |
   |  (containing public key)                 |
   |----------------------------------------->|
   | 2). Site certificate                     |
   |<-----------------------------------------|
   |                                          |
   | 3). Browser calls encryptRequestData()   |
   |  (js-https generates symmetric key       |
   |  (AES key and AES IV), encrypt them      |
   |  using RSA with public key. Then encrypt |
   |  request data using AES with generated   |
   |  symmetric key)                          |
   |                                          |
   | 4). Browser sends ciphertext             |
   |  (containing encrypted symmetric key     |
   |  and request data)                       |
   |----------------------------------------->|
   |                                          |
   | 5). Server decrypts symmetric key and    |
   |  request data, do service, then encrypts |
   |  response data using AES with the same   |
   |  symmetric key                           |
   |                                          |
   | 6). Server sends ciphertext              |
   |  (Containing encrypted response data)    |
   |<-----------------------------------------|
   |                                          |
   | 7). Browser calls decryptResponseData()  |
   |  and gets the actual response object     |
   |  (js-https decrypts response cipher      |
   |  using AES with symmetric key)           |
   |                                          |
   
```

The above steps 1) and 2) are not part of js-https and browser needs to verify the certificate to ensure its authority. To keep things simple, in this guide we will omit these two steps and make public key directly available in our code.

As is illustrated above, in order to get things working, js-https requires the backend server to perform RSA-decryption, AES-decryption and AES-encryption for each request. You can find our backend demo with Springboot [here](https://github.com/ErnestThePoet/js-https-backend-demo) and one with Django [here](https://github.com/ErnestThePoet/js-https-backend-demo-django).

### Generating RSA Keys
To get an RSA public/private key pair, you can take advantage of OpenSSL:

```bash
# 2048-bit key size is recommended
openssl genrsa -out private-orig.pem 2048
# Our backend demo needs PKCS#8 format key, so convert the key
openssl pkcs8 -topk8 -inform PEM -in private-orig.pem -outform pem -nocrypt -out private.pem
# Get public key from private key
openssl rsa -in private.pem -pubout -out public.pem
```

Make sure to keep your **private key** a top-secret!

### Usage
The usage is as simple as follows:

```javascript
// If you use <script> to include CDN(UMD) version of js-https,
// just remove these imports. You will have direct access to 
// the global variable JsHttps.
import axios from "axios";
import JsHttps from "js-https";

// a 2048-bit RSA public key
// header and footer are optional
// '\n' at the end of each line are also optional
const publicKey = "-----BEGIN PUBLIC KEY-----" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2HrBycYe4BbgrxhnF/Au" +
    "/FkK6OFdY9xwFmxLuS0FNu+51Xzz5cGFw8AbVR41dPYwMK3kDwM2+dEioNxIkE/r" +
    "lyKUkd0lExjg1o08e02y/ytquAWpPyVrLlrN5AvHbLVezjqe9rNhTrXuvu9dI+RS" +
    "J98vvitls106Ke6rVSdIzOv9Sp50ZHVC7wURS2UkLHhWFE4iBjGGY/41aKbjug4t" +
    "GrAElilG5XiFjYk7wohlBaOQprB2W/qYbEgOcKElbOWXiqq7Kh0iSQyuo56PZNQf" +
    "3svrfh+lgbNNz5onRaoTtK1UTvu7G+lF/CytjxloXp/xSQXEkStw/Ionq0HYM7MF" +
    "LQIDAQAB" +
    "-----END PUBLIC KEY-----";

function safeRequest(){
    // a JsHttps object should be dedicated to each request
    const jsHttps=new JsHttps();

    const myRequestData={
        name:"Flora",
        age:20,
        interests:["reading","writing","exploring","law"]
    };

    // ajax to any HTTP url
    axios.post("http://localhost:13680/api/demo",
        jsHttps.encryptRequestData(myRequestData,publicKey)
    ).then(
        // say that server responds with cipher string in response body directly
        res=>{
            console.log(jsHttps.decryptResponseData(res.data));
    });
}
```

With a correctly implemented backend server, you should see the actual response data in your browser console when `safeRequest()` is invoked, just as what it is without js-https.  
If you run either of our backend demo implementations, you will also see the decrypted request data in your Springboot or Django terminal.

## API

1. `JsHttps.encryptRequestData(data: object, publicKey: string): EncryptedRequestParam`

    Params:

    * `data: object`: the request data object to be encrypted.

    * `publicKey: string`: the pem encoded RSA public key. Header(`"-----BEGIN PUBLIC KEY-----"`) and footer(`"-----END PUBLIC KEY-----"`) are optional, `'\n'` at the end of each line are also optional.

    Returns an `EncryptedRequestParam` object. Typically you can send it directly. The object has the following properties:
    * `bodyCipher: string`: the Base64-encoded string of AES128-encrypted `JSON.stringify(data)`.
    * `ksCipher: string`: the Base64-encoded string of RSA-encrypted AES key(128 bits).
    * `ivCipher: string`: the Base64-encoded string of RSA-encrypted AES IV(128 bits).

2. `JsHttps.decryptResponseData(data: string): object|null`

    Params:

    * `data: string`: the Base64-encoded response ciphertext encrypted by server using AES128 with the same symmetric key used to encrypt request data.

    Returns the decrypted response object.  
    If you call `decryptResponseData` without any prior call to `encryptRequestData`, there will be no symmetric key for decryption and this method will return `null`.

### Note
Each call to `encryptRequestData` will generate and store a random AES symmetric key, which will be used for decryption in the next call to `decryptResponseData`.  
If you call `encryptRequestData` again before the previous one's decryption, then a new symmetric key will replace the previous one and you won't be able to decrypt the response cipher of the previous request.  

It's recommended to use a dedicated `JsHttps` object for each request, and call `encryptRequestData` and `decryptResponseData` once each only.

## Safety Details

The AES encryption uses CBC mode with 128-bit key size, with PKCS #7 padding mode.  
The key size for RSA encryption should be at lease 2048 bits, as is [recommended](http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57Pt3r1.pdf) by NIST since 2015. In js-https it should be just 2048 bits for performance.

## Credits

Js-https wouldn't have been possible without these great open-source projects: [brix/crypto-js](https://github.com/brix/crypto-js), [entronad/
crypto-es](https://github.com/entronad/crypto-es), [travist/jsencrypt](https://github.com/travist/jsencrypt) and [
sindresorhus/crypto-random-string](https://github.com/sindresorhus/crypto-random-string).

## Notes on Build
If you'd like to build js-https on your own, you may have to modify the source code of `jsencrypt`(current version is 3.3.0) to make the UMD version run in browser.  
Go to `jsencrypt/lib/JSEncrypt.js`, and find `var version = process.env.npm_package_version;`. Change this line to `var version = "3.3.0";`. This removes the reference to the Node.js `process` object which causes error in browser.
