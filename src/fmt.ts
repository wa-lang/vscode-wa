import { spawn } from 'child_process'
import { window } from 'vscode'
import { fmtPath } from './helpers'

export const fmtWaCode = () => {
  const document = window.activeTextEditor?.document
  const langId = document?.languageId
  if (langId !== 'wa') { return }

  const path = fmtPath(document!.uri.fsPath)
  const command = `wa fmt ${path}`
  const spawnedProcess = spawn(command, [], { shell: true })

  let stdout = ''
  let stderr = ''

  spawnedProcess.stdout.on('data', (data: string) => stdout += data)
  spawnedProcess.stderr.on('data', (data: string) => stderr += data)
  spawnedProcess.on('exit', (code: number) => {
    if (code !== 0) {
      window.showErrorMessage(`Wa Format Error: ${stderr || stdout}`)
    }
  })
}
