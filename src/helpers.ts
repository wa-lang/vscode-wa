import { Uri, commands, window, workspace } from 'vscode'
import type { ProcessOptions, RootFileSystem, Stdio, Wasm } from '@vscode/wasm-wasi'
import type { ExtensionContext } from 'vscode'
import type { IExtensionsConf } from './types'

export const isWin = process.platform === 'win32'

export const getExtensionsConf = () => {
  const conf = workspace.getConfiguration('wa')
  const rootPath = conf.get('rootPath')
  const useWebShell = conf.get('useWebShell')
  return { rootPath, useWebShell } as IExtensionsConf
}

export const getRootPathConf = () => {
  const conf = getExtensionsConf()
  return conf?.rootPath
}

export const getUseWebShellConf = () => {
  const conf = getExtensionsConf()
  return conf?.useWebShell || false
}

export const fmtPath = (path: string) => {
  if (isWin) { return path.replace(/\\/g, '/') }

  return path
}

export const getProjectDirPath = (path: string) => {
  if (isWin) { return path.replace(/\\src\\.*$/, '\\') }

  return path.replace(/\/src\/.*$/, '/')
}

export const getParentDirPath = (path: string) => {
  if (isWin) { return path.replace(/\\[^\\]*$/, '') }

  return path.replace(/\/[^\/]*$/, '')
}

async function createWaTerminal() {
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

export async function sendTerminalCommand(command: string) {
  const terminal = await createWaTerminal()
  if (terminal) {
    terminal.sendText(command)
    terminal.sendText('\r')
  }
}

export function getActiveFilePath(): string | null {
  const document = window.activeTextEditor?.document
  if (!document) { return null }
  const path = document.uri.fsPath

  const srcIndex = path.indexOf('/src/')
  if (srcIndex === -1) { return './' }

  return `.${path.slice(srcIndex)}`
}

export async function runWasmCommand(
  wasm: Wasm,
  context: ExtensionContext,
  commandName: string,
  wasmFileName: string,
  args: string[],
  stdio: Stdio,
  rootFileSystem: RootFileSystem,
): Promise<number> {
  const options: ProcessOptions = { stdio, rootFileSystem, args, trace: true }
  const filename = Uri.joinPath(context.extensionUri, 'assets', wasmFileName)
  const bits = await workspace.fs.readFile(filename)
  // TODO: Remove any type
  const module = await (WebAssembly as any).compile(bits)
  const process = await wasm.createProcess(commandName, module, options)

  return process.run()
}

export async function getModName() {
  const modPath = Uri.joinPath(workspace.workspaceFolders![0].uri, 'wa.mod')
  const modBuffer = (await workspace.fs.readFile(modPath)).buffer
  const modContentStr = Array.from(new Uint8Array(modBuffer)).map(byte => String.fromCharCode(byte)).join('')
  const name = modContentStr.match(/name = "(.*)"/)?.[1]
  return name
}
