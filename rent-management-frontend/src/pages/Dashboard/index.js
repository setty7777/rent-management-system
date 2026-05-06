import Layout from '../../components/Layout'
import DashboardCards from '../../components/DashboardCards'
import './index.css'

const Dashboard = () => {
  return (
    <Layout>
      {/* Dashboard Header */}
      <div className='dashboard-header'>
        <div>
          <h1>Dashboard</h1>
          <p className='dashboard-subtitle'>Overview of your recent activity</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards />
    </Layout>
  )
}

export default Dashboard
