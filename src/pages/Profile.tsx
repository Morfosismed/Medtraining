import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { api } from "@/services/api"
import { motion } from "motion/react"
import { User, Mail, Calendar, BookOpen, Award, Clock, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Profile({ user, logout }: { user: any, logout: () => void }) {
  const [profile, setProfile] = useState<any>(null)
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const profileData = await api.get('/user/profile', token)
        setProfile(profileData)
        
        const enrolledData = await api.get('/subjects/enrolled', token)
        setEnrolledSubjects(enrolledData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Layout user={user} logout={logout}><div className="animate-pulse text-slate-500">Cargando perfil...</div></Layout>

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-display font-bold text-surgical-green mb-2">Mi Perfil</h1>
          <p className="text-slate-500">Gestiona tu información y revisa tu progreso académico.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-dark-border shadow-xl overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-medical-blue to-surgical-green" />
              <div className="px-6 pb-8 -mt-12">
                <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-surgical-green">
                    <User className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-surgical-green">{profile?.name}</h2>
                <p className="text-slate-500 text-sm mb-6 uppercase tracking-wider font-medium">{profile?.role}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 text-medical-blue" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="w-4 h-4 text-medical-blue" />
                    <span className="text-sm">Miembro desde {new Date(profile?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-8" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats and Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-dark-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-medical-blue" />
                    <span className="text-sm font-medium text-slate-500">Materias</span>
                  </div>
                  <div className="text-3xl font-bold text-surgical-green">{profile?.stats?.enrollments}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-dark-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-surgical-green" />
                    <span className="text-sm font-medium text-slate-500">Temas Completados</span>
                  </div>
                  <div className="text-3xl font-bold text-surgical-green">{profile?.stats?.completedTopics}</div>
                </CardContent>
              </Card>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h3 className="text-xl font-display font-bold text-surgical-green mb-4">Mis Cursos</h3>
              <div className="space-y-4">
                {enrolledSubjects.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-dark-border rounded-3xl">
                    <p className="text-slate-500 mb-4">Aún no te has inscrito en ninguna materia.</p>
                    <Link to="/catalog">
                      <Button variant="outline">Ir al Catálogo</Button>
                    </Link>
                  </div>
                ) : (
                  enrolledSubjects.map(subject => (
                    <Link key={subject.id} to={`/subjects/${subject.id}`}>
                      <Card className="group hover:border-medical-blue/30 transition-all border-dark-border bg-white shadow-sm mb-4">
                        <div className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={subject.image_url || 'https://picsum.photos/200'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-surgical-green group-hover:text-medical-blue transition-colors">{subject.title}</h4>
                            <p className="text-xs text-slate-500">Inscrito el {new Date(subject.enrolled_at).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-medical-blue group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
