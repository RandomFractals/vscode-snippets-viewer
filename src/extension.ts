import {
	ExtensionContext,
	TextEditor,
	commands,
	window,
	workspace,
	TreeView
} 
from 'vscode';
import {registerCommands} from './commands';
import {SnippetLoader} from './snippets/snippetLoader';
import {SnippetLanguage} from './snippets/snippets';
import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

export function activate(context: ExtensionContext) {
	// create snippets tree view
	const snippetLoader: SnippetLoader = new SnippetLoader();
	const snippetProvider: SnippetTreeDataProvider = new SnippetTreeDataProvider(snippetLoader);
	const snippetView = window.createTreeView('snippets.view', {
		treeDataProvider: snippetProvider,
		showCollapseAll: false,
	});

	// check for active editor changes
	window.onDidChangeActiveTextEditor((textEditor: TextEditor | undefined) => {
		if (textEditor) {
			const editorLanguage: string = textEditor.document.languageId;
			const snippetsLanguage: SnippetLanguage | undefined = snippetLoader.snippetLanguages.get(editorLanguage);
			if (snippetsLanguage) {
				snippetView.reveal(snippetsLanguage, {
					select: true, 
					focus: true,
					expand: true
				});
			}
		}
	});

	// add snippets refresh command
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

	// add other snippet viewer commands
	registerCommands(context);
}

export function deactivate() {}
