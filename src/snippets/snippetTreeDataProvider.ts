import {
  Event, 
  EventEmitter,
	TreeDataProvider, 
  TreeItem,
  workspace
} 
from 'vscode';
import {
	SnippetLanguage, 
	SnippetFile, 
	Snippet
} 
from './snippets'
import {SnippetLoader} from './snippetLoader';

export class SnippetTreeDataProvider implements TreeDataProvider<SnippetLanguage | SnippetFile | Snippet> {
	private readonly _onDidChangeTreeData: EventEmitter<SnippetLanguage | undefined> = 
		new EventEmitter<SnippetLanguage | undefined>();
	readonly onDidChangeTreeData: Event<SnippetLanguage | undefined> = this._onDidChangeTreeData.event;

	constructor(private snippetLoader: SnippetLoader) {
  }

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: SnippetLanguage | SnippetFile | Snippet): TreeItem {
		return element;
	}

	async getChildren(element?: SnippetLanguage | SnippetFile): Promise<SnippetLanguage[] | SnippetFile[] | Snippet[]> {
		if (!element) {
			// get languages from built-in extensions and snippets extensions
			return await this.snippetLoader.getSnippetLanguages();
		}
		else if (element instanceof SnippetLanguage) {
			const combineLanguageSnippets: boolean = 
				<boolean>workspace.getConfiguration('snippets.viewer').get('combineLanguageSnippets');
			if (combineLanguageSnippets) {
				const sortSnippetsByName: boolean = 
					<boolean>workspace.getConfiguration('snippets.viewer').get('sortSnippetsByName');
					let snippets = await this.snippetLoader.getSnippets(element);
					if (sortSnippetsByName) {
						snippets = snippets.sort((a, b) => a.name.localeCompare(b.name));
					}
					return snippets;
			}
			return element.snippetFiles.sort((a, b) => a.label.localeCompare(b.label));
		}
		else if (element instanceof SnippetFile) {
			// get snippets for a snippet file
			let snippets = await this.snippetLoader.getFileSnippets(element);
			const sortSnippetsByName: boolean = 
				<boolean>workspace.getConfiguration('snippets.viewer').get('sortSnippetsByName');
			if (sortSnippetsByName) {
				snippets = snippets.sort((a, b) => a.name.localeCompare(b.name));
			}
			return snippets;
		}
		return [];
	}
}
