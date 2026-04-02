declare module "xlsx" {
  export const utils: {
    book_new(): any;
    aoa_to_sheet(data: any[][]): any;
    book_append_sheet(wb: any, ws: any, name: string): void;
    sheet_to_json<T = any>(ws: any, opts?: any): T[];
    [key: string]: any;
  };
  export function read(data: any, opts?: any): any;
  export function writeFile(wb: any, filename: string, opts?: any): void;
}
