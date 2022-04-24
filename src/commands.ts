import {
  DocumentSymbol,
  ExtensionContext,
  Selection,
  TextEditorRevealType,
  TextDocument,
  Uri,
  commands,
  window,
  workspace
} from 'vscode';

import * as config from './config';
import * as constants from './constants';

import {
	SnippetFile,
	Snippet
} from './snippets/snippets';

import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

/**
 * Registers snippets viewer commands.
 *
 * @param context Extension context.
 * @param snippetProvider Snippets tree data provider.
 */
export function registerCommands(context: ExtensionContext, snippetProvider: SnippetTreeDataProvider) {
  context.subscriptions.push(
		commands.registerCommand(constants.RefreshSnippetsCommand, () => snippetProvider.refresh())
	);

  context.subscriptions.push(
		commands.registerCommand(constants.CombineLanguageSnippetsCommand, () => {
      snippetProvider.combineLanguageSnippets = true;
      config.updateGlobalSetting('combineLanguageSnippets', true);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(constants.GroupSnippetsByFileCommand, () => {
      snippetProvider.combineLanguageSnippets = false;
      config.updateGlobalSetting('combineLanguageSnippets', false);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(constants.SortSnippetsByNameCommand, () => {
      snippetProvider.sortSnippetsByName = true;
      config.updateGlobalSetting('sortSnippetsByName', true);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(constants.SortSnippetsByDefinitionOrderCommand, () => {
      snippetProvider.sortSnippetsByName = false;
      config.updateGlobalSetting('sortSnippetsByName', false);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(constants.SkipLanguageSnippetsCommand, () => {
      commands.executeCommand(constants.WorkbenchActionOpenSettings, 'snippets.viewer.skipLanguageSnippets');
    })
	);

  context.subscriptions.push(
		commands.registerCommand(constants.ViewSettingsCommand, () => {
      // show snippets viewer settings
      commands.executeCommand(constants.WorkbenchActionOpenSettings, constants.ExtensionId);
    })
	);

  context.subscriptions.push(
    commands.registerCommand(constants.InsertSnippetCommand, (snippet: Snippet) => {
      // construct snippet code body
      let snippetBody: string;
      if (Array.isArray(snippet.body)) {
        snippetBody = snippet.body.join('\n');
      }
      else {
        snippetBody = snippet.body;
      }

      // insert snippet in active text editor
      commands.executeCommand(constants.EditorActionInsertSnippet, {snippet: snippetBody});

      // release focus from snippets tree view to active text editor
      commands.executeCommand(constants.WorkbenchActionFocusActiveEditorGroup);
    })
  );

  context.subscriptions.push(
    commands.registerCommand(constants.OpenSnippetFileCommand, (snippet: SnippetFile | Snippet) => {
      // determine snippets file path
      let filePath: string;
      if (snippet instanceof Snippet) {
        filePath = snippet.snippetFile.filePath;
      }
      else {
        filePath = snippet.filePath;
      }

      // open snippets file
      workspace.openTextDocument(Uri.file(filePath)).then((document) => {
        window.showTextDocument(document).then(() => {
          if (snippet instanceof Snippet) {
            // scroll to requested snippet symbol name
            goToSymbol(document, snippet.name);
          }
        });
      });
    })
  );
}

/**
 * Scrolls open text document to the specified symbol
 * to display requested snippet definition in text editor.
 *
 * @param document Text document.
 * @param symbolName Symblol name to locate.
 */
async function goToSymbol(document: TextDocument, symbolName: string) {
  const symbols = await getSymbols(document);
  const documentSymbol: DocumentSymbol | undefined = symbols.find(symbol => symbol.name === symbolName);
  const activeTextEditor = window.activeTextEditor;
  if (documentSymbol && activeTextEditor) {
    // create text document selection and reveal range to show document symbol code block
    activeTextEditor.selection = new Selection(documentSymbol.range.start, documentSymbol.range.start);
    activeTextEditor.revealRange(documentSymbol.range, TextEditorRevealType.AtTop);
  }
}

/**
 * Gets text document symbols.
 *
 * @param document Text document.
 * @returns Text document symbols.
 */
async function getSymbols(document: TextDocument): Promise<DocumentSymbol[]> {
  return new Promise(async (resolve, reject) => {
    // get document symbols via built-in vscode document symbol provider
    let symbols: DocumentSymbol[] = await commands.executeCommand<DocumentSymbol[]>(
      constants.VSCodeExecuteDocumentSymbolProvider, document.uri);

    if (!symbols || symbols.length === 0) {
      // retry getting document symbols with a timeout
      setTimeout(async () => {
        symbols = await commands.executeCommand<DocumentSymbol[]>(
          constants.VSCodeExecuteDocumentSymbolProvider, document.uri);
        return resolve(symbols || []);
      }, 1200);
    }
    else {
      return resolve(symbols || []);
    }
  });
}
