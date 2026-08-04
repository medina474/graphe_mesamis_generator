import { readFileSync } from "node:fs";

import { Book } from "../models/Book.js";

export class BookLoader {
  static load(path: string): Book[] {
    const csv = readFileSync(path, "utf8");

    return csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(1)
      .map((line) => {
        const [rawId, rawAuthor, rawTitle, rawTags] = line.split(",");
        const id = rawId?.trim();
        const author = rawAuthor?.trim();
        const title = rawTitle?.trim();
        const tags = rawTags?.trim().split('|');

        if (!author) {
          return null;
        }

        return new Book(id, author, title, tags);
      })
      .filter((item): item is Book => item !== null);
  }
}
