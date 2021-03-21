import { 
  ExtensionContext,
  Uri,
  commands,
  window,
  workspace
} 
from 'vscode';
import {ISnippet} from './snippets/snippet';

export function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`snippets.viewer.insertSnippet`, (snippetBody: ISnippet['body']) => {
      let snippetAsString;
      if (Array.isArray(snippetBody)) {
        snippetAsString = snippetBody.join('\n');
      }
      commands.executeCommand('editor.action.insertSnippet', {
        snippet: snippetAsString ? snippetAsString : snippetBody,
      });
      commands.executeCommand('workbench.action.focusActiveEditorGroup');
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`snippets.viewer.viewSettings`, viewSettings)
  );
}

async function viewSettings() {
  commands.executeCommand( 'workbench.action.openSettings', 'snippets.viewer' );
}
