import {
	TreeItemCollapsibleState,
  window,
  extensions
} from 'vscode';
import {
	SnippetLanguage, 
	SnippetFile, 
	Snippet
} from './snippets'
import * as config from '../config';
import * as jsonc from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';

export class SnippetLoader {

	public snippetLanguages: Map<string, SnippetLanguage> = new Map<string, SnippetLanguage>();

	constructor() {
  }

	async getSnippetLanguages(): Promise<SnippetLanguage[]> {
		this.snippetLanguages.clear();
  	// get snippet languages from extension snippet files
		const snippetLanguages: SnippetLanguage[] = [];
		const skipLanguages: string[] = config.skipLanguages();
		const showBuiltInExtensionSnippets = config.showBuiltInExtensionSnippets();
		const snippetFileCollapsibleState: TreeItemCollapsibleState = this.getSnippetFileCollapsibleState();
    extensions.all.forEach(extension => {
      if ((showBuiltInExtensionSnippets || !extension.packageJSON.isBuiltin) && 
					extension.packageJSON?.contributes?.snippets) {
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
		return Promise.resolve(snippetLanguages.sort((a, b) => a.language.localeCompare(b.language)));
	}

	getSnippetFileCollapsibleState(): TreeItemCollapsibleState {
		if (config.expendSnippetFiles()) {
			return TreeItemCollapsibleState.Expanded;
		}
		return TreeItemCollapsibleState.Collapsed;
	}

	async getSnippetFiles(extensionId: string): Promise<SnippetFile[]> {
		const extension = extensions.getExtension(extensionId);
		let snippetFiles: SnippetFile[] = [];
		if (extension) {
			const extensionLocation = extension.packageJSON?.extensionLocation;
			const snippetsConfig = extension.packageJSON?.contributes?.snippets;
			if (extensionLocation && Array.isArray(snippetsConfig)) {
				const snippetFileCollapsibleState: TreeItemCollapsibleState = this.getSnippetFileCollapsibleState();
  			snippetsConfig.forEach(snippetConfig => {
					const snippetFile: SnippetFile = new SnippetFile(
						snippetConfig.language,
						path.join(extensionLocation.fsPath, snippetConfig.path),
						snippetConfig.language,
						snippetFileCollapsibleState
					);
					snippetFiles.push(snippetFile);
			  });
				await Promise.all(snippetFiles.map((file: SnippetFile) => this.getFileSnippets(file)));
			}
		}
		return Promise.resolve(snippetFiles);
	}

	async getSnippets(snippetLanguage: SnippetLanguage): Promise<Snippet[]> {
		const fileSnippets: Snippet[][] = await Promise.all(
			snippetLanguage.snippetFiles.map((file: SnippetFile) => this.getFileSnippets(file))
		);
		const snippets: Snippet[] = [];
		fileSnippets.forEach(file => file.map(snippet => snippets.push(snippet)));
		return Promise.resolve(snippets);
	}

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
				}
				return resolve(snippets);
			});
		});
	}
}
