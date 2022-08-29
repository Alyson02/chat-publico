let nomeUsuario = "";
let tempoUltimaMensagem = 0;
let para = "Todos";
let tipo = "message";
let participantes = [];

entrar();

async function entrar() {
  const btnEntrar = document.querySelector("#entrar");
  const campoNome = document.querySelector("#campoNome");

  campoNome.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btnEntrar.click();
  });

  btnEntrar.addEventListener("click", async (e) => {
    nomeUsuario = campoNome.value;
    e.prevent;

    await axios
      .post("https://mock-api.driven.com.br/api/v6/uol/participants", {
        name: campoNome.value,
      })
      .then((r) => {
        console.log(r);
        document.querySelector(".identificacao").classList.add("escondido");
        document.querySelector(".home").classList.remove("escondido");
        carregaMensagens();
        carregaParticipantes();
        setInterval(async () => {
          await axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {
            name: campoNome.value,
          });
          carregaMensagens();
        }, 5000);
        setInterval(() => {
          carregaParticipantes();
        }, 10000);
      })
      .catch((r) => {
        console.log(r);
        notificar("Nome não disponível.", "red");
      });
  });
}

async function carregaMensagens() {
  let mensagens = [];
  await axios
    .get("https://mock-api.driven.com.br/api/v6/uol/messages")
    .then((res) => {
      console.log(res.data, "mensagens");
      mensagens = res.data;
    });
  mensagens.forEach((mensagem) => criaMensagem(mensagem));
}

async function carregaParticipantes() {
  await axios
    .get("https://mock-api.driven.com.br/api/v6/uol/participants")
    .then((res) => {
      participantes = res.data;
    });
  participantes.forEach((participante) => {
    if (participante.name == nomeUsuario) return;
    criaParticipante(participante);
  });
}

function criaMensagem(mensagem) {
  if (mensagem.type == "private_message") {
    if (!(mensagem.to == nomeUsuario)) {
      if (!(mensagem.from == nomeUsuario)) return;
    }
  }

  const chat = document.querySelector(".chat");

  if (chat.childElementCount > 99) {
    chat.innerHTML = "";
  }

  const elementMensagem = document.createElement("div");
  elementMensagem.classList.add("mensagem", `${mensagem.type}`);

  const elementDatetime = document.createElement("span");
  elementDatetime.classList.add("datetime");
  elementDatetime.textContent = `(${mensagem.time})`;

  const elementText = document.createElement("span");
  elementText.classList.add("ow");

  switch (mensagem.type) {
    case "status":
      elementText.innerHTML = `<strong>${mensagem.from}</strong> ${mensagem.text}`;
      break;

    case "private_message":
      elementText.innerHTML = `<strong>${mensagem.from}</strong> 
            reservadamente para <strong>${mensagem.to}</strong>:  ${mensagem.text}`;
      break;

    default:
      elementText.innerHTML = `<strong>${mensagem.from}</strong> 
            para <strong>${mensagem.to}</strong>:  ${mensagem.text}`;
      break;
  }

  elementMensagem.appendChild(elementDatetime);
  elementMensagem.appendChild(elementText);
  chat.appendChild(elementMensagem);

  const tempoAtual = Number(mensagem.time.substring(3, 8).replace(":", ""));
  if (
    (mensagem.type == "message" || mensagem.type == "private_message") &&
    tempoAtual > tempoUltimaMensagem
  ) {
    elementMensagem.scrollIntoView();
    tempoUltimaMensagem = tempoAtual;
  }
}

function criaParticipante(participante) {
  const listaParticipantes = document.querySelector("#participantes");

  if (listaParticipantes.children.length > 13) {
    listaParticipantes.innerHTML = `<li class="selecionado">
    <div class="descricao">
      <ion-icon name="people-sharp"></ion-icon>
      <span>Todos</span>
    </div>
    <ion-icon name="checkmark-outline" id="mark"></ion-icon>
  </li>`;
    ativarOuvinte(listaParticipantes.firstChild);
  }

  const itemLinha = document.createElement("li");

  const div = document.createElement("div");
  div.classList.add("descricao");
  div.innerHTML = `<ion-icon name="person-circle"></ion-icon>
                   <span>${participante.name}</span>`;

  //<ion-icon name="checkmark-outline" class="escondido"></ion-icon>
  const ionIconMark = document.createElement("ion-icon");
  ionIconMark.setAttribute("name", "checkmark-outline");
  ionIconMark.setAttribute("id", "mark");
  ionIconMark.classList.add("escondido");

  itemLinha.appendChild(div);
  itemLinha.appendChild(ionIconMark);
  listaParticipantes.appendChild(itemLinha);
  ativarOuvinte(itemLinha);
}

const btnEnviar = document.querySelector("#btn-enviar");
const mensagem = document.querySelector("#mensagem");

mensagem.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && !e.shiftKey) {
    btnEnviar.click();
    console.log("enviou");
  }
});

btnEnviar.addEventListener("click", (e) => {
  e.preventDefault();
  enviarMensagem(mensagem.value);
  mensagem.value = "";
});

async function enviarMensagem(text) {
  await axios
    .post("https://mock-api.driven.com.br/api/v6/uol/messages", {
      from: nomeUsuario,
      to: para,
      text: text,
      type: tipo, // ou "private_message" para o bônus
    })
    .then((r) => {
      carregaMensagens();
    });
}

const botaoMenu = document.querySelector("#botao-menu");
const bgSideMenu = document.querySelector(".sidemenu-background");

botaoMenu.addEventListener("click", (e) => {
  bgSideMenu.classList.toggle("escondido");
  document.querySelector(".sidemenu").classList.toggle("escondido");
});

bgSideMenu.addEventListener("click", (e) => {
  bgSideMenu.classList.toggle("escondido");
  document.querySelector(".sidemenu").classList.toggle("escondido");
});

function ativarOuvinte(liParticipante) {
  liParticipante.addEventListener("click", (e) => {
    let jaSelecionado = encontrarElemento(
      document.querySelector("#participantes"),
      "selecionado"
    );

    if (jaSelecionado != null) {
      console.log(jaSelecionado, "ja selecionado");
      const mark = jaSelecionado.querySelector("#mark");
      console.log(mark);
      mark.classList.add("escondido");
      jaSelecionado.classList.remove("selecionado")
    }

    liParticipante.classList.add("selecionado");

    para = liParticipante.querySelector(".descricao span").innerHTML;

    const to = document.querySelector(".to");
    to.classList.remove("escondido");
    to.innerHTML = `Enviando para ${para}`;

    const mark = liParticipante.querySelector("#mark");
    mark.classList.remove("escondido");
  });
}

function alterarTipo(el) {
  const jaSelecionado = encontrarElemento(
    document.querySelector("#visibilidades"), "selecionado"
  );

  if (jaSelecionado) {
    console.log(jaSelecionado, "ja selecionado");
    const mark = jaSelecionado.querySelector("#mark");
    console.log(mark);
    mark.classList.add("escondido");
    jaSelecionado.classList.remove("selecionado")
  }

  if (el.innerHTML == "Reservadamente") {
    tipo = "private_message";
    const to = document.querySelector(".to");
    to.classList.remove("escondido");
    to.innerHTML = `Reservadamente para ${para}`;
  }

  const elPai = el.parentNode;
  const markPai = elPai.parentNode;
  markPai.classList.add("selecionado")
  const mark = markPai.querySelector("#mark");
  mark.classList.remove("escondido");
}

function notificar(text, color) {
  Toastify({
    text: text,
    duration: 5000,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: color,
    },
  }).showToast();
}

function encontrarElemento(pai, classe) {
  const filhos = Array.from(pai.children);
  let selecionado;
  filhos.forEach((filho) => {
    if (filho.classList.contains(classe)) selecionado = filho;
  });
  return selecionado;
}
