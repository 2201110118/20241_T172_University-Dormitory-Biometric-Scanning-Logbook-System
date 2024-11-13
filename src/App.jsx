import { useState } from 'react'
import './index.css'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import buksucoloredlogo from './assets/images/buksu-colored-logo.png'
import buksulogo from './assets/images/dorm-pic.jpg'


function App() {

  return (
    <>
    <div className='grid grid-cols-2 grid-rows-1 place-content-center bg-white gap-0 shadow-xl rounded-[24px] w-[700px] h-[500px] mx-auto mt-10 pr-5 '>
    
    {/* picture nga side */}
    <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url('../assets/images/dorm-pic.jpg')` }}>
  <div className="mt-10 ml-10">
    <img src={buksulogo} alt="../assets/images/dorm-pic.jpg" />
  </div>
    <div className="bg-[url('/images/buksu-colored-logo.jpg')] h-64 bg-cover bg-center">
      <div className="object-contain max-h-full max-w-full">
      <img src={buksucoloredlogo} alt="buksu-colored-logo" />
      </div>
      
</div>
      </div>
      
      {/* login nga side */}
      <div className=' rounded-[24px] md:mt-0 mt-auto'>
      <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className='items-center text-center'>
      <FontAwesomeIcon icon={faCircleUser} size="3x" />
      </div>
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
  
    <h2 class=" text-center text-2xl/9 font-bold tracking-tight text-gray-900">Admin Login</h2>
  </div>
  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" action="#" method="POST">
    <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
        <div class="mt-2">
          <input id="email" name="email" type="email" autocomplete="email" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
        </div>
      </div>


      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
          <div class="text-sm">
            <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
          </div>
        </div>
        <div class="mt-2">
          <input id="password" name="password" type="password" autocomplete="current-password" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"/>
        </div>
      </div>

      <div>
        <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Login</button>
      </div>
    </form>

    <p class=" text-center text-sm/6 text-gray-500">
      Not registered yet?
      <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Sign Up</a>
    </p>
  </div>
</div>
      </div>

      
    </div>
   
     
    </>
  )
}

export default App
