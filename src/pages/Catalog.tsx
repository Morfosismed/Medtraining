import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { api } from "@/services/api"
import { motion } from "motion/react"
import { BookOpen, CheckCircle, PlusCircle } from "lucide-react"

export default function Catalog({ user, logout }: { user: any, logout: () => void }) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token') || ''
      const data = await api.get('/subjects', token)
      setSubjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleEnroll = async (subjectId: number) => {
    try {
      const token = localStorage.getItem('token') || ''
      await api.post(`/subjects/${subjectId}/enroll`, {}, token)
      fetchSubjects()
    } catch (err) {
      alert("Error al inscribirse")
    }
  }

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-display font-bold text-surgical-green mb-2">Catálogo de Cursos</h1>
          <p className="text-slate-500">Explora nuestra oferta académica y especialízate.</p>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-dark-border bg-white hover:border-medical-blue/50 transition-all hover:shadow-xl h-full flex flex-col">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={subject.image_url || `https://picsum.photos/seed/${subject.id}/800/400`} 
                      alt={subject.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-60" />
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl text-surgical-green">{subject.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-slate-500">{subject.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t border-dark-border/50 pt-4">
                    {subject.is_enrolled ? (
                      <Button variant="outline" className="w-full gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50" disabled>
                        <CheckCircle className="w-4 h-4" />
                        Inscrito
                      </Button>
                    ) : (
                      <Button className="w-full gap-2" onClick={() => handleEnroll(subject.id)}>
                        <PlusCircle className="w-4 h-4" />
                        Inscribirme
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
