This project aims to help HTTP Ajax data transport safer by simulating what HTTPS does.

## Getting Started

First add dependency to your project:

```bash
npm install js-https
# or
yarn add js-https
```

Now let's gain an insight as of how js-https works. This library attempts to imitate HTTPS with the following workflow:
```
BROWSER                                    SERVER
   |                                          |
   | 1). Request site public key              |
   |----------------------------------------->|
   | 2). Public key                           |
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

As is illustrated, the way js-https works calls for a mutual-supporting backend. You can find a working backend demo [here](https://github.com/ErnestThePoet/js-https-backend-demo).

To get an RSA public/private key pair, you can take advantage of OpenSSL:

```bash
# 2048-bit keysize is recommended
openssl genrsa -out private-orig.pem 2048
# If you use javax.crypto.Cipher in your backend, 
# it is necessary to convert to PKCS#8 format key
openssl pkcs8 -topk8 -inform PEM -in private-orig.pem -outform pem -nocrypt -out private.pem
# Get public key from private key
openssl rsa -in private.pem -pubout -out public.pem
```

Make sure to keep your **private key** a top-secret!

Then the usage is as simple as follows:

```javascript
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

With a correctly implemented backend server, you should see the actual response data in the console, just as what you would see without js-https.  
If you run our demo backend implementation, you will also see the decrypted request data in your Springboot terminal.

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

Each call to `encryptRequestData` will generate and store a random AES symmetric key, which will be used for decryption in the next call to `decryptResponseData`.  
If you call `encryptRequestData` again before the previous one's decryption, then a new symmetric key will replace the previous one and you won't be able to decrypt the response cipher of the previous request.  

It's recommended to use a dedicated `JsHttps` object for each request, and call `encryptRequestData` and `decryptResponseData` once only.

## Safety Details

The AES encryption uses CBC mode with 128-bit keysize.  
The RSA encryption used ECB mode with your given keysize. Typically 2048-bit keysize is recommended.

## Credits

This utility wouldn't have been possible without these great open-source projects: [brix/crypto-js](https://github.com/brix/crypto-js), [entronad/
crypto-es](https://github.com/entronad/crypto-es), [travist/jsencrypt](https://github.com/travist/jsencrypt), [
sindresorhus/crypto-random-string](https://github.com/sindresorhus/crypto-random-string).
