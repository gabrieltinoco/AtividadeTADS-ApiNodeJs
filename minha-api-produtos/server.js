const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Habilita o Express para entender JSON no body
app.use(cors()); // Habilita o CORS

// Rota de teste
app.get("/", (req, res) => {
    res.send("API de Produtos está no ar!");
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.post("/produtos", async (req, res) => {
    try {
        // Pega os dados do corpo da requisição
        const { Nome, Codigo, Preco, Descricao, Estoque, Avaliacao, Categoria } =
            req.body;

        let pool = await sql.connect(dbConfig);
        let result = await pool
            .request()
            .input("Nome", sql.VarChar, Nome)
            .input("Codigo", sql.VarChar, Codigo)
            .input("Preco", sql.Decimal(10, 2), Preco)
            .input("Descricao", sql.Text, Descricao)
            .input("Estoque", sql.Int, Estoque)
            .input("Avaliacao", sql.Decimal(3, 2), Avaliacao)
            .input("Categoria", sql.VarChar, Categoria)
            .query(`INSERT INTO Produtos (Nome, Codigo, Preco, Descricao, Estoque, Avaliacao, Categoria) 
                    VALUES (@Nome, @Codigo, @Preco, @Descricao, @Estoque, @Avaliacao, @Categoria)`);

        res.status(201).send("Produto criado com sucesso!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao criar produto");
    }
});

app.get("/produtos", async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM Produtos");

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar produtos");
    }
});

app.get("/produtos/:codigo", async (req, res) => {
    try {
        const { codigo } = req.params; // Pega o código da URL

        let pool = await sql.connect(dbConfig);
        let result = await pool
            .request()
            .input("Codigo", sql.VarChar, codigo)
            .query("SELECT * FROM Produtos WHERE Codigo = @Codigo");

        if (result.recordset.length === 0) {
            res.status(404).send("Produto não encontrado");
        } else {
            res.status(200).json(result.recordset[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar produto");
    }
});

app.get("/produtos/categoria/:categoria", async (req, res) => {
    try {
        const { categoria } = req.params; // Pega a categoria da URL

        let pool = await sql.connect(dbConfig);
        let result = await pool
            .request()
            .input("Categoria", sql.VarChar, categoria)
            .query("SELECT * FROM Produtos WHERE Categoria = @Categoria");

        if (result.recordset.length === 0) {
            res.status(404).send("Nenhum produto encontrado para esta categoria");
        } else {
            res.status(200).json(result.recordset);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar por categoria");
    }
});

app.put("/produtos/:codigo", async (req, res) => {
    try {
        const { codigo } = req.params;
        const { Nome, Preco, Descricao, Estoque, Avaliacao, Categoria } = req.body;

        let pool = await sql.connect(dbConfig);
        let result = await pool
            .request()
            .input("CodigoParam", sql.VarChar, codigo) // Parâmetro do WHERE
            .input("Nome", sql.VarChar, Nome)
            .input("Preco", sql.Decimal(10, 2), Preco)
            .input("Descricao", sql.Text, Descricao)
            .input("Estoque", sql.Int, Estoque)
            .input("Avaliacao", sql.Decimal(3, 2), Avaliacao)
            .input("Categoria", sql.VarChar, Categoria).query(`UPDATE Produtos 
                    SET Nome = @Nome, Preco = @Preco, Descricao = @Descricao, 
                        Estoque = @Estoque, Avaliacao = @Avaliacao, Categoria = @Categoria 
                    WHERE Codigo = @CodigoParam`);

        if (result.rowsAffected[0] === 0) {
            res.status(404).send("Produto não encontrado para atualização");
        } else {
            res.status(200).send("Produto atualizado com sucesso!");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar produto");
    }
});

app.delete('/produtos/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;

        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('Codigo', sql.VarChar, codigo)
            .query('DELETE FROM Produtos WHERE Codigo = @Codigo');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Produto não encontrado para exclusão');
        } else {
            res.status(200).send('Produto excluído com sucesso!');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir produto');
    }
});