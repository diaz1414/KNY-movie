const XOR_KEY = '90_NiwmsdfhgjQw';

const decryptLicense = (ciphertext) => {
  try {
    const binary = atob(ciphertext);
    let result = '';
    for (let i = 0; i < binary.length; i++) {
      result += String.fromCharCode(binary.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
};

const cipher = "DARmLwtADhdXUwlRXjMVD1I9el5OCBABBwxXXjVBAFRldltOWkpdAwxSWWUTCAE5LQgTCBFQBFleWGVBDlVve1k=";
console.log("Decrypted license:", decryptLicense(cipher));
