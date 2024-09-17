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
  ID_REQUIRED: (id: string) => `${id} is required.`,

  BOTH_REQUIRED: (id1: string, id2: string) =>
    `${id1} and ${id2} are both required.`,

  INVALID_ENTITY: (entity: string) =>
    `Invalid ${entity} or ${entity} not found.`,

  FORBIDDEN_ACCESS: 'Forbidden access.',

  INVALID_ROLE: 'Please assign a valid new role.',

  EMPTY_DATA: 'No data provided',

  REQUIRED_ROLE: 'You do not have the required roles',

  INVALID_TIME: 'Invalid time',
  INVALID_ATTEMPT: 'You have used all your attempts',
  MEMBERSHIP_EXISTS: 'User already has a membership for this account.',

  INVITATION_EXISTS: 'User already has a invitation for this account.',

  INVITATION_NOT_FOUND: 'Invitation not found or already confirmed.',
};
