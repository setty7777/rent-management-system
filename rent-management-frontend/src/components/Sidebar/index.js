import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../SettyRents.png';
import './index.css';
import {
  FaHome,
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaUsers,
  FaMoneyCheckAlt,
  FaFileInvoiceDollar,
  FaSignOutAlt,
} from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
  { name: 'Buildings', path: '/buildings', icon: <FaBuilding /> },
  { name: 'Floors', path: '/floors', icon: <FaLayerGroup /> },
  { name: 'Rooms', path: '/rooms', icon: <FaDoorOpen /> },
  { name: 'Tenants', path: '/tenants', icon: <FaUsers /> },
  { name: 'Rent Entry', path: '/rent-entry', icon: <FaMoneyCheckAlt /> },
  { name: 'Bills', path: '/bills', icon: <FaFileInvoiceDollar /> },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate(); // ✅ useNavigate hook inside component

  const handleLogout = () => {
    // 1. Clear token (and optionally user data)
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // optional

    // 2. Redirect to login page
    navigate('/', { replace: true }); // replace:true prevents back navigation
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <div className="logo-wrapper">
            <img src={logo} alt="logo" className="logo-img" />
          </div>
          <h2 className="logo-text">Rent Manager</h2>
        </div>

        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              <span className="icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
