import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/services/api"
import { ChevronLeft, Play, FileText, Brain, Send, User, Bot, CheckCircle, XCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { motion } from "motion/react"

export default function TopicView({ user, logout }: { user: any, logout: () => void }) {
  const { id } = useParams()
  const [topic, setTopic] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'ai'>('content')
  
  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // AI State
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const topicData = await api.get(`/topics/${id}`, token)
        setTopic(topicData)
        
        try {
          const quizData = await api.get(`/topics/${id}/quiz`, token)
          setQuiz(quizData)
        } catch (e) {
          console.log("No quiz for this topic")
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNextQuestion = () => {
    if (selectedOption === quiz.questions[currentQuestion].correct_answer_index) {
      setScore(s => s + 1)
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(c => c + 1)
      setSelectedOption(null)
    } else {
      setQuizFinished(true)
      // Submit score
      api.post('/quizzes/submit', { 
        quiz_id: quiz.id, 
        score: ((score + (selectedOption === quiz.questions[currentQuestion].correct_answer_index ? 1 : 0)) / quiz.questions.length) * 100 
      }, localStorage.getItem('token') || '')
    }
  }

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMsg = query
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setAiLoading(true)

    try {
      const data = await api.post('/ai/ask', { 
        subject_id: topic.subject_id, 
        query: userMsg 
      }, localStorage.getItem('token') || '')
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Lo siento, hubo un error al procesar tu consulta." }])
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <Layout user={user} logout={logout}><div className="animate-pulse text-slate-500">Cargando tema...</div></Layout>

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-6xl mx-auto">
        <Link to={`/subjects/${topic?.subject_id}`} className="inline-flex items-center text-sm text-slate-500 hover:text-medical-blue mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a la Materia
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-display font-bold text-white">{topic?.title}</h1>
              <div className="flex bg-dark-surface p-1 rounded-xl border border-dark-border">
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Contenido
                </button>
                <button 
                  onClick={() => setActiveTab('quiz')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'quiz' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Quiz
                </button>
              </div>
            </div>

            {activeTab === 'content' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {topic?.video_url && (
                  <div className="aspect-video rounded-3xl overflow-hidden bg-black border border-dark-border relative group">
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/40 group-hover:bg-dark-bg/20 transition-all cursor-pointer">
                      <div className="w-20 h-20 rounded-full bg-medical-blue/90 flex items-center justify-center shadow-[0_0_40px_rgba(0,102,255,0.4)] group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </div>
                    </div>
                    <img src={topic.image_url || `https://picsum.photos/seed/topic${id}/1280/720`} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                  </div>
                )}

                <Card className="border-none bg-dark-surface/30">
                  <CardContent className="pt-6 prose prose-invert max-w-none">
                    <div className="markdown-body text-slate-300 leading-relaxed space-y-4">
                      <ReactMarkdown>{topic?.content_html || "Sin contenido disponible."}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 gap-2 h-14 rounded-2xl">
                    <FileText className="w-5 h-5 text-medical-blue" />
                    Descargar PDF del Tema
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 h-14 rounded-2xl">
                    <Play className="w-5 h-5 text-surgical-green" />
                    Ver Video Clase
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!quiz ? (
                  <div className="p-20 text-center border-2 border-dashed border-dark-border rounded-3xl text-slate-500">
                    No hay quiz disponible para este tema.
                  </div>
                ) : quizFinished ? (
                  <Card className="text-center p-12 bg-gradient-to-br from-medical-blue/10 to-transparent border-medical-blue/20">
                    <div className="w-20 h-20 rounded-full bg-surgical-green/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-surgical-green" />
                    </div>
                    <CardTitle className="text-3xl mb-2">¡Quiz Completado!</CardTitle>
                    <p className="text-slate-400 mb-8">Has obtenido un puntaje de:</p>
                    <div className="text-6xl font-bold text-white mb-10">
                      {Math.round((score / quiz.questions.length) * 100)}%
                    </div>
                    <Button onClick={() => {
                      setQuizFinished(false)
                      setCurrentQuestion(0)
                      setScore(0)
                      setSelectedOption(null)
                    }}>
                      Reintentar Quiz
                    </Button>
                  </Card>
                ) : (
                  <Card className="border-dark-border bg-dark-surface/50">
                    <CardHeader>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-medical-blue">Pregunta {currentQuestion + 1} de {quiz.questions.length}</span>
                        <div className="w-32 h-2 bg-dark-bg rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-medical-blue transition-all duration-500" 
                            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }} 
                          />
                        </div>
                      </div>
                      <CardTitle className="text-xl leading-relaxed">{quiz.questions[currentQuestion].question_text}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quiz.questions[currentQuestion].options.map((option: any, idx: number) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                            selectedOption === idx 
                              ? 'border-medical-blue bg-medical-blue/10 text-white' 
                              : 'border-dark-border bg-dark-bg/30 text-slate-400 hover:border-slate-600 hover:bg-dark-bg/50'
                          }`}
                        >
                          <span className="font-medium">{option.option_text}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedOption === idx ? 'border-medical-blue bg-medical-blue' : 'border-slate-700'
                          }`}>
                            {selectedOption === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                      <Button 
                        className="w-full h-14 rounded-2xl mt-6 text-lg" 
                        disabled={selectedOption === null}
                        onClick={handleNextQuestion}
                      >
                        {currentQuestion + 1 === quiz.questions.length ? 'Finalizar Quiz' : 'Siguiente Pregunta'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar: AI Advisor Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-160px)] flex flex-col border-dark-border bg-dark-surface/40 backdrop-blur-2xl sticky top-24">
              <CardHeader className="border-b border-dark-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-medical-blue/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-medical-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Asesor IA</CardTitle>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-surgical-green animate-pulse" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">En línea</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-dark-bg flex items-center justify-center mb-4 border border-dark-border">
                      <Bot className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">
                      Pregúntame cualquier duda sobre este tema. Mis respuestas se basan únicamente en la bibliografía oficial.
                    </p>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-medical-blue text-white rounded-tr-none' 
                        : 'bg-dark-bg border border-dark-border text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-dark-bg border border-dark-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </CardContent>

              <div className="p-4 border-t border-dark-border">
                <form onSubmit={handleAskAI} className="relative">
                  <Input 
                    placeholder="Escribe tu duda médica..." 
                    className="pr-12 bg-dark-bg/50 border-dark-border focus:ring-medical-blue h-12 rounded-xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={aiLoading}
                  />
                  <button 
                    type="submit"
                    disabled={aiLoading || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-medical-blue text-white flex items-center justify-center hover:bg-medical-blue-hover disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
