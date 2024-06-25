import { UIKind, commands, env, languages, workspace } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { Wasm } from '@vscode/wasm-wasi'
import { runWaCode } from './run'
import { fmtWaCode } from './fmt'
import { codeLensProvider } from './codeLens'
import { getActiveFilePath, getModName, getUseWebShellConf, runWasmCommand, sendTerminalCommand } from './helpers'
import { waPreviewPanel } from './panel'

export async function activate(context: ExtensionContext) {
  const isWeb = env.uiKind === UIKind.Web
  const useWebShell = getUseWebShellConf()

  commands.executeCommand('setContext', 'wa-use-web-shell', useWebShell)

  context.subscriptions.push(
    languages.registerCodeLensProvider({ scheme: 'file', language: 'wa' },
      !isWeb ? codeLensProvider() : { provideCodeLenses: () => [] },
    ),
  )

  if (isWeb || useWebShell) {
    const wasm = await Wasm.load()
    const modName = await getModName()

    context.subscriptions.push(
      commands.registerCommand(
        'wa.openWaPreview',
        async () => { return await waPreviewPanel(context) },
      ),
      commands.registerCommand('wa.openWaTerminal',
        async () => {
          await commands.executeCommand('ms-vscode.webshell.create')
        },
      ),
      commands.registerCommand('wa.runWaBuild',
        async () => {
          await sendTerminalCommand('wa build')
        },
      ),
      commands.registerCommand(
        'wa.runWatToWasm',
        async () => {
          await sendTerminalCommand(`wat2wasm /workspace/output/${modName}.wat -o /workspace/output/${modName}.wasm`)
        },
      ),
      commands.registerCommand(
        'wa.runWasm',
        async () => {
          await sendTerminalCommand(`wa run-wasm /workspace/output/${modName}.wasm`)
        },
      ),
      commands.registerCommand(
        'wa.webshell.wa',
        async (_command, args, _cwd, stdio, rootFileSystem) => {
          return runWasmCommand(wasm, context, 'wa', 'wa.wasm', args, stdio, rootFileSystem)
        },
      ),
      commands.registerCommand(
        'wa.webshell.wat2wasm',
        async (_command, args, _cwd, stdio, rootFileSystem) => {
          return runWasmCommand(wasm, context, 'wat2wasm', 'wat2wasm.wasm', args, stdio, rootFileSystem)
        },
      ),
      commands.registerCommand('wa.runWaFmt', async () => {
        const path = getActiveFilePath()
        if (!path) { return }
        await sendTerminalCommand(`wa fmt ${path}`)
      }),
    )
  }
  else {
    context.subscriptions.push(
      commands.registerCommand('wa.runWaCode', runWaCode),
      workspace.onDidSaveTextDocument(fmtWaCode),
    )
  }
}

export function deactivate() { }
