## Contexto

A empresa necessita de uma aplicação de previsão do tempo para que usuários consultem as condições meteorológicas de cidades. A experiência deve funcionar em dispositivos móveis e permitir visualizar o clima atual e uma previsão para cinco dias, com opção de exibição em Celsius ou Fahrenheit.

O briefing não define público específico, fonte dos dados, plataformas suportadas nem o nível de detalhe da previsão.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o resultado correspondente.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit para as temperaturas exibidas.
- **RF-05 — Usar em dispositivos móveis:** disponibilizar as funções principais em uma interface adequada para dispositivos móveis.

## Requisitos Não-Funcionais

Os itens abaixo são propostas iniciais para validação, pois o briefing não estabelece metas específicas.

- **RNF-01 — Responsividade:** conteúdo e controles devem se adaptar a diferentes tamanhos de tela, sem exigir rolagem horizontal.
- **RNF-02 — Usabilidade:** busca, consulta da previsão e troca de unidade devem ser fáceis de localizar e operar.
- **RNF-03 — Acessibilidade:** interface e controles devem ser utilizáveis por teclado e compatíveis com tecnologias assistivas.
- **RNF-04 — Desempenho:** buscas e consultas devem apresentar retorno em tempo adequado; estabelecer uma meta após definir a fonte de dados e as condições de rede.
- **RNF-05 — Tratamento de falhas:** indisponibilidade da rede, erro na busca e ausência de dados devem ser comunicados de forma compreensível.

## Riscos

- **Dados meteorológicos indisponíveis ou desatualizados:** podem comprometer a confiança na aplicação.
- **Cidades com nomes iguais ou ambíguos:** o usuário pode selecionar uma localidade incorreta sem informações suficientes para distingui-la.
- **Diferenças de fuso horário:** podem causar confusão sobre o dia a que a previsão se refere.
- **Escopo indefinido da previsão:** “previsão de 5 dias” pode significar valores diários resumidos ou dados detalhados por horário.
- **Uso em redes móveis instáveis:** consultas podem falhar ou demorar, afetando a experiência.
- **Conversão e arredondamento de temperaturas:** inconsistências podem aparecer ao alternar entre Celsius e Fahrenheit.

## Perguntas em Aberto

- Qual serviço ou fonte fornecerá os dados meteorológicos? Há requisitos de licença, custo ou disponibilidade?
- A busca será apenas por nome de cidade? Deve aceitar país, região ou código postal?
- Como diferenciar resultados de cidades homônimas: país, estado, região ou outro dado?
- Quais informações devem aparecer no clima atual e em cada dia da previsão?
- Os cinco dias incluem o dia atual ou começam no dia seguinte?
- A previsão deve ser diária, por horário ou oferecer as duas visualizações?
- A aplicação deve detectar a localização do usuário ou funcionar somente mediante busca?
- A unidade escolhida deve permanecer após recarregar ou retornar à aplicação?
- Quais idiomas, navegadores e versões de dispositivos devem ser suportados?
- Há metas definidas para desempenho, disponibilidade e acessibilidade?

## Suposições

- A consulta será feita por cidade informada pelo usuário; localização automática não está incluída até ser confirmada.
- “Clima atual” e “previsão de cinco dias” serão fornecidos por uma fonte externa de dados meteorológicos.
- Celsius e Fahrenheit alteram a exibição das temperaturas, não os dados meteorológicos subjacentes.
- A interface móvel deve permitir realizar as mesmas funções principais disponíveis em telas maiores.
- Os detalhes, a frequência de atualização e a precisão dos dados dependem da fonte escolhida e ainda precisam ser definidos.