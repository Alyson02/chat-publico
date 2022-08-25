let nomeUsuario = "";

entrar();

async function entrar() {
  const btnEntrar = document.querySelector("#entrar");
  const campoNome = document.querySelector("#campoNome");

  nomeUsuario = campoNome.value;

  campoNome.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btnEntrar.click();
  });

  btnEntrar.addEventListener("click", async (e) => {
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
  if (mensagem.status == "private_message" && mensagem.to != nomeUsuario)
    return;

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
      elementText.innerHTML = `$<strong>${mensagem.from}</strong> 
            reservadamente para <strong>${mensagem.to}</strong>:  ${mensagem.text}`;
      break;

    default:
      elementText.innerHTML = `$<strong>${mensagem.from}</strong> 
            para <strong>${mensagem.to}</strong>:  ${mensagem.text}`;
      break;
  }

  elementMensagem.appendChild(elementDatetime);
  elementMensagem.appendChild(elementText);
  chat.appendChild(elementMensagem);
  elementMensagem.scrollIntoView();
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
