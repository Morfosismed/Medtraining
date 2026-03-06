import { Activity, LayoutDashboard, BookOpen, Settings, LogOut, User, ShieldCheck } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"

export default function Layout({ children, user, logout }: { children: React.ReactNode, user: any, logout: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Materias', icon: BookOpen, path: '/dashboard' }, // In this demo, dashboard shows subjects
  ]

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', icon: ShieldCheck, path: '/admin' })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-surgical-green/10 bg-surgical-green flex flex-col fixed h-full z-40 text-white">
        <div className="p-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-display font-bold text-2xl tracking-tight">
            <Activity className="text-white w-8 h-8" />
            MED<span className="text-white/60 font-light">TRAINING</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.role === 'admin' ? 'Administrador' : 'Estudiante'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/60 hover:text-red-400 hover:bg-red-500/10"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        {children}
      </main>
    </div>
  )
}
