import { languages } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { webCommands } from './webCommands'

export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { scheme: 'file', language: 'wa' },
      { provideCodeLenses: () => [] },
    ),
  )
  const disposables = await webCommands(context)
  context.subscriptions.push(...disposables)
}

export function deactivate() { }
