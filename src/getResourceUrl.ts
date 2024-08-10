import { plural } from "pluralize";
import { camelCase } from "camel-case";

export function getResourceUrl(apiUrl, resource) {
  const controllerName = camelCase(plural(resource));

  return `${apiUrl}/${controllerName}`;
}
