export interface CustomHeaders {
  [key: string]: string;
}
export type CustomHeadersFunction = () => Promise<CustomHeaders>;
