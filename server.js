import { open } from "sqlite";
import sqlite3 from "sqlite3";
import express from "express";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(cors());

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database('./public/banco.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados banco.db.');
        // Criar a tabela 'rotas' se não existir com todas as colunas esperadas
        db.run(`CREATE TABLE IF NOT EXISTS rotas (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            colaborador TEXT,
            endereco TEXT,
            numero TEXT,
            complemento TEXT,
            funcionario TEXT,
            submission_id TEXT UNIQUE,
            dataEntrega TEXT,
            prioridade TEXT,
            bairro TEXT,
            cidade TEXT,
            estado TEXT,
            cep TEXT,
            observacao TEXT,
            status TEXT DEFAULT 'pendente',
            dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,
            origem TEXT DEFAULT 'manual',
            executedAt TEXT
        )`, (createErr) => {
            if (createErr) console.error('Erro ao criar tabela rotas:', createErr.message);
            else console.log('Tabela "rotas" verificada/criada.');
        });
    }
});

// Middleware para analisar corpos de requisição JSON
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página HTML principal (assumindo que controlador.html é a página principal)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'controlador.html'));
});

// Rota para obter todas as rotas
app.get('/api/rotas', (req, res) => {
    // CORREÇÃO: Adicionando alias ID AS ID_ROTA
    db.all('SELECT *, ID AS ID_ROTA FROM rotas', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ rotas: rows });
    });
});

// Rota para obter rotas por nome de funcionário
app.get('/api/rotas/funcionario/:nomeFuncionario', (req, res) => {
    const { nomeFuncionario } = req.params;
    // CORREÇÃO: Adicionando alias ID AS ID_ROTA
    db.all('SELECT *, ID AS ID_ROTA FROM rotas WHERE funcionario = ?', [nomeFuncionario], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ rotas: rows });
    });
});

// Rota para adicionar uma nova rota
app.post('/api/rotas', (req, res) => {
    const {
        colaborador, endereco, numero, complemento, funcionario,
        submission_id, dataEntrega, prioridade, bairro, cidade, estado, cep, observacao,
        status, origem
    } = req.body;

    if (!colaborador || !endereco || !numero || !funcionario) {
        return res.status(400).json({ error: 'Campos obrigatórios (colaborador, endereco, numero, funcionario) ausentes.' });
    }

    const sql = `INSERT INTO rotas (colaborador, endereco, numero, complemento, funcionario, submission_id, dataEntrega, prioridade, bairro, cidade, estado, cep, observacao, status, dataCriacao, origem)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`;

    const finalStatus = status || 'pendente';
    const finalOrigem = origem || 'manual';

    db.run(sql, [
        colaborador, endereco, numero, complemento, funcionario,
        submission_id, dataEntrega, prioridade, bairro, cidade, estado, cep, observacao,
        finalStatus, finalOrigem
    ],
        function(err) {
            if (err) {
                if (err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: rotas.submission_id')) {
                    return res.status(409).json({ error: 'Já existe uma rota com este Submission ID.' });
                }
                console.error('Erro ao adicionar rota no DB:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'Rota adicionada com sucesso!', id: this.lastID });
        }
    );
});

// Rota para atualizar uma rota existente (inclui status)
app.put('/api/rotas/:id', (req, res) => {
    const { id } = req.params;
    const {
        colaborador, endereco, numero, complemento, funcionario,
        submission_id, status, dataEntrega, prioridade, bairro, cidade, estado, cep, observacao, executedAt
    } = req.body;

    let updates = [];
    let params = [];

    if (colaborador !== undefined) { updates.push('colaborador = ?'); params.push(colaborador); }
    if (endereco !== undefined) { updates.push('endereco = ?'); params.push(endereco); }
    if (numero !== undefined) { updates.push('numero = ?'); params.push(numero); }
    if (complemento !== undefined) { updates.push('complemento = ?'); params.push(complemento); }
    if (funcionario !== undefined) { updates.push('funcionario = ?'); params.push(funcionario); }
    if (submission_id !== undefined) { updates.push('submission_id = ?'); params.push(submission_id); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (dataEntrega !== undefined) { updates.push('dataEntrega = ?'); params.push(dataEntrega); }
    if (prioridade !== undefined) { updates.push('prioridade = ?'); params.push(prioridade); }
    if (bairro !== undefined) { updates.push('bairro = ?'); params.push(bairro); }
    if (cidade !== undefined) { updates.push('cidade = ?'); params.push(cidade); }
    if (estado !== undefined) { updates.push('estado = ?'); params.push(estado); }
    if (cep !== undefined) { updates.push('cep = ?'); params.push(cep); }
    if (observacao !== undefined) { updates.push('observacao = ?'); params.push(observacao); }
    if (executedAt !== undefined) { updates.push('executedAt = ?'); params.push(executedAt); }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar fornecido.' });
    }

    params.push(id);

    const sql = `UPDATE rotas SET ${updates.join(', ')} WHERE ID = ?`;

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Erro ao atualizar rota no DB:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Rota não encontrada ou nenhum dado foi alterado.' });
        } else {
            res.json({ message: 'Rota atualizada com sucesso!' });
        }
    });
});

// Nova rota para limpar TODAS as rotas
app.delete('/api/rotas/limpar-todas', (req, res) => {
    db.run('DELETE FROM rotas', [], function(err) {
        if (err) {
            console.error('Erro ao limpar todas as rotas no DB:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: `Todas as ${this.changes} rotas foram excluídas!` });
    });
});

// Rota para deletar uma rota
app.delete('/api/rotas/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM rotas WHERE ID = ?', id, function(err) {
        if (err) {
            console.error('Erro ao deletar rota no DB:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Rota não encontrada.' });
        } else {
            res.json({ message: 'Rota excluída com sucesso!' });
        }
    });
});

// Nova rota para limpar rotas por funcionário
app.delete('/api/rotas/limpar-por-funcionario/:funcionario', (req, res) => {
    const { funcionario } = req.params;
    db.run('DELETE FROM rotas WHERE funcionario = ?', [funcionario], function(err) {
        if (err) {
            console.error('Erro ao limpar rotas por funcionário no DB:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Nenhuma rota encontrada para este funcionário.' });
        } else {
            res.json({ message: `Todas as ${this.changes} rotas de ${funcionario} foram excluídas!` });
        }
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Abra http://localhost:${port}/controlador.html no seu navegador.`);
});

// Lembre-se de fechar o banco de dados quando o servidor for encerrado
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Conexão com o banco de dados encerrada.');
        process.exit(0);
    });
});