import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { api } from "@/services/api"
import { ChevronLeft, PlayCircle, FileText, CheckCircle2, MessageSquare, Clock } from "lucide-react"
import { motion } from "motion/react"

export default function SubjectView({ user, logout }: { user: any, logout: () => void }) {
  const { id } = useParams()
  const [subject, setSubject] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const subjects = await api.get('/subjects', token)
        const currentSubject = subjects.find((s: any) => s.id === parseInt(id!))
        setSubject(currentSubject)
        
        const topicsData = await api.get(`/subjects/${id}/topics`, token)
        setTopics(topicsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <Layout user={user} logout={logout}><div className="animate-pulse text-slate-500">Cargando materia...</div></Layout>

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-medical-blue mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>

        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <div className="w-full md:w-1/3">
            <div className="rounded-3xl overflow-hidden border border-dark-border aspect-[4/3]">
              <img 
                src={subject?.image_url || `https://picsum.photos/seed/${id}/800/600`} 
                alt={subject?.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-display font-bold text-white mb-4">{subject?.title}</h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">{subject?.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="gap-2">
                <MessageSquare className="w-5 h-5" />
                Asesor IA de la Materia
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-5 h-5" />
                Libro Base (PDF)
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-8">Temario</h2>
        
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-dark-border rounded-3xl text-slate-500">
              No hay temas cargados para esta materia aún.
            </div>
          ) : (
            topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/topics/${topic.id}`}>
                  <Card className="group hover:border-medical-blue/30 hover:bg-dark-surface transition-all">
                    <div className="p-6 flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-dark-bg flex items-center justify-center text-slate-500 group-hover:text-medical-blue transition-colors">
                        {topic.video_url ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-medical-blue transition-colors">
                          {index + 1}. {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 15 min
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-surgical-green" /> Quiz disponible
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Estudiar
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
