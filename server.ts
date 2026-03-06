import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import db from './src/db/index.ts';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'med_training_secret';

app.use(express.json());

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, hashedPassword, role || 'student');
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- Subject Routes ---
app.get('/api/subjects', authenticateToken, (req, res) => {
  const subjects = db.prepare('SELECT * FROM subjects').all();
  res.json(subjects);
});

app.post('/api/subjects', authenticateToken, isAdmin, (req, res) => {
  const { title, description, image_url, base_book_url } = req.body;
  const stmt = db.prepare('INSERT INTO subjects (title, description, image_url, base_book_url) VALUES (?, ?, ?, ?)');
  const info = stmt.run(title, description, image_url, base_book_url);
  res.json({ id: info.lastInsertRowid });
});

// --- Topic Routes ---
app.get('/api/subjects/:subjectId/topics', authenticateToken, (req, res) => {
  const topics = db.prepare('SELECT * FROM topics WHERE subject_id = ? ORDER BY order_index').all(req.params.subjectId);
  res.json(topics);
});

app.get('/api/topics/:id', authenticateToken, (req, res) => {
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id);
  res.json(topic);
});

app.post('/api/topics', authenticateToken, isAdmin, (req, res) => {
  const { subject_id, title, content_html, video_url, pdf_url, image_url, order_index } = req.body;
  const stmt = db.prepare('INSERT INTO topics (subject_id, title, content_html, video_url, pdf_url, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(subject_id, title, content_html, video_url, pdf_url, image_url, order_index);
  res.json({ id: info.lastInsertRowid });
});

// --- Quiz Routes ---
app.get('/api/topics/:topicId/quiz', authenticateToken, (req, res) => {
  const quiz: any = db.prepare('SELECT * FROM quizzes WHERE topic_id = ?').get(req.params.topicId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz.id);
  const questionsWithOptions = questions.map((q: any) => ({
    ...q,
    options: db.prepare('SELECT * FROM options WHERE question_id = ?').all(q.id)
  }));

  res.json({ ...quiz, questions: questionsWithOptions });
});

app.post('/api/quizzes/submit', authenticateToken, (req: any, res) => {
  const { quiz_id, score } = req.body;
  const stmt = db.prepare('INSERT INTO quiz_results (user_id, quiz_id, score) VALUES (?, ?, ?)');
  stmt.run(req.user.id, quiz_id, score);
  res.json({ success: true });
});

// --- AI Advisor (RAG Simulation) ---
app.post('/api/ai/ask', authenticateToken, async (req: any, res) => {
  const { subject_id, query } = req.body;
  const subject: any = db.prepare('SELECT * FROM subjects WHERE id = ?').get(subject_id);
  
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // In a real RAG system, we would fetch chunks from a vector store.
    // Here we simulate it by providing the subject description and title as context.
    const systemInstruction = `
      Eres el Asesor IA de MED TRAINING para la materia: ${subject.title}.
      Tu conocimiento se basa exclusivamente en el libro base: ${subject.base_book_url || 'No especificado'}.
      Solo puedes responder preguntas relacionadas con el contenido de esta materia.
      Si la pregunta está fuera de lugar, recházala amablemente diciendo que solo puedes ayudar con temas de ${subject.title}.
      Siempre intenta citar el capítulo o sección si es posible (simulado si no tienes el texto real).
      Contexto de la materia: ${subject.description}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: query,
      config: {
        systemInstruction
      }
    });

    const answer = response.text || "No pude generar una respuesta.";
    
    // Log history
    db.prepare('INSERT INTO ai_history (user_id, subject_id, query, response) VALUES (?, ?, ?, ?)').run(
      req.user.id, subject_id, query, answer
    );

    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Admin Stats ---
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
  const quizResultCount = db.prepare('SELECT COUNT(*) as count FROM quiz_results').get();
  res.json({ userCount, subjectCount, quizResultCount });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Seed admin if not exists
    const adminExists = db.prepare('SELECT * FROM users WHERE role = "admin"').get();
    if (!adminExists) {
      const hashedPass = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
        'Admin MedTraining', 'admin@medtraining.com', hashedPass, 'admin'
      );
      console.log('Admin user created: admin@medtraining.com / admin123');
    }

    // Seed some subjects if empty
    const subjectsCount: any = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
    if (subjectsCount.count === 0) {
      db.prepare('INSERT INTO subjects (title, description, image_url) VALUES (?, ?, ?)').run(
        'Anatomía Humana', 'Estudio de la estructura del cuerpo humano.', 'https://picsum.photos/seed/anatomy/800/600'
      );
      db.prepare('INSERT INTO subjects (title, description, image_url) VALUES (?, ?, ?)').run(
        'Fisiología Médica', 'Estudio de las funciones del cuerpo humano.', 'https://picsum.photos/seed/physiology/800/600'
      );
    }
  });
}

startServer();
