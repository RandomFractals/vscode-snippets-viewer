import {
	ExtensionContext,
	commands,
	window
} 
from 'vscode';
import * as path from 'path';
import {registerCommands} from './commands';
import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

export function activate(context: ExtensionContext) {
	// create snippets sidebar view section
	const snippetsProvider = new SnippetTreeDataProvider();
	window.createTreeView('snippets.view', {
		treeDataProvider: snippetsProvider,
		showCollapseAll: false,
	});

	context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.refreshSnippets`, () => snippetsProvider.refresh(true))
	);

	// add other snippts commands
	registerCommands(context);
}

export function deactivate() {}
