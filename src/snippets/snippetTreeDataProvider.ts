import {
  Event, 
  EventEmitter,
	TreeDataProvider, 
  TreeItem,
  window,
  extensions
} from 'vscode';
import {
	SnippetLanguage, 
	SnippetFile, 
	Snippet
} from './snippets'
import * as jsonc from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';

export class SnippetTreeDataProvider implements TreeDataProvider<SnippetLanguage | SnippetFile | Snippet> {
	private readonly _onDidChangeTreeData: EventEmitter<Snippet | undefined> = new EventEmitter<Snippet | undefined>();
	readonly onDidChangeTreeData: Event<Snippet | undefined> = this._onDidChangeTreeData.event;
	private _snippets: {[language: string]: Snippet[]} = {};
	private _snippetFiles: SnippetFile[] = new Array<SnippetFile>();
	private _snippetExtensions: {[extensionId: string]: Snippet[]} = {};

	constructor() {
  }

	refresh(clearSnippets: boolean): void {
		if (clearSnippets) {
			this._snippets = {};
			this._snippetExtensions = {};
			this._snippetFiles = [];
		}
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: SnippetLanguage | SnippetFile | Snippet): TreeItem {
		return element;
	}

	async getChildren(element?: SnippetLanguage | SnippetFile): Promise<SnippetLanguage[] | SnippetFile[] | Snippet[]> {
		if (!element) {
			return await this.getSnippetLanguages();
		}
		else if (element.contextValue === 'snippetLanguage') {
			return (element as SnippetLanguage).snippetFiles;
		}
		else if (element.contextValue === 'snippetFile') {
			const snippets = await this.getSnippets(element as SnippetFile);
			return snippets.sort(this.sortByScope);
		}
		return [];
	}

	private async getSnippetLanguages(): Promise<SnippetLanguage[]> {
  	// get snippet languages from extension snippet files
		const snippetLanguages: SnippetLanguage[] = [];
		const snippetLanguageMap: Map<string, SnippetLanguage> = new Map<string, SnippetLanguage>();
    extensions.all.forEach(extension => {
      if (!extension.packageJSON.isBuiltin && extension.packageJSON?.contributes?.snippets) {
				const extensionName = extension.packageJSON?.extensionName;
				const extensionLocation = extension.packageJSON?.extensionLocation;
				const snippetsConfig = extension.packageJSON?.contributes?.snippets;
				if (extensionLocation && Array.isArray(snippetsConfig)) {
					snippetsConfig.forEach(snippetConfig => {
						const language: string = snippetConfig.language;
						const snippetFile: SnippetFile = new SnippetFile(extensionName,
							path.join(extensionLocation.fsPath, snippetConfig.path),
							language
						);
						if (!snippetLanguageMap.has(language)) {
							const snippetLanguage: SnippetLanguage = new SnippetLanguage(language);
							snippetLanguages.push(snippetLanguage);
							snippetLanguageMap.set(language, snippetLanguage);
						}
						snippetLanguageMap.get(language)?.snippetFiles.push(snippetFile);
					});
				}
			}
    });
		return Promise.resolve(snippetLanguages);
	}

	private async getSnippetFiles(extensionId: string): Promise<SnippetFile[]> {
		const extension = extensions.getExtension(extensionId);
		let snippetFiles: SnippetFile[] = [];
		if (!this._snippetExtensions[extensionId]) {
			this._snippetExtensions[extensionId] = [];
		}
		if (extension) {
			const extensionLocation = extension.packageJSON?.extensionLocation;
			const snippetsConfig = extension.packageJSON?.contributes?.snippets;
			if (extensionLocation && Array.isArray(snippetsConfig)) {
  			snippetsConfig.forEach(snippetConfig => {
					const snippetFile: SnippetFile = new SnippetFile(
						snippetConfig.language,
						path.join(extensionLocation.fsPath, snippetConfig.path),
						snippetConfig.language
					);
					snippetFiles.push(snippetFile);
					this._snippetFiles.push(snippetFile);
			  });
				await Promise.all(snippetFiles.map((file: SnippetFile) => this.getSnippets(file, extensionId)));
			}
		}
		return Promise.resolve(snippetFiles);
	}

	private async getSnippets(snippetFile: SnippetFile, extensionId?: string): Promise<Snippet[]> {
    if (!this._snippets[snippetFile.language]) {
      // create new language snippets array
      this._snippets[snippetFile.language] = [];
    }
		return new Promise((resolve, reject) => {
			fs.readFile(snippetFile.filePath, 'utf8', (error, snippetsConfig) => {
				if (error) {
					window.showErrorMessage(`Error reading file ${snippetFile.filePath} \n ${error.message}`);
					return reject([]);
				}
				if (snippetsConfig === '') {
					return resolve([]);
				}

				let parsedSnippets: any;
				try {
					parsedSnippets = jsonc.parse(snippetsConfig); // tslint:disable-line
				} 
        catch (err) {
					window.showErrorMessage(`JSON parsing of snippet file ${snippetFile.filePath} failed`);
					return reject([]);
				}

        // load parsed snippets
				const snippets: Snippet[] = [];
				for (const key in parsedSnippets) {
          const parsedSnippet = parsedSnippets[key];
					const scope = [snippetFile.language];
					const snippet: Snippet = 
						new Snippet(key, parsedSnippet.prefix, scope, parsedSnippet.body, snippetFile);
					snippets.push(snippet);
					this._snippets[snippetFile.language].push(snippet);
					if (extensionId) {
						this._snippetExtensions[extensionId].push(snippet);
					}
				}
				return resolve(snippets);
			});
		});
	}

	private readonly filterSnippets = (snippet: Snippet): boolean => {
		// filter snippets by language for the active text editor
		if (window.activeTextEditor && snippet.scope.length !== 0) {
			if (!snippet.scope.includes(window.activeTextEditor.document.languageId)) {
				return false;
			}
		}
		return true;
	};

  private sortByScope(sn1: Snippet, sn2: Snippet) {
		const n1 = sn1.scope.length === 1 ? Infinity : sn1.scope.length;
		const n2 = sn2.scope.length === 1 ? Infinity : sn2.scope.length;
		return n2 - n1;
	}  
}