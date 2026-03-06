import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Activity, Lock, Mail } from "lucide-react"
import { motion } from "motion/react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { api } from "@/services/api"

export default function Login({ onLogin }: { onLogin: (user: any, token: string) => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email, password })
      onLogin(data.user, data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Credenciales inválidas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-medical-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-surgical-green/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-surgical-green font-display font-bold text-3xl tracking-tight mb-2">
            <Activity className="text-medical-blue w-10 h-10" />
            MED<span className="text-slate-400 font-light">TRAINING</span>
          </Link>
          <p className="text-slate-500 text-sm">Acceso Seguro a la Plataforma</p>
        </div>

        <div className="bg-white border border-dark-border rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="doctor@hospital.com"
                  className="pl-12 bg-slate-50 border-dark-border focus:border-medical-blue h-14 rounded-2xl text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                <a href="#" className="text-xs text-medical-blue hover:text-medical-blue-hover transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 bg-slate-50 border-dark-border focus:border-medical-blue h-14 rounded-2xl text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-2xl h-14 text-lg font-semibold mt-8"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            ¿No tienes una cuenta?{" "}
            <a href="#" className="text-medical-blue font-medium hover:underline">
              Solicita acceso
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
