import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { FitAddon } from '@xterm/addon-fit'
import { WebContainer } from '@webcontainer/api'
import WabtModule from 'wabt'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { files } from './files'

let wc: WebContainer

async function notifyVSCode(text: string) {
  window.vscode.postMessage({ command: 'err-notify', text })
}

async function writeFileFromU8A(path: string, data: Uint8Array, encoding: string = 'utf-8') {
  try {
    const content = new TextDecoder(encoding).decode(data)
    await wc.fs.writeFile(path, content, { encoding })
  }
  catch (error) {
    notifyVSCode(`${path} failed to load, Please restart Wa Preview`)
  }
}

async function compileWatToWasm(watName: string, watContent: Uint8Array) {
  try {
    const wabt = await WabtModule()
    const wat = new TextDecoder('utf-8').decode(watContent)
    const parsed = wabt.parseWat(`${watName}.wat`, wat)
    const { buffer } = parsed.toBinary({})
    const wasm = new Uint8Array(buffer)
    await wc.fs.writeFile(`/${watName}.wasm`, wasm, { encoding: 'utf-8' })
  }
  catch (error) {
    notifyVSCode(`Wasm loading failed, Please restart Wa Preview`)
  }
}

async function startServer(terminal: Terminal) {
  try {
    await runCommand(terminal, 'npm', ['install'])
    await runCommand(terminal, 'npm', ['run', 'dev'])
    const shellProcess = await startShell(terminal)
    return shellProcess
  }
  catch (error) {
    console.error('Error starting server:', error)
  }
}

async function runCommand(terminal: Terminal, command: string, args: string[] = []) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const process = await wc.spawn(command, args)
      if (process.output) {
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              terminal.write(data)
            },
          }),
        )
      }

      process.exit.then((exitCode) => {
        if (exitCode === 0) {
          resolve('')
        }
        else {
          reject(new Error(`${command} ${args.join(' ')} failed with exit code ${exitCode}`))
        }
      })
    }
    catch (error) {
      reject(error)
    }
  })
}

async function startShell(terminal: Terminal) {
  const shellProcess = await wc.spawn('jsh', {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  })

  if (shellProcess.output) {
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data)
        },
      }),
    )
  }

  const input = shellProcess.input?.getWriter()
  if (input) {
    terminal.onData((data) => {
      input.write(data)
    })
  }

  return shellProcess
}

export default async function webContainer(
  iframeRef: RefObject<HTMLIFrameElement>,
  terminalRef: RefObject<HTMLDivElement>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) {
  const fitAddon = new FitAddon()
  const terminal = new Terminal({ convertEol: true })
  terminal.loadAddon(fitAddon)
  terminal.open(terminalRef.current!)
  fitAddon.fit()

  wc = await WebContainer.boot()
  await wc.mount(files)

  try {
    // TODO: Getting data using the publish-subscribe model
    const watFile = window.outputFiles.find(({ name }: any) => name.endsWith('.wat')) as { name: string, data: number[] }
    await compileWatToWasm(`${(watFile.name).replace('.wat', '')}`, new Uint8Array(watFile.data))

    for (const { name, data } of window.outputFiles) {
      await writeFileFromU8A(`/${name}`, new Uint8Array(data))
    }
  }
  catch (error) {
    notifyVSCode('File loading failed, Please restart Wa Preview')
  }

  wc.on('server-ready', async (_port: any, url: string) => {
    iframeRef.current!.src = url
    setIsLoading(false)
  })

  try {
    await startServer(terminal)
  }
  catch (error) {
    notifyVSCode('Server startup failed, Please restart Wa Preview')
  }
}
