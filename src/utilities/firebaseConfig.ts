const admin = require("firebase-admin");

const serviceAccount = {
    "type": "service_account",
    "project_id": "scholarity-d3107",
    "private_key_id": "f95fc0ac2489df0cca8d745d9103570fe80b22bd",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCE0TgB3IsFXvGU\njLmkV6qLXX9exR+aDJ8TnLtSc/zJDoBA/V4tYaUAZgqtyhSoP8I8/3FuVwFj/r4b\nTpUXF+8u4nvh+nN0nS0KyTwxh232j62fTcytdpN/diigeBw8Fh6VO2RlD39vyJih\n8gvXE7GZIM5YeGjt/OAH5oprPT4lfUvTFbQPNj/9nfxuMb/5LdNcyxKZz/V6lkI0\nNQc2UrazQIiuaWL7Eck2FOSEOZpxNkLsyeK+Xv3Xso4ZtvfUkBdJSlmefhwcXmxW\nnVRGsj+JV9v0x4B5m9Co6iplcEE2+J+2gg4LVotrd2eWRQAQdtNI+dRCb7eVzrpZ\niMpyPqpFAgMBAAECggEAAMHfycMen4cM2aOWWloXC6Tp6IMe5rMiuVvVQqdog2xO\n3Qz0zDUdEKwo2iSYVwj45H3QezdrEtNwk6LCnuspL4d3seQyJsQxPT9WvUPwyDf2\ns/pKLwgSs0gMpopaT9CKeUrXMJbnDpKd4tohHNIabULKCCI0xmQledSIb0hwVEEZ\n8i3tKMhHHPfQzTh6bJqobQBAwA5+q4EqmS7iRONGRoeGEQ7Mi8cxxB2RXlZjXfRe\ni6TcYenkvUR7pqJoRscZV9fOAO3OYJC75bLhxUwuNiOpcE/SrZh7Af7Hj0+4jnWa\nMDcGqrQVF0VyjlGLCUzV/yf4PIGH2VLt7+t+kW2vYwKBgQC4i2DMsGdSyOIDKtlm\nXMVcAH6Dd+7PMwKAsgAp9q0YRm1eYhGa7M1dUcKkOlI35MPnlO/RN6gaNoF7opEC\nZfawbVbjHxnOdGzHZKTz0xnW1fKQTxCLZxWAyjM1+eM1V3FDmEzIymUpz+UvpJmv\nz94K28ktJpUJVpjTZKMsZ+qsIwKBgQC4PnsDO7OMAP7w50H0KnPdCCi3C4+3i48e\nSlZiIIdIZ7XWb9RkHWLLdRSS/BaHv1aHw9hrU1d2nH0WhyiIGoUon7HuyzRu3xzk\n1Q4waDYMQnr33BydKc5NhYJUpCc+Fcz0ic+rUSonWPKFvoxTBLWD4IwytuLWcFPq\nMQiDwEQidwKBgBZi4fUymPYT5EbaFdEzA8XrUW2FSPTdjTorXZW5lLnTIUVHxDb0\n7tyZJHFjmcGqAJHBIW5RwBSd9AsZZ1nRIKG6QcX/adP/j4qIjPH+8615+pjC3pDq\nilM7NAciLwuzdcvrV7UryCXQUE79Op93KcpLaxYNDhs55AQQuzKR0IfdAoGBAJ2O\ncMu3Bje3skx4tuICW8qs64R9Eo23ftA8adrITmgQqGOUhmCG8LFkkg+QHARCD9FS\nHYTKZIU+FYpqUrLxWuX+ir7WbyRRD/hwag3jUDTztQy44o9T7ORGQ8n2BskFA5wr\nLbgnVJEJc3wEEyP7Zu473CiSVTFkJZ6kB9ADX0DJAoGAHGDAbCZQlmQUrSnx52RT\nRa0wbQSsCuT1aqDi+DRz5q2VUduJrDiDgQFQG7LP8XYSg7lS2GUYf8oWKHVgAbBl\nuy6Fy2jQ6FzBVxQtWWWPey1sOyqznyDcJFB/LiF5VHuKK8moNafTdzG13AbeSe6j\nMvSugC8bNmYMoO8MF+nIoMs=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-i9dzq@scholarity-d3107.iam.gserviceaccount.com",
    "client_id": "114621588549849582252",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-i9dzq%40scholarity-d3107.iam.gserviceaccount.com"
  }
  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const firebaseConfig = {admin};