import {FaBars} from 'react-icons/fa'
import './index.css'

const Header = ({toggleSidebar}) => {
  return (
    <div className='header'>
      <div className='header-left'>
        <button
          className='menu-btn'
          onClick={toggleSidebar}
          aria-label='Toggle sidebar'
        >
          <FaBars />
        </button>
      </div>
    </div>
  )
}

export default Header
