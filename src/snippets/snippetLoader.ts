import {
  ExtensionContext,
  TreeItemCollapsibleState,
  extensions,
  window,
  workspace
} from 'vscode';

import {
  SnippetLanguage,
  SnippetFile,
  Snippet
} from './snippets';

import * as config from '../config';
import * as jsonc from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Defines snippets loader for built-in and snippets extensions.
 */
export class SnippetLoader {

  // loaded snippet languages, top level snippets map
  public snippetLanguages: Map<string, SnippetLanguage> = new Map<string, SnippetLanguage>();

  /**
   * Creates new snippets loader.
   *
   * @param context Extension context.
   */
  constructor(private context: ExtensionContext) {
  }

  /**
   * Gets snippet languages from built-in and snippets extensions.
   *
   * @returns Detected snippet languages.
   */
  async getSnippetLanguages(): Promise<SnippetLanguage[]> {
    // clear local snippet languages cache
    this.snippetLanguages.clear();

    // get snippet languages from extension snippet files
    const snippetLanguages: SnippetLanguage[] = [];
    const skipLanguages: string[] = config.skipLanguages();
    const showBuiltInExtensionSnippets = config.showBuiltInExtensionSnippets();
    const snippetFileCollapsibleState: TreeItemCollapsibleState = this.getSnippetFileCollapsibleState();
    extensions.all.forEach(extension => {

      // check built-in extensions and snippets contributions
      if ((showBuiltInExtensionSnippets || !extension.packageJSON.isBuiltin) &&
        extension.packageJSON?.contributes?.snippets) {

        // get snippets extension name, location and snippet files config
        const extensionName = extension.packageJSON?.displayName;
        const extensionLocation = extension.packageJSON?.extensionLocation;
        const snippetsConfig = extension.packageJSON?.contributes?.snippets;

        if (extensionLocation && Array.isArray(snippetsConfig)) {
          snippetsConfig.forEach(snippetConfig => {
            const language: string = snippetConfig.language;
            if (skipLanguages.indexOf(language) < 0) {
              // create snippets file
              const snippetFile: SnippetFile = new SnippetFile(extensionName,
                path.join(extensionLocation.fsPath, snippetConfig.path),
                language,
                snippetFileCollapsibleState
              );

              if (!this.snippetLanguages.has(language)) {
                // create snippets language
                const snippetLanguage: SnippetLanguage = new SnippetLanguage(language);
                snippetLanguages.push(snippetLanguage);
                this.snippetLanguages.set(language, snippetLanguage);
              }

              // add snippet file to language snippets
              this.snippetLanguages.get(language)?.snippetFiles.push(snippetFile);
            }
          });
        }
      }
    });

    // load user-defined snippet languages and files
    const userSnippetsDirectoryPath: string = path.join(
      this.context.globalStorageUri.fsPath, '..', '..', '..', 'User', 'snippets');
    const userSnippetFiles: SnippetFile[] =
      await this.getDirectorySnippetFiles(userSnippetsDirectoryPath, 'User Snippets');

    // load project/workspace snippet languages and files
    const projectSnippetFiles: SnippetFile[] = await this.getProjectSnippetFiles();

    // sort loaded snippet languages alphabetically
    return Promise.resolve(snippetLanguages.sort(
      (snippetLanguageA, snippetLanguageB) =>
        snippetLanguageA.language.localeCompare(snippetLanguageB.language)));
  }

  /**
   * Gets project/workspace snippet files.
   *
   * @returns Snippet files from the open workspace folders.
   */
  async getProjectSnippetFiles(): Promise<SnippetFile[]> {
    return new Promise(async (resolve, reject) => {
      let snippetFiles: SnippetFile[] = [];
      const workspaceFolders = workspace.workspaceFolders;
      if (workspaceFolders) {
        // get snippet files from all open workspace folders
        snippetFiles = Array.prototype.concat.apply([], await Promise.all(
          workspaceFolders.map(async workspaceFolder => {
            // look for snippet files in the default .vscode directory
            const vscodeDirectoryPath: string = path.join(workspaceFolder.uri.fsPath, '.vscode');
            return this.getDirectorySnippetFiles(vscodeDirectoryPath, `/${workspaceFolder.name} Snippets`);
          })
        ));
      }
      return resolve(snippetFiles);
    });
  }

  /**
   * Gets snippet files from the local directory.
   *
   * @param directoryPath Local directory path.
   * @param snippetFileLabel Snippet file label.
   * @returns Loaded snippet files for the specified directory path.
   */
  async getDirectorySnippetFiles(directoryPath: string, snippetFileLabel: string): Promise<SnippetFile[]> {
    const directoryExists: boolean = await this.directoryExists(directoryPath);
    if (!directoryExists) {
      return [];
    }

    return new Promise((resolve, reject) => {

      // read and parse all snippet file configs
      fs.readdir(directoryPath, (err, fileNames) => {
        if (err) {
          window.showErrorMessage(`Error reading directory: ${directoryPath} \n ${err.message}`);
          return reject([]);
        }

        // loop through all directory files
        const snippetFiles: SnippetFile[] = [];
        const skipLanguages: string[] = config.skipLanguages();
        fileNames.forEach(fileName => {
          const filePath: string = path.join(directoryPath, fileName);
          const language: string = path.parse(fileName).name.toLowerCase();

          // check for snippet file config
          if ((fileName.endsWith('.json') || fileName.endsWith('.code-snippets')) &&
            skipLanguages.indexOf(language) < 0) {

            // create new snippet file
            const snippetFile: SnippetFile =
              new SnippetFile(snippetFileLabel, filePath, language, this.getSnippetFileCollapsibleState());

            if (!this.snippetLanguages.has(language)) {
              // create new snippets language
              const snippetLanguage: SnippetLanguage = new SnippetLanguage(language);
              this.snippetLanguages.set(language, snippetLanguage);
            }

            // add snippet file to the loaded language snippets
            this.snippetLanguages.get(language)?.snippetFiles.push(snippetFile);
            snippetFiles.push(snippetFile);
          }
        });
        return resolve(snippetFiles);
      });
    });
  }

  /**
   * Checks if local file directory exists.
   *
   * @param directoryPath Directory path to check.
   *
   * @returns True if directory exists, and false otherwise.
   */
  async directoryExists(directoryPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        fs.stat(directoryPath, (err, file) => {
          if (!err && file.isDirectory()) {
            return resolve(true);
          }
          else {
            return resolve(false);
          }
        });
      } catch (err) {
        return reject(false);
      }
    });
  }

  /**
   * Gets snippet file collapse/expand state to use for the snippet file nodes.
   *
   * @returns Tree item collapsible state to use for the snippet file nodes.
   */
  getSnippetFileCollapsibleState(): TreeItemCollapsibleState {
    if (config.expandSnippetFiles()) {
      return TreeItemCollapsibleState.Expanded;
    }
    return TreeItemCollapsibleState.Collapsed;
  }

  /**
   * Gets all snippet files for the specified snippets extension id.
   *
   * @param extensionId Snippets extension id.
   * @returns Snippet files loaded from the specified snippets extension.
   */
  async getSnippetFiles(extensionId: string): Promise<SnippetFile[]> {
    // get snippets extension info
    const extension = extensions.getExtension(extensionId);

    // get extension snippets
    let snippetFiles: SnippetFile[] = [];
    if (extension) {
      // get snippets extension location and snippet contributions
      const extensionLocation = extension.packageJSON?.extensionLocation;
      const snippetsConfig = extension.packageJSON?.contributes?.snippets;

      if (extensionLocation && Array.isArray(snippetsConfig)) { // has defined snippet files
        // use configured snippet file collapse/expand preference
        const snippetFileCollapsibleState: TreeItemCollapsibleState = this.getSnippetFileCollapsibleState();

        // load snippet files from declared snippets extension contributions
        snippetsConfig.forEach(snippetConfig => {
          const snippetFile: SnippetFile = new SnippetFile(
            snippetConfig.language,
            path.join(extensionLocation.fsPath, snippetConfig.path),
            snippetConfig.language,
            snippetFileCollapsibleState
          );
          snippetFiles.push(snippetFile);
        });

        // load and cache all snippets from the loaded snippets extension files
        await Promise.all(snippetFiles.map((file: SnippetFile) => this.getFileSnippets(file)));
      }
    }
    return Promise.resolve(snippetFiles);
  }

  /**
   * Gets all snippets for the specified snippet language.
   *
   * @param snippetLanguage Snippet language.
   * @returns Loaded snippets for the specified snippet language.
   */
  async getSnippets(snippetLanguage: SnippetLanguage): Promise<Snippet[]> {
    // get snippets from all snippet language files
    const fileSnippets: Snippet[][] = await Promise.all(
      snippetLanguage.snippetFiles.map((file: SnippetFile) => this.getFileSnippets(file))
    );
    const snippets: Snippet[] = [];
    fileSnippets.forEach(file => file.map(snippet => snippets.push(snippet)));
    return Promise.resolve(snippets);
  }

  /**
   * Gets defined snippets from the specified snippets file.
   *
   * @param snippetFile Snippets file with file path info.
   * @returns Snippets defined in a snippets file.
   */
  async getFileSnippets(snippetFile: SnippetFile): Promise<Snippet[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(snippetFile.filePath, 'utf8', (error, snippetsConfig) => {
        if (error) {
          window.showErrorMessage(`Error reading file ${snippetFile.filePath} \n ${error.message}`);
          return reject([]);
        }
        if (snippetsConfig === '') {
          return resolve([]);
        }

        // parse snippets file content
        let parsedSnippets: any;
        try {
          parsedSnippets = jsonc.parse(snippetsConfig); // tslint:disable-line
        }
        catch (err) {
          window.showErrorMessage(`JSON parsing of snippet file ${snippetFile.filePath} failed`);
          return reject([]);
        }

        // create file snippets
        const snippets: Snippet[] = [];
        for (const key in parsedSnippets) {
          const parsedSnippet = parsedSnippets[key];
          const scope = [snippetFile.language];
          const snippet: Snippet = new Snippet(key, parsedSnippet.prefix, scope,
            parsedSnippet.description, parsedSnippet.body, snippetFile);
          snippets.push(snippet);
        }
        return resolve(snippets);
      });
    });
  }
}
