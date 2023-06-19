"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    const languageConfig = {
        language: 'cortexcss',
        scheme: 'file',
        pattern: '**/*.css.ts',
    };
    // Register language
    const disposable = vscode.languages.registerCompletionItemProvider(languageConfig, {
        provideCompletionItems(document, position) {
            // Provide completion items logic
            return [];
        },
    });
    // Register document formatting provider
    vscode.languages.registerDocumentFormattingEditProvider(languageConfig, {
        provideDocumentFormattingEdits(document) {
            const indentSize = 2;
            const fullText = document.getText();
            const lines = fullText.split(/\r?\n/);
            let indentedText = '';
            let insideProperty = false;
            const isSpecialLine = (line) => {
                return (line.startsWith('@variable') ||
                    line.startsWith('@keyframes') ||
                    line.startsWith('@media') ||
                    line.startsWith(':host') ||
                    line.startsWith('::slotted') ||
                    line.startsWith('.'));
            };
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trimStart();
                if (line.endsWith('`,')) {
                    insideProperty = false;
                    indentedText += ' '.repeat(indentSize * 2) + line + '\n'; // 2 tabs for content inside the property
                }
                else if (insideProperty && isSpecialLine(line)) {
                    indentedText += ' '.repeat(indentSize * 2) + line + '\n'; // 2 tabs for content inside the property
                }
                else if (insideProperty) {
                    indentedText += ' '.repeat(indentSize * 3) + line + '\n'; // 3 tabs for content inside the property if not special line
                }
                else if (line.includes(': `')) {
                    insideProperty = true;
                    indentedText += ' '.repeat(indentSize) + line + '\n'; // 1 tab for property name
                }
                else {
                    indentedText += line + '\n'; // No indent outside properties
                }
            }
            const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(fullText.length));
            return [vscode.TextEdit.replace(fullRange, indentedText.trim())]; // Trim to remove trailing newlines
        },
    });
    // Dispose the language registration when the extension is deactivated
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
    // Cleanup logic when the extension is deactivated
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map