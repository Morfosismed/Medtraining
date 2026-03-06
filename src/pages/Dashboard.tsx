import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { api } from "@/services/api"
import { BookOpen, ChevronRight, Clock, Award } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"

export default function Dashboard({ user, logout }: { user: any, logout: () => void }) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const data = await api.get('/subjects/enrolled', token)
        
        // Fetch progress for each subject
        const subjectsWithProgress = await Promise.all(data.map(async (subject: any) => {
          const progress = await api.get(`/subjects/${subject.id}/progress`, token)
          return { ...subject, progress }
        }))
        
        setSubjects(subjectsWithProgress)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-display font-bold text-surgical-green mb-2">Bienvenido, {user?.name}</h1>
          <p className="text-slate-500">Continúa tu formación médica hoy.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white border-dark-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Materias Activas</CardTitle>
              <BookOpen className="w-4 h-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-surgical-green">{subjects.length}</div>
              <p className="text-xs text-slate-400 mt-1">En progreso</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-dark-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Quizzes Completados</CardTitle>
              <Award className="w-4 h-4 text-surgical-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-surgical-green">12</div>
              <p className="text-xs text-slate-400 mt-1">+3 esta semana</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-dark-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Tiempo de Estudio</CardTitle>
              <Clock className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-surgical-green">24h</div>
              <p className="text-xs text-slate-400 mt-1">Total acumulado</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-display font-bold text-surgical-green mb-6">Tus Materias Inscritas</h2>
        
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-dark-surface animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-dark-border rounded-3xl bg-white">
            <p className="text-slate-500 mb-6 font-medium">No estás inscrito en ninguna materia todavía.</p>
            <Link to="/catalog">
              <Button size="lg">Explorar Catálogo</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/subjects/${subject.id}`}>
                  <Card className="group overflow-hidden border-dark-border bg-white hover:border-medical-blue/50 transition-all hover:shadow-xl">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={subject.image_url || `https://picsum.photos/seed/${subject.id}/800/400`} 
                        alt={subject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-60" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl text-surgical-green group-hover:text-medical-blue transition-colors">{subject.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-slate-500">{subject.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-between border-t border-dark-border/50 pt-4">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex flex-col w-full">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Progreso</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-medical-blue transition-all duration-1000" 
                                style={{ width: `${subject.progress?.percentage || 0}%` }} 
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{Math.round(subject.progress?.percentage || 0)}%</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-medical-blue group-hover:translate-x-1 transition-all ml-4" />
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
