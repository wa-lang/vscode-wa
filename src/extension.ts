import { commands, workspace } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { runWaCode } from './run'
import { fmtWaCode } from './fmt'

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('wa.runWaCode', runWaCode))
  context.subscriptions.push(workspace.onDidSaveTextDocument(fmtWaCode))
}

export function deactivate() { }
