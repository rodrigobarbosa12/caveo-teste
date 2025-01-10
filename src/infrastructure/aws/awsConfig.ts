import AWS from "aws-sdk";

AWS.config.update({
  region: "us-east-1", // Substitua pela região do seu User Pool
});

export const cognito = new AWS.CognitoIdentityServiceProvider();
