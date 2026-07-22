import { createFileRoute } from "@tanstack/react-router";
import { Check, Flame, Brain, Target, Zap, MessageSquare, Gift, ChevronDown, Star, ArrowRight, X, XCircle, Award } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { WistiaVsl } from "@/components/WistiaVsl";
import { hasValidRevealAccess, saveRevealAccess } from "@/lib/vsl-reveal";
import { ENABLE_EXIT_POPUP, ENABLE_WHATSAPP_FLOAT } from "@/lib/feature-flags";
import flaviaImg from "@/assets/flavia.webp";
import frustradoImg from "@/assets/frustrado.webp";
import seloGarantia from "@/assets/selo-garantia.webp";
import pagamentoSeguro from "@/assets/pagamento-seguro.webp";
import { buildSeoMeta } from "@/lib/site-seo";
import {
  trackExitCheckout,
  trackExitPopupShown,
  trackFaqCheckout,
  trackFaqSearch,
  trackHeroInterest,
  trackMetaEvent,
  trackOfferCheckout,
  trackVslContentUnlocked,
  trackVslLandingView,
  trackReceiveCheckout,
  trackWhatsAppContact,
} from "@/lib/meta-pixel";

export const Route = createFileRoute("/")({
  head: () => {
    const seo = buildSeoMeta("/");
    return {
      meta: seo.meta,
      links: [
        ...seo.links,
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
        {
          rel: "preload",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;600&display=swap",
          as: "style",
        },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;600&display=swap" },
      ],
      scripts: seo.scripts,
    };
  },
  component: SalesPage,
});

const CHECKOUT_URL = "https://pay.kiwify.com.br/FGxNNX7";

function VslHeroHeader({
  onReachThreshold,
  trackThreshold,
}: {
  onReachThreshold: () => void;
  trackThreshold: boolean;
}) {
  return (
    <section className="vsl-hero-section relative overflow-hidden pb-10 sm:pb-12">
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_20%_20%,var(--lime),transparent_40%),radial-gradient(circle_at_80%_60%,var(--lime),transparent_45%)]" />
      <div className="relative max-w-3xl mx-auto px-6 pt-16 text-center">
        <div className="mx-auto flex items-center justify-center gap-2 sm:gap-3">
          <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--navy-deep)] text-lg sm:text-xl font-bold">
            ✓
          </span>
          <span className="font-extrabold font-display text-2xl sm:text-4xl md:text-5xl tracking-wide">
            <span className="text-[var(--cream)]">CÓDIGO </span>
            <span className="text-[var(--lime)]">INVISÍVEL</span>
          </span>
        </div>
      </div>
      <WistiaVsl onReachThreshold={onReachThreshold} trackThreshold={trackThreshold} />
    </section>
  );
}

function HeroContent() {
  return (
    <section className="bg-[var(--navy-deep)] text-[var(--cream)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_20%_20%,var(--lime),transparent_40%),radial-gradient(circle_at_80%_60%,var(--lime),transparent_45%)]" />
      <div className="relative max-w-3xl mx-auto px-6 pt-5 pb-16 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] sm:leading-[1.1]">
          O Código Invisível ensina a <span className="text-[var(--lime)]">ler o comportamento</span> do cliente e reduzir objeções sem precisar pressionar para vender.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[var(--cream)]/80 max-w-2xl mx-auto">
          Descubra como identificar o perfil emocional do cliente em poucos minutos e use isso para conduzir conversas e aumentar suas vendas.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left max-w-xl mx-auto">
          <p className="text-sm font-semibold text-[var(--lime)]">
            Método prático baseado em comportamento humano, gatilhos mentais e inteligência emocional aplicada em vendas.
          </p>
          <ul className="mt-4 space-y-2.5 text-sm sm:text-[15px]">
            {[
              "Entenda por que o cliente realmente diz “vou pensar”",
              "Aprenda a identificar rapidamente cada perfil comportamental",
              "Saiba exatamente como conduzir cada tipo de cliente",
              "Venda sem parecer insistente ou robótico",
              "Crie mais conexão, confiança e autoridade nas conversas",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="w-5 h-5 text-[var(--lime)] shrink-0 mt-0.5" />
                <span className="text-[var(--cream)]/90">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <a href="#receber" className="btn-cta btn-cta-sm mt-8" onClick={trackHeroInterest}>
          QUERO ACESSAR O CÓDIGO INVISÍVEL AGORA <ArrowRight className="w-4 h-4" />
        </a>
        <p className="mt-3 text-xs text-[var(--cream)]/60">Acesso imediato após a compra • Material 100% digital</p>
      </div>

      <div className="relative ticker py-3 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-sm">CÓDIGO INVISÍVEL · LEIA · ADAPTE · CONDUZA ·</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const pains = [
    "Você entra em conversas sem leitura do cliente e a venda esfria.",
    "Você sente que poderia ter vendido, mas não sabe onde perdeu o controle.",
    "Você tenta convencer sem antes entender o comportamento de quem está do outro lado.",
  ];
  return (
    <section className="section-deferred py-12 sm:py-14 px-6 bg-[var(--cream)]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative">
          <img
            src={frustradoImg}
            alt="Vendedor frustrado por não conseguir fechar a venda"
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            className="relative w-full object-cover aspect-[4/5] rounded-3xl shadow-xl"
          />
        </div>
        <div>
          <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[var(--navy-deep)] leading-[1.15]">
            Você escuta <span className="text-[var(--navy)]">“vou pensar”</span>… e não sabe o que responder.
          </h2>
          <p className="mt-5 text-sm sm:text-base lg:text-[17px] text-[var(--muted-foreground)] leading-relaxed">
            O cliente demonstra interesse, mas some no meio da conversa. Você sente que a venda poderia ter acontecido… mas não consegue identificar onde perdeu o controle da negociação.
          </p>
          <div className="mt-6 space-y-4">
            {pains.map((p) => (
              <div key={p} className="flex gap-3 border-b border-[var(--border)] pb-4">
                <XCircle className="w-6 h-6 text-[var(--destructive)] shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base lg:text-[17px] text-[var(--navy-deep)]/85 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm sm:text-base lg:text-[17px] font-bold text-[var(--navy-deep)] leading-relaxed">
            O problema é que a maioria dos vendedores tenta convencer sem antes entender o comportamento do cliente.
          </p>
          <p className="mt-3 text-sm sm:text-base lg:text-[17px] text-[var(--navy-deep)] leading-relaxed">
            E é exatamente isso que o <strong>Código Invisível</strong> resolve. Você vai aprender como identificar rapidamente o perfil comportamental do cliente, entender o que existe por trás das objeções e conduzir a conversa de forma estratégica, gerando mais confiança, conexão e fechamento.
          </p>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="section-deferred py-12 sm:py-14 px-6 bg-[var(--cream)]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 lg:gap-14 items-center">
        <div className="md:col-span-2 relative">
          <div className="absolute -inset-4 bg-[var(--lime)] rounded-[40%_60%_55%_45%/50%_45%_55%_50%] opacity-30 blur-xl" />
          <img
            src={flaviaImg}
            alt="Flávia, especialista em comportamento humano e alta performance"
            width={860}
            height={1280}
            loading="lazy"
            decoding="async"
            className="relative rounded-3xl shadow-xl w-full object-cover aspect-[3/4]"
          />
        </div>
        <div className="md:col-span-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-[var(--navy)]">
            <Award className="w-4 h-4" /> QUEM ESTÁ POR TRÁS DO MÉTODO
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[var(--navy-deep)] leading-[1.1]">
            Especialista em <span className="text-[var(--navy)]">Comportamento Humano</span> & Alta Performance
          </h2>
          <p className="mt-5 text-[var(--muted-foreground)] leading-relaxed">
            Especialista em comportamento humano aplicado à alta performance e eficiência operacional. Com sólida trajetória no ambiente corporativo, desenvolveu líderes, estruturou equipes comerciais e implementou estratégias que aumentam a previsibilidade de resultados. Atuou em uma das maiores empresas de gestão fitness da América Latina, treinando líderes e vendedores para performance consistente.
          </p>
          <p className="mt-4 text-[var(--navy-deep)] leading-relaxed">
            Criadora do <strong>Método PAR</strong>, que integra perfil comportamental, disciplina estratégica e inteligência emocional para acelerar resultados de empresários, líderes e equipes comerciais.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { k: "+10", v: "anos de carreira" },
              { k: "1000+", v: "vendedores treinados" },
              { k: "Método PAR", v: "exclusivo" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl bg-[var(--lime)] p-3 sm:p-4 text-center text-[var(--navy-deep)] flex flex-col items-center justify-center min-h-[96px]">
                <div className="font-extrabold font-display text-base sm:text-2xl leading-tight">{s.k}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider mt-1 leading-tight">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Receive() {
  const blocks = [
    { icon: Flame, title: "O novo jeito de vender", items: ["Como vender entendendo comportamento humano", "Por que clientes compram emocionalmente", "Como gerar confiança sem parecer forçado"] },
    { icon: Brain, title: "Os 4 perfis comportamentais", items: ["Tubarão: dominante e acelerado", "Lobo: analítico e desconfiado", "Gato: emocional e relacional", "Águia: visionário e livre"] },
    { icon: Target, title: "O mapa oculto das objeções", items: ["“Tá caro”", "“Vou pensar”", "“Agora não”", "“Depois te chamo”"] },
    { icon: Zap, title: "A Fórmula Trinus", items: ["Como ler comportamento", "Como adaptar linguagem", "Como conduzir sem confronto", "Reduzir resistência emocional"] },
    { icon: MessageSquare, title: "Frases estratégicas prontas", items: ["Clientes inseguros", "Clientes resistentes", "Posicionamento e liderança", "Conexão emocional"] },
  ];
  return (
    <section id="receber" className="section-deferred py-12 sm:py-14 px-6 bg-[var(--lime-soft)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-[0.3em] text-[var(--navy)]">O QUE VOCÊ VAI RECEBER</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[var(--navy-deep)]">
            Tudo o que está incluído
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Um guia prático criado para vendedores, closers, empresários e equipes comerciais que querem transformar comportamento em conversão.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blocks.map(({ icon: Icon, title, items }) => (
            <div key={title} className="rounded-2xl bg-[var(--lime)] p-7 text-[var(--navy-deep)] shadow-[0_10px_30px_-15px_oklch(0.78_0.13_85/0.6)]">
              <Icon className="w-7 h-7" />
              <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i} className="flex gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl bg-[var(--navy-deep)] p-7 text-[var(--cream)]">
            <h3 className="text-xl font-extrabold">Porque objeção não é desculpa.</h3>
            <p className="mt-3 text-[var(--cream)]/80">É conflito emocional. E você vai aprender a resolvê-lo antes mesmo que apareça.</p>
            <div className="mt-6 text-[var(--lime)] font-extrabold font-display text-lg">LEIA → ADAPTE → CONDUZA</div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="btn-cta" onClick={trackReceiveCheckout}>
            QUERO O CÓDIGO INVISÍVEL <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Bonuses() {
  const bonuses = [
    { tag: "BÔNUS 01", title: "Mini Aula: Venda Comportamental na Prática", desc: "Uma aula mostrando como aplicar os perfis comportamentais em reuniões e conversas reais." },
    { tag: "BÔNUS 02", title: "Guia Rápido dos Gatilhos Mentais", desc: "Autoridade, prova social, escassez, reciprocidade e pertencimento, aplicados com naturalidade." },
    { tag: "BÔNUS 03", title: "PDF: Frases de Alta Conversão", desc: "Frases prontas para quebrar objeções, gerar conexão e aumentar percepção de valor." },
  ];
  return (
    <section className="section-deferred py-12 sm:py-14 px-6 bg-[var(--navy-deep)] text-[var(--cream)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-[var(--lime)]">BÔNUS EXCLUSIVOS</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">Você ainda leva 3 bônus para acelerar resultado</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {bonuses.map((b) => (
            <div key={b.tag} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 hover:bg-white/[0.07] transition">
              <Gift className="w-7 h-7 text-[var(--lime)]" />
              <div className="mt-4 text-xs font-bold tracking-[0.25em] text-[var(--lime)]">{b.tag}</div>
              <h3 className="mt-2 text-xl font-extrabold">{b.title}</h3>
              <p className="mt-3 text-sm text-[var(--cream)]/75">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: "Depois que aprendi a identificar o perfil do cliente, parei de tentar convencer todo mundo do mesmo jeito e comecei a fechar mais vendas.", title: "Minhas conversões melhoraram muito.", name: "Rafael Mendes", role: "Closer" },
    { quote: "O Código Invisível me ajudou a entender o que realmente existe por trás das objeções. Hoje minhas reuniões são muito mais estratégicas.", title: "Parei de ouvir tanto ‘vou pensar’.", name: "Juliana Freitas", role: "Consultora Comercial" },
    { quote: "Aprendi a conduzir a conversa sem parecer insistente. Isso aumentou minha confiança e meus fechamentos.", title: "As vendas ficaram mais naturais.", name: "Lucas Andrade", role: "Executivo de Vendas" },
    { quote: "Aplicamos o método na operação e o time melhorou muito a comunicação e a condução das negociações.", title: "Minha equipe começou a vender melhor.", name: "Fernanda Oliveira", role: "Empresária" },
  ];
  return (
    <section id="depoimentos" className="section-deferred py-12 sm:py-14 px-6 bg-[var(--lime-soft)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy-deep)]">Quem aplicou, mudou o jogo</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="flex gap-1 text-[var(--lime)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <h4 className="mt-3 font-extrabold text-[var(--navy-deep)]">“{t.title}”</h4>
              <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">{t.quote}</p>
              <div className="mt-5 pt-4 border-t text-sm">
                <span className="font-bold text-[var(--navy-deep)]">{t.name}</span>
                <span className="text-[var(--muted-foreground)]"> · {t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer() {
  return (
    <section id="oferta" className="section-deferred py-12 sm:py-14 px-6 bg-[var(--cream)] relative">
      <div className="ticker py-2 absolute top-0 left-0 right-0 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-marquee-fast text-xs">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>CÓDIGO INVISÍVEL · CÓDIGO INVISÍVEL · CÓDIGO INVISÍVEL ·</span>
          ))}
        </div>
      </div>
      <div className="max-w-md mx-auto mt-10 rounded-3xl bg-[var(--lime)] p-8 sm:p-10 text-center text-[var(--navy-deep)] shadow-[0_30px_60px_-20px_oklch(0.78_0.13_85/0.6)]">
        <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-[var(--navy)]">Investimento</h3>
        <div className="mt-5 text-base">Por apenas</div>
        <div className="mt-1 text-6xl sm:text-7xl font-extrabold font-display text-[var(--navy)] leading-none">R$97</div>
        <p className="mt-6 text-sm sm:text-base text-[var(--navy-deep)]/85 leading-relaxed">
          Um único cliente fechado com o <strong>Código Invisível</strong> já paga o seu investimento.
        </p>
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta mt-7 w-full !bg-[var(--navy-deep)] !text-[var(--cream)] !shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5)]"
          onClick={trackOfferCheckout}
        >
          QUERO VENDER MAIS AGORA <ArrowRight className="w-4 h-4" />
        </a>
        <div className="mt-7 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[var(--navy-deep)] text-[var(--lime)] text-xs sm:text-sm font-extrabold tracking-[0.25em] uppercase shadow-md">
          Pagamento Seguro
        </div>
        <img
          src={pagamentoSeguro}
          alt="Formas de pagamento: Visa, Mastercard, American Express, Elo, Hipercard, Pix e Boleto Bancário"
          loading="lazy"
          decoding="async"
          className="mx-auto mt-2 w-full max-w-md h-auto"
        />

        <p className="mt-2 text-xs text-[var(--navy-deep)]/75 leading-relaxed">
          Seu pagamento será processado em um ambiente totalmente seguro e seus dados estão protegidos.
        </p>
        <p className="mt-2 text-sm font-extrabold text-[var(--navy)]">Compra 100% segura!</p>

      </div>
    </section>
  );
}

function Guarantee() {
  return (
    <section id="garantia" className="section-deferred py-12 sm:py-14 px-6 bg-[var(--navy-deep)] text-[var(--cream)]">
      <div className="max-w-3xl mx-auto text-center">
        <img
          src={seloGarantia}
          alt="Selo de garantia de 7 dias"
          width={220}
          height={220}
          loading="lazy"
          decoding="async"
          className="mx-auto w-40 sm:w-52 h-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
        />
        <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold">Garantia incondicional de 7 dias</h2>
        <p className="mt-5 text-[var(--cream)]/80">
          Você acessa o conteúdo, aplica o método e testa tudo na prática. Se entender que o material não faz sentido para você, basta solicitar o reembolso dentro de 7 dias.
        </p>
        <p className="mt-4 font-extrabold text-[var(--lime)]">Risco zero. A decisão é sua, o teste é por nossa conta.</p>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: "O Código Invisível serve apenas para vendedores?", a: "Não. Serve para empresários, closers, líderes, consultores e qualquer pessoa que precise melhorar comunicação e persuasão." },
    { q: "O acesso é imediato?", a: "Sim. Após a confirmação da compra, o acesso é liberado automaticamente." },
    { q: "O conteúdo é muito técnico?", a: "Não. O material é direto ao ponto e extremamente prático." },
    { q: "Vou aprender perfil comportamental?", a: "Sim. O foco principal é ensinar como identificar e conduzir diferentes perfis comportamentais em vendas." },
    { q: "Isso funciona para WhatsApp e reuniões?", a: "Sim. Você poderá aplicar tanto em calls quanto em mensagens e negociações." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section-deferred py-12 sm:py-14 px-6 bg-[var(--cream)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-[var(--navy)]">F.A.Q.</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[var(--navy-deep)]">Dúvidas frequentes</h2>
        </div>
        <div className="mt-10 space-y-3">
          {items.map((it, i) => (
            <button
              key={it.q}
              type="button"
              onClick={() => {
                if (open !== i) trackFaqSearch(it.q);
                setOpen(open === i ? null : i);
              }}
              aria-expanded={open === i}
              className="w-full text-left rounded-2xl bg-white border border-[var(--border)] p-5 hover:border-[var(--lime)] transition"
            >
              <div className="flex justify-between items-center gap-4">
                <span className="font-bold text-[var(--navy-deep)]">{it.q}</span>
                <ChevronDown className={`w-5 h-5 text-[var(--navy)] transition ${open === i ? "rotate-180" : ""}`} />
              </div>
              {open === i && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{it.a}</p>}
            </button>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="btn-cta" onClick={trackFaqCheckout}>COMEÇAR AGORA POR R$97 <ArrowRight className="w-4 h-4" /></a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--navy-deep)] text-[var(--cream)]/70 py-10 px-6">
      <div className="max-w-6xl mx-auto text-center text-sm">
        <p>Trinus Business 2026. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (shown) return;

    const trigger = () => {
      setShown(true);
      setOpen(true);
      trackExitPopupShown();
    };

    const timer = setTimeout(trigger, 45000);

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [shown]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-in fade-in"
      onClick={close}
      role="presentation"
    >
      <div
        className="relative max-w-lg w-full rounded-3xl bg-[var(--cream)] p-8 sm:p-10 text-center text-[var(--navy-deep)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-popup-title"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-black/5"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="inline-block text-lg sm:text-xl font-extrabold tracking-wider text-[#e11d2e] uppercase">
          ESPERE. NÃO FECHE A PÁGINA.
        </span>
        <h3 id="exit-popup-title" className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
          O Código Invisível vai te fazer entender o comportamento de cada perfil do seu potencial cliente e te fazer <span className="text-[#16a34a]">VENDER MUITO</span> mais.
        </h3>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Não perca essa oportunidade.
        </p>
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta mt-7 w-full"
          onClick={trackExitCheckout}
        >
          Quero acessar agora <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/556581325700?text=Ol%C3%A1!%20Vim%20da%20P%C3%A1gina%20do%20C%C3%B3digo%20Invis%C3%ADvel.%20Quero%20adquirir%20ele%20agora!"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-[#25D366] shadow-[0_10px_30px_-5px_rgba(37,211,102,0.6)] flex items-center justify-center hover:scale-110 transition-transform"
      onClick={trackWhatsAppContact}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.482-1.318.214-.5.214-.928.144-1.018-.072-.13-.273-.244-.602-.4z"/>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.838.748 5.502 2.058 7.81L0 32l8.42-2.022A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.252c-2.554 0-4.93-.74-6.93-2.015l-4.84 1.162 1.244-4.706A12.97 12.97 0 0 1 3 16C3 8.82 8.82 3 16 3s13 5.82 13 13-5.82 13-13 13z"/>
      </svg>
    </a>
  );
}

function SalesPage() {
  const [contentRevealed, setContentRevealed] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);
  const [instantReveal, setInstantReveal] = useState(false);
  const contentRevealedRef = useRef(false);
  const unlockTrackedRef = useRef(false);

  const revealSalesContent = useCallback(() => {
    if (contentRevealedRef.current) return;
    contentRevealedRef.current = true;
    if (!unlockTrackedRef.current) {
      unlockTrackedRef.current = true;
      trackVslContentUnlocked("video-threshold");
    }
    saveRevealAccess();
    setContentRevealed(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("delayed-sales-content");
        if (el) void el.offsetHeight;
      });
    });
  }, []);

  useEffect(() => {
    if (hasValidRevealAccess()) {
      contentRevealedRef.current = true;
      setInstantReveal(true);
      setContentRevealed(true);
    }
    setStorageChecked(true);
  }, []);

  useEffect(() => {
    trackVslLandingView();
  }, []);

  useEffect(() => {
    if (!contentRevealed || !instantReveal || unlockTrackedRef.current) return;
    unlockTrackedRef.current = true;
    trackVslContentUnlocked("storage-return");
  }, [contentRevealed, instantReveal]);

  useEffect(() => {
    if (!contentRevealed) return;

    const seen = new Set<string>();
    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const config = SECTION_PIXEL_EVENTS.find((item) => item.selector === `#${entry.target.id}`);
            if (!config || seen.has(config.selector)) continue;
            seen.add(config.selector);
            trackMetaEvent(config.event, config.params);
          }
        },
        { threshold: 0.35 },
      );

      for (const { selector } of SECTION_PIXEL_EVENTS) {
        const element = document.querySelector(selector);
        if (element) observer.observe(element);
      }
    };

    const timer = window.setTimeout(setupObserver, 100);

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [contentRevealed]);

  const delayedContentClass = contentRevealed
    ? instantReveal
      ? "delayed-sales-content--visible-immediate"
      : "delayed-sales-content--visible"
    : "delayed-sales-content--hidden";

  return (
    <main>
      <VslHeroHeader
        onReachThreshold={revealSalesContent}
        trackThreshold={storageChecked && !contentRevealed}
      />
      <div id="delayed-sales-content" className={delayedContentClass}>
        <HeroContent />
        <Problem />
        <Receive />
        <Bonuses />
        <Testimonials />
        <About />
        <Offer />
        <Guarantee />
        <Faq />
        <Footer />
      </div>
      {contentRevealed && ENABLE_EXIT_POPUP && <ExitIntentPopup />}
      {contentRevealed && ENABLE_WHATSAPP_FLOAT && <WhatsAppFloat />}
    </main>
  );
}
