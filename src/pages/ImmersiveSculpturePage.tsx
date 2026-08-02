import { useParams, Link } from "react-router-dom";
import { ImmersiveSculptureLesson } from "../modules/dental-sculpture";
import "../modules/dental-sculpture/styles/immersive-sculpture.css";

export function ImmersiveSculpturePage() {
  const { dente } = useParams();
  const fdi = Number(dente) || 11;

  return (
    <div className="sculpture-area">
      <div className="immersive-lesson__crumb no-print">
        <Link to={`/app/escultura/${fdi}`}>← Escultura {fdi}</Link>
      </div>
      <ImmersiveSculptureLesson fdi={fdi} />
    </div>
  );
}
