import { useState } from 'react'
import hask from '/hask-512.png'

function App() {
  const [isOn, setIsOn] = useState(false)

  const handleStatus = () => {
    setIsOn(!isOn)
  }

  return ( // [#1E1E1E]
    <main className='min-h-[400px] min-w-[360px] mx-auto relative'> 
      <div className='flex items-center justify-between p-4'>
        <div className='flex items-center'>
          <a href="https://github.com/bm777/hask" target="_blank">
            <img src={hask} className="h-[32px] transform duration-300" alt="Hask logo" />
          </a>
          {/* <p className='text-xl text-[#979797]'> Hask Extension </p> */}
        </div>
      </div>
      <div className='h-[150px] mt-10 flex items-center justify-center'>
        <div onClick={handleStatus} className={'h-[120px] w-[120px] rounded-full flex items-center justify-center hover:cursor-pointer duration-700 shadow-xl hover:shadow-[#0000006f] ' + (isOn ? 'bg-[#1EDA99]' : 'bg-white') }>
          <svg xmlns="http://www.w3.org/2000/svg" 
                width="24" height="24"
                viewBox="0 0 24 24" fill="none" 
                stroke="#888" strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round" 
                className="w-10 h-10">
            <path d="M12 2v10"/>
            <path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>
          </svg>
        </div>
      </div>
      <div className='h-[90px] mt-1 flex items-center justify-center'>
        <div className='w-[200px] h-[65px] bg-[#2973fc] border border-[#ffffff06] rounded flex items-center justify-center'>
          <p className='text-white text-xl'>Hask is { isOn ? "ON" : "OFF" }</p>
        </div>
      </div>


      {/* footer */}
      <div className=" w-full absolute bottom-0 bg-white shadow p-2 flex items-center justify-between">
        <div className='flex justify-center items-center'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EE7202" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <circle cx="12" cy="12" r="1"/>
            <path d="M5 12s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5"/>
          </svg>
          <p className='flex items-center font-semibold mx-2 gap-2'>
            Webpages already scanned: <span className='text-[#888] font-semibold text-xl'>{55}</span>
          </p>
        </div>
        <div className='flex items-center justify-center mr-5 bg-[#1EDA99] hover:bg-[#15CF8F] px-3 py-1 rounded'>beta</div>
      </div>
    </main>
  )
}

export default App
