import { CodeLens } from 'vscode'
import type { CodeLensProvider, TextDocument } from 'vscode'

const getCodeLenses = (document: TextDocument): CodeLens[] => {
  const codeLens: CodeLens[] = []
  const text = document.getText()
  const lines = text.split('\n')
  const mainLine = lines.findIndex(line => /func main\s*[\(\{]/.test(line))
  if (mainLine !== -1) {
    codeLens.push(new CodeLens(document.lineAt(mainLine).range, {
      title: '▷ Run',
      command: 'wa.runWaCode',
    }))
  }

  return codeLens
}

export const codeLensProvider = (): CodeLensProvider => {
  return {
    provideCodeLenses: (document: TextDocument) => getCodeLenses(document),
  }
}
