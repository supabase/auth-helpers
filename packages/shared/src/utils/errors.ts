export interface ErrorPayload {
  type?: string;
  message: string;
  source?: string;
}

export class AuthHelperError extends Error {
  errorType: string;
  source: string;

  constructor(message: string, errorType: string) {
    super(message);
    this.errorType = errorType;
    this.source = 'sb_auth_helpers';
  }

  toObj(): ErrorPayload {
    return {
      type: this.errorType,
      message: this.message,
      source: this.source
    };
  }

  toString() {
    return JSON.stringify(this.toObj());
  }
}

export class CookieNotFound extends AuthHelperError {
  constructor() {
    super('No cookie was found!', 'cookie_not_found');
  }
}

export class CookieNotSaved extends AuthHelperError {
  constructor() {
    super('Cookies cannot be saved!', 'cookie_not_saved');
  }
}

export class AccessTokenNotFound extends AuthHelperError {
  constructor() {
    super('No access token was found!', 'cookie_not_found');
  }
}

export class RefreshTokenNotFound extends AuthHelperError {
  constructor() {
    super('No refresh token was found!', 'cookie_not_found');
  }
}

export class ProviderTokenNotFound extends AuthHelperError {
  constructor() {
    super('No provider token was found!', 'cookie_not_found');
  }
}

export class CookieNotParsed extends AuthHelperError {
  constructor() {
    super('Not able to parse cookies!', 'cookie_not_parsed');
  }
}

export class CallbackUrlFailed extends AuthHelperError {
  constructor(callbackUrl: string) {
    super(`The request to ${callbackUrl} failed!`, 'callback_url_failed');
  }
}

export class JWTPayloadFailed extends AuthHelperError {
  constructor() {
    super('Not able to parse JWT payload!', 'jwt_payload_failed');
  }
}

export class JWTInvalid extends AuthHelperError {
  constructor() {
    super('Invalid jwt!', 'jwt_invalid');
  }
}
