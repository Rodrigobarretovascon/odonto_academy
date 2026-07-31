import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Conheça a loja",
    text: "A loja fica aberta a todos. Produtos e planos podem ser vistos sem assinatura.",
  },
  {
    title: "Crie sua conta",
    text: "Cadastre-se para comprar, acompanhar pedidos e liberar a área de assinantes.",
  },
  {
    title: "Assine e estude",
    text: "Com pagamento aprovado, resumos, perguntas, escultura, anatomia, 3D e IA ficam disponíveis.",
  },
  {
    title: "Pratique com método",
    text: "Siga as fases da escultura, compare vistas finais e use a IA só como apoio educacional.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="content-page">
      <h1>Como funciona</h1>
      <p className="content-page__lead">
        Do visitante ao assinante — um caminho simples para estudar e comprar no GB Dental.
      </p>
      <ol className="how-steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className="how-steps__item">
            <span className="how-steps__num">{i + 1}</span>
            <div>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="content-page__actions">
        <Link to="/assinar" className="btn-primary">
          Ver planos
        </Link>
        <Link to="/recursos" className="btn-outline">
          Ver recursos
        </Link>
      </div>
    </div>
  );
}
