import { UIKind, commands, env, languages, workspace } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { runWaCode } from './run'
import { fmtWaCode } from './fmt'
import { codeLensProvider } from './codeLens'
import { getUseWebShellConf } from './helpers'
import { webCommands } from './web/webCommands'

export async function activate(context: ExtensionContext) {
  const isWeb = env.uiKind === UIKind.Web
  const useWebShell = getUseWebShellConf()

  commands.executeCommand('setContext', 'wa-use-web-shell', useWebShell)

  context.subscriptions.push(
    languages.registerCodeLensProvider({ scheme: 'file', language: 'wa' },
      !isWeb ? codeLensProvider() : { provideCodeLenses: () => [] },
    ),
  )

  let webDisposables: [] = []
  if (useWebShell) {
    const disposables = await webCommands(context)
    webDisposables = disposables as typeof webDisposables
  }

  context.subscriptions.push(
    commands.registerCommand('wa.runWaCode', runWaCode),
    workspace.onDidSaveTextDocument(fmtWaCode),
    ...webDisposables,
  )
}

export function deactivate() { }
