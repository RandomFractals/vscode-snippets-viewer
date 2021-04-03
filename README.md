# vscode-snippets-viewer

[![Apache-2.0 License](https://img.shields.io/badge/license-Apache2-orange.svg?color=green)](http://opensource.org/licenses/Apache-2.0)
<a href='https://ko-fi.com/dataPixy' target='_blank' title='support: https://ko-fi.com/dataPixy'>
  <img height='24' style='border:0px;height:20px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=2' alt='https://ko-fi.com/dataPixy' /></a>

[![Version](https://vsmarketplacebadge.apphb.com/version/RandomFractalsInc.snippets-viewer.svg?color=orange&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.snippets-viewer)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/RandomFractalsInc.snippets-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.snippets-viewer)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads/RandomFractalsInc.snippets-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.snippets-viewer)

Snippets Viewer ⇥ for VSCode

![Snippets Viewer Tree View](https://raw.githubusercontent.com/RandomFractals/vscode-snippets-viewer/main/images/snippets-viewer-tree-view.png)

# Features

- View extension snippets grouped by language in the Snippets Tree View ⎇
- View user defined and project snippets with multiple workspace folders
- Auto-select and expand language snippets on active text editor change
- See snippet prefix and shortcut keystrokes in the Snippets tree view
- View snippet description and preview snippet body in the Snippets tree view markdown tooltip
- Insert a snippet from the Snippets tree view into the active code editor
- Open extension snippets file to view snippets JSON config
- Go to the snippet definition in a snippet file
- Toggle built-in language extension snippets display
- Skip language snippets option for the specified languages in extension settings
- Expand snippet files on snippet language tree node expand
- Combine language snippets without snippets extension name grouping
- Sort snippets by definition order in a snippet file
- Sort snippets by name
- View Snippets Viewer settings

# VSCode Contributions

Snippets Viewer ⇥ extension Settings, Commands, and VSCode Views:

![Snippets Viewer VSCode Feature Contributions](https://raw.githubusercontent.com/RandomFractals/vscode-snippets-viewer/main/images/snippets-viewer-contributions.png)

# Installation

Install [Snippets Viewer ⇥](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.snippets-viewer) via VSCode Extensions tab (`Ctrl+Shift+X`) by searching for `snippets viewer` || via [VSCode marketplace search results](https://marketplace.visualstudio.com/search?term=snippets%20viewer&target=VSCode&category=All%20categories&sortBy=Relevance).

![Snippets Viewer Installation](https://raw.githubusercontent.com/RandomFractals/vscode-snippets-viewer/main/images/snippets-viewer-installation.png)

# Configuration

[Create User or Workspace Settings in VSCode](http://code.visualstudio.com/docs/customization/userandworkspace#_creating-user-and-workspace-settings) to change default Snippets Viewer ⇥ extension Settings:

![Snippets Viewer Settings](https://raw.githubusercontent.com/RandomFractals/vscode-snippets-viewer/main/images/snippets-viewer-settings.png)

| Setting | Type | Default Value | Description |
| ------- | ---- | ------------- | ----------- |
| `snippets.viewer.combineLanguageSnippets` | boolean | `false` | Combine language snippets in the Snippets tree view.|
| `snippets.viewer.expandSnippetFiles` | boolean | `false` | Expand snippet files on snippet language tree node expand in the Snippets tree view.|
| `snippets.viewer.focusOnActiveEditorSnippets` | boolean | `false` | Focus on active editor snippets when Snippets tree view is visible. |
| `snippets.viewer.showBuiltInExtensionSnippets` | boolean | `true` | Show built-in language extension snippets in the Snippets tree view. |
| `snippets.viewer.showOnlyActiveEditorLanguageSnippets` | boolean | `true` | Show only active editor language snippets in the Snippets tree view. |
| `snippets.viewer.skipLanguageSnippets` | string | | Comma delimited list of languages to skip snippets display in the Snippets tree view. |
| `snippets.viewer.sortSnippetsByName` | boolean | `false` | Sort loaded snippets by name in Snippets tree view. |

# Dev Build

Use the following commands to build this Snippets Viewer VSCcode extension locally for debugging and submitting pull requests (PRs):

```
$ git clone https://github.com/RandomFractals/vscode-snippets-viewer
$ cd vscode-snippets-viewer
$ npm install
$ code .
```

Watch for changes:

```
$ npm run-script watch
```

Press `F5` in VSCode to start Snippets Viewer extension debug session.

# Contributions

Any & all test, code || feedback contributions are welcome.

Open an issue || create a pull request to make this Snippets Viewer VSCode extension work better for all. 🤗
