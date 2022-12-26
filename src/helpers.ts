import { workspace } from 'vscode'
import type { IExtensionsConf } from './types'

export const isWin = process.platform === 'win32'

export const getExtensionsConf = () => {
  const conf = workspace.getConfiguration('wa')
  const rootPath = conf.get('rootPath')
  return { rootPath } as IExtensionsConf
}

export const getRootPathConf = () => {
  const conf = getExtensionsConf()
  return conf?.rootPath
}

export const getCorrectPath = (path: string) => {
  if (isWin)
    return path.replace(/\\/g, '/')

  return path
}

export const getProjectDirPath = (path: string) => {
  if (isWin)
    return path.replace(/\\src\\.*$/, '')

  return path.replace(/\/src\/.*$/, '')
}
