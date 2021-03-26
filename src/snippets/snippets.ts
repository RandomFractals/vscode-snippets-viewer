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
		readonly name: string,
		readonly prefix: string,
		readonly scope: string[],
		readonly snippetDescription: string,
		readonly body: string | string[],
		readonly snippetFile: SnippetFile
	) {
		super(name);
		this.scope = [snippetFile.language];
    this.description = prefix;
    let snippetBody = body;
		if (Array.isArray(body)) {
			snippetBody = body.join('\n');
		}
		let snippetInfo: string = `**${this.prefix}⇥ ${this.label}** _(from ${snippetFile.label})_\n___`;
		if (snippetDescription && snippetDescription !== name) {
			// add description
			snippetInfo += `\n${snippetDescription}\n___`;
		}
 		this.tooltip = new MarkdownString(`${snippetInfo}\n\`\`\`${snippetFile.language}\n${snippetBody}\n\`\`\``);
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
		this.iconPath = ThemeIcon.File;
		this.resourceUri = Uri.file(`_.${getFileExtension(language)}`);
		this.tooltip = filePath;
		this.collapsibleState = TreeItemCollapsibleState.Expanded;
	}
}

export class SnippetLanguage extends TreeItem {
	readonly contextValue = 'snippetLanguage';
	public snippetFiles: SnippetFile[] =  new Array<SnippetFile>();
	constructor(readonly language: string) {
		super(language);
		this.iconPath = ThemeIcon.File;
		this.resourceUri = Uri.file(`_.${getFileExtension(language)}`);
		this.collapsibleState = TreeItemCollapsibleState.Collapsed;
		this.tooltip = `${language} snippets`;
	}
}

/**
 * Maps language to file extension for the file type tree view icon loading.
 */
function getFileExtension(language: string): string {
	let fileExtension: string = language;
	// map js and ts files
	if (fileExtension.startsWith('javascript')) {
		fileExtension = 'js';
	}
	else if (fileExtension.startsWith('typescript')) {
		fileExtension = 'ts';
	}
	return fileExtension;
}