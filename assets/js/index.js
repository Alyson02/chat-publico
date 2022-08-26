let nomeUsuario = "";

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
        setInterval(async () => {
          await axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {
            name: campoNome.value,
          });
          carregaMensagens();
        }, 5000);
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
      console.log(res.data);
      mensagens = res.data;
    });
  mensagens.forEach((mensagem) => criaMensagem(mensagem));
}

function criaMensagem(mensagem) {
  console.log(nomeUsuario);
  if (mensagem.type == "private_message" && (mensagem.to != nomeUsuario || !mensagem.from == nomeUsuario)) return;

  const chat = document.querySelector(".chat");

  if (chat.childNodes.length > 99) {
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
  elementMensagem.scrollIntoView();
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
      to: "Todos",
      text: text,
      type: "message", // ou "private_message" para o bônus
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