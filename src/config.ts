import {
  ConfigurationTarget,
  workspace
}
from 'vscode';

export function showBuiltInExtensionSnippets(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('showBuiltInExtensionSnippets');
}

export function combineLanguageSnippets(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('combineLanguageSnippets');
}

export function expandSnippetFiles(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('expandSnippetFiles');
}

export function sortSnippetsByName(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('sortSnippetsByName');
}

export function focusOnActiveEditorSnippets(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('focusOnActiveEditorSnippets');
}

export function showOnlyActiveEditorLanguageSnippets(): boolean {
  return <boolean>workspace.getConfiguration('snippets.viewer').get('showOnlyActiveEditorLanguageSnippets');
}

export function skipLanguages(): string[] {
  let skipLanguages: string[] = [];
  let skipLanguageSnippets: string = <string>workspace.getConfiguration('snippets.viewer').get('skipLanguageSnippets');
  if (skipLanguageSnippets.length > 0) {
    skipLanguageSnippets = skipLanguageSnippets.trim().replace(/\s/g, '');
    skipLanguages = skipLanguageSnippets.split(',');
  }
  return skipLanguages;
}

export function updateWorkspaceSetting(name: string, value: boolean) {
  const settings = workspace.getConfiguration('snippets.viewer', null);
	settings.update(name, value, ConfigurationTarget.Workspace);
}

export function updateGlobalSetting(name: string, value: boolean) {
  const settings = workspace.getConfiguration('snippets.viewer', null);
  settings.update(name, value, ConfigurationTarget.Global);
}