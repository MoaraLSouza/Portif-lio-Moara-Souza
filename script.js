
const secoes = document.querySelectorAll(".secao");

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.15
});

secoes.forEach((secao) => {
    observador.observe(secao);
});

const rodape = document.querySelector("footer");

rodape.textContent = `© ${new Date().getFullYear()} Moara Lima Souza · Feito com HTML, CSS e JavaScript.`;

const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector("#menu");
const linksMenu = document.querySelectorAll("nav a");

function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.textContent = "☰";
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
}

botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");

    botaoMenu.textContent = aberto ? "✕" : "☰";
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

linksMenu.forEach((link) => {
    link.addEventListener("click", () => {
        linksMenu.forEach((item) => item.classList.remove("ativo"));
        link.classList.add("ativo");
        fecharMenu();
    });
});

const formContato = document.querySelector("#form-contato");
const formStatus = document.querySelector("#form-status");
const campoNome = document.querySelector("#nome-msg");
const campoEmail = document.querySelector("#email-msg");
const campoMotivo = document.querySelector("#motivo-msg");
const campoAssunto = document.querySelector("#assunto-msg");
const campoMensagem = document.querySelector("#mensagem-msg");
const containerAssunto = document.querySelector("#container-assunto");
const contador = document.querySelector("#contador-msg");
const botaoEnviar = document.querySelector("#btn-enviar-msg");

const ENDPOINT_FORMULARIO = "https://formspree.io/f/xyewywoq";

function mostrarErro(campo, mensagem) {
    const spanErro = document.getElementById(campo.getAttribute("aria-describedby"));

    if (mensagem) {
        campo.setAttribute("aria-invalid", "true");
        if (spanErro) spanErro.textContent = mensagem;
    } else {
        campo.setAttribute("aria-invalid", "false");
        if (spanErro) spanErro.textContent = "";
    }
}

function validarCampo(campo) {
    let valor = campo.value.trim();
    let temErro = false;

    if (campo === campoNome) {
        if (!valor || valor.length < 3 || valor.length > 80) {
            mostrarErro(campo, "O nome deve ter entre 3 e 80 caracteres.");
            temErro = true;
        } else {
            mostrarErro(campo, "");
        }
    }
    else if (campo === campoEmail) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!valor || !regexEmail.test(valor)) {
            mostrarErro(campo, "Insira um e-mail válido (ex: email@dominio.com).");
            temErro = true;
        } else {
            mostrarErro(campo, "");
        }
    }
    else if (campo === campoMotivo) {
        if (!valor) {
            mostrarErro(campo, "Selecione um motivo.");
            temErro = true;
        } else {
            mostrarErro(campo, "");
        }
    }
    else if (campo === campoAssunto && !campo.disabled) {
        if (!valor || valor.length < 5 || valor.length > 100) {
            mostrarErro(campo, "O assunto deve ter entre 5 e 100 caracteres.");
            temErro = true;
        } else {
            mostrarErro(campo, "");
        }
    }
    else if (campo === campoMensagem) {
        if (!valor || valor.length < 30 || valor.length > 1000) {
            mostrarErro(campo, "A mensagem deve ter entre 30 e 1000 caracteres.");
            temErro = true;
        } else {
            mostrarErro(campo, "");
        }
    }

    return !temErro;
}

const todosCampos = [campoNome, campoEmail, campoMotivo, campoAssunto, campoMensagem];

todosCampos.forEach((campo) => {
    campo.addEventListener("blur", () => validarCampo(campo));

    campo.addEventListener("input", () => {
        if (campo.getAttribute("aria-invalid") === "true") {
            mostrarErro(campo, "");
        }
    });
});

campoMensagem.addEventListener("input", () => {
    contador.textContent = `${campoMensagem.value.length}/1000`;
});

campoMotivo.addEventListener("change", () => {
    const outro = campoMotivo.value === "Outro";

    containerAssunto.classList.toggle("oculto", !outro);
    campoAssunto.disabled = !outro;

    if (!outro) {
        campoAssunto.value = "";
        mostrarErro(campoAssunto, "");
    }
});

formContato.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    formStatus.textContent = "";
    formStatus.className = "status-msg";

    const invalidos = todosCampos.filter((campo) => !validarCampo(campo));

    if (invalidos.length > 0) {
        formStatus.textContent = "Corrija os campos destacados e tente de novo.";
        formStatus.classList.add("erro");
        invalidos[0].focus();
        return;
    }

    const assunto = campoMotivo.value === "Outro"
        ? `${campoMotivo.value}: ${campoAssunto.value.trim()}`
        : campoMotivo.value;

    const dados = new FormData(formContato);
    dados.append("_subject", `Portfólio: ${assunto}`);

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";

    try {
        const resposta = await fetch(ENDPOINT_FORMULARIO, {
            method: "POST",
            body: dados,
            headers: { Accept: "application/json" }
        });

        if (!resposta.ok) {
            throw new Error("Falha no envio");
        }

        formContato.reset();
        contador.textContent = "0/1000";
        containerAssunto.classList.add("oculto");
        campoAssunto.disabled = true;
        todosCampos.forEach((campo) => campo.removeAttribute("aria-invalid"));

        formStatus.textContent = "Mensagem enviada! Obrigada pelo contato.";
        formStatus.classList.add("sucesso");

    } catch (erro) {
        formStatus.textContent = "Não foi possível enviar agora. Tente de novo em instantes ou use os contatos acima.";
        formStatus.classList.add("erro");

    } finally {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Enviar mensagem";
    }
});
