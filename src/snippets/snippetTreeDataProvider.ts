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
} 
from './snippets'
import {SnippetLoader} from './snippetLoader';
import * as jsonc from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';

export class SnippetTreeDataProvider implements TreeDataProvider<SnippetLanguage | SnippetFile | Snippet> {
	private readonly _onDidChangeTreeData: EventEmitter<Snippet | undefined> = new EventEmitter<Snippet | undefined>();
	readonly onDidChangeTreeData: Event<Snippet | undefined> = this._onDidChangeTreeData.event;

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
		else if (element.contextValue === 'snippetLanguage') {
			return (element as SnippetLanguage).snippetFiles;
		}
		else if (element.contextValue === 'snippetFile') {
			const snippets = await this.snippetLoader.getSnippets(element as SnippetFile);
			return snippets.sort(this.sortByScope);
		}
		return [];
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
