import { stringCompare } from "./string";
import { numberCompare } from "./math";

export const sortArrayByString = <Item>(arr: Item[], sortBy: (item: Item) => string) => {
  const result = [...arr]; // clone
  result.sort((t1, t2) => stringCompare(sortBy(t1), sortBy(t2)));
  return result;
};

export const sortArrayByNumber = <Item>(arr: Item[], sortBy: (item: Item) => number) => {
  const result = [...arr]; // clone
  result.sort((t1, t2) => numberCompare(sortBy(t1), sortBy(t2)));
  return result;
};

export const sortStringArray = (arr: string[]) => {
  return sortArrayByString(arr, t => t);
}

export const sortNumberArray = (arr: number[]) => {
  return sortArrayByNumber(arr, t => t);
}

export const getDistinctItemsByValue = <Item, Value>(arr: Item[], getValue: (item: Item) => Value) => {
  const processed = new Set<Value>();
  const result: Item[] = [];

  for (const item of arr) {
    const value = getValue(item);

    if (!processed.has(value)) {
      result.push(item);
      processed.add(value);
    }
  }

  return result;
};

export const getDistictValues = <Item>(arr: Item[]) => getDistinctItemsByValue(arr, t => t);

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
