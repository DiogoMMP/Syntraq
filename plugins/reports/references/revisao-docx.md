# Rever um `.docx` só com sugestões

Como marcar um `.docx` para que o utilizador aceite ou recuse cada alteração no Word. Se houver uma skill `docx` disponível, usa-se essa para ler e escrever o OOXML; isto descreve o que ela tem de produzir.

## Princípios

- Trabalhar sempre numa cópia (`<nome> (revisão).docx`, na mesma pasta). O original não é tocado.
- Nenhuma alteração fora de uma marca de revisão. Se não der para marcar, vira comentário.
- Autor das marcas: `Claude`, para o utilizador distinguir das suas.
- Os comentários nunca incluem caminhos de ficheiros do utilizador.

## Alterações controladas

Dentro de `word/document.xml`:

- Inserção: `<w:ins w:id="N" w:author="Claude" w:date="AAAA-MM-DDThh:mm:ssZ"><w:r><w:t xml:space="preserve">texto</w:t></w:r></w:ins>`
- Remoção: `<w:del w:id="N" w:author="Claude" w:date="..."><w:r><w:delText xml:space="preserve">texto</w:delText></w:r></w:del>`
- Substituição: uma remoção seguida de uma inserção, na mesma posição.
- Os `w:id` são únicos em todo o documento, comentários incluídos. Os desta revisão começam acima do maior `w:id` que o documento já tem, e esse ponto de partida fica registado: é o que separa as marcas desta revisão das que já lá estavam, incluindo as de uma revisão anterior também feita pelo Claude.
- Ao dividir uma run para marcar só parte do texto, copiar o `w:rPr` (formatação) para todas as partes.
- Não marcar dentro de campos (índice, referências cruzadas, campos do Mendeley Cite): comentar em vez disso.

## Comentários

- `word/comments.xml` com um `<w:comment w:id="N" w:author="Claude" w:date="..." w:initials="C">` por comentário.
- No texto: `<w:commentRangeStart w:id="N"/>` … `<w:commentRangeEnd w:id="N"/>` e, a seguir, uma run com `<w:commentReference w:id="N"/>`.
- Se o ficheiro ainda não tiver comentários: adicionar `comments.xml` ao pacote, a relação em `word/_rels/document.xml.rels` (tipo `.../relationships/comments`) e o override em `[Content_Types].xml`.
- Formato do texto: `[Erro]`, `[Sugestão]` ou `[Dúvida]`, a regra em causa e, numa linha, o porquê. Quando a ideia vem de uma análise externa, indicar a origem ("sugerido pelo colega X", "análise da IA Y").

## Controlo de revisões e restrição de edições

Em `word/settings.xml`:

- `<w:trackRevisions/>` liga o controlo de alterações. Ligar na cópia antes de marcar e deixar ligado no fim.
- `<w:documentProtection w:edit="trackedChanges" w:enforcement="1"/>` força que tudo seja alteração controlada. Pode ser ligado durante a revisão como garantia.
- **No fim, remover o elemento `w:documentProtection`** (desligar o "Restringir edição"), mesmo que o original já o tivesse ligado. É intencional: o utilizador quer receber a cópia sem restrições para decidir as sugestões. Dizer no resumo que a proteção foi retirada e de que tipo era.
- Se o elemento tiver `w:hash`, `w:salt` ou `w:cryptProviderType`, há palavra-passe. Não tentar contornar: dizer ao utilizador para fazer Rever, Restringir Edição, Parar Proteção.

## Verificação antes de entregar

1. Todo o XML bem formado e o `.docx` abre (reabrir o zip e parsear).
2. Rejeitar **só as marcas desta revisão** dá exatamente o texto do original. Identificá-las pelos `w:id` acima do ponto de partida registado, não só pelo autor, porque o original pode ter marcas do Claude de uma revisão anterior. Fazer isto numa cópia descartável: tirar esses `w:ins` com o conteúdo, desembrulhar esses `w:del` (`w:delText` volta a `w:t`) e tirar esses comentários. As alterações controladas que o original já tinha ficam como estão, e o texto delas lê-se da mesma forma nos dois ficheiros. Comparar parágrafo a parágrafo.
3. Os `w:id` são únicos e cada comentário tem início, fim e referência.
4. Sem `w:documentProtection` no fim.
5. Se for possível, abrir no Word ou converter para PDF para confirmar que não fica corrompido.

## Outros formatos

- `.tex`: ver `revisao-latex.md`.
- `.pdf`: só ler. A revisão sai num ficheiro à parte com a página e o excerto de cada ponto.
