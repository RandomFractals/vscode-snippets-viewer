import { 
  ExtensionContext,
  commands
} 
from 'vscode';

export function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`snippets.viewer.insertSnippet`, (snippetBody: string | string[]) => {
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
