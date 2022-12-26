import { window } from 'vscode'
import { getCorrectPath, getProjectDirPath } from './helpers'

export const runWaCode = () => {
  const document = window.activeTextEditor?.document
  const langId = document?.languageId
  if (langId !== 'wa')
    return window.showErrorMessage('Code language not supported or defined.')

  const filePath = getProjectDirPath(document!.uri.fsPath)
  const path = getCorrectPath(filePath)
  const command = `wa run ${path}`

  const terminal = window.terminals.find(t => t.name === '凹') || window.createTerminal('凹')

  terminal.show()
  terminal.sendText(command)
}
