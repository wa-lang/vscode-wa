import fs from 'node:fs'
import { ShellExecution, Task, tasks, window, workspace } from 'vscode'
import { fmtPath, getParentDirPath, getProjectDirPath } from './helpers'

export const runWaCode = () => {
  const document = window.activeTextEditor?.document
  const langId = document?.languageId
  if (langId !== 'wa') {
    return window.showErrorMessage('Code language not supported or defined.')
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
    const hasWaModJson = fs.readdirSync(srcPath)?.includes('wa.mod.json') || fs.readdirSync(srcPath)?.includes('wa.mod')
    if (!hasWaModJson) {
      return window.showErrorMessage('wa.mod.json not found in the current directory.')
    }
    const _filePath = getProjectDirPath(fsPath)
    const path = fmtPath(_filePath)
    proPath = path
    filePath = path
  }

  const waRunTask = tasks.taskExecutions.find(task => task.task.name === 'wa run')
  if (waRunTask) {
    waRunTask.terminate()
  }

  tasks.executeTask(
    new Task(
      { type: 'wa' }, workspace.workspaceFolders![0], 'wa run', 'wa',
      new ShellExecution(`wa run ${filePath}`, { cwd: proPath }),
    ),
  )
}
