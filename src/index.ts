import { stringify } from "query-string";
import { fetchUtils, DataProvider, SortPayload } from "ra-core";

import { buildQueryString } from "./buildQueryString";
import { getResourceUrl } from "./getResourceUrl";
import { getSortQuery } from "./getSortQuery";

export default (
  apiUrl: string,
  httpClient = fetchUtils.fetchJson,
  countHeader: string = "Content-Range"
): DataProvider => ({
  getList: (resource, params) => {
    console.log("getList", resource, params);

    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };

    const rangeStart = (page - 1) * perPage;

    const query = {
      orderBy: getSortQuery(params.sort),
      skip: rangeStart,
      take: perPage,
      where: params.filter,
    };
    const url = `${getResourceUrl(apiUrl, resource)}?${buildQueryString(
      query
    )}`;
    const options =
      countHeader === "Content-Range"
        ? {
            // // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
            // headers: new Headers({
            //   Range: `${resource}=${rangeStart}-${rangeEnd}`,
            // }),
            signal: params?.signal,
          }
        : { signal: params?.signal };

    return httpClient(url, options).then(({ headers, json }) => {
      //   if (!headers.has(countHeader)) {
      //     throw new Error(
      //       `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
      //     );
      //   }
      return {
        data: json,
        total: 100,
        //   countHeader === "Content-Range"
        //     ? parseInt(headers.get("content-range")!.split("/").pop() || "", 10)
        //     : parseInt(headers.get(countHeader.toLowerCase())!),
      };
    });
  },

  getOne: (resource, params) => {
    console.log("getOne", resource, params);
    return httpClient(`${getResourceUrl(apiUrl, resource)}/${params.id}`, {
      signal: params?.signal,
    }).then(({ json }) => ({
      data: json,
    }));
  },

  getMany: (resource, params) => {
    console.log("getMany", resource, params);
    const query = {
      where: {
        id: {
          in: params.ids,
        },
      },
    };
    const url = `${getResourceUrl(apiUrl, resource)}?${buildQueryString(
      query
    )}`;
    return httpClient(url, { signal: params?.signal }).then(({ json }) => ({
      data: json,
    }));
  },

  getManyReference: (resource, params) => {
    console.log("getManyReference", resource, params);

    const { target, id, pagination, sort, filter } = params;

    //remove the id suffix
    const targetField = target.replace(/Id$/, "");

    const { page, perPage } = pagination;
    const { field, order } = sort;

    const rangeStart = (page - 1) * perPage;
    const rangeEnd = page * perPage - 1;

    const query = {
      orderBy: getSortQuery(params.sort),
      skip: rangeStart,
      take: perPage,
      where: {
        ...params.filter,
        [targetField]: {
          id: id,
        },
      },
    };
    const url = `${getResourceUrl(apiUrl, resource)}?${buildQueryString(
      query
    )}`;
    const options =
      countHeader === "Content-Range"
        ? {
            // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
            // headers: new Headers({
            //   Range: `${resource}=${rangeStart}-${rangeEnd}`,
            // }),
            signal: params?.signal,
          }
        : { signal: params?.signal };

    return httpClient(url, options).then(({ headers, json }) => {
      //   if (!headers.has(countHeader)) {
      //     throw new Error(
      //       `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
      //     );
      //   }
      return {
        data: json,
        total: 100,
        //   countHeader === "Content-Range"
        //     ? parseInt(headers.get("content-range")!.split("/").pop() || "", 10)
        //     : parseInt(headers.get(countHeader.toLowerCase())!),
      };
    });
  },

  update: (resource, params) => {
    console.log("update", resource, params);

    return httpClient(`${getResourceUrl(apiUrl, resource)}/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
  updateMany: (resource, params) => {
    console.log("updateMany", resource, params);

    return Promise.all(
      params.ids.map((id) =>
        httpClient(`${getResourceUrl(apiUrl, resource)}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(params.data),
        })
      )
    ).then((responses) => ({
      data: responses.map(({ json }) => json.id),
    }));
  },

  create: (resource, params) => {
    console.log("create", resource, params);

    return httpClient(`${getResourceUrl(apiUrl, resource)}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) => {
    console.log("delete", resource, params);

    return httpClient(`${getResourceUrl(apiUrl, resource)}/${params.id}`, {
      method: "DELETE",
      headers: new Headers({
        "Content-Type": "text/plain",
      }),
    }).then(({ json }) => ({ data: json }));
  },

  // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
  deleteMany: (resource, params) => {
    console.log("deleteMany", resource, params);

    return Promise.all(
      params.ids.map((id) =>
        httpClient(`${getResourceUrl(apiUrl, resource)}/${id}`, {
          method: "DELETE",
          headers: new Headers({
            "Content-Type": "text/plain",
          }),
        })
      )
    ).then((responses) => ({
      data: responses.map(({ json }) => json.id),
    }));
  },
});
