import express from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/users.js';
import questionsRoutes from './routes/questions.js';
import attemptPersistenceRoutes from './routes/attemptPersistence.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path'
import {fileURLToPath} from 'url';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/questions', questionsRoutes);
app.use('/users', attemptPersistenceRoutes);


let root = path.join(__dirname, '..', "client", "build");
app.use(express.static(root));

app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});


app.listen(PORT, () => console.log(`console.log("Server running on port: http://localhost:${PORT}`))