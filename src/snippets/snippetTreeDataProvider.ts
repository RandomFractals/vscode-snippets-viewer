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

	refresh(clearSnippets: boolean): void {
		if (clearSnippets) {
			this.snippetLoader.refresh(clearSnippets);
		}
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: SnippetLanguage | SnippetFile | Snippet): TreeItem {
		return element;
	}

	async getChildren(element?: SnippetLanguage | SnippetFile): Promise<SnippetLanguage[] | SnippetFile[] | Snippet[]> {
		if (!element) {
			return await this.snippetLoader.getSnippetLanguages();
		}
		else if (element instanceof SnippetLanguage) {
			return element.snippetFiles.sort((a, b) => a.label.localeCompare(b.label));
		}
		else if (element instanceof SnippetFile) {
			let snippets = await this.snippetLoader.getSnippets(element);
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
