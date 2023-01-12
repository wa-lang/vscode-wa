import fs from 'node:fs'
import * as vs from 'vscode'
import { fmtPath, getParentDirPath, getProjectDirPath } from './helpers'

export const runWaCode = () => {
  const document = vs.window.activeTextEditor?.document
  const langId = document?.languageId
  if (langId !== 'wa') {
    return vs.window.showErrorMessage('Code language not supported or defined.')
  }

  let proPath, filePath
  const fsPath = document!.uri.fsPath
  const hasSrcDir = fsPath.includes('src')
  if (!hasSrcDir) {
    proPath = getParentDirPath(fsPath)
    filePath = fsPath.split('/').pop()
  }
  else {
    const srcPath = getProjectDirPath(fsPath)
    const hasWaModJson = fs.readdirSync(srcPath)?.includes('wa.mod.json')
    if (!hasWaModJson) {
      return vs.window.showErrorMessage('wa.mod.json not found in the current directory.')
    }
    const _filePath = getProjectDirPath(fsPath)
    const path = fmtPath(_filePath)
    proPath = path
    filePath = path
  }

  const waRunTask = vs.tasks.taskExecutions.find(task => task.task.name === 'wa run')
  if (waRunTask) {
    waRunTask.terminate()
  }

  vs.tasks.executeTask(
    new vs.Task(
      { type: 'wa' }, vs.workspace.workspaceFolders![0], 'wa run', 'wa',
      new vs.ShellExecution(`wa run ${filePath}`, { cwd: proPath }),
    ),
  )
}
