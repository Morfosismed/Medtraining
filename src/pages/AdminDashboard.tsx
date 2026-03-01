import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/services/api"
import { Plus, Users, BookOpen, Award, Trash2, Edit, Save, X } from "lucide-react"

export default function AdminDashboard({ user, logout }: { user: any, logout: () => void }) {
  const [stats, setStats] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [newSubject, setNewSubject] = useState({ title: '', description: '', image_url: '', base_book_url: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const statsData = await api.get('/admin/stats', token)
        setStats(statsData)
        
        const subjectsData = await api.get('/subjects', token)
        setSubjects(subjectsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token') || ''
      await api.post('/subjects', newSubject, token)
      const updatedSubjects = await api.get('/subjects', token)
      setSubjects(updatedSubjects)
      setNewSubject({ title: '', description: '', image_url: '', base_book_url: '' })
      setIsAdding(false)
    } catch (err) {
      alert("Error al crear materia")
    }
  }

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-slate-400">Gestiona el contenido y los usuarios de MED TRAINING.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Nueva Materia
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-dark-surface/50 border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Alumnos</CardTitle>
              <Users className="w-4 h-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.userCount?.count || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-dark-surface/50 border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Materias</CardTitle>
              <BookOpen className="w-4 h-4 text-surgical-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.subjectCount?.count || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-dark-surface/50 border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Quizzes Realizados</CardTitle>
              <Award className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.quizResultCount?.count || 0}</div>
            </CardContent>
          </Card>
        </div>

        {isAdding && (
          <Card className="mb-12 border-medical-blue/30 bg-medical-blue/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Nueva Materia</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}><X className="w-5 h-5" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Título</label>
                  <Input 
                    value={newSubject.title} 
                    onChange={e => setNewSubject({...newSubject, title: e.target.value})}
                    placeholder="Ej: Farmacología" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">URL Imagen</label>
                  <Input 
                    value={newSubject.image_url} 
                    onChange={e => setNewSubject({...newSubject, image_url: e.target.value})}
                    placeholder="https://..." 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-300">Descripción</label>
                  <Input 
                    value={newSubject.description} 
                    onChange={e => setNewSubject({...newSubject, description: e.target.value})}
                    placeholder="Breve descripción de la materia..." 
                    required 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-300">URL Libro Base (PDF)</label>
                  <Input 
                    value={newSubject.base_book_url} 
                    onChange={e => setNewSubject({...newSubject, base_book_url: e.target.value})}
                    placeholder="https://..." 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancelar</Button>
                  <Button type="submit" className="gap-2">
                    <Save className="w-5 h-5" />
                    Guardar Materia
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-display font-bold text-white mb-6">Gestionar Materias</h2>
        <div className="grid grid-cols-1 gap-4">
          {subjects.map(subject => (
            <Card key={subject.id} className="bg-dark-surface/30 border-dark-border hover:border-slate-700 transition-all">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-bg">
                    <img src={subject.image_url || 'https://picsum.photos/200'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{subject.title}</h3>
                    <p className="text-xs text-slate-500">{subject.description.substring(0, 60)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 gap-2">
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
