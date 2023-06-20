import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const languageConfig: vscode.DocumentFilter = {
    language: 'cortexcss',
    scheme: 'file',
    pattern: '**/*.css.ts',
  };

  // Register language
  const disposable = vscode.languages.registerCompletionItemProvider(languageConfig, {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ): vscode.CompletionItem[] {
      // Provide completion items logic
      return [];
    },
  });

  // Register document formatting provider
  // Register document formatting provider
  vscode.languages.registerDocumentFormattingEditProvider(languageConfig, {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.TextEdit[]> {
      const indentSize = 2;
      const fullText = document.getText();
      const lines = fullText.split(/\r?\n/);
      let indentedText = '';
      let insideProperty = false;
      let isFirstProperty = true;

      const isSpecialLine = (line: string): boolean => {
        return (
          line.startsWith('@variable') ||
          line.startsWith('@keyframes') ||
          line.startsWith('@media') ||
          line.startsWith(':host') ||
          line.startsWith('::slotted') ||
          line.startsWith('.')
        );
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimStart();

        if (line === '') {
          continue; // Skip blank lines
        }

        if (
          !line.endsWith(';') &&
          line.length > 0 &&
          !line.endsWith('{') &&
          !line.endsWith('`') &&
          !line.endsWith('`,')
        ) {
          line += ';';
        }

        // Remove spaces before semicolon
        line = line.replace(/\s*;\s*$/, ';');

        if (line.endsWith('`,')) {
          insideProperty = false;
          indentedText += ' '.repeat(indentSize * 2) + line + '\n'; // 2 tabs for content inside the property
        } else if (insideProperty && isSpecialLine(line)) {
          indentedText += ' '.repeat(indentSize * 2) + line + '\n'; // 2 tabs for content inside the property
        } else if (insideProperty) {
          indentedText += ' '.repeat(indentSize * 3) + line + '\n'; // 3 tabs for content inside the property if not special line
        } else if (line.includes(': `')) {
          if (!isFirstProperty) {
            indentedText += '\n'; // Add a new line before each property except the first one
          }
          insideProperty = true;
          indentedText += ' '.repeat(indentSize) + line + '\n'; // 1 tab for property name
          isFirstProperty = false;
        } else {
          indentedText += line + '\n'; // No indent outside properties
        }
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );

      return [vscode.TextEdit.replace(fullRange, indentedText.trim())]; // Trim to remove trailing newlines
    },
  });

  // Dispose the language registration when the extension is deactivated
  context.subscriptions.push(disposable);
}

export function deactivate() {
  // Cleanup logic when the extension is deactivated
}
