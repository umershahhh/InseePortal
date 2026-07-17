import DashboardSidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="dash-layout">
      <DashboardSidebar />
      <div className="dash-main">
        {children}
      </div>
    </div>
  )
}
