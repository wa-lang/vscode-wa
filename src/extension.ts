import { commands, languages, workspace } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { runWaCode } from './run'
import { fmtWaCode } from './fmt'
import { codeLensProvider } from './codeLens'

export function activate(context: ExtensionContext) {
  const disposables = [
    languages.registerCodeLensProvider({ scheme: 'file', language: 'wa' }, codeLensProvider()),
    commands.registerCommand('wa.runWaCode', runWaCode),
    workspace.onDidSaveTextDocument(fmtWaCode),
  ] as const
  context.subscriptions.push(...disposables)
}

export function deactivate() { }
