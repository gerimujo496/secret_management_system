export const errorMessage = {
  NOT_FOUND: (entity: string, propertyName?: string, propertyValue?: string) =>
    propertyName && propertyValue
      ? `The ${entity} with the given ${propertyName}: ${propertyValue} is not found.`
      : `The ${entity} is not found`,

  INTERNAL_SERVER_ERROR: (action: string, enitity: string) =>
    `Failed to ${action} the ${enitity}`,

  EMAIL_IN_USE: (email: string) => `Email: ${email} is in use`,

  INVALID_CREDENTIALS: `Email or password is not correct`,

  CONFLICT_ACCOUNT_CONFIRMED: `Account's email has been confirmed`,

  INVALID_TOKEN: `Invalid token`,

  EMAIL_IS_CONFIRMED: 'Email is confirmed',

  EMAIL_IS_NOT_CONFIRMED: 'Email is not confirmed',

  USER_2FA_IS_ENABLED:
    'Two factor authentication is enabled, please login through the 2fa endpoint and provide the code',

  USER_2FA_NOT_ENABLED:
    'Two factor authentication is not enabled, please login through the login endpoint ',

  WRONG_AUTH_CODE: 'Wrong authentication code',

  CAN_NOT_SEND_EMAIL: 'Can not send email',
};
