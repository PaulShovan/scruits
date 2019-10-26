import {CognitoUserPool} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId : 'us-east-1_FhioeMi1z',
    ClientId : '7rsud5o0n25ubua6q68u4ilhgg'
};
const userPool = new CognitoUserPool(poolData);

export default { userPool }