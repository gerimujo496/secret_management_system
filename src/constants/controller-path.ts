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
    PATH: 'account',
    GET_ONE: ':accountId',
    GET_USERS: ':accountId/users',
    UPDATE_ACCOUNT: ':accountId',
    DELETE_ACCOUNT: ':accountId',
  },
  MEMBERSHIP: {
    PATH: 'membership',
    UPDATE_ROLE: ':accountId/role/:userId',
    DELETE_MEMBERSHIP: ':membershipId/:accountId',
  },
  SECRET: {
    PATH: 'secret',
    CREATE_SECRET: ':accountId/secrets',
    GET_ONE: ':accountId/:secretId',
    GET_SECRETS: ':accountId/secrets',
    UPDATE_SECRETS: ':accountId/:secretId',
    DELETE_SECRET: ':accountId/:secretId',
  },
  SECRETSHARE: {
    PATH: 'secret-sharing',
    GET_KEY: 'get_key/:accountId',
    CREATE_SHARE_SECRET: 'create_share_secret/:accountGiverId',
    GET_SHARE_SECRET_FORM: '/:secretShareId',
    POST_NEW_SHARE_SECRET: '/:secretShareId',
  },
};
