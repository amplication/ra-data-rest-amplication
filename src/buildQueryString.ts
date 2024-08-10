export function buildQueryString(obj, prefix = "") {
  //check if obj is empty object
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return undefined;
  }

  if (obj === null || obj === undefined || obj === "") {
    return undefined;
  }

  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      const encodedKey = prefix
        ? `${prefix}[${encodeURIComponent(key)}]`
        : encodeURIComponent(key);

      if (typeof value === "object" && value !== null) {
        return buildQueryString(value, encodedKey);
      } else {
        return `${encodedKey}=${encodeURIComponent(value)}`;
      }
    })
    .join("&");
}
