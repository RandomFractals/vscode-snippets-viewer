import {
  MarkdownString,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri
} from 'vscode';
import * as path from 'path';

/**
 * Defines snippet tree item node for the snippets tree view.
 */
export class Snippet extends TreeItem {
  readonly collapsibleState = TreeItemCollapsibleState.None;
  readonly contextValue = 'snippet';

  /**
   * Creates new snippet tree node.
   *
   * @param name Short snippet name.
   * @param prefix Snippet prefix, or snippets extension short name.
   * @param scope Snippet scope or language.
   * @param snippetDescription Snippet text description.
   * @param body Snippet code body.
   * @param snippetFile Parent snippet file tree node.
   */
  constructor(
    readonly name: string,
    readonly prefix: string,
    readonly scope: string[],
    readonly snippetDescription: string,
    readonly body: string | string[],
    readonly snippetFile: SnippetFile
  ) {
    super(name);

    // use snippet file language for the snippet scope
    this.scope = [snippetFile.language];

    // show snippet prefix as description in tree node
    this.description = prefix;

    // create snippet body string
    let snippetBody = body;
    if (Array.isArray(body)) {
      snippetBody = body.join('\n');
    }

    // create snippet title markdown
    let snippetInfo: string = `**${this.prefix}⇥ ${this.label}** _(from ${snippetFile.label})_\n___`;

    if (snippetDescription && snippetDescription !== name) {
      // add snippet description text
      snippetInfo += `\n${snippetDescription}\n___`;
    }

    // create snippet markdown tooltip
    this.tooltip = new MarkdownString(`${snippetInfo}\n\`\`\`${snippetFile.language}\n${snippetBody}\n\`\`\``);
  }

  // use custom snippet icons for the tree nodes display
  iconPath = {
    light: path.join(__filename, '..', '..', 'images', 'light', 'snippet.svg'),
    dark: path.join(__filename, '..', '..', 'images', 'dark', 'snippet.svg')
  };
}

/**
 * Defines snippet file tree item for display in the snippets tree view.
 */
export class SnippetFile extends TreeItem {
  readonly contextValue = 'snippetFile';

  /**
   * Creates new snippet file tree node.
   *
   * @param label Snippet file name/label.
   * @param filePath Full snippet file path.
   * @param language Snippet file language type.
   * @param collapse Collapse/expand state to show defined snippets.
   */
  constructor(
    readonly label: string,
    readonly filePath: string,
    readonly language: string,
    readonly collapse: TreeItemCollapsibleState
  ) {
    super(label);
    this.iconPath = ThemeIcon.File;
    this.tooltip = filePath;
    this.collapsibleState = collapse;

    // use resource uri with `_.<languageFileExt>` hack
    // to show proper language icons in the snippets tree view
    this.resourceUri = Uri.file(`_.${getFileExtension(language)}`);
  }
}

/**
 * Defines snippets language tree item for display in the snippets tree view.
 */
export class SnippetLanguage extends TreeItem {
  readonly contextValue = 'snippetLanguage';
  public snippetFiles: SnippetFile[] = new Array<SnippetFile>();

  /**
   * Creates nee snippets language tree node for the given language.
   *
   * @param language Snippets language name.
   */
  constructor(readonly language: string) {
    super(language);
    this.iconPath = ThemeIcon.File;
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
    this.tooltip = `${language} snippets`;

    // use resource uri with `_.<languageFileExt>` hack
    // to show proper language icons in the snippets tree view
    this.resourceUri = Uri.file(`_.${getFileExtension(language)}`);
  }
}

/**
 * Maps text document language id to file extension for the file type tree view icon loading.
 *
 * @returns The file extension for the given language id.
 */
function getFileExtension(language: string): string {
  let fileExtension: string = language;
  // map language to file extension
  switch (language) {
    case 'coffeescript':
      fileExtension = 'coffee';
      break;
    case 'csharp':
      fileExtension = 'cs';
      break;
    case 'fsharp':
      fileExtension = 'fs';
      break;
    case 'javascript':
      fileExtension = 'js';
      break;
    case 'javascriptreact':
      fileExtension = 'jsx';
      break;
    case 'powershell':
      fileExtension = 'ps1';
      break;
    case 'python':
      fileExtension = 'py';
      break;
    case 'stylus':
      fileExtension = 'styl';
      break;
    case 'typescript':
      fileExtension = 'ts';
      break;
    case 'typescriptreact':
      fileExtension = 'tsx';
      break;
  }
  return fileExtension;
}
