import type { FC } from 'react'

const Loading: FC = () => {
  return (
    <div className="wa-loading">
      <div className="wa-loading-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M50 70C50 58.9543 58.9543 50 70 50H130C141.046 50 150 58.9543 150 70V74V130V150H250V130V74V70C250 58.9543 258.954 50 270 50H330C341.046 50 350 58.9543 350 70V94V130V330C350 341.046 341.046 350 330 350H70C58.9543 350 50 341.046 50 330V130V94V70Z" fill="LightSeaGreen">
            <animateMotion path="M 0 0 v 40 Z" dur="0.6s" repeatCount="indefinite" />
          </path>
          <path stroke="none" fill="white" d="M100,100 m-5,-5 h10 v10 h-10">
            <animateMotion path="M 0 0 v 40 Z" dur="0.6s" repeatCount="indefinite" />
          </path>
          <path stroke="none" fill="white" d="M400,100 m-100,0 m-5,-5 h10 v10 h-10">
            <animateMotion path="M 0 0 v 40 Z" dur="0.6s" repeatCount="indefinite" />
          </path>
          <path stroke="white" fill="none" stroke-width="8" stroke-linecap="round" d="M200,230 l34,34 l34,-34 M200,230 l-34,34 l-34,-34">
            <animateMotion path="M 0 0 v 40 Z" dur="0.6s" repeatCount="indefinite" />
          </path>
        </svg>
        <span>Starting Wa server...</span>
      </div>
    </div>
  )
}

export default Loading
