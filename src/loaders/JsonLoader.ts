import { readFileSync } from "node:fs";

export interface JsonConstructor<T> {
  fromJson(json: unknown): T;
}

export class JsonLoader {
  static load<T>(
    path: string,
    factory: JsonConstructor<T>,
  ): T[] {
    const json = readFileSync(path, "utf8");
    const data = JSON.parse(json) as unknown[];

    return data.map(item => factory.fromJson(item));
  }
}