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
    TWO_FA_AUTHENTICATE: 'two_fa_authenticate',
    TWO_FA_INIT: 'two_fa_init',
    TWO_FA_ACTIVATE: 'two_fa_activate',
  },
};
