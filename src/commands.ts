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
}
from 'vscode';
import * as config from './config';
import {
	SnippetFile,
	Snippet
}
from './snippets/snippets';
import {SnippetTreeDataProvider} from './snippets/snippetTreeDataProvider';

export function registerCommands(context: ExtensionContext, snippetProvider: SnippetTreeDataProvider) {
  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.refreshSnippets`, () => snippetProvider.refresh())
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.combineLanguageSnippets`, () => {
      snippetProvider.combineLanguageSnippets = true;
      config.updateGlobalSetting('combineLanguageSnippets', true);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.groupSnippetsByFile`, () => {
      snippetProvider.combineLanguageSnippets = false;
      config.updateGlobalSetting('combineLanguageSnippets', false);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.sortSnippetsByName`, () => {
      snippetProvider.sortSnippetsByName = true;
      config.updateGlobalSetting('sortSnippetsByName', true);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.sortSnippetsByDefinitionOrder`, () => {
      snippetProvider.sortSnippetsByName = false;
      config.updateGlobalSetting('sortSnippetsByName', false);
    })
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.skipLanguageSnippets`, () => {
      commands.executeCommand('workbench.action.openSettings', 'snippets.viewer.skipLanguageSnippets');
    })
	);

  context.subscriptions.push(
		commands.registerCommand(`snippets.viewer.viewSettings`, () => {
      commands.executeCommand('workbench.action.openSettings', 'snippets.viewer');
    })
	);

  context.subscriptions.push(
    commands.registerCommand(`snippets.viewer.insertSnippet`, (snippet: Snippet) => {
      let snippetBody: string;
      if (Array.isArray(snippet.body)) {
        snippetBody = snippet.body.join('\n');
      }
      else {
        snippetBody = snippet.body;
      }
      commands.executeCommand('editor.action.insertSnippet', {
        snippet: snippetBody,
      });
      commands.executeCommand('workbench.action.focusActiveEditorGroup');
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`snippets.viewer.openSnippetFile`, (snippet: SnippetFile | Snippet) => {
      let filePath: string;
      if (snippet instanceof Snippet) {
        filePath = snippet.snippetFile.filePath;
      }
      else {
        filePath = snippet.filePath;
      }
      workspace.openTextDocument(Uri.file(filePath)).then((document) => {
        window.showTextDocument(document).then(() => {
          if (snippet instanceof Snippet) {
            goToSymbol(document, snippet.name);
          }
        });
      });
    })
  );
}

async function goToSymbol(document: TextDocument, symbolName: string) {
  const symbols = await getSymbols(document);
  const findSymbol = symbols.find(symbol => symbol.name === symbolName);
  const activeTextEditor = window.activeTextEditor;
  if (findSymbol && activeTextEditor) {
    activeTextEditor.selection = new Selection(findSymbol.range.start, findSymbol.range.start);
    activeTextEditor.revealRange(findSymbol.range, TextEditorRevealType.AtTop);
  }
}

async function getSymbols(document: TextDocument): Promise<DocumentSymbol[]> {
  return new Promise(async (resolve, reject) => {
    let symbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);// tslint:disable-line
    if (!symbols || symbols.length === 0) {
      setTimeout(async () => {
        symbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);// tslint:disable-line
        return resolve(symbols || []);
      }, 1200);
    } else {
      return resolve(symbols || []);
    }
  });
}
