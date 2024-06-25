import { useEffect, useRef, useState } from 'react'
import './App.css'
import webContainer from './webcontainer'
import Loading from './Loading'

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    async function start() {
      await webContainer(iframeRef, terminalRef, setIsLoading)
    }
    start()
  }, [])

  return (
    <div>
      {isLoading && <Loading />}
      <div className="wa-preview">
        <iframe ref={iframeRef} className="wa-iframe"></iframe>
        <div ref={terminalRef} className="wa-terminal"></div>
      </div>
    </div>
  )
}

export default App
