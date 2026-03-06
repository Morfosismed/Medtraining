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
  const user: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- Subject Routes ---
app.get('/api/subjects', authenticateToken, (req: any, res) => {
  const subjects = db.prepare(`
    SELECT s.*, 
    (SELECT COUNT(*) FROM enrollments e WHERE e.subject_id = s.id AND e.user_id = ?) as is_enrolled
    FROM subjects s
  `).all(req.user.id);
  res.json(subjects);
});

app.post('/api/subjects', authenticateToken, isAdmin, (req, res) => {
  const { title, description, image_url, base_book_url } = req.body;
  const stmt = db.prepare('INSERT INTO subjects (title, description, image_url, base_book_url) VALUES (?, ?, ?, ?)');
  const info = stmt.run(title, description, image_url, base_book_url);
  res.json({ id: info.lastInsertRowid });
});

// --- Topic Routes ---
app.get('/api/subjects/:subjectId/topics', authenticateToken, (req: any, res) => {
  const topics = db.prepare(`
    SELECT t.*, 
    (SELECT COUNT(*) FROM user_topic_progress utp WHERE utp.topic_id = t.id AND utp.user_id = ?) as is_completed
    FROM topics t 
    WHERE t.subject_id = ? 
    ORDER BY t.order_index
  `).all(req.user.id, req.params.subjectId);
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
app.get('/api/topics/:topicId/quiz', authenticateToken, (req: any, res) => {
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

// --- Enrollment & Progress Routes ---
app.post('/api/subjects/:id/enroll', authenticateToken, (req: any, res) => {
  try {
    const stmt = db.prepare('INSERT INTO enrollments (user_id, subject_id) VALUES (?, ?)');
    stmt.run(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: 'Already enrolled or subject not found' });
  }
});

app.get('/api/subjects/enrolled', authenticateToken, (req: any, res) => {
  const subjects = db.prepare(`
    SELECT s.*, e.enrolled_at 
    FROM subjects s 
    JOIN enrollments e ON s.id = e.subject_id 
    WHERE e.user_id = ?
  `).all(req.user.id);
  res.json(subjects);
});

app.post('/api/topics/:id/complete', authenticateToken, (req: any, res) => {
  try {
    const stmt = db.prepare('INSERT OR IGNORE INTO user_topic_progress (user_id, topic_id) VALUES (?, ?)');
    stmt.run(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subjects/:id/progress', authenticateToken, (req: any, res) => {
  const subjectId = req.params.id;
  const totalTopics: any = db.prepare('SELECT COUNT(*) as count FROM topics WHERE subject_id = ?').get(subjectId);
  const completedTopics: any = db.prepare(`
    SELECT COUNT(*) as count 
    FROM user_topic_progress utp
    JOIN topics t ON utp.topic_id = t.id
    WHERE utp.user_id = ? AND t.subject_id = ?
  `).get(req.user.id, subjectId);

  const progress = totalTopics.count > 0 ? (completedTopics.count / totalTopics.count) * 100 : 0;
  res.json({ 
    total: totalTopics.count, 
    completed: completedTopics.count, 
    percentage: progress 
  });
});

app.get('/api/user/profile', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  const enrollmentsCount: any = db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?').get(req.user.id);
  const completedTopicsCount: any = db.prepare('SELECT COUNT(*) as count FROM user_topic_progress WHERE user_id = ?').get(req.user.id);
  
  res.json({ 
    ...user, 
    stats: {
      enrollments: enrollmentsCount.count,
      completedTopics: completedTopicsCount.count
    }
  });
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
    const adminUser: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get('admin@medtraining.com');
    const hashedPass = bcrypt.hashSync('admin123', 10);
    if (!adminUser) {
      db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
        'Admin MedTraining', 'admin@medtraining.com', hashedPass, 'admin'
      );
      console.log('Admin user created: admin@medtraining.com / admin123');
    } else {
      // Force reset password and role to ensure access
      db.prepare('UPDATE users SET password = ?, role = "admin" WHERE email = ?').run(hashedPass, 'admin@medtraining.com');
      console.log('Admin user password/role reset: admin@medtraining.com / admin123');
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
