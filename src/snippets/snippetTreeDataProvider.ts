import {
  Event,
  EventEmitter,
  TextEditor,
  TreeDataProvider,
  TreeItem,
  window
} from 'vscode';

import {
  SnippetLanguage,
  SnippetFile,
  Snippet
} from './snippets';

import { SnippetLoader } from './snippetLoader';
import * as config from '../config';

/**
 * Defines snippets tree data provider for the snippets tree view.
 */
export class SnippetTreeDataProvider implements TreeDataProvider<SnippetLanguage | SnippetFile | Snippet> {

  // snippets display settings
  public combineLanguageSnippets: boolean = config.combineLanguageSnippets();
  public sortSnippetsByName: boolean = config.sortSnippetsByName();

  // top level snippet languages data change handler
  private readonly _onDidChangeTreeData: EventEmitter<SnippetLanguage | undefined> =
    new EventEmitter<SnippetLanguage | undefined>();
  readonly onDidChangeTreeData: Event<SnippetLanguage | undefined> = this._onDidChangeTreeData.event;

  constructor(private snippetLoader: SnippetLoader) {
  }

  /**
   * Reloads snippet languages.
   */
  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Gets snippet tree view item.
   *
   * @param element Snippet tree item.
   * @returns Snippet tree item.
   */
  getTreeItem(element: SnippetLanguage | SnippetFile | Snippet): TreeItem {
    return element;
  }

  /**
   * Gets snippet parent node, eidther snippet file or language.
   *
   * @param element Snippet tree item.
   * @returns Snippet parent node.
   */
  getParent(element: SnippetLanguage | SnippetFile | Snippet): SnippetLanguage | SnippetFile | undefined {
    let snippetParent: SnippetLanguage | SnippetFile | undefined;
    if (element instanceof Snippet) {
      // use parent snippet file
      snippetParent = element.snippetFile;
    }
    else if (element instanceof SnippetFile) {
      // use parent snippet language from snippets loader
      snippetParent = this.snippetLoader.snippetLanguages.get(element.language);
    }
    return snippetParent;
  }

  /**
   * Gets snippet tree item children.
   *
   * @param element Snippet tree item.
   * @returns Snippet tree item children.
   */
  async getChildren(element?: SnippetLanguage | SnippetFile): Promise<SnippetLanguage[] | SnippetFile[] | Snippet[]> {
    if (!element) {
      // get top level snippet languages from built-in and snippets extensions
      const snippetLanguages: SnippetLanguage[] = await this.snippetLoader.getSnippetLanguages();
      if (config.showOnlyActiveEditorLanguageSnippets()) {
        const activeTextEditor: TextEditor | undefined = window.activeTextEditor;
        if (activeTextEditor) {
          // get snippets language node for the active text editor language only
          const editorLanguage: string = activeTextEditor.document.languageId;
          const snippetsLanguage: SnippetLanguage | undefined =
            this.snippetLoader.snippetLanguages.get(editorLanguage);
          if (snippetsLanguage) {
            return [snippetsLanguage];
          }
        }
      }
      return snippetLanguages;
    }
    else if (element instanceof SnippetLanguage) {
      if (this.combineLanguageSnippets) {
        // get all language snippets
        let snippets = await this.snippetLoader.getSnippets(element);
        if (this.sortSnippetsByName) {
          // sort language snippets by name
          snippets = snippets.sort((snippetA, snippetB) => snippetA.name.localeCompare(snippetB.name));
        }
        return snippets;
      }

      // otherwise, get language snippet files sorted by file name/label
      return element.snippetFiles.sort(
        (snippetFileA, snippetFileB) => snippetFileA.label.localeCompare(snippetFileB.label));
    }
    else if (element instanceof SnippetFile) {
      // get snippets from the parent snippets file
      let snippets: Snippet[] = await this.snippetLoader.getFileSnippets(element);
      if (this.sortSnippetsByName) {
        // sort snippets by name
        snippets = snippets.sort((snippetA, snippetB) => snippetA.name.localeCompare(snippetB.name));
      }
      return snippets;
    }
    return [];
  }
}
