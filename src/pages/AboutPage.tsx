import { Link } from "react-router-dom";
import { BrandLockup, HeartRule } from "../components/BrandMark";

export function AboutPage() {
  return (
    <div className="content-page">
      <BrandLockup size="md" />
      <h1>O que somos</h1>
      <p className="content-page__lead">
        O GB Dental é uma plataforma de odontologia com área de assinantes, anatomia, escultura em
        cera, visualização 3D, loja e apoio com inteligência artificial.
      </p>
      <HeartRule className="landing__rule" />
      <div className="content-page__prose">
        <p>
          Nosso propósito é ensinar, orientar e cuidar — com material pensado para estudantes e
          profissionais que querem estudar com delicadeza e precisão.
        </p>
        <p>
          A loja é aberta a todos. Resumos, perguntas, escultura, anatomia, visualizador 3D, IA e
          novidades ficam na área de assinantes.
        </p>
        <p className="content-page__note">
          Informações clínicas passam por revisão profissional antes de serem tratadas como
          referência definitiva. Placeholders indicam mídia ou texto ainda pendente.
        </p>
      </div>
      <div className="content-page__actions">
        <Link to="/como-funciona" className="btn-outline">
          Como funciona
        </Link>
        <Link to="/assinar" className="btn-primary">
          Assinar
        </Link>
      </div>
    </div>
  );
}
