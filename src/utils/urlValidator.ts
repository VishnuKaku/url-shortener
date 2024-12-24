import validUrl from 'valid-url';

export class URLValidator {
  static isValidUrl(url: string): boolean {
    return !!validUrl.isWebUri(url);
  }

  static isValidCustomAlias(alias: string): boolean {
    const aliasRegex = /^[a-zA-Z0-9-_]{4,15}$/;
    return aliasRegex.test(alias);
  }
}