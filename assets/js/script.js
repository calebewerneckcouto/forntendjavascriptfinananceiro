// script.js

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
let currentMonthIndex = new Date().getMonth(); // Mês atual

document.getElementById('prevMonth').addEventListener('click', () => {
    if (currentMonthIndex > 0) {
        currentMonthIndex--;
        updateMonthDisplay();
        loadItemsByMonth();
    }
});

document.getElementById('nextMonth').addEventListener('click', () => {
    if (currentMonthIndex < 11) {
        currentMonthIndex++;
        updateMonthDisplay();
        loadItemsByMonth();
    }
});

function updateMonthDisplay() {
    document.getElementById('currentMonth').textContent = months[currentMonthIndex];
}

async function loadCategorias() {
    try {
        const response = await fetch('http://localhost:8080/listacategoria');
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        const categorias = await response.json();
        const categoriaSelect = document.getElementById('categoria');
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.descricao;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error.message);
    }
}

async function loadItemsByMonth() {
    try {
        const response = await fetch(`http://localhost:8080/listaitemsmes?mes=${currentMonthIndex + 1}`);
        if (!response.ok) {
            throw new Error('Failed to load items');
        }
        const items = await response.json();
        const tabelaBody = document.getElementById('dadosTabela');
        tabelaBody.innerHTML = ''; // Limpa os dados anteriores

        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatarData(item.data)}</td>
                <td>${item.categoria.descricao}</td>
                <td>${item.descricao}</td>
                <td style="color: ${item.categoria.cor};">${"R$ "+ item.valor.toFixed(2)}</td>
                <td>
                    <button onclick="deleteItem(${item.id})">Deletar</button>
                </td>
            `;
            tabelaBody.appendChild(row);
        });

        // Calcula e exibe o total dos valores positivos e negativos
        calcularTotais(items);
    } catch (error) {
        console.error('Error loading items:', error.message);
    }
}

async function salvarItem() {
    const categoriaId = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);

    if (!categoriaId || !data || !descricao || isNaN(valor)) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    // Obtém a descrição da categoria selecionada
    const categoriaSelect = document.getElementById('categoria');
    const categoriaDescricao = categoriaSelect.options[categoriaSelect.selectedIndex].text;

    try {
        const response = await fetch('http://localhost:8080/itemssalvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoria: {
                    id: categoriaId,
                    descricao: categoriaDescricao
                },
                data,
                descricao,
                valor
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save item');
        }

        console.log('Item saved successfully');

        // Limpa os campos após salvar
        document.getElementById('categoria').value = '';
        document.getElementById('data').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('valor').value = '';

        // Recarrega os itens da tabela
        loadItemsByMonth();
    } catch (error) {
        console.error('Error saving item:', error.message);
    }
}

async function deleteItem(itemId) {
    try {
        const response = await fetch(`http://localhost:8080/lista/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        // Recarrega os itens da tabela após deletar
        loadItemsByMonth();
    } catch (error) {
        console.error('Error deleting item:', error.message);
    }
}

function navigateToCategoriaPage() {
    window.location.href = 'categoria.html';
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function calcularTotais(items) {
    let totalPositivo = 0;
    let totalNegativo = 0;

    items.forEach(item => {
        if (item.categoria.cor === 'green') {
            totalPositivo += item.valor;
        } else if (item.categoria.cor === 'red') {
            totalNegativo += item.valor;
        }
    });

    const valorReal = totalPositivo - totalNegativo;
const valorFormatado = valorReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const totalContainer = document.getElementById('totalValor');
totalContainer.innerHTML = `
    <p style="color:green">Receitas: R$ ${totalPositivo.toFixed(2)}</p>
    <p style="color:red">Despesas: R$ ${totalNegativo.toFixed(2)}</p>
    <p style="color:blue">Valor Real: ${valorFormatado}</p>
`;

}

loadCategorias();
updateMonthDisplay();
loadItemsByMonth(); // Carrega os itens do mês atual ao carregar a página
