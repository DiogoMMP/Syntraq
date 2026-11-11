# Regras de escrita académica

Regras por omissão para rever e escrever relatórios académicos em português de Portugal. Aplicam-se quando nada as substitui. A precedência está no fim.

Estas regras valem para o texto do documento. O tom da conversa com o utilizador é outro assunto: no chat trata-se o utilizador por "tu".

## 1. Idioma

- Português de Portugal (PT-PT). Sinalizar termos do português do Brasil: "usuário" (utilizador), "arquivo" (ficheiro), "tela" (ecrã), "time" (equipa), "acessar" (aceder), "rodar" (executar), "deletar" (apagar), "baixar" (descarregar), "gerenciar" (gerir), "ótimo" no sentido de "bom", gerúndio em vez de "a" + infinitivo ("estamos fazendo" em vez de "estamos a fazer").
- Termos técnicos em inglês só quando não há tradução corrente. Em itálico na primeira ocorrência, se o template o fizer.
- Siglas e acrónimos por extenso na primeira utilização, com a sigla entre parênteses, e só a sigla daí em diante. Se o documento tiver lista de siglas, cada sigla usada tem de lá estar e cada entrada tem de ser usada.
- Se o documento estiver noutra língua, a regra passa a ser coerência com a língua do documento. Não se traduz nada.

## 2. Voz e tempo verbal

- Texto impessoal. Nunca primeira pessoa: "eu fiz", "vou apresentar", "apresentamos", "posso concluir". Escreve-se "O projeto é implementado", "É possível concluir", "Segue-se a apresentação".
- Presente. Nem passado nem futuro: "foi implementado", "vai ser testado", "concluiu-se" passam a "é implementado", "é testado", "conclui-se".
- A reescrita mantém o sentido temporal. Um plano não pode passar a parecer feito: o que é mesmo futuro (trabalho futuro, cronograma, testes ainda por fazer) escreve-se no presente sem mudar o estado, por exemplo "vai ser testado" passa a "está previsto testar" ou "o cronograma prevê", nunca a "é testado". Na dúvida sobre se algo já aconteceu, `[Dúvida]` em vez de reescrever.
- Exceção razoável: o que um autor publicou num ano concreto. Tratar como sugestão de baixa gravidade, não como erro.

## 3. Objetividade e ritmo

- Se se diz em 5 palavras, não se usam 10. Factos, decisões técnicas e resultados.
- Frases curtas. Acima de cerca de 30 palavras, sugerir divisão.
- Parágrafos curtos a fluir em vez de listas de marcadores em excesso. Uma lista só quando os itens são mesmo paralelos.
- Sem introduções formais nem frases que anunciam o que se vai dizer.

## 4. Marcas de texto gerado por IA

Estas marcas denunciam o texto. Sinalizar todas.

- Travessões (— e –) a abrir ou fechar incisos. Substituir por vírgulas, parênteses ou ponto final.
- Adjetivação abundante e superlativa: "robusto", "abrangente", "fundamental", "crucial", "poderoso", "inovador", "sem precedentes".
- Expressões feitas: "insights valiosos", "No ecossistema digital de hoje", "Um aspeto fundamental a considerar", "É importante salientar que", "desempenha um papel crucial", "no panorama atual", "mergulhar em", "em suma", "vale a pena notar".
- Estruturas em três elementos por reflexo ("rápido, seguro e escalável") sem que o conteúdo o peça.
- Conclusões de parágrafo que repetem o que acabou de ser dito.
- Negrito espalhado pelo texto corrido.

## 5. Objetivos

- Começam por um verbo de ação mensurável: Desenvolver, Implementar, Comparar, Medir, Avaliar, Modelar.
- Nunca "conhecer" nem "perceber": não se medem.
- Objetivos SMART: específicos, mensuráveis, atingíveis, realistas e com prazo. Sinalizar o que não tiver forma de ser verificado no fim.
- Se houver questões de pesquisa, devem ter resposta no final.

## 6. Figuras e tabelas

- Legenda da tabela por cima da tabela. Legenda da figura por baixo da figura.
- Todas numeradas e referidas no texto. Nenhuma figura ou tabela sem referência.
- Numeração contínua e referências cruzadas a apontarem para o número certo.
- Lista de figuras e lista de tabelas atualizadas, se existirem.

## 7. Citações e referências

- Cada citação no texto tem entrada na lista de referências e cada entrada é citada.
- Estilo de referências: o que o documento ou o perfil indicar. Se não houver nenhum, IEEE.
- A forma da citação no texto segue o estilo. Em IEEE, número entre parênteses retos (`[3]`), por ordem de primeira citação; o nome do autor pode aparecer na frase ("Silva [3] mostra que..."), mas não é obrigatório. Em estilos autor-data (APA, Harvard), autor e ano ("Silva, 2021"). Não marcar como erro uma citação correta no estilo em uso.
- Se o orientador ou o curso pedir mais do que o estilo (por exemplo nome e ano junto de cada citação mesmo em IEEE, "Silva (2021) [3]"), essa é uma regra do perfil e sobrepõe-se a esta.
- Nunca inventar uma referência, um DOI ou uma citação. Se uma fonte não puder ser confirmada, comentário a pedir confirmação.
- Quando uma referência tem DOI e há acesso à web, confirmar que o DOI existe e que o título e os autores batem certo. Um DOI que não resolve ou aponta para outro trabalho é um erro. Sem acesso à web, dizer no resumo que os DOIs ficaram por confirmar.
- Gestor de referências: se o utilizador usa o Mendeley, as referências entram pelo Mendeley Cite. Sugerir a inserção por aí em vez de escrever referências à mão.
- Nunca citar nem ligar a ficheiros locais do utilizador (caminhos de disco, pastas pessoais).

## 8. Estrutura típica (relatório de licenciatura ou estágio)

Por omissão e ajustável pelo template ou pelo orientador.

1. **Introdução.** O problema que levou ao projeto, objetivos específicos, questões de pesquisa (opcional), cronograma e metodologia. Pode incluir um subcapítulo sobre o uso ético e responsável de IA: modelos usados, vantagens e estratégias para evitar artificialidade e plágio involuntário.
2. **Estado da arte.** O que já existe: contextualizar o tema, apresentar soluções semelhantes e concluir vantagens e desvantagens. Fontes científicas relevantes, com citações acompanhadas de autor e ano.
3. **Capítulos de implementação** (variam com o tema): análise da solução (por exemplo UML), implementação, testes e recolha de dados.
4. **Conclusão.** Conclusões, limitações e trabalhos futuros.

## 9. Revisão final antes de entregar

Em LaTeX: compilar duas vezes, confirmar que não há `??` nem avisos de referências indefinidas, e que as chaves de `\cite{}` existem no `.bib`.


- Formatação coerente com o template: estilos, cabeçalhos, rodapés, numeração de páginas.
- Índice atualizado (e listas de figuras e tabelas).
- Capa, logos e identificação conforme o perfil de quem entrega.
- Ortografia e termos do português do Brasil.
- Referências: citadas, completas e no estilo certo.

## 10. Enunciado e limites

- Se houver enunciado, rubrica ou grelha de avaliação (dado pelo utilizador ou encontrado na base de conhecimento), cada critério é verificado: cumprido, parcial ou em falta, com o sítio do relatório onde é tratado.
- Limites de páginas ou de palavras, do enunciado ou do perfil: contar e dizer quanto falta ou sobra. Indicar o que conta para o limite (normalmente sem capa, índices, referências e anexos, salvo indicação em contrário).
- Sem enunciado nem limites conhecidos, não se inventa nenhum. Diz-se no resumo que não foram verificados.

## Precedência

1. O que o utilizador pede no momento.
2. As regras do perfil do utilizador (orientador, curso, instituição).
3. Regras encontradas na base de conhecimento (por exemplo feedback de outros trabalhos).
4. Estas regras por omissão.

Análises de outras IAs ou de colegas são informação, não regras. Verificam-se contra o texto e aplicam-se como sugestão com a origem indicada.
