export const cookies = {
  get(name: string): string | undefined {
    if (typeof document !== "undefined") {
      const cookieString = document.cookie;
      const cookiesArray = cookieString.split("; ");
      const cookie = cookiesArray.find((row) => row.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    } else if (typeof globalThis !== "undefined") {
      throw new Error(
        "Cookies en servidor requieren acceso al request headers."
      );
    }
    return undefined;
  },

  set(
    name: string,
    value: string,
    options: {
      expires?: Date | string;
      maxAge?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
    } = {}
  ): void {
    if (typeof document !== "undefined") {
      const { expires, maxAge, path = "/", domain, secure } = options;
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=${path}`;
      if (expires) {
        cookieString += `; expires=${new Date(expires).toUTCString()}`;
      }
      if (maxAge) {
        cookieString += `; max-age=${maxAge}`;
      }
      if (domain) {
        cookieString += `; domain=${domain}`;
      }
      if (secure) {
        cookieString += `; secure`;
      }
      document.cookie = cookieString;
    } else {
      throw new Error(
        "Cookies en servidor requieren acceso al response headers."
      );
    }
  },

  delete(name: string, path: string = "/"): void {
    this.set(name, "", { path, expires: new Date(0) });
  },
};
