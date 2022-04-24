import {
  ConfigurationTarget,
  WorkspaceConfiguration,
  workspace
} from 'vscode';

import * as constants from './constants';

/**
 * Gets snippets viewer configuration settings.
 *
 * @returns Worskpace configuration for the snippets viewer.
 */
export function getConfiguration(): WorkspaceConfiguration {
  return workspace.getConfiguration(constants.ExtensionId);
}

/**
 * Gets built-in vscode extension snippets display toggle setting.
 *
 * @returns True to display built-in extension snippets, and false otherwise.
 */
export function showBuiltInExtensionSnippets(): boolean {
  return <boolean>getConfiguration().get('showBuiltInExtensionSnippets');
}

/**
 * Gets language snippets grouping toggle setting.
 *
 * @returns True to combine all language snippets, and false otherwise.
 */
export function combineLanguageSnippets(): boolean {
  return <boolean>getConfiguration().get('combineLanguageSnippets');
}

/**
 * Gets snippets file expand toggle setting.
 *
 * @returns True to expand all snippets file nodes, and false otherwise.
 */
export function expandSnippetFiles(): boolean {
  return <boolean>getConfiguration().get('expandSnippetFiles');
}

/**
 * Gets snippets sort order for the snippets tree view display.
 *
 * @returns True to sort snippets by name, and false to list them by definition order in snippet files.
 */
export function sortSnippetsByName(): boolean {
  return <boolean>getConfiguration().get('sortSnippetsByName');
}

/**
 * Gets language snippets selection toggle setting for the open text document and language id.
 *
 * @returns True to auto-select langugage snippets node in the snippets tree view
 * based on the open text document language id, and false otherwise.
 */
export function focusOnActiveEditorSnippets(): boolean {
  return <boolean>getConfiguration().get('focusOnActiveEditorSnippets');
}

/**
 * Gets active text editor language snippets toggle setting.
 *
 * @returns True to hide all other language snippets in the snippets tree view,
 * and false to show all language snippets at all times.
 */
export function showOnlyActiveEditorLanguageSnippets(): boolean {
  return <boolean>getConfiguration().get('showOnlyActiveEditorLanguageSnippets');
}

/**
 * Gets the list of language snippets to skip in the snippets tree view display.
 *
 * @returns The list of language snippets to skip displaying.
 */
export function skipLanguages(): string[] {
  let skipLanguages: string[] = [];
  let skipLanguageSnippets: string = <string>getConfiguration().get('skipLanguageSnippets');
  if (skipLanguageSnippets.length > 0) {
    // remove white spaces from the skip language snippets setting
    skipLanguageSnippets = skipLanguageSnippets.trim().replace(/\s/g, '');

    // create skip languages list
    skipLanguages = skipLanguageSnippets.split(',');
  }
  return skipLanguages;
}

/**
 * Updates snippets viewer setting in the current workspace.
 *
 * @param name Snippets viewer setting name.
 * @param value New snippets viewer setting value.
 */
export function updateWorkspaceSetting(name: string, value: boolean) {
  const settings = workspace.getConfiguration(constants.ExtensionId, null);
  settings.update(name, value, ConfigurationTarget.Workspace);
}

/**
 * Updates global/user snippets viewer setting.
 *
 * @param name Snippets viewer setting name.
 * @param value New snippets viewer setting value.
 */
export function updateGlobalSetting(name: string, value: boolean) {
  const settings = workspace.getConfiguration(constants.ExtensionId, null);
  settings.update(name, value, ConfigurationTarget.Global);
}
