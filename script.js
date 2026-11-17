"use strict";

const SENHA_ADMIN = "moara2026";
const CHAVE_PROJETOS = "moara_portfolio_projetos_v1";
const ENDPOINT_FORMULARIO = "https://formspree.io/f/xyewywoq";

let modoAdministrador = false;
let filtroAtual = "Todos";
let enviando = false;

const projetosIniciais = [
  {
    id: "projeto-site-banda",
    titulo: "Site de uma banda",
    categoria: "Front-End",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    descricao: "Uma página que iniciou minha trajetória em Front-End, praticando estruturação e estilização de páginas web.",
    link: "https://dontpad.com/CORTIS",
    imagem: "",
    tema: "marinho"
  },
  {
    id: "projeto-carrinho",
    titulo: "Carrinho de compras",
    categoria: "Java",
    tecnologias: ["Java", "POO"],
    descricao: "Exercício acadêmico de lógica de programação com produtos e carrinho de compras.",
    link: "https://github.com/MoaraLSouza/logica-de-programa-o/blob/main/Trabalho%20de%20encerramento",
    imagem: "",
    tema: "indigo"
  },
  {
    id: "projeto-contratos",
    titulo: "Contratos e parcelas",
    categoria: "Java",
    tecnologias: ["Java", "Interfaces"],
    descricao: "Projeto de estudo para praticar interfaces e cálculo de parcelas de um contrato.",
    link: "https://github.com/MoaraLSouza/Contrato-e-parcelas/tree/main",
    imagem: "",
    tema: "lavanda"
  }
];

const elemento = (seletor, raiz = document) => raiz.querySelector(seletor);

const elementos = (seletor, raiz = document) => [
  ...raiz.querySelectorAll(seletor)
];

function copiarProjetosIniciais() {
  return projetosIniciais.map(projeto => ({
    ...projeto,
    tecnologias: [...projeto.tecnologias]
  }));
}

function carregarProjetos() {
  try {
    const salvos = localStorage.getItem(CHAVE_PROJETOS);

    if (!salvos) {
      return copiarProjetosIniciais();
    }

    const dados = JSON.parse(salvos);

    if (!Array.isArray(dados)) {
      return copiarProjetosIniciais();
    }

    return dados.map((projeto, indice) => ({
      id: String(projeto.id || `projeto-${Date.now()}-${indice}`),
      titulo: String(projeto.titulo || "Projeto sem título"),
      categoria: String(projeto.categoria || "Outros"),
      tecnologias: Array.isArray(projeto.tecnologias)
        ? projeto.tecnologias.map(String)
        : [],
      descricao: String(projeto.descricao || ""),
      link: String(projeto.link || ""),
      imagem: String(projeto.imagem || ""),
      tema: ["marinho", "indigo", "lavanda"].includes(projeto.tema)
        ? projeto.tema
        : ["marinho", "indigo", "lavanda"][indice % 3]
    }));
  } catch (erro) {
    console.error("Erro ao carregar projetos:", erro);
    return copiarProjetosIniciais();
  }
}

let projetos = carregarProjetos();

function salvarProjetos() {
  try {
    localStorage.setItem(CHAVE_PROJETOS, JSON.stringify(projetos));
    return true;
  } catch (erro) {
    console.error("Erro ao salvar projetos:", erro);
    mostrarStatusProjeto(
      "Não foi possível salvar. Verifique o armazenamento do navegador.",
      "erro"
    );
    return false;
  }
}

function normalizarTexto(valor) {
  return String(valor).trim().replace(/\s+/g, " ");
}

function urlSegura(valor) {
  if (!valor) return "";

  try {
    const url = new URL(valor.trim());

    if (url.protocol !== "https:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

const listaProjetos = elemento("#lista-projetos");
const botoesFiltro = elemento("#filtro-botoes");
const contadorProjetos = elemento("#contador-projetos");
const semResultados = elemento("#sem-resultados");

function obterCategorias() {
  return [
    ...new Set(
      projetos
        .flatMap(projeto => [
          projeto.categoria,
          ...(projeto.tecnologias || [])
        ])
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function renderizarFiltros() {
  const categorias = obterCategorias();

  if (filtroAtual !== "Todos" && !categorias.includes(filtroAtual)) {
    filtroAtual = "Todos";
  }

  botoesFiltro.replaceChildren();

  ["Todos", ...categorias].forEach(categoria => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `filtro-btn${categoria === filtroAtual ? " ativo" : ""}`;
    botao.dataset.filtro = categoria;
    botao.textContent = categoria;
    botao.setAttribute("aria-pressed", String(categoria === filtroAtual));

    botao.addEventListener("click", () => {
      filtroAtual = categoria;
      renderizarFiltros();
      renderizarProjetos();
    });

    botoesFiltro.append(botao);
  });
}

function criarCardProjeto(projeto, indice) {
  const card = document.createElement("article");

  const temas = ["marinho", "indigo", "lavanda"];

  const tema = temas.includes(projeto.tema)
    ? projeto.tema
    : temas[indice % temas.length];

  card.className = `projeto projeto-${tema}`;
  card.dataset.projetoId = projeto.id;

  const imagemUrl = urlSegura(projeto.imagem || "");

  if (imagemUrl) {
    const imagem = document.createElement("img");

    imagem.className = "projeto-imagem";
    imagem.src = imagemUrl;
    imagem.alt = `Imagem do projeto ${projeto.titulo}`;
    imagem.loading = "lazy";

    imagem.addEventListener("error", () => imagem.remove(), {
      once: true
    });

    card.append(imagem);
  }

  const conteudo = document.createElement("div");
  conteudo.className = "projeto-conteudo";

  const tipo = document.createElement("p");
  tipo.className = "tipo";
  tipo.textContent = (projeto.tecnologias || []).join(" · ");

  const titulo = document.createElement("h3");
  titulo.textContent = projeto.titulo;

  const descricao = document.createElement("p");
  descricao.textContent = projeto.descricao;

  const tecnologias = document.createElement("div");
  tecnologias.className = "projeto-tecnologias";

  (projeto.tecnologias || []).forEach(tecnologia => {
    const tag = document.createElement("span");
    tag.textContent = tecnologia;
    tecnologias.append(tag);
  });

  conteudo.append(tipo, titulo, descricao, tecnologias);

  const link = urlSegura(projeto.link || "");

  if (link) {
    const ancora = document.createElement("a");

    ancora.href = link;
    ancora.target = "_blank";
    ancora.rel = "noopener noreferrer";
    ancora.textContent = "Ver projeto ↗";

    conteudo.append(ancora);
  } else {
    const semLink = document.createElement("span");

    semLink.className = "projeto-sem-link";
    semLink.textContent = "Link do projeto ainda não disponível";

    conteudo.append(semLink);
  }

  const acoes = document.createElement("div");
  acoes.className = "acoes-card";
  acoes.hidden = !modoAdministrador;

  const editar = document.createElement("button");

  editar.type = "button";
  editar.className = "acao-card";
  editar.textContent = "Editar";
  editar.setAttribute("aria-label", `Editar ${projeto.titulo}`);

  editar.addEventListener("click", () => {
    iniciarEdicao(projeto.id);
  });

  const remover = document.createElement("button");

  remover.type = "button";
  remover.className = "acao-card";
  remover.textContent = "Remover";
  remover.setAttribute("aria-label", `Remover ${projeto.titulo}`);

  remover.addEventListener("click", () => {
    removerProjeto(projeto.id);
  });

  acoes.append(editar, remover);
  conteudo.append(acoes);
  card.append(conteudo);

  return card;
}

function renderizarProjetos() {
  const encontrados = projetos.filter(projeto => {
    return (
      filtroAtual === "Todos" ||
      projeto.categoria === filtroAtual ||
      (projeto.tecnologias || []).includes(filtroAtual)
    );
  });

  const cards = encontrados.map((projeto, indice) => {
    return criarCardProjeto(projeto, indice);
  });

  listaProjetos.replaceChildren(...cards);

  contadorProjetos.textContent =
    `${encontrados.length} ${
      encontrados.length === 1
        ? "projeto encontrado"
        : "projetos encontrados"
    }`;

  semResultados.hidden = encontrados.length !== 0;
  listaProjetos.hidden = encontrados.length === 0;
}

const formProjeto = elemento("#form-projeto");
const statusProjeto = elemento("#status-projeto");
const campoProjetoId = elemento("#projeto-id");
const painelGerenciador = elemento("#gerenciador");

const camposProjeto = {
  titulo: elemento("#projeto-titulo"),
  categoria: elemento("#projeto-categoria"),
  tecnologias: elemento("#projeto-tecnologias"),
  descricao: elemento("#projeto-descricao"),
  link: elemento("#projeto-link"),
  imagem: elemento("#projeto-imagem")
};

const botaoSalvarProjeto = elemento("#salvar-projeto");
const botaoCancelarEdicao = elemento("#cancelar-edicao");
const botaoSairAdmin = elemento("#sair-admin");
const botaoAcessoAdmin = elemento("#acesso-admin");

function mostrarStatusProjeto(mensagem, tipo = "") {
  statusProjeto.textContent = mensagem;
  statusProjeto.className = `status-msg${tipo ? ` ${tipo}` : ""}`;
}

function entrarNoModoAdministrador() {
  const tentativa = window.prompt(
    "Digite a senha para abrir a área administrativa:"
  );

  if (tentativa === null) {
    return;
  }

  if (tentativa !== SENHA_ADMIN) {
    window.alert("Senha incorreta.");
    return;
  }

  modoAdministrador = true;
  painelGerenciador.hidden = false;

  renderizarProjetos();

  painelGerenciador.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  mostrarStatusProjeto("Acesso administrativo liberado.", "sucesso");
}

function sairDoModoAdministrador() {
  modoAdministrador = false;

  painelGerenciador.hidden = true;

  limparFormularioProjeto();

  renderizarProjetos();
}

botaoAcessoAdmin.addEventListener("click", entrarNoModoAdministrador);
botaoSairAdmin.addEventListener("click", sairDoModoAdministrador);

function erroProjeto(nomeCampo, mensagem) {
  const campo = camposProjeto[nomeCampo];
  const saida = elemento(`#erro-projeto-${nomeCampo}`);

  campo.setAttribute("aria-invalid", String(Boolean(mensagem)));
  saida.textContent = mensagem;
}

function validarFormularioProjeto() {
  let primeiroInvalido = null;

  const valores = {
    titulo: normalizarTexto(camposProjeto.titulo.value),
    categoria: normalizarTexto(camposProjeto.categoria.value),
    tecnologias: normalizarTexto(camposProjeto.tecnologias.value),
    descricao: normalizarTexto(camposProjeto.descricao.value),
    link: normalizarTexto(camposProjeto.link.value),
    imagem: normalizarTexto(camposProjeto.imagem.value)
  };

  const regras = {
    titulo: [
      valores.titulo.length >= 2 && valores.titulo.length <= 70,
      "Informe um título entre 2 e 70 caracteres."
    ],
    categoria: [
      valores.categoria.length >= 2 && valores.categoria.length <= 35,
      "Informe uma categoria entre 2 e 35 caracteres."
    ],
    tecnologias: [
      valores.tecnologias.length > 0 && valores.tecnologias.length <= 120,
      "Informe ao menos uma tecnologia."
    ],
    descricao: [
      valores.descricao.length >= 10 && valores.descricao.length <= 240,
      "A descrição deve ter entre 10 e 240 caracteres."
    ],
    link: [
      !valores.link || Boolean(urlSegura(valores.link)),
      "Informe uma URL válida começando com https://."
    ],
    imagem: [
      !valores.imagem || Boolean(urlSegura(valores.imagem)),
      "Informe uma URL de imagem válida começando com https://."
    ]
  };

  Object.entries(regras).forEach(([nome, [valido, mensagem]]) => {
    erroProjeto(nome, valido ? "" : mensagem);

    if (!valido && !primeiroInvalido) {
      primeiroInvalido = camposProjeto[nome];
    }
  });

  return {
    valido: !primeiroInvalido,
    primeiroInvalido,
    valores
  };
}

function limparFormularioProjeto() {
  formProjeto.reset();
  campoProjetoId.value = "";

  Object.keys(camposProjeto).forEach(nome => {
    erroProjeto(nome, "");
  });

  botaoSalvarProjeto.textContent = "Adicionar projeto";
  botaoCancelarEdicao.hidden = true;
  mostrarStatusProjeto("");
}

function iniciarEdicao(id) {
  const projeto = projetos.find(item => item.id === id);

  if (!projeto) {
    return;
  }

  campoProjetoId.value = projeto.id;
  camposProjeto.titulo.value = projeto.titulo;
  camposProjeto.categoria.value = projeto.categoria;
  camposProjeto.tecnologias.value = (projeto.tecnologias || []).join(", ");
  camposProjeto.descricao.value = projeto.descricao;
  camposProjeto.link.value = projeto.link || "";
  camposProjeto.imagem.value = projeto.imagem || "";

  botaoSalvarProjeto.textContent = "Salvar alterações";
  botaoCancelarEdicao.hidden = false;

  mostrarStatusProjeto(`Editando: ${projeto.titulo}`);

  elemento("#titulo-gerenciador").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  camposProjeto.titulo.focus({
    preventScroll: true
  });
}

function removerProjeto(id) {
  const projeto = projetos.find(item => item.id === id);

  if (!projeto) {
    return;
  }

  const confirmado = window.confirm(
    `Tem certeza de que deseja remover o projeto "${projeto.titulo}"?`
  );

  if (!confirmado) {
    return;
  }

  const projetosAnteriores = projetos;

  projetos = projetos.filter(item => item.id !== id);

  if (!salvarProjetos()) {
    projetos = projetosAnteriores;
    return;
  }

  if (campoProjetoId.value === id) {
    limparFormularioProjeto();
  }

  renderizarFiltros();
  renderizarProjetos();

  mostrarStatusProjeto("Projeto removido com sucesso.", "sucesso");
}

formProjeto.addEventListener("submit", evento => {
  evento.preventDefault();

  const resultado = validarFormularioProjeto();

  if (!resultado.valido) {
    mostrarStatusProjeto(
      "Revise os campos destacados antes de salvar.",
      "erro"
    );

    resultado.primeiroInvalido.focus();
    return;
  }

  const valores = resultado.valores;

  const tecnologias = [
    ...new Set(
      valores.tecnologias
        .split(",")
        .map(normalizarTexto)
        .filter(Boolean)
    )
  ];

  const idExistente = campoProjetoId.value;

  const projetoAtual = idExistente
    ? projetos.find(item => item.id === idExistente)
    : null;

  const novoProjeto = {
    id: idExistente || `projeto-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    titulo: valores.titulo,
    categoria: valores.categoria,
    tecnologias,
    descricao: valores.descricao,
    link: valores.link,
    imagem: valores.imagem,
    tema: projetoAtual?.tema ||
      ["marinho", "indigo", "lavanda"][projetos.length % 3]
  };

  const projetosAnteriores = projetos;

  if (idExistente) {
    projetos = projetos.map(item =>
      item.id === idExistente ? novoProjeto : item
    );
  } else {
    projetos = [...projetos, novoProjeto];
  }

  if (!salvarProjetos()) {
    projetos = projetosAnteriores;
    return;
  }

  limparFormularioProjeto();

  filtroAtual = "Todos";

  renderizarFiltros();
  renderizarProjetos();

  mostrarStatusProjeto(
    idExistente
      ? "Projeto atualizado com sucesso!"
      : "Projeto adicionado com sucesso!",
    "sucesso"
  );
});

botaoCancelarEdicao.addEventListener("click", () => {
  limparFormularioProjeto();
  mostrarStatusProjeto("Edição cancelada.");
});

Object.entries(camposProjeto).forEach(([nome, campo]) => {
  campo.addEventListener("input", () => {
    if (campo.getAttribute("aria-invalid") === "true") {
      erroProjeto(nome, "");
    }
  });
});

const secoes = elementos(".secao");

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(
    entradas => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  secoes.forEach(secao => observador.observe(secao));
} else {
  secoes.forEach(secao => secao.classList.add("visivel"));
}

const botaoMenu = elemento(".menu-botao");
const menu = elemento("#menu");
const linksMenu = elementos("#menu a");

function fecharMenu() {
  menu.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
}

botaoMenu.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");

  botaoMenu.setAttribute("aria-expanded", String(aberto));
  botaoMenu.setAttribute(
    "aria-label",
    aberto ? "Fechar menu" : "Abrir menu"
  );
});

linksMenu.forEach(link => {
  link.addEventListener("click", () => {
    linksMenu.forEach(item => item.classList.remove("ativo"));

    link.classList.add("ativo");

    fecharMenu();
  });
});

document.addEventListener("keydown", evento => {
  if (evento.key === "Escape" && menu.classList.contains("aberto")) {
    fecharMenu();
    botaoMenu.focus();
  }
});

const btnTema = elemento("#btn-tema");
const iconeTema = elemento("#icone-tema");

function carregarTema() {
  try {
    return localStorage.getItem("tema") === "dark";
  } catch {
    return false;
  }
}

function aplicarTema(escuro) {
  document.body.classList.toggle("dark-mode", escuro);
  iconeTema.textContent = escuro ? "☀️" : "🌙";

  btnTema.setAttribute(
    "aria-label",
    escuro ? "Ativar modo claro" : "Ativar modo escuro"
  );
}

aplicarTema(carregarTema());

btnTema.addEventListener("click", () => {
  const escuro = !document.body.classList.contains("dark-mode");

  aplicarTema(escuro);

  try {
    localStorage.setItem("tema", escuro ? "dark" : "light");
  } catch (erro) {
    console.error("Não foi possível salvar a preferência de tema:", erro);
  }
});

const formContato = elemento("#form-contato");
const formStatus = elemento("#form-status");
const campoNome = elemento("#nome-msg");
const campoEmail = elemento("#email-msg");
const campoMotivo = elemento("#motivo-msg");
const campoAssunto = elemento("#assunto-msg");
const campoMensagem = elemento("#mensagem-msg");
const containerAssunto = elemento("#container-assunto");
const contador = elemento("#contador-msg");
const botaoEnviar = elemento("#btn-enviar-msg");

const camposContato = [
  campoNome,
  campoEmail,
  campoMotivo,
  campoAssunto,
  campoMensagem
];

function valorUtil(campo) {
  return campo.value.trim();
}

function tamanhoUtil(campo) {
  return valorUtil(campo).length;
}

function mostrarErroContato(campo, mensagem) {
  const idMensagem = campo
    .getAttribute("aria-describedby")
    ?.split(" ")
    .find(id => id.startsWith("erro-"));

  const spanErro = idMensagem
    ? document.getElementById(idMensagem)
    : null;

  campo.setAttribute("aria-invalid", String(Boolean(mensagem)));

  if (spanErro) {
    spanErro.textContent = mensagem;
  }
}

function validarCampoContato(campo) {
  const valor = valorUtil(campo);
  let mensagem = "";

  if (campo === campoNome && (valor.length < 3 || valor.length > 80)) {
    mensagem = "O nome deve ter entre 3 e 80 caracteres.";
  }

  if (campo === campoEmail && (!campo.validity.valid || !valor)) {
    mensagem = "Insira um endereço de e-mail em formato válido.";
  }

  if (campo === campoMotivo && !valor) {
    mensagem = "Selecione um motivo para o contato.";
  }

  if (
    campo === campoAssunto &&
    !campo.disabled &&
    (valor.length < 5 || valor.length > 100)
  ) {
    mensagem = "O assunto deve ter entre 5 e 100 caracteres.";
  }

  if (
    campo === campoMensagem &&
    (valor.length < 30 || valor.length > 1000)
  ) {
    mensagem = "A mensagem deve ter entre 30 e 1000 caracteres.";
  }

  mostrarErroContato(campo, mensagem);

  return !mensagem;
}

function atualizarAssuntoCondicional() {
  const precisaAssunto = campoMotivo.value === "Outro";

  containerAssunto.classList.toggle("oculto", !precisaAssunto);

  campoAssunto.disabled = !precisaAssunto;
  campoAssunto.required = precisaAssunto;

  if (!precisaAssunto) {
    campoAssunto.value = "";
    mostrarErroContato(campoAssunto, "");
  }
}

function atualizarContador() {
  contador.textContent = `${tamanhoUtil(campoMensagem)}/1000`;
}

function mostrarStatusContato(mensagem, tipo = "") {
  formStatus.textContent = mensagem;
  formStatus.className = `status-msg${tipo ? ` ${tipo}` : ""}`;
}

camposContato.forEach(campo => {
  campo.addEventListener("blur", () => {
    validarCampoContato(campo);
  });

  campo.addEventListener("input", () => {
    if (campo === campoMensagem) {
      atualizarContador();
    }

    if (campo.getAttribute("aria-invalid") === "true") {
      validarCampoContato(campo);
    }

    if (formStatus.textContent) {
      mostrarStatusContato("");
    }
  });
});

campoMotivo.addEventListener("change", () => {
  atualizarAssuntoCondicional();
  validarCampoContato(campoMotivo);

  if (formStatus.textContent) {
    mostrarStatusContato("");
  }
});

formContato.addEventListener("submit", async evento => {
  evento.preventDefault();

  if (enviando) {
    return;
  }

  mostrarStatusContato("");
  atualizarAssuntoCondicional();

  const camposAtivos = camposContato.filter(campo => !campo.disabled);

  const invalidos = camposAtivos.filter(campo => {
    return !validarCampoContato(campo);
  });

  if (invalidos.length) {
    mostrarStatusContato(
      "Corrija os campos destacados e tente novamente.",
      "erro"
    );

    invalidos[0].focus();
    return;
  }

  const dados = new FormData(formContato);

  ["nome", "email", "motivo", "assunto", "mensagem"].forEach(nome => {
    if (dados.has(nome)) {
      dados.set(nome, String(dados.get(nome)).trim());
    }
  });

  const assuntoEmail = campoMotivo.value === "Outro"
    ? `Outro: ${valorUtil(campoAssunto)}`
    : campoMotivo.value;

  dados.set("_subject", `Portfólio: ${assuntoEmail}`);

  enviando = true;
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  mostrarStatusContato("Sua mensagem está sendo enviada...");

  try {
    const resposta = await fetch(ENDPOINT_FORMULARIO, {
      method: "POST",
      body: dados,
      headers: {
        Accept: "application/json"
      }
    });

    if (!resposta.ok) {
      let detalhe = "";

      try {
        const corpo = await resposta.json();

        detalhe = corpo.errors
          ?.map(item => item.message)
          .join(" ");
      } catch {
        detalhe = "";
      }

      throw new Error(
        detalhe || `O serviço respondeu com status ${resposta.status}.`
      );
    }

    formContato.reset();

    atualizarAssuntoCondicional();
    atualizarContador();

    camposContato.forEach(campo => {
      mostrarErroContato(campo, "");
    });

    mostrarStatusContato(
      "Mensagem enviada! Obrigada pelo contato.",
      "sucesso"
    );
  } catch (erro) {
    console.error("Erro ao enviar formulário:", erro);

    mostrarStatusContato(
      "Não foi possível enviar agora. Seus dados foram mantidos; tente novamente ou use o e-mail informado acima.",
      "erro"
    );
  } finally {
    enviando = false;
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Enviar mensagem";
  }
});

function inicializar() {
  renderizarFiltros();
  renderizarProjetos();

  atualizarAssuntoCondicional();
  atualizarContador();

  elemento("#ano-atual").textContent = new Date().getFullYear();
}

inicializar();
