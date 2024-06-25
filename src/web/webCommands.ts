import type { ExtensionContext } from 'vscode'
import { commands } from 'vscode'
import { Wasm } from '@vscode/wasm-wasi'
import { getActiveFilePath, getModName, runWasmCommand, sendTerminalCommand } from './helpers'
import { waPreviewPanel } from './panel'

export const webCommands = async (context: ExtensionContext) => {
  const wasm = await Wasm.load()
  const modName = await getModName()

  const disposables = [
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
  ]
  return disposables
}
