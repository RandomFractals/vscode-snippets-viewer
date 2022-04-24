import {
  ExtensionContext,
  TextEditor,
  window,
  workspace
} from 'vscode';

import * as config from './config';
import * as constants from './constants';

import { registerCommands } from './commands';
import { Settings } from './settings';
import { SnippetLoader } from './snippets/snippetLoader';
import { SnippetLanguage } from './snippets/snippets';
import { SnippetTreeDataProvider } from './snippets/snippetTreeDataProvider';

/**
 * Activates snippets viewer extension, creates and initializes snippets tree view,
 * registers active text editor and snippets tree view settings change listeners,
 * and adds snippets viewer commands.
 *
 * @param context Extension context.
 */
export function activate(context: ExtensionContext) {
  // create snippets tree view
  const snippetLoader: SnippetLoader = new SnippetLoader(context);
  const snippetProvider: SnippetTreeDataProvider = new SnippetTreeDataProvider(snippetLoader);
  const snippetView = window.createTreeView(constants.SnippetsView, {
    treeDataProvider: snippetProvider,
    showCollapseAll: true
  });

  // expand and select snippets language node on active text editor change
  window.onDidChangeActiveTextEditor((textEditor: TextEditor | undefined) => {
    if (textEditor && snippetView.visible) {
      const editorLanguage: string = textEditor.document.languageId;
      const snippetsLanguage: SnippetLanguage | undefined =
        snippetLoader.snippetLanguages.get(editorLanguage);

        if (config.showOnlyActiveEditorLanguageSnippets()) {
        // reload snippets to display for the active editor text document language
        snippetProvider.refresh();
      }

      if (snippetsLanguage) {
        // reveal loaded language snippets in the snippets tree view
        const expandSnippetLevels: number = config.expandSnippetFiles() ? 2 : 1; // levels to expand
        snippetView.reveal(snippetsLanguage, {
          select: true,
          focus: config.focusOnActiveEditorSnippets(),
          expand: expandSnippetLevels
        });
      }
    }
  });

  // update snippets viewer setttings and refresh snippets tree view on configuraiton changes
  context.subscriptions.push(workspace.onDidChangeConfiguration(workspaceConfig => {
    if (workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.CombineLanguageSnippets}`)) {
      snippetProvider.combineLanguageSnippets = config.combineLanguageSnippets();
      snippetProvider.refresh();
    }
    else if (workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.SortSnippetsByName}`)) {
      snippetProvider.sortSnippetsByName = config.sortSnippetsByName();
      snippetProvider.refresh();
    }
    else if (workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.ShowBuiltInExtensionSnippets}`) ||
      workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.SkipLanguageSnippets}`) ||
      workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.ExpandSnippetFiles}`) ||
      workspaceConfig.affectsConfiguration(`${constants.ExtensionId}.${Settings.ShowOnlyActiveEditorLanguageSnippets}`)) {
      snippetProvider.refresh();
    }
  }));

  // add snippets viewer commands
  registerCommands(context, snippetProvider);
}

export function deactivate() { }
