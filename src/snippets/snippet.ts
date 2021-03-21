
export interface ISnippet {
  prefix: string;
  body: string | string[];
  description?: string;
  scope?: string;
}

export interface ISnippetFile {
  [key: string]: ISnippet;
}
