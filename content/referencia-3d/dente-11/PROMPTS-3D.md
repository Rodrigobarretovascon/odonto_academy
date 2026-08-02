# Prompts 3D — Incisivo central superior direito (FDI 11)

Cada microfase gera **3 estados**: A (antes) · B (durante) · C (depois).  
O estado C da fase N = estado A da fase N+1.

## Prompt-mestre (cole no início de todos)

```
Estilo: render 3D odontológico realista, cera de modelagem azul-esverdeada fosca (não branco de dente vivo, não massinha infantil).
Objeto: bloco/escultura contínua do MESMO incisivo central superior direito (FDI 11) em todas as imagens.
Orientação fixa: Incisal cima (+Y), cervical/raiz baixo (−Y), Vestibular frente (+Z), Lingual atrás (−Z), Mesial esquerda (−X), Distal direita (+X).
Instrumento: Lecron proporcional, metal fosco, ponta ENCOSTANDO na cera (nunca atravessando, nunca flutuando).
Iluminação: estúdio suave, sombra discreta no chão claro.
Fundo: cinza-claro limpo (#F3F7FB).
Overlays didáticos (camadas, não substituem a cera):
- vermelho translúcido = remover
- verde translúcido = preservar/já pronto
- azul = linhas de referência
- amarelo = ponto inicial do instrumento
- seta branca/azul-escura = trajetória
- pontilhado = silhueta final ainda não alcançada
Enquadramento: close consistente; mesmas proporções do bloco entre fases.
Proibido: anatomia de lateral/canino; simetria perfeita; sulcos vestibulares profundos; fossa em buraco; cíngulo esférico; borda em lâmina; pular etapas.
```

## Legenda rápida de vistas

`iso` · `V` · `P` · `M` · `D` · `I` · `MV` (mésio-vestibular) · `DP` (disto-lingual)

---

## Fase 1 — Bloco e instrumentais (0:13–0:58)

**A** — Bloco intacto iso; cotas altura/largura/espessura; sem instrumento em corte.  
**B** — Bandeja à frente: Lecron afiado, Lecron fábrica, Rollemberg 3/3S, espátula 7, régua; labels V/P/M/D.  
**C** — Mesmo bloco; overlays de face ligados; pontilhado do dente final bem suave.

Prompt B: `Estado B. Vista iso. Bloco de cera azul-esverdeada intacto. Instrumentos alinhados na bandeja em escala correta. Labels V P M D. Sem remoção de cera.`

## Fase 2 — Plano das 5 sequências (0:51–1:07)

**A** — Bloco + pontilhado do central.  
**B** — Numeração 1–5 flutuando junto às regiões (só overlay).  
**C** — Pontilhado permanece; aluno “sabe o mapa”.

## Fase 3 — Medir 34 mm / terços 11 mm (1:07–1:25)

**A** — Bloco V.  
**B** — Régua vertical encostada; cotas 34 mm e marcas 11/11/11; ponto amarelo no topo.  
**C** — Marcas leves de terço ainda sem anéis fechados.

## Fase 4 — 1º traço do anel (1:32–1:39)

**A** — Bloco V com guias de terço.  
**B** — Lecron afiado na V; seta horizontal; linha azul surgindo no limite cervical–médio; amarelo no início.  
**C** — Linha parcial só na V.

## Fase 5 — Fechar anéis 360° (1:39–1:48)

**A** — Linha parcial V.  
**B** — Instrumento contornando M→P→D; linha azul crescendo; seta curva.  
**C** — Dois anéis completos no perímetro.

## Fase 6 — Entrar em vista mesial (1:56–2:12)

**A** — Bloco com terços; câmera ainda V.  
**B** — Rotação até M; labels V (frente da vista) e P.  
**C** — Enquadramento M estável; pronto para desenhar.

## Fase 7 — Contorno proximal mesial (2:12–2:26)

**A** — Face M limpa (só terços).  
**B** — Lecron traça V (bossa cervical) depois P (fossa + cíngulo); seta acompanhando; azul/rosa no traço.  
**C** — Silhueta proximal mesial fechada; interior = manter; exterior = futuro vermelho fraco.

## Fase 8 — Transferência para distal (2:19–2:36)

**A** — Mesial pronta; distal ainda sem desenho.  
**B** — Linhas-guia paralelas M→D; Lecron repete na D.  
**C** — Contornos simétricos M e D.

## Fase 9 — Ênfase da bossa V (2:36–2:56)

**A/B/C** — Zoom proximal; highlight da convexidade cervical V; sem remoção.

## Fase 10 — Ênfase fossa/cíngulo no perfil P (2:56–3:10)

**A/B/C** — Zoom; fossa médio-incisal côncava; cíngulo cervical; verde no cíngulo a preservar depois.

## Fase 11 — Aprofundar cervical (3:17–3:26)

**A** — Contornos prontos; sulco ainda raso.  
**B** — Lecron no colo; vermelho no sulco; seta circunferencial; amarelo no início.  
**C** — Sulco cervical contínuo anti-lasca.

## Fase 12 — Cortes MD (3:35–3:49)

**A** — Vermelho nos excessos laterais fora do perfil.  
**B** — Lecron cortando MD; raspas de cera; seta MD; verde = volume interno.  
**C** — Largura reduzida; linhas ainda visíveis.

## Fase 13 — Redução inciso-cervical (3:41–4:07)

**A** — Vermelho no excesso IC.  
**B** — Cortes/raspas IC; empunhadura visível.  
**C** — Coroa grosseira emergindo (forma intermediária em cunha).

## Fase 14 — Raspar junto à linha (4:07–4:21)

**A** — Perto do desenho; margem de segurança.  
**B** — Só raspas finas; seta curta; amarelo no ponto de contato.  
**C** — Perfil respeitado, sem ultrapassar.

## Fase 15 — Reduzir futura lingual (4:21–4:46)

**A** — Vista P; vermelho no excesso externo P.  
**B** — Lecron afiado reduzindo.  
**C** — Face P grosseira alinhada ao desenho.

## Fase 16 — Lecron fábrica na fossa (4:46–5:07)

**A** — Verde nas futuras cristas; vermelho no centro médio-incisal.  
**B** — Lecron de ponta arredondada; movimento côncavo; camadas finas.  
**C** — Concavidade inicial rasa (não buraco).

## Fase 17 — Fim 1ª sequência (5:07–5:22)

**A** — Forma intermediária.  
**B** — Rotação D↔M; pontilhado do gesso.  
**C** — Checkpoint: coroa grosseira ok.

## Fase 18 — Trapézio vestibular (5:22–5:39)

**A** — Face V.  
**B** — Desenho linha a linha do trapézio (base maior incisal); azul.  
**C** — Trapézio completo na V.

## Fase 19 — Trapézio lingual + convergência (5:31–5:53)

**A** — Face P.  
**B** — Trapézio + setas de convergência proximal→P.  
**C** — Ambos trapézios + convergência marcada.

## Fase 20 — 2ª sequência de cortes (5:53–6:30)

**A** — Vermelho fora dos trapézios; destaque ângulo inciso-distal.  
**B** — Remoção em camadas; raspas; setas.  
**C** — Silhueta de central; ângulo ID suavizado.

## Fase 21 — Checagem com gesso (6:30–6:43)

**A/B/C** — Split: bloco vs pontilhado do padrão; sem corte novo.

## Fase 22 — Arredondar quinas (6:43–7:16)

**A** — Quinas em vermelho.  
**B** — Passes curtos do Lecron; setas locais.  
**C** — Transições suaves; verde nas áreas já boas.

## Fase 23 — Eixo e macro (7:02–7:40)

**A** — Eixo azul.  
**B** — Ajuste de volume mantendo macro.  
**C** — 3ª sequência concluída.

## Fase 24 — Fossa com espátula 7 (7:40–7:56)

**A** — P: vermelho centro; verde cristas + cíngulo.  
**B** — Espátula 7 em contato; seta côncava; raspas.  
**C** — Fossa ampla rasa entre cristas.

## Fase 25 — Suavizar fossa / borda (7:56–8:13)

**A/B/C** — Refile fino; borda ainda um pouco reta.

## Fase 26 — Cíngulo 45° (8:13–8:27)

**A** — Cíngulo “reto demais”.  
**B** — Lecron afiado a ~45° para P; seta 45°; amarelo no contato.  
**C** — Cíngulo contínuo, não esférico.

## Fase 27 — Ângulos MI e DI (8:19–8:34)

**A** — Ambos ângulos ainda parecidos.  
**B1** — Suavizar MI (mais definido).  
**B2** — Arredondar DI.  
**C** — Assimetria correta; 4ª sequência ok.

## Fase 28 — Colo com Rollemberg (8:42–9:29)

**A** — Colo indefinido.  
**B** — Rollemberg percorrendo V→M→P→D; seta; vermelho fino no colo.  
**C** — Linha sinuosa; bossa V preservada (verde).

## Fase 29 — Corte da raiz (9:36–9:58)

**A** — Base cúbica em vermelho.  
**B** — Lecron afiado cortando base com apoio; seta firme.  
**C** — Raiz esboçada cônica.

## Fase 30 — Acabamento radicular (9:50–10:43)

**A/B/C** — Rollemberg suaviza; simetria VL da raiz.

## Fase 31 — Detalhes e final (10:43+)

**A** — Anatomia quase pronta.  
**B** — Lóbulos/sulcos discretíssimos; embrasure proximal; sem ranhuras profundas.  
**C** — Resultado final acetinado; rotação 360°; comparar bloco inicial → intermediário → final.

---

## Controles que a UI deve espelhar

Para cada fase na plataforma: Antes · Durante/Animação · Depois · linhas on/off · desgaste on/off · faces V/P/M/D/I · zoom · reset · replay · câmera lenta.

Arquivo de tempos: `TABELA-FASES.md`
