import {
	ExtensionContext,
	TextEditor,
	commands,
	window,
	workspace,
	TreeView
} 
from 'vscode';
import * as config from './config';
import {registerCommands} from './commands';
import {SnippetLoader} from './snippets/snippetLoader';
import {SnippetLanguage} from './snippets/snippets';
import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

export function activate(context: ExtensionContext) {
	// create snippets tree view
	const snippetLoader: SnippetLoader = new SnippetLoader(context);
	const snippetProvider: SnippetTreeDataProvider = new SnippetTreeDataProvider(snippetLoader);
	const snippetView = window.createTreeView('snippets.view', {
		treeDataProvider: snippetProvider,
		showCollapseAll: true
	});

	// expend and select snippets language node on active text editor change
	window.onDidChangeActiveTextEditor((textEditor: TextEditor | undefined) => {
		if (textEditor && snippetView.visible) {
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

	// update snippets tree view setttings and refresh
	context.subscriptions.push(workspace.onDidChangeConfiguration(workspaceConfig => {
    if (workspaceConfig.affectsConfiguration('snippets.viewer.combineLanguageSnippets')) {
			snippetProvider.combineLanguageSnippets = config.combineLanguageSnippets();
			snippetProvider.refresh();
		}
		else if (workspaceConfig.affectsConfiguration('snippets.viewer.sortSnippetsByName')) {
			snippetProvider.sortSnippetsByName = config.sortSnippetsByName();
			snippetProvider.refresh();
		}
		else if (workspaceConfig.affectsConfiguration('snippets.viewer.showBuiltInExtensionSnippets') ||
				workspaceConfig.affectsConfiguration('snippets.viewer.skipLanguageSnippets') ||
				workspaceConfig.affectsConfiguration('snippets.viewer.expandSnippetFiles')) {
			snippetProvider.refresh();
		}
	}));

	// add snippets viewer commands
	registerCommands(context, snippetProvider);
}

export function deactivate() {}
