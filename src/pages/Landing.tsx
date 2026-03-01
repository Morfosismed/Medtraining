import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { motion } from "motion/react"
import { Activity, Brain, Shield, Stethoscope, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 selection:bg-medical-blue/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-dark-border bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-display font-bold text-2xl tracking-tight">
            <Activity className="text-medical-blue w-8 h-8" />
            MED<span className="text-slate-400 font-light">TRAINING</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#materias" className="hover:text-white transition-colors">Materias</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#testimonios" className="hover:text-white transition-colors">Testimonios</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Iniciar Sesión</Button>
            </Link>
            <Link to="/login">
              <Button>Comenzar Ahora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-medical-blue/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-surgical-green text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-surgical-green animate-pulse" />
              Plataforma EdTech Premium
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-8 leading-[1.1]">
              Domina la medicina con <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue to-cyan-400">
                precisión clínica.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              La plataforma definitiva para estudiantes de medicina. Contenido curado, evaluaciones precisas y un Asesor IA entrenado con literatura médica oficial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto group">
                  Explorar Plataforma
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="beneficios" className="py-24 px-6 bg-dark-surface/30 border-y border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-dark-bg border-dark-border hover:border-medical-blue/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-medical-blue" />
                </div>
                <CardTitle className="text-xl">Asesor IA Especializado</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400 leading-relaxed">
                Resuelve tus dudas al instante con nuestro modelo RAG, entrenado exclusivamente con la bibliografía oficial de cada materia.
              </CardContent>
            </Card>
            <Card className="bg-dark-bg border-dark-border hover:border-surgical-green/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-surgical-green/10 flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-surgical-green" />
                </div>
                <CardTitle className="text-xl">Contenido Clínico</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400 leading-relaxed">
                Artículos, videos y PDFs estructurados jerárquicamente. Diseñado para retención a largo plazo y aplicación práctica.
              </CardContent>
            </Card>
            <Card className="bg-dark-bg border-dark-border hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-xl">Evaluación Continua</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400 leading-relaxed">
                Quizzes interactivos al final de cada tema para consolidar conocimientos, con historial detallado de tu desempeño.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t border-dark-border text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-slate-300">
            <Activity className="w-5 h-5 text-medical-blue" />
            MEDTRAINING
          </div>
          <p>© 2026 MedTraining Inc. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
