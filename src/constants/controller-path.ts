export const controller_path = {
  USER: { GET_ONE: ':id', PATCH_ONE: ':id', DELETE_ONE: ':id', GET_ALL: '' },
  AUTH: {
    SIGN_UP: 'sign_up',
    SIGN_IN: 'sign_in',
    CONFIRM_EMAIL: 'confirm_email',
    RESEND_EMAIL: 'resend_email',
    REQUEST_RESET_PASSWORD: 'request_reset_password',
    RESET_PASSWORD_FORM: 'reset_password_form',
    RESET_PASSWORD: 'reset_password',
  },
  ACCOUNT: {
    GET_ONE: ':accountId',
    GET_USERS: ':accountId/users',
    UPDATE_ACCOUNT: ':accountId',
    DELETE_ACCOUNT: ':accountId',
  },
  MEMBERSHIP: {
    UPDATE_ROLE: ':accountId/role/:userId',
    DELETE_MEMBERSHIP: ':membershipId/:accountId',
  },
};
