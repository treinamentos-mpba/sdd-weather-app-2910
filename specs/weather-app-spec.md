# Weather App — Especificação de Produto

## Overview

O Weather App é uma aplicação web responsiva para consultar as condições meteorológicas de uma cidade e a previsão para cinco dias. A experiência deve permitir localizar uma cidade, visualizar o clima atual, consultar hoje e os quatro dias seguintes e alternar a temperatura entre Celsius e Fahrenheit.

**Objetivo do produto:** permitir que uma pessoa encontre e interprete rapidamente informações meteorológicas de uma localidade escolhida, em desktop ou dispositivo móvel.

**Decisões confirmadas pelo negócio:**
- Fonte de dados: Open-Meteo, sem API key.
- Período da previsão: hoje mais os quatro dias seguintes.
- Unidade inicial: Celsius; Fahrenheit também estará disponível.
- Autenticação: não haverá contas ou login.
- Persistência server-side: não haverá persistência de dados em servidor.
- Idioma da interface: pt-BR.

**Público-alvo:** ainda não validado. As proto-personas nas histórias são hipóteses para orientar a primeira versão, não critérios de elegibilidade.

## Functional Requirements

- **FR-01 — Buscar e selecionar cidade:** aceitar nome de cidade em Unicode, remover espaços no início/fim e exibir as localidades retornadas pela geocodificação com nome e os dados de região/país disponíveis. Exigir seleção explícita quando houver resultados; não selecionar automaticamente uma localidade ambígua.
- **FR-02 — Consultar clima atual:** para a localidade selecionada, exibir temperatura atual e condição meteorológica. Campos adicionais só devem ser exibidos quando fornecidos pela fonte.
- **FR-03 — Consultar previsão de cinco dias:** exibir um resumo diário para hoje e os quatro dias seguintes no fuso local da cidade, com mínima, máxima, condição meteorológica e probabilidade máxima de precipitação; quando a fonte não fornecer essa probabilidade, identificá-la como indisponível.
- **FR-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit em todas as temperaturas; usar Celsius quando não houver preferência local salva e manter a escolha no dispositivo.
- **FR-05 — Comunicar estados da consulta:** distinguir carregamento, busca sem resultados, dados indisponíveis, falha e timeout. Mensagens devem estar em pt-BR; falhas recuperáveis devem oferecer nova tentativa.

A adaptação a dispositivos móveis é tratada como requisito não funcional, pois descreve uma qualidade da interface, não uma ação independente da pessoa usuária.

## User Stories

As personas abaixo são proto-personas levantadas durante o discovery e ainda não validadas por pesquisa: pessoa em deslocamento diário, pessoa planejando uma viagem e pessoa organizando uma atividade ao ar livre. Como `discovery.md` não contém uma seção formal de personas, estes perfis são referências provisórias.

- **US-01 (FR-01):** Como pessoa em deslocamento diário, quero buscar e selecionar minha cidade ou meu destino para consultar a localidade correta antes de sair.
- **US-02 (FR-02):** Como pessoa em deslocamento diário, quero ver as condições atuais da cidade selecionada para decidir como me preparar para o trajeto.
- **US-03 (FR-03):** Como pessoa planejando uma viagem, quero consultar a previsão de hoje e dos quatro dias seguintes no destino para organizar os próximos dias da viagem.
- **US-04 (FR-04):** Como pessoa planejando uma viagem, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que uso.
- **US-05 (FR-03):** Como pessoa organizando uma atividade ao ar livre, quero consultar a previsão dos próximos cinco dias para decidir se mantenho ou ajusto meus planos.
- **US-06 (FR-05):** Como pessoa organizando uma atividade ao ar livre, quero saber quando uma consulta está carregando, não encontrou dados ou falhou para entender se posso confiar no resultado ou tentar novamente mais tarde.

## Acceptance Criteria

### FR-01 — Buscar e selecionar cidade

```gherkin
Scenario: AC-01.1 — Buscar cidade com acentos e pontuação
	Given a geocodificação tem uma resposta fixture para "São José d'Oeste"
	When a pessoa usuária envia "  São José d'Oeste  "
	Then a consulta enviada contém "São José d'Oeste" sem espaços externos
	And o resultado é exibido com nome e região/país quando esses campos existem na resposta

Scenario: AC-01.2 — Selecionar a localidade correta entre homônimas
	Given a fixture retorna duas localidades com nomes iguais e IDs distintos
	When a pessoa usuária seleciona a opção identificada como a segunda localidade
	Then essa localidade fica selecionada
	And a consulta meteorológica usa o ID ou as coordenadas dessa localidade
	And nenhuma localidade é selecionada antes da ação da pessoa usuária

Scenario: AC-01.3 — Impedir busca com consulta vazia
	Given o campo de busca está vazio ou contém apenas espaços
	When a pessoa usuária envia o formulário
	Then a geocodificação não é chamada
	And uma orientação para informar uma cidade é exibida

Scenario: AC-01.4 — Tratar cidade inexistente ou sem correspondências
	Given a geocodificação retorna uma lista vazia para uma consulta não vazia
	When a pessoa usuária envia a consulta
	Then um estado vazio informa que nenhuma cidade foi encontrada
	And o texto da consulta permanece disponível para edição
	And nenhuma consulta meteorológica é iniciada
```

### FR-02 — Consultar clima atual

```gherkin
Scenario: AC-02.1 — Exibir clima atual da cidade selecionada
	Given uma cidade está selecionada
	And a resposta fixture contém temperatura de 18 °C e condição "Céu limpo"
	When a consulta termina com sucesso
	Then o nome da localidade, 18 °C e "Céu limpo" são exibidos

Scenario: AC-02.2 — Atualizar o clima após selecionar outra cidade
	Given o clima atual da cidade A está exibido
	When a pessoa usuária seleciona a cidade B
	Then os dados de A deixam de ser apresentados como dados da cidade selecionada
	And quando a consulta de B termina, o nome e os dados de B são exibidos

Scenario: AC-02.3 — Resposta atual sem um campo
	Given a resposta fixture contém a condição, mas não contém temperatura
	When a consulta termina com sucesso
	Then a condição disponível é exibida
	And a temperatura é identificada como indisponível, sem valor inventado
```

### FR-03 — Consultar previsão de cinco dias

```gherkin
Scenario: AC-03.1 — Exibir hoje e os quatro dias seguintes
	Given o relógio de teste está fixado em 2026-03-10
	And a cidade está no fuso America/Sao_Paulo e tem cinco previsões diárias completas
	When a consulta de previsão termina com sucesso
	Then são exibidos exatamente cinco registros para hoje e os quatro dias seguintes no fuso da cidade
	And as datas exibidas são 2026-03-10, 2026-03-11, 2026-03-12, 2026-03-13 e 2026-03-14
	And cada registro mostra data local, mínima, máxima, condição meteorológica e probabilidade de chuva

Scenario: AC-03.2 — Indicar um dia sem dados de previsão
	Given a resposta não contém probabilidade de chuva para uma das cinco datas
	When a previsão é exibida
	Then as cinco datas continuam identificáveis
	And somente a probabilidade ausente é marcada como indisponível
	And os demais valores disponíveis para essa data são exibidos

Scenario: AC-03.3 — Resposta sem registros de previsão
	Given a resposta fixture não contém registros diários
	When a consulta de previsão termina
	Then a seção de previsão informa que os dados estão indisponíveis
	And nenhum registro com valores fictícios é exibido
```

### FR-04 — Alternar unidade de temperatura

```gherkin
Scenario: AC-04.1 — Usar Celsius quando não há preferência salva
	Given o dispositivo não tem preferência de unidade salva
	When a aplicação é aberta
	Then o controle indica Celsius
	And todas as temperaturas são exibidas em Celsius

Scenario: AC-04.2 — Converter temperaturas para Fahrenheit
	Given as temperaturas disponíveis são 0 °C no clima atual, -10 °C de mínima e 20 °C de máxima na previsão
	When a pessoa usuária seleciona Fahrenheit
	Then essas temperaturas são exibidas como 32 °F, 14 °F e 68 °F, respectivamente
	And todas as outras temperaturas visíveis também usam °F
	And a cidade e as datas da previsão permanecem inalteradas

Scenario: AC-04.3 — Voltar a exibir Celsius
	Given as temperaturas estão exibidas em Fahrenheit
	When a pessoa usuária seleciona Celsius
	Then todas as temperaturas visíveis são exibidas em Celsius

Scenario: AC-04.4 — Manter a unidade escolhida no dispositivo
	Given a pessoa usuária seleciona Fahrenheit
	When a aplicação é recarregada no mesmo dispositivo
	Then Fahrenheit continua selecionado
	And nenhuma conta ou persistência em servidor é necessária
```

### FR-05 — Comunicar estados da consulta

```gherkin
Scenario: AC-05.1 — Indicar consulta em andamento
	Given uma busca ou consulta meteorológica foi iniciada e ainda não respondeu
	When a solicitação permanece pendente
	Then um indicador com role status e texto em pt-BR é exibido

Scenario: AC-05.2 — Informar falha de rede ou do serviço
	Given uma consulta está em andamento
	When a rede falha ou o serviço responde com erro HTTP
	Then uma mensagem em pt-BR é exibida em uma região com role alert
	And o indicador de carregamento deixa de ser exibido
	And uma ação para tentar novamente é disponibilizada

Scenario: AC-05.3 — Encerrar solicitação por timeout
	Given uma solicitação não recebeu resposta
	When 10 segundos se passam desde o início da solicitação
	Then a solicitação é encerrada
	And uma mensagem de timeout em pt-BR e uma ação para tentar novamente são exibidas
	And o indicador de carregamento deixa de ser exibido

Scenario: AC-05.4 — Tratar resposta inválida
	Given o serviço responde com conteúdo que não pode ser interpretado como uma resposta meteorológica válida
	When a resposta é processada
	Then nenhum valor inválido ou inventado é exibido
	And a seção afetada informa que não foi possível interpretar os dados
	And as outras seções com dados válidos permanecem utilizáveis

Scenario: AC-05.5 — Distinguir ausência de resultados de erro
	Given a busca termina com uma resposta válida sem localidades
	When a resposta é processada
	Then o estado vazio de busca é exibido
	And a mensagem de erro de rede ou serviço não é exibida

Scenario: AC-05.6 — Informar ausência de dados meteorológicos
	Given uma resposta válida não contém dados para uma seção meteorológica
	When a resposta é processada
	Then apenas essa seção informa que os dados estão indisponíveis
	And nenhuma outra seção válida é substituída por um erro global

Scenario: AC-05.7 — Descartar resposta de busca anterior
	Given a consulta da cidade A está pendente
	When a pessoa usuária seleciona a cidade B e a resposta de B chega primeiro
	And a resposta de A chega depois
	Then B permanece como cidade selecionada
	And os dados de A não substituem os dados de B

Scenario: AC-05.8 — Repetir uma consulta que falhou
	Given uma consulta terminou com erro e a ação para tentar novamente está disponível
	When a pessoa usuária aciona essa ação
	Then uma nova solicitação é feita para a mesma consulta ou localidade
	And o indicador de carregamento é exibido até a nova resposta
```

## Traceability Matrix

| User Story | Requisito funcional | Acceptance Criteria | Requisitos não funcionais relevantes |
|---|---|---|---|
| US-01 — Buscar a cidade correta antes de sair | FR-01 | AC-01.1, AC-01.2, AC-01.3, AC-01.4 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-02 — Consultar condições para o trajeto | FR-02 | AC-02.1, AC-02.2, AC-02.3 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08 |
| US-03 — Planejar viagem com a previsão | FR-03 | AC-03.1, AC-03.2, AC-03.3 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08 |
| US-04 — Interpretar temperaturas na unidade preferida | FR-04 | AC-04.1, AC-04.2, AC-04.3, AC-04.4 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06 |
| US-05 — Decidir sobre atividade ao ar livre | FR-03 | AC-03.1, AC-03.2, AC-03.3 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08 |
| US-06 — Entender carregamento, vazio ou falha | FR-05 | AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5, AC-05.6, AC-05.7, AC-05.8 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08 |

## Non-Functional Requirements

Metas quantitativas não definidas no discovery estão marcadas como propostas e precisam de aprovação antes de se tornarem compromissos de aceite.

- **NFR-01 — Idioma:** toda a interface e as mensagens do produto devem estar em pt-BR.
- **NFR-02 — Responsividade:** as funções principais devem ser utilizáveis a partir de 320 CSS px, sem rolagem horizontal. Validar em 320, 375, 768 e 1280 CSS px e com zoom de 200%.
- **NFR-03 — Acessibilidade:** atender WCAG 2.2 AA; toda função deve ser operável por teclado, ter nome acessível e foco visível. Estados de carregamento e erro devem usar roles `status` e `alert`, respectivamente.
- **NFR-04 — Desempenho:** medir do envio da busca/seleção até a exibição dos dados utilizáveis. Meta: p95 <= 5 s quando a resposta do provedor ocorre em <= 2 s, em rede 4G ou Wi-Fi. Timeout da solicitação: 10 s.
- **NFR-05 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari, incluindo Safari iOS e Chrome Android. Validar os fluxos FR-01 a FR-05 nessa matriz.
- **NFR-06 — Privacidade:** não exigir login nem enviar preferências ou histórico a servidor. A consulta da cidade é enviada à Open-Meteo; a unidade é armazenada somente no dispositivo. Não solicitar geolocalização.
- **NFR-07 — Disponibilidade:** meta candidata de 99,5% mensal para carregamento da aplicação; disponibilidade dos dados externos deve ser medida separadamente e não é garantida pela aplicação. Confirmar a meta antes do lançamento.
- **NFR-08 — Atualidade e integridade:** não apresentar dados de uma localidade como se fossem de outra. Exibir horário de atualização quando fornecido pela fonte; nunca preencher campos ausentes com valores estimados pela aplicação.

## Edge Cases

- Consulta de cidade vazia, com espaços, inválida ou sem resultados.
- Nomes com acentos, apóstrofos, hífens e outros caracteres Unicode válidos.
- Vários resultados com o mesmo nome ou localidades próximas; a pessoa usuária seleciona uma opção incorreta ou não consegue distingui-las.
- Seleção de cidade sem dados atuais, sem previsão para uma ou mais datas ou com campos ausentes.
- Falha de rede, timeout após 10 s, resposta inválida, limite de requisições ou indisponibilidade da Open-Meteo.
- Mudança de dia no fuso horário da localidade durante a consulta, especialmente perto da meia-noite.
- Temperaturas negativas, valores extremos, conversão e arredondamento ao inteiro mais próximo (empates afastados de zero).
- Alternância de unidade enquanto dados estão carregando ou após selecionar outra cidade.
- Nova busca iniciada antes de uma consulta anterior terminar; a resposta antiga não deve substituir dados da seleção mais recente.
- Tela estreita, zoom do navegador, orientação móvel e uso somente por teclado.

## Assumptions

- O produto será uma aplicação web responsiva; aplicativos nativos não estão incluídos na primeira versão.
- A pessoa usuária informa a cidade manualmente; localização automática não faz parte do escopo inicial.
- Open-Meteo fornece a geocodificação e os dados de clima atual e previsão necessários, sem exigir API key, conforme a decisão de produto.
- A previsão da v1 é diária, com mínima, máxima e condição para hoje e os quatro dias seguintes.
- A preferência de unidade é salva no armazenamento local do dispositivo; sem preferência salva, usar Celsius.
- Sem persistência server-side não significa funcionamento offline nem ausência de envio de consultas ao provedor externo.
- O timeout de consulta é 10 s; não há repetição automática. A pessoa usuária pode iniciar uma nova tentativa.
- O produto não calcula previsões nem preenche dados meteorológicos ausentes; apresenta somente os valores válidos recebidos.

## Risks

- **Indisponibilidade, limite ou mudança no serviço Open-Meteo.** Impacto: consultas indisponíveis ou necessidade de adaptar a integração. Mitigação: verificar termos, limites e disponibilidade antes do lançamento; tratar erros e monitorar falhas.
- **Dados meteorológicos ausentes, atrasados ou com cobertura desigual.** Impacto: perda de confiança ou localidades sem informação útil. Mitigação: validar cobertura, indicar horário dos dados quando disponível e não apresentar dado ausente como atual.
- **Cidades homônimas ou geocodificação imprecisa.** Impacto: exibição do clima da localidade errada. Mitigação: mostrar detalhes de desambiguação e exigir seleção explícita quando houver múltiplos resultados.
- **Fuso horário ou definição de data incorretos.** Impacto: previsão associada ao dia errado. Mitigação: usar o fuso da localidade retornado pela fonte e testar fronteiras de data.
- **Requisitos de desempenho, acessibilidade e compatibilidade não aprovados.** Impacto: retrabalho e divergência de expectativa perto do lançamento. Mitigação: validar metas e matriz de suporte durante a revisão da spec.
- **Envio de consultas a provedor externo sem expectativa de privacidade clara.** Impacto: surpresa para usuários ou conflito com políticas internas. Mitigação: documentar os dados enviados, revisar termos e validar o aviso de privacidade.
- **Termos, limites ou atribuição da Open-Meteo incompatíveis com o uso pretendido.** Impacto: bloqueio de lançamento ou necessidade de trocar a fonte. Mitigação: validar os termos vigentes, limites e atribuição antes da publicação.

## Out of Scope

Os itens abaixo não fazem parte da v1. Incluí-los requer atualização aprovada desta especificação.

- Contas, login, perfis e qualquer persistência de dados meteorológicos ou de usuário em servidor.
- Aplicativos nativos para iOS/Android e localização automática por GPS ou navegador.
- Cidades favoritas, histórico de buscas, sincronização entre dispositivos e personalização além da unidade local.
- Previsões por hora; a v1 mostra somente resumo diário para cinco datas.
- Métricas meteorológicas além da temperatura e condição atuais e da mínima, máxima, condição e probabilidade de chuva diária da previsão.
- Atualização automática periódica, garantias de tempo real, cache offline e consulta sem conexão; os dados são buscados ao selecionar uma cidade ou solicitar nova tentativa.
- Mapas, radar, alertas, avisos severos, notificações push/e-mail, widgets, compartilhamento e exportação.
- Provedor meteorológico alternativo ou failover automático; a fonte da v1 é Open-Meteo.
- Interface em idiomas diferentes de pt-BR e analytics comportamental. Monitoramento operacional necessário para disponibilidade não é excluído.

## Open Questions

1. O negócio aprova as metas de desempenho, disponibilidade, acessibilidade e a matriz de navegadores como critérios de lançamento?
2. Qual público é prioritário e qual métrica de sucesso deve ser acompanhada? Não há analytics ou telemetria definidos nesta versão.
3. Quais exigências de atribuição, limites e privacidade da Open-Meteo devem constar na interface antes do lançamento?
