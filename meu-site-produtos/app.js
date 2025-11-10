// URL base da sua API (verifique se a porta está correta)
const apiUrl = 'http://localhost:3000/produtos';

// Espera o conteúdo da página carregar antes de rodar o JS
document.addEventListener('DOMContentLoaded', () => {
    
    // Verifica se estamos na página 'index.html'
    if (document.getElementById('produtos-grid')) {
        carregarProdutosHome();
        configurarModalAdicionar();
    }

    // Verifica se estamos na página 'detalhe.html'
    if (document.getElementById('detalhe-nome')) {
        carregarDetalheProduto();
    }

});

// ----------------------------------------------------------------
// FUNÇÕES DA PÁGINA HOME (index.html)
// ----------------------------------------------------------------

// 1. (GET Todos) Busca produtos na API e exibe no grid
async function carregarProdutosHome() {
    const grid = document.getElementById('produtos-grid');
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos. API está no ar?');
        }
        const produtos = await response.json();

        // Limpa o grid caso tenha algo
        grid.innerHTML = ''; 

        // Pega os 12 últimos (ou quantos a API retornar)
        // A atividade pede 12, mas o wireframe tem 8. Vamos usar 12.
        const ultimosProdutos = produtos.slice(-12); 

        // Cria um card para cada produto
        ultimosProdutos.forEach(produto => {
            const card = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="https://plus.unsplash.com/premium_photo-1683984171269-04c84ee23234?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074" class="card-img-top" alt="${produto.Nome}">
                        <div class="card-body">
                            <h5 class="card-title">${produto.Nome}</h5>
                            <p class="card-text">R$ ${produto.Preco.toFixed(2)}</p>
                            
                            <a href="detalhe.html?codigo=${produto.Codigo}" class="btn btn-primary">
                                Ver Detalhes
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p class="text-danger">Não foi possível carregar os produtos. Verifique se sua API está rodando.</p>';
    }
}

// 2. (POST) Configura o modal de adicionar produto
function configurarModalAdicionar() {
    const form = document.getElementById('form-adicionar');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        // Monta o objeto JSON com os dados do formulário
        const novoProduto = {
            Nome: document.getElementById('add-nome').value,
            Codigo: document.getElementById('add-codigo').value,
            Preco: parseFloat(document.getElementById('add-preco').value),
            Descricao: document.getElementById('add-descricao').value,
            Estoque: parseInt(document.getElementById('add-estoque').value),
            Avaliacao: parseFloat(document.getElementById('add-avaliacao').value),
            Categoria: document.getElementById('add-categoria').value,
        };

        try {
            // Envia o (POST) para a API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoProduto),
            });

            if (!response.ok) {
                const erroMsg = await response.text();
                throw new Error('Erro ao criar produto: ' + erroMsg);
            }

            alert('Produto criado com sucesso!');
            location.reload(); // Recarrega a página para mostrar o novo produto

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
}


// ----------------------------------------------------------------
// FUNÇÕES DA PÁGINA DE DETALHE (detalhe.html)
// ----------------------------------------------------------------

// 1. (GET por Código) Busca o produto específico da URL
async function carregarDetalheProduto() {
    // Pega o parâmetro 'codigo' da URL
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('codigo');

    if (!codigo) {
        alert('Código do produto não encontrado na URL.');
        window.location.href = 'index.html'; // Volta pra home
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${codigo}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Produto não encontrado.');
            }
            throw new Error('Erro ao buscar produto.');
        }
        
        const produto = await response.json();

        // Preenche o HTML com os dados do produto
        document.getElementById('detalhe-nome').textContent = produto.Nome;
        document.getElementById('detalhe-descricao').textContent = produto.Descricao || 'Produto sem descrição.';
        document.getElementById('detalhe-preco').textContent = produto.Preco.toFixed(2);
        document.getElementById('detalhe-categoria').textContent = produto.Categoria;
        document.getElementById('detalhe-codigo').textContent = produto.Codigo;
        document.getElementById('detalhe-estoque').textContent = produto.Estoque;
        document.getElementById('detalhe-avaliacao').textContent = produto.Avaliacao.toFixed(2);

        // Configura os botões de Editar e Excluir
        configurarModalEditar(produto);
        configurarBotaoExcluir(produto.Codigo);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// 2. (PUT) Configura o modal de edição
function configurarModalEditar(produto) {
    const form = document.getElementById('form-editar');
    
    // Preenche o formulário com os dados atuais do produto
    document.getElementById('edit-nome').value = produto.Nome;
    document.getElementById('edit-preco').value = produto.Preco;
    document.getElementById('edit-categoria').value = produto.Categoria;
    document.getElementById('edit-estoque').value = produto.Estoque;
    document.getElementById('edit-avaliacao').value = produto.Avaliacao;
    document.getElementById('edit-descricao').value = produto.Descricao;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Monta o objeto JSON com os dados atualizados
        const produtoAtualizado = {
            Nome: document.getElementById('edit-nome').value,
            Preco: parseFloat(document.getElementById('edit-preco').value),
            Descricao: document.getElementById('edit-descricao').value,
            Estoque: parseInt(document.getElementById('edit-estoque').value),
            Avaliacao: parseFloat(document.getElementById('edit-avaliacao').value),
            Categoria: document.getElementById('edit-categoria').value,
        };

        try {
            // Envia o (PUT) para a API (usando o código)
            const response = await fetch(`${apiUrl}/${produto.Codigo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produtoAtualizado),
            });

            if (!response.ok) throw new Error('Falha ao atualizar produto.');

            alert('Produto atualizado com sucesso!');
            location.reload(); // Recarrega a página

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
}

// 3. (DELETE) Configura o botão de excluir
function configurarBotaoExcluir(codigo) {
    const btn = document.getElementById('btn-excluir');
    
    btn.addEventListener('click', async () => {
        
        // Confirmação de exclusão (Requisito da Atividade)
        if (!confirm('Tem certeza que deseja excluir este produto? Esta ação é irreversível.')) {
            return; // Cancela se o usuário clicar em "Cancelar"
        }

        try {
            // Envia o (DELETE) para a API
            const response = await fetch(`${apiUrl}/${codigo}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Falha ao excluir produto.');

            alert('Produto excluído com sucesso!');
            window.location.href = 'index.html'; // Envia o usuário de volta para a Home

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
}