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

export const uuid = (len = 16, radix?: number): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid: string[] = []
  let i
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) { uuid[i] = chars[0 | Math.random() * radix] }
  }
  else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}
