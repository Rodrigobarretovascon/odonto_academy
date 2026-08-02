import { Link } from "react-router-dom";
import { HeartRule } from "../components/BrandMark";
import { PageShell } from "../components/PageShell";

export function AboutPage() {
  return (
    <PageShell
      eyebrow="GB Dental · Institucional"
      title="O que somos"
      lead="Uma plataforma de odontologia com área de assinantes, anatomia, escultura em cera, visualização 3D, loja e apoio com inteligência artificial."
      actions={
        <>
          <Link to="/como-funciona" className="btn-outline btn-outline--lg">
            Como funciona
          </Link>
          <Link to="/assinar" className="btn-primary btn-primary--lg">
            Assinar
          </Link>
        </>
      }
      panelBody={<HeartRule className="page-panel__rule" />}
    >
      <div className="page-card page-card--wide">
        <div className="page-panel__prose">
          <p>
            Nosso propósito é ensinar, orientar e cuidar — com material pensado para estudantes e
            profissionais que querem estudar com delicadeza e precisão.
          </p>
          <p>
            A loja é aberta a todos. Resumos, perguntas, escultura, anatomia, visualizador 3D, IA e
            novidades ficam na área de assinantes.
          </p>
          <p className="page-panel__note">
            Informações clínicas passam por revisão profissional antes de serem tratadas como
            referência definitiva.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
