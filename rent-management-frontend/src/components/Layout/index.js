import {useState} from 'react'
import Sidebar from '../Sidebar'
import Header from '../Header'
import './index.css'

const Layout = ({children}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  return (
    <div className='layout'>
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} closeSidebar={closeSidebar} />

      {/* Main content */}
      <div className='main-container'>
        <Header toggleSidebar={toggleSidebar} />
        <div className='content'>{children}</div>
      </div>
    </div>
  )
}

export default Layout
