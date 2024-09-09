export type TableElement = {
  column: string;
  element: any;
};

export type TableEdit<T> = { newElement: T; oldElement: T };
