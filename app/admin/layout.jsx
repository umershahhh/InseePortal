import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="dash-layout">
      <AdminSidebar />
      <div className="dash-main">
        {children}
      </div>
    </div>
  )
}
