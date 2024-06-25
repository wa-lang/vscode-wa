import type { ExtensionContext } from 'vscode'
import { Uri, ViewColumn, window, workspace } from 'vscode'
import { uuid } from './helpers'

export async function waPreviewPanel(context: ExtensionContext) {
  const panel = window.createWebviewPanel(
    'wa-preview',
    'Wa Preview',
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  )

  const styleUri = Uri.joinPath(context.extensionUri, 'client/dist/assets/index.css')
  const scriptUri = Uri.joinPath(context.extensionUri, 'client/dist/assets/index.js')

  panel.webview.onDidReceiveMessage((message) => {
    if (message.command === 'err-notify') {
      window.showErrorMessage(message.text)
      return
    }
    window.showInformationMessage(message.text)
  })

  panel.webview.html = /* html */`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Wa Webview</title>
        <script>
          window.vscode = acquireVsCodeApi()
          window.addEventListener('message', event => {
            const message = event.data
            // TODOs: Push data using the publish-subscribe model
            switch (message.command) {
              case 'outputFiles':
                window.outputFiles = message.data
                break
            }
          })
        </script>
        <script type="module" crossorigin src=${scriptUri}></script>
        <link rel="stylesheet" crossorigin href=${styleUri}>
      </head>
      <body>
        <div id="root" nonce="${uuid()}"></div>
      </body>

    </html>
  `

  const outputDir = Uri.joinPath(workspace.workspaceFolders![0].uri, 'output')
  const outputFiles = await workspace.fs.readDirectory(outputDir)
  if (!outputFiles.length) {
    window.showErrorMessage('No output files found, Please execute wa build')
    return
  }
  const outputData = []
  for (const [name] of outputFiles) {
    if (name.endsWith('.wasm')) { continue }

    const srcPath = Uri.joinPath(outputDir, name)
    const srcBuffer = (await workspace.fs.readFile(srcPath)).buffer
    const srcContent = new Uint8Array(srcBuffer)

    outputData.push({ name, data: Array.from(srcContent) })
  }

  panel.webview.postMessage({ command: 'outputFiles', data: outputData })
}
