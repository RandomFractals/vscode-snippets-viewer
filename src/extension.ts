import {
	ExtensionContext,
	commands,
	window,
	workspace
} 
from 'vscode';
import {registerCommands} from './commands';
import {SnippetLoader} from './snippets/snippetLoader';
import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

export function activate(context: ExtensionContext) {
	const snippetLoader: SnippetLoader = new SnippetLoader();
	// create snippets tree view
	const snippetProvider = new SnippetTreeDataProvider(snippetLoader);
	window.createTreeView('snippets.view', {
		treeDataProvider: snippetProvider,
		showCollapseAll: false,
	});
	
	context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.refreshSnippets`, () => snippetProvider.refresh())
	);

	// check for tree view settings changes
	context.subscriptions.push(workspace.onDidChangeConfiguration(config => {
    if (config.affectsConfiguration('snippets.viewer.combineLanguageSnippets') ||
				config.affectsConfiguration('snippets.viewer.expendSnippetFiles') ||
				config.affectsConfiguration('snippets.viewer.showBuiltInExtensionSnippets') ||
				config.affectsConfiguration('snippets.viewer.skipLanguageSnippets') ||
				config.affectsConfiguration('snippets.viewer.sortSnippetsByName')) {
			snippetProvider.refresh();
		}
	}));

	// add other snippet commands
	registerCommands(context);
}

export function deactivate() {}
