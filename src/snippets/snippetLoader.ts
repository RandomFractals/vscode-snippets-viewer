import {
  window,
  extensions,
	workspace
} from 'vscode';
import {
	SnippetLanguage, 
	SnippetFile, 
	Snippet
} from './snippets'
import * as jsonc from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';

export class SnippetLoader {

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
	}

	async getSnippetLanguages(): Promise<SnippetLanguage[]> {
  	// get snippet languages from extension snippet files
		const snippetLanguages: SnippetLanguage[] = [];
		const snippetLanguageMap: Map<string, SnippetLanguage> = new Map<string, SnippetLanguage>();
		const showBuiltInExtensionSnippets: boolean = 
			<boolean>workspace.getConfiguration('snippets.viewer').get('showBuiltInExtensionSnippets');
    extensions.all.forEach(extension => {
      if ((showBuiltInExtensionSnippets || !extension.packageJSON.isBuiltin) && 
					extension.packageJSON?.contributes?.snippets) {
				const extensionName = extension.packageJSON?.displayName;
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

	async getSnippetFiles(extensionId: string): Promise<SnippetFile[]> {
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

	async getSnippets(snippetFile: SnippetFile, extensionId?: string): Promise<Snippet[]> {
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
					const snippet: Snippet = new Snippet(key,	parsedSnippet.prefix, scope, 
						parsedSnippet.description, parsedSnippet.body, snippetFile);
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
}
