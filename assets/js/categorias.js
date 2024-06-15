// categorias.js

document.addEventListener('DOMContentLoaded', function() {
    carregarCategorias();
});

async function carregarCategorias() {
    try {
        const response = await fetch('http://localhost:8080/listacategoria');
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        const categorias = await response.json();
        const tabelaCategorias = document.getElementById('tabelaCategorias');
        tabelaCategorias.innerHTML = ''; // Limpa os dados anteriores

        categorias.forEach(categoria => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.id}</td>
                <td>${categoria.descricao}</td>
                <td><div style="width: 20px; height: 20px; background-color: ${categoria.cor};"></div></td>
                <td>${categoria.gastos ? 'Sim' : 'Não'}</td>
                <td>
                    <button onclick="deletarCategoria(${categoria.id})">Deletar</button>
                </td>
            `;
            tabelaCategorias.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading categories:', error.message);
    }
}

async function salvarCategoria() {
    const descricao = document.getElementById('descricao').value;
    const cor = document.getElementById('cor').value;
    const gastos = document.getElementById('gastos').checked;

    if (!descricao) {
        alert('Preencha a descrição da categoria.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/categoriasalvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                descricao: descricao,
                cor: cor,
                gastos: gastos
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save category');
        }

        console.log('Category saved successfully');

        // Limpa os campos após salvar
        document.getElementById('descricao').value = '';
        document.getElementById('cor').value = 'red'; // Voltando para a opção padrão 'red'
        document.getElementById('gastos').checked = false;

        // Recarrega a tabela de categorias
        carregarCategorias();
    } catch (error) {
        console.error('Error saving category:', error.message);
    }
}

async function deletarCategoria(id) {
    try {
        const response = await fetch(`http://localhost:8080/listarcategorias/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete category');
        }

        console.log('Category deleted successfully');

        // Recarrega a tabela de categorias
        carregarCategorias();
    } catch (error) {
        console.error('Error deleting category:', error.message);
    }
}
