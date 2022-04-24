/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Snippet viewer extensions constants
 */

// Extension constants
export const PublisherId: string = 'RandomFractalsInc';
export const ExtensionName: string = 'vscode-snippets-viewer';
export const ExtensionId: string = 'snippets.viewer';
export const ExtensionDisplayName: string = 'Snippets Viewer';

// View constants
export const SnippetsView: string = 'snippets.view';

// Snippets Viewer command constants
export const RefreshSnippetsCommand: string = `${ExtensionId}.refreshSnippets`;
export const CombineLanguageSnippetsCommand: string = `${ExtensionId}.combineLanguageSnippets`;
export const GroupSnippetsByFileCommand: string = `${ExtensionId}.groupSnippetsByFile`;
export const SortSnippetsByNameCommand: string = `${ExtensionId}.sortSnippetsByName`;
export const SortSnippetsByDefinitionOrderCommand: string = `${ExtensionId}.sortSnippetsByDefinitionOrder`;
export const SkipLanguageSnippetsCommand: string = `${ExtensionId}.skipLanguageSnippets`;
export const ViewSettingsCommand: string = `${ExtensionId}.viewSettings`;
export const InsertSnippetCommand: string = `${ExtensionId}.insertSnippet`;
export const OpenSnippetFileCommand: string = `${ExtensionId}.openSnippetFile`;

// VSCode action/command constants
export const VSCodeExecuteDocumentSymbolProvider: string = 'vscode.executeDocumentSymbolProvider';
export const WorkbenchActionFocusActiveEditorGroup: string = 'workbench.action.focusActiveEditorGroup';
export const WorkbenchActionOpenSettings: string = 'workbench.action.openSettings';
export const EditorActionInsertSnippet: string = 'editor.action.insertSnippet';
