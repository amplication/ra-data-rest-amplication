import { SortPayload } from "ra-core";

type SortOrder = "asc" | "desc";

type OrderType = { [key: string]: SortOrder } | undefined;

const SORT_ORDER_MAP: { [key: string]: SortOrder } = {
  ASC: "asc",
  DESC: "desc",
};

export function getSortQuery(sortParam: SortPayload | undefined): OrderType {
  const { field, order } = sortParam || {};

  if (!field || !order) {
    return undefined;
  }

  return {
    [field]: SORT_ORDER_MAP[order],
  };
}
