const admin = require("firebase-admin");

const serviceAccount = 
  {
    "type": "service_account",
    "project_id": "scholarity-b2456",
    "private_key_id": "9639286d268c5c20214255a6f041fb678fcb87ad",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJmMmn/7ehJi+u\nRSxKb1DWy29m9mD9kk5PB8stH1HQvVtPbCLpSkBf690dNN/k91d0UW/FVqgK/oby\n7XgViKdx5ux3vF0t+dxYM7gPWOsOdrOyE5mkngtAp8wstj4e2WJEuMYBCTmm6v/Z\n+eJVpjZDEkc6RtbPDdR0AuTDnZR0LAqq7wogmnN/zcEAQS7jErPmkEyVcgpbhlEQ\naE61C4yjEFv8hGpdHY9+EVMh7M7orNLgyWGwHTVvBg1/jq9zk4ojjJ5Vq3pswlmj\n5DFs7s9hC2B4ku3F/qzoyNK1pklUyn/gPKb/1x1DM+GQISyoxVNKMiuAK375Ycxr\nR2rJPN1dAgMBAAECggEAK019oW/BBKU0cDlNDHcRNPYxSXtKNaV/2yN4LcrQsub9\nrldyv0wy/DeogP3Kyv6jIynb+ZZF1ci6+YLvPKbkGsgIyqZkGHxXa32+f1Nw+CQg\nsLNbmRvWnG5+oasKuGsm286Zv365CsTnLK3rg0zG0oziTl8JhKO6mynE9EzMptAu\nZ80Y7uMS9RJ7MV2zh/MgWOUHG5bJF69x7nGAeoLsJ0MmaQkggJ57IHUVVD0JjBsi\nrRSBxbSV9HUSJQxSfdkSARMdHro4KPQOcrVBXZsQtlRBV1Avhxidf3KSRtAnZzT+\nvzDi11MQbWBLPHxR7FKq/sJKwxZ61y2z4N5eHXEPYQKBgQDlZcZZJbQXUguLI75+\nMIMqgmERiy2J/WEcrGCPANuPgbBgSTrSLH27pa2qo9ldigDps0kxPNiENrr/uwgJ\nwBKUURFHuhKeoQBDPk7OwIklYw8dxAcq9ZKg8Ei8ZOt2sLaMaKy1b733gOE84jM+\nKVMFTeD40WL4WhlscsobEe8tvQKBgQDg+a42kMdrpbS2R7cWtKGGlNGpjOwc2U4Y\nzQ+jXu1ZnP5aFo+MYha94g0N4jrRbUe3zPAJWQ1Z7L8CzLuTN5sPFo+l2CcbSXln\nANG6SwZacAbExAoVgcpb4pqY7L5K03Y2RIJMqJ5OJ4eMCaaejpDkJL9DuYD0P/RH\nuBvbNdtYIQKBgQCSBkVKvjtzlOCQQ8KhJVR5nOEZf9UPP+GvlPMqVMtvAIk74aG1\n5GhtKLvyIbbeWljWazAuTaMuFoDXBUHKox+wliI/3Gy52ZcHNwSHi/xBdltLAVvm\ntsgN9qb2de+FcFvj6UX3gRgWE05NqVghO8EDYV3SRceQfBou9Ks+rB3qqQKBgQCg\n3GZgxayRn+5S13xmU8ma/RXc8dJx3j8lJJql6d40UTjdGXySmCBCrTtATh5YWJcL\nKRII3Q/a2JjLW7BTV1MburoDj0aHEEYqDD/pwHNOfwOX9cRwFFmo0aJQ7hYyUnkX\n3Gx+e6KVp1YYH15vyOh4+H154039Vy1HirEAUMYBgQKBgCPmF+H3NLb48i4uxeqM\nLsv2Vfx4tYJjHBACyywje1joXmyiRNGmOGAh5Sy+ghjS4xUQ2GPf9kuZhpY4h6rH\n2ut7Wd/JjAXAyo+gJyzH8Lb/ove4CgRtKaRGbS+lQa8AVivK1c1T+3ZcIEzNHif/\nD2WPWH//Ofpwg3F4DLPaoXiH\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xxdfm@scholarity-b2456.iam.gserviceaccount.com",
    "client_id": "111394942463530319220",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxdfm%40scholarity-b2456.iam.gserviceaccount.com"
  }  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const firebaseConfig = {admin};