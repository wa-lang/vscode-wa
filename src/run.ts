import { ShellExecution, Task, Uri, tasks, window, workspace } from 'vscode'

export const runWaCode = async () => {
  const document = window.activeTextEditor?.document
  const langId = document?.languageId
  if (langId !== 'wa') {
    return window.showErrorMessage('Code language not supported or defined.')
  }

  const fsPath = document!.uri.fsPath
  let proPath, filePath
  const hasSrcDir = fsPath.includes('src')

  if (!hasSrcDir) {
    const uri = Uri.file(fsPath)
    proPath = uri.with({ path: uri.path.substring(0, uri.path.lastIndexOf('/')) }).fsPath
    filePath = uri.path.substring(uri.path.lastIndexOf('/') + 1)
  }
  else {
    const srcPath = Uri.file(fsPath).with({ path: `${fsPath.split('/src')[0]}/` })
    try {
      const files = await workspace.fs.readDirectory(srcPath)
      const hasWaModJson = files.some(([name]) => name === 'wa.mod')
      if (!hasWaModJson) {
        return window.showErrorMessage('wa.mod.json not found in the current directory.')
      }
    }
    catch (error) {
      return window.showErrorMessage('Error reading the directory.')
    }
    proPath = srcPath.fsPath
    filePath = srcPath.fsPath
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
