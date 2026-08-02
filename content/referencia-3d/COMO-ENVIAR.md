# Kit de referência 3D — como preparar e enviar

Use esta pasta para material **próprio** (gravações ou frames com direitos liberados).  
Não coloque aqui vídeos de terceiros (YouTube / DentisticaCia etc.).

## Piloto: dente 11

Comece só pelo **incisivo central superior (FDI 11)**.  
Depois de validarmos o padrão, copiamos a mesma estrutura para os demais dentes.

Pasta do piloto:

```
content/referencia-3d/dente-11/
```

## O que colocar (ordem de prioridade)

1. **Clipes curtos por fase** em `dente-11/fases/`  
   - Um MP4 por fase (10–40 s).  
   - Mostra só a alteração daquela fase.  
   - Ângulo preferencial: vestibular; se possível, um segundo clipe `…-proximal.mp4` ou `…-lingual.mp4`.

2. **Frames antes / durante / depois** em `dente-11/frames/`  
   - 2–4 imagens por fase (JPG ou PNG).  
   - “Durante” = instrumento + direção do movimento visíveis.

3. **Roteiro** em `dente-11/roteiro.md`  
   - Já vem preenchido com as 10 fases do roteiro da plataforma.  
   - Complete os campos em branco (face, direção, o que remover, erro comum).

4. **Vídeo completo** (opcional) em `dente-11/video-completo.mp4`  
   - Só para contexto do fluxo geral.

## Nomes dos arquivos (obrigatório)

Siga exatamente os nomes listados em `dente-11/roteiro.md` e nas pastas `fases/` / `frames/`.  
Assim consigo localizar cada etapa sem ambiguidade.

## Depois de preencher

Avise no chat, por exemplo:

> “Preenchi o kit do dente 11 — pode analisar e refinar o 3D.”

Com os arquivos na pasta, eu mapeio cada fase no player e ajusto o morph progressivo.

## Vídeos finais no site (opcional)

Quando um clipe estiver pronto para o aluno assistir na plataforma:

```
public/videos/tooth-11/fase-{id}.mp4
```

Ex.: `public/videos/tooth-11/fase-04.mp4`  
(ver `public/videos/README.md`)
