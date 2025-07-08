// eslint-disable-next-line no-unused-vars
import React from 'react'

const Eror = () => {
  return (
    <div className='flex justify-center items-center'>
      <div className='flex m-5 flex-col justify-center items-center gap-4'>
        <h1 className='text-6xl font-bold text-red-500'>404</h1>
        <p className='text-xl text-gray-700'>Sahifa topilmadi</p>
        <a href="/" className='text-blue-500 hover:underline'>Bosh sahifaga qaytish</a>
      </div>
    </div>
  )
}

export default Eror;