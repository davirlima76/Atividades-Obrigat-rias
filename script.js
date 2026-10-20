
const CHAVE_LIVROS = "biblioteca_livros";
const CHAVE_EMPRESTIMOS = "biblioteca_emprestimos";

let livros = carregar(CHAVE_LIVROS);
let emprestimos = carregar(CHAVE_EMPRESTIMOS);

function carregar(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
        return [];
    }
}

function salvar() {
    localStorage.setItem(CHAVE_LIVROS, JSON.stringify(livros));
    localStorage.setItem(CHAVE_EMPRESTIMOS, JSON.stringify(emprestimos));
}

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// LOGIN DEMONSTRATIVO
document.getElementById("formLogin").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erroLogin");

    if (usuario === "admin" && senha === "1234") {
        document.getElementById("login").classList.add("oculto");
        document.getElementById("sistema").classList.remove("oculto");
        erro.textContent = "";

        mostrarTela("principal");
        atualizarSistema();
    } else {
        erro.textContent = "Usuário ou senha incorretos.";
    }
});

// SAIR
document.getElementById("btnSair").addEventListener("click", function() {
    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
    document.getElementById("formLogin").reset();
});

// NAVEGAÇÃO ENTRE AS TELAS
document.querySelectorAll("nav button").forEach(botao => {
    botao.addEventListener("click", function() {
        mostrarTela(this.dataset.tela);
    });
});

function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.add("oculto");
    });

    document.getElementById(id).classList.remove("oculto");
    atualizarSistema();
}

// CADASTRO DE LIVROS
document.getElementById("formLivro").addEventListener("submit", function(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const isbn = document.getElementById("isbn").value.trim();

    const codigoExiste = livros.some(livro =>
        livro.isbn.toLowerCase() === isbn.toLowerCase()
    );

    if (codigoExiste) {
        alert("Já existe um livro com esse ISBN ou código.");
        return;
    }

    livros.push({
        id: criarId(),
        titulo,
        autor,
        isbn
    });

    salvar();
    this.reset();
    atualizarSistema();

    alert("Livro cadastrado com sucesso!");
});

// EXCLUIR LIVRO
function excluirLivro(id) {
    const possuiEmprestimo = emprestimos.some(emprestimo =>
        emprestimo.livroId === id && emprestimo.status === "Emprestado"
    );

    if (possuiEmprestimo) {
        alert("Não é possível excluir um livro emprestado.");
        return;
    }

    if (!confirm("Deseja realmente excluir este livro?")) {
        return;
    }

    livros = livros.filter(livro => livro.id !== id);

    // Preserva o histórico dos empréstimos já registrados.
    salvar();
    atualizarSistema();
}

// CADASTRO DE EMPRÉSTIMOS
document.getElementById("formEmprestimo").addEventListener("submit", function(event) {
    event.preventDefault();

    const livroId = document.getElementById("livroEmprestimo").value;
    const leitor = document.getElementById("nomeLeitor").value.trim();
    const dataDevolucao = document.getElementById("dataDevolucao").value;

    const livro = livros.find(item => item.id === livroId);

    if (!livro) {
        alert("Selecione um livro válido.");
        return;
    }

    const jaEmprestado = emprestimos.some(emprestimo =>
        emprestimo.livroId === livroId &&
        emprestimo.status === "Emprestado"
    );

    if (jaEmprestado) {
        alert("Este livro já está emprestado.");
        return;
    }

    const hoje = dataLocal();

    if (dataDevolucao < hoje) {
        alert("A data de devolução não pode ser anterior a hoje.");
        return;
    }

    emprestimos.push({
        id: criarId(),
        livroId,
        tituloLivro: livro.titulo,
        leitor,
        dataEmprestimo: hoje,
        dataDevolucao,
        status: "Emprestado"
    });

    salvar();
    this.reset();
    atualizarSistema();

    alert("Empréstimo registrado com sucesso!");
});

// REGISTRAR DEVOLUÇÃO
function devolverLivro(id) {
    const emprestimo = emprestimos.find(item => item.id === id);

    if (!emprestimo || emprestimo.status !== "Emprestado") {
        return;
    }

    if (!confirm("Confirmar a devolução deste livro?")) {
        return;
    }

    emprestimo.status = "Devolvido";

    salvar();
    atualizarSistema();
}

// DATA LOCAL NO FORMATO AAAA-MM-DD
function dataLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function criarId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 10);
}

// ATUALIZA AS INFORMAÇÕES DO SISTEMA
function atualizarSistema() {
    atualizarResumo();
    atualizarLivros();
    atualizarOpcoesLivros();
    atualizarEmprestimos();
}

function atualizarResumo() {
    const ativos = emprestimos.filter(item =>
        item.status === "Emprestado"
    ).length;

    const devolvidos = emprestimos.filter(item =>
        item.status === "Devolvido"
    ).length;

    document.getElementById("totalLivros").textContent = livros.length;
    document.getElementById("totalEmprestimos").textContent = ativos;
    document.getElementById("totalDevolvidos").textContent = devolvidos;
}

// LISTA DE LIVROS
function atualizarLivros() {
    const tabela = document.getElementById("listaLivros");

    if (livros.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhum livro cadastrado.</td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = livros.map(livro => {
        const emprestado = emprestimos.some(item =>
            item.livroId === livro.id &&
            item.status === "Emprestado"
        );

        return `
            <tr>
                <td>${escapar(livro.titulo)}</td>
                <td>${escapar(livro.autor)}</td>
                <td>${escapar(livro.isbn)}</td>
                <td class="status">
                    ${emprestado ? "Emprestado" : "Disponível"}
                </td>
                <td>
                    <button class="btn-excluir"
                        data-acao="excluir-livro"
                        data-id="${livro.id}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// OPÇÕES DE LIVROS DISPONÍVEIS
function atualizarOpcoesLivros() {
    const select = document.getElementById("livroEmprestimo");
    const valorAnterior = select.value;

    const disponiveis = livros.filter(livro =>
        !emprestimos.some(item =>
            item.livroId === livro.id &&
            item.status === "Emprestado"
        )
    );

    select.innerHTML = `
        <option value="">Selecione um livro</option>
        ${disponiveis.map(livro => `
            <option value="${livro.id}">
                ${escapar(livro.titulo)} - ${escapar(livro.autor)}
            </option>
        `).join("")}
    `;

    if (disponiveis.some(livro => livro.id === valorAnterior)) {
        select.value = valorAnterior;
    }
}

// LISTA DE EMPRÉSTIMOS
function atualizarEmprestimos() {
    const tabela = document.getElementById("listaEmprestimos");

    if (emprestimos.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">Nenhum empréstimo registrado.</td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = emprestimos.map(item => {
        const nomeLivro = item.tituloLivro ||
            livros.find(livro => livro.id === item.livroId)?.titulo ||
            "Livro excluído";

        const acao = item.status === "Emprestado"
            ? `<button data-acao="devolver" data-id="${item.id}">
                   Devolver
               </button>`
            : "Finalizado";

        return `
            <tr>
                <td>${escapar(nomeLivro)}</td>
                <td>${escapar(item.leitor)}</td>
                <td>${formatarData(item.dataEmprestimo)}</td>
                <td>${formatarData(item.dataDevolucao)}</td>
                <td class="status">${escapar(item.status)}</td>
                <td>${acao}</td>
            </tr>
        `;
    }).join("");
}

// AÇÕES DOS BOTÕES DAS TABELAS
document.addEventListener("click", function(event) {
    const botao = event.target.closest("button[data-acao]");

    if (!botao) return;

    const id = botao.dataset.id;

    if (botao.dataset.acao === "excluir-livro") {
        excluirLivro(id);
    }

    if (botao.dataset.acao === "devolver") {
        devolverLivro(id);
    }
});

// INICIALIZAÇÃO
atualizarSistema();
