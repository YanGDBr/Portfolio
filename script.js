const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Vitrine da abertura ----------
// Uma moldura por tipo de tela. A frase digitada acompanha a moldura,
// e a barra da aba ativa (animação CSS "enche") marca o tempo até a próxima.
const vitrine = document.querySelector("[data-vitrine]");

if (vitrine) {
  const abertura = vitrine.closest(".abertura");
  const itens = [...vitrine.querySelectorAll(".vitrine-item")];
  const abas = [...vitrine.querySelectorAll("[data-aba]")];
  const pausa = vitrine.querySelector("[data-pausa]");
  const alvo = document.querySelector("[data-digitar]");
  let atual = 0;
  let digitando;

  function digitar(texto) {
    clearTimeout(digitando);
    if (calmo) {
      alvo.textContent = texto;
      return;
    }
    const escrever = (n) => {
      alvo.textContent = texto.slice(0, n);
      if (n < texto.length) digitando = setTimeout(() => escrever(n + 1), 55);
    };
    const apagar = () => {
      const resto = alvo.textContent.slice(0, -1);
      alvo.textContent = resto;
      digitando = setTimeout(resto ? apagar : () => escrever(1), resto ? 22 : 120);
    };
    apagar();
  }

  function mostrar(indice) {
    if (indice === atual) return;
    const sai = itens[atual];
    const entra = itens[indice];

    itens.forEach((item) => {
      if (item !== sai && item !== entra) {
        item.hidden = true;
        item.classList.remove("saindo");
      }
    });

    if (calmo) {
      sai.hidden = true;
    } else {
      sai.classList.add("saindo");
      setTimeout(() => {
        if (sai.classList.contains("saindo")) {
          sai.hidden = true;
          sai.classList.remove("saindo");
        }
      }, 240);
    }

    entra.classList.remove("saindo");
    entra.hidden = false;
    abas.forEach((aba, i) => aba.setAttribute("aria-pressed", String(i === indice)));
    atual = indice;
    digitar(entra.dataset.frase);
  }

  function tocar(ligado) {
    abertura.classList.toggle("tocando", ligado);
    pausa.textContent = ligado ? "Pausar" : "Continuar";
  }

  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => {
      tocar(false);
      mostrar(i);
    });
  });

  if (!calmo) {
    pausa.hidden = false;
    pausa.addEventListener("click", () => tocar(!abertura.classList.contains("tocando")));

    // O fim da barra de tempo da aba ativa passa para a próxima tela.
    vitrine.addEventListener("animationend", (evento) => {
      if (evento.animationName === "enche") mostrar((atual + 1) % itens.length);
    });

    // Quem está olhando ou navegando pela vitrine não é interrompido.
    const suspender = (sim) => abertura.classList.toggle("suspensa", sim);
    vitrine.addEventListener("pointerenter", () => suspender(true));
    vitrine.addEventListener("pointerleave", () => suspender(false));
    vitrine.addEventListener("focusin", () => suspender(true));
    vitrine.addEventListener("focusout", () => suspender(false));

    tocar(true);
  }
}

// ---------- Capturas de cada projeto ----------
document.querySelectorAll("[data-vistas]").forEach((palco) => {
  const imagens = palco.querySelectorAll(".tela img");
  const botoes = palco.querySelectorAll(".vistas button");

  botoes.forEach((botao, indice) => {
    botao.addEventListener("click", () => {
      botoes.forEach((b, i) => b.setAttribute("aria-pressed", String(i === indice)));
      imagens.forEach((img, i) => (img.hidden = i !== indice));
    });
  });
});

// ---------- Entrada ao rolar ----------
const aoAparecer = (elementos, acao, opcoes) => {
  if (!("IntersectionObserver" in window)) {
    elementos.forEach(acao);
    return;
  }
  const olho = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        olho.unobserve(entrada.target);
        acao(entrada.target);
      }
    });
  }, opcoes);
  elementos.forEach((el) => olho.observe(el));
};

aoAparecer(
  document.querySelectorAll("[data-revelar], [data-cascata]"),
  (el) => el.classList.add("visivel"),
  { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
);

// ---------- O laço do "Sobre mim" ----------
// tentar, errar, aprender, duas voltas, e então o return fica aceito.
aoAparecer(
  document.querySelectorAll("[data-laco]"),
  (trecho) => {
    const passos = [...trecho.querySelectorAll("[data-passo]")];
    const fim = trecho.querySelector("[data-fim]");
    if (calmo) {
      fim.classList.add("aceita");
      return;
    }
    const voltas = 2;
    let n = 0;
    const andar = () => {
      passos.forEach((p) => p.classList.remove("na-vez"));
      if (n < passos.length * voltas) {
        passos[n % passos.length].classList.add("na-vez");
        n += 1;
        setTimeout(andar, 520);
      } else {
        fim.classList.add("aceita");
      }
    };
    setTimeout(andar, 500);
  },
  { threshold: 0.6 },
);

// ---------- Copiar o e-mail ----------
document.querySelectorAll("[data-copiar]").forEach((botao) => {
  const rotulo = botao.textContent;
  let volta;

  botao.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(botao.dataset.copiar);
      botao.textContent = "E-mail copiado";
    } catch {
      botao.textContent = "Copie manualmente";
    }
    clearTimeout(volta);
    volta = setTimeout(() => (botao.textContent = rotulo), 2500);
  });
});
