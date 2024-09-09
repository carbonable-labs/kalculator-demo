function transformObject<T extends object>(obj: T): Array<T> {
  return [{ ...obj }];
}

export const PERCENTAGE_MAX_VALUE = 100;
