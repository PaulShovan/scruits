import CognitoExpress from 'cognito-express';

const cognitoExpress = new CognitoExpress({
    region: "us-east-1",
    cognitoUserPoolId: "us-east-1_FhioeMi1z",
    tokenUse: "id", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});
export default cognitoExpress;