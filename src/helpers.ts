import { workspace } from 'vscode'
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
