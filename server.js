const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

mongoose.connect(process.env.MONGODB_URI, { dbName: 'financeApp' })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.log('Erro na conexão:', err.message));

// Schema do gasto
const gastoSchema = new mongoose.Schema({
    descricao: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0.01 },
    categoria: { type: String, required: true, trim: true },
    data: { type: Date, required: true, default: Date.now }
}, { collection: 'gastos', timestamps: true });

const Gasto = mongoose.model('Gasto', gastoSchema);

// Rota inicial
app.get('/', (req, res) => res.json({ msg: 'API rodando' }));

// CADASTRAR GASTO
app.post('/gastos', async (req, res) => {
        const novoGasto = await Gasto.create(req.body);
        return res.status(201).json(novoGasto);
    
});

//DELETA GASTO POR ID
 app.delete('/gastos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        const gasto = await Gasto.findByIdAndDelete(req.params.id);
        if (!gasto) return res.status(404).json({ error: 'Gasto não encontrado' });
        res.json({ ok: true });
    }catch (err) {
        res.status(500).json({ error: err.message});
    }
 });

 //BUSCA GASTO POR ID
  app.get('/gastos/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const gasto = await Gasto.findById(id);

        if (!gasto) {
            return res.status(404).json({ msg: "Gasto não encontrado" });
        }

        return res.json(gasto);

    } catch (err) {
        return res.status(400).json({ 
            erro: "ID inválido",
            detalhes: err.message 
        });
    }
});

//SUBSTITUI GASTO ID
app.put('/gastos/:id', async (req, res) => {
    try{
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        const aluno = await Gasto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, overwrite: true}
        );
        if (!aluno) return res.status(404).json({ error: 'Gasto não econtrado' });
        res.json(aluno);
    }catch (err) {
        res.status(400).json({ error: err.message });
    }
 });

 //BUSCA TODOS OS GASTOS
app.get('/gastos', async (req, res) => {
    try {
        const gastos = await Gasto.find();
        res.json(gastos);
        } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar gastos", detalhes: err.message });
    }
});

// Iniciar servidor
app.listen(process.env.PORT, () =>
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
);
