import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  )
}
