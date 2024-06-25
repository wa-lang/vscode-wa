import { Uri, commands, window, workspace } from 'vscode'
import type { ProcessOptions, RootFileSystem, Stdio, Wasm } from '@vscode/wasm-wasi'
import type { ExtensionContext } from 'vscode'

const createWaTerminal = async () => {
  await commands.executeCommand('ms-vscode.webshell.create')

  const terminals = window.terminals
  if (!terminals) {
    window.showErrorMessage('No terminals found')
    return null
  }

  const terminal = [...terminals]?.reverse().find(t => t.name === 'wesh')
  if (!terminal) {
    window.showErrorMessage('Wa Terminal not found')
    return null
  }

  return terminal
}

export const sendTerminalCommand = async (command: string) => {
  const terminal = await createWaTerminal()
  if (terminal) {
    terminal.sendText(command)
    terminal.sendText('\r')
  }
}

export const getActiveFilePath = (): string | null => {
  const document = window.activeTextEditor?.document
  if (!document) { return null }
  const path = document.uri.fsPath

  const srcIndex = path.indexOf('/src/')
  if (srcIndex === -1) { return './' }

  return `.${path.slice(srcIndex)}`
}

export const runWasmCommand = async (
  wasm: Wasm,
  context: ExtensionContext,
  commandName: string,
  wasmFileName: string,
  args: string[],
  stdio: Stdio,
  rootFileSystem: RootFileSystem,
): Promise<number> => {
  const options: ProcessOptions = { stdio, rootFileSystem, args, trace: true }
  const filename = Uri.joinPath(context.extensionUri, 'assets', wasmFileName)
  const bits = await workspace.fs.readFile(filename)
  // TODO: Remove any type
  const module = await (WebAssembly as any).compile(bits)
  const process = await wasm.createProcess(commandName, module, options)

  return process.run()
}

export const getModName = async () => {
  const modPath = Uri.joinPath(workspace.workspaceFolders![0].uri, 'wa.mod')
  const modBuffer = (await workspace.fs.readFile(modPath)).buffer
  const modContentStr = Array.from(new Uint8Array(modBuffer)).map(byte => String.fromCharCode(byte)).join('')
  const name = modContentStr.match(/name = "(.*)"/)?.[1]
  return name
}
