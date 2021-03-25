import {
	MarkdownString,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri
} 
from 'vscode';
import * as path from 'path';

export class Snippet extends TreeItem {
	readonly collapsibleState = TreeItemCollapsibleState.None;
	readonly contextValue = 'snippet';

  constructor(
		readonly label: string,
		readonly prefix: string,
		readonly scope: string[],
		readonly body: string | string[],
		readonly snippetFile: SnippetFile
	) {
		super(label);		
		this.scope = [snippetFile.language];
    this.description = prefix;
    let snippetBody = body;
		if (Array.isArray(body)) {
			snippetBody = body.join('\n');
		}
 		this.tooltip = 
			new MarkdownString(`*${this.prefix}⇥ ${this.label}*\n\`\`\`${snippetFile.language}\n${snippetBody}\n\`\`\``);
		this.command = {
			command: `snippets.viewer.insertSnippet`,
			title: 'Insert Snippet',
			arguments: [body]
		};
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'images', 'light', 'snippet.svg'),
		dark: path.join(__filename, '..', '..', 'images', 'dark', 'snippet.svg')
	};
}

export class SnippetFile extends TreeItem {
	readonly contextValue = 'snippetFile';

  constructor(
		readonly label: string,
		readonly filePath: string,
		readonly language: string
	) {
		super(label);
		this.resourceUri = Uri.file(filePath);
		this.collapsibleState = TreeItemCollapsibleState.Expanded;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'images', 'light', 'snippets.svg'),
		dark: path.join(__filename, '..', '..', 'images', 'dark', 'snippets.svg')
	};
}

export class SnippetLanguage extends TreeItem {
	readonly contextValue = 'snippetLanguage';
	public snippetFiles: SnippetFile[] =  new Array<SnippetFile>();
	constructor(readonly language: string) {
		super(language);
		this.iconPath = ThemeIcon.Folder;
		this.collapsibleState = TreeItemCollapsibleState.Collapsed;
		this.tooltip = `${language} snippets`;
	}
}
