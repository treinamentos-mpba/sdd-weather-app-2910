# Weather App — Backlog de Tarefas

Tarefas derivadas de [specs/weather-app-spec.md](../specs/weather-app-spec.md) e [plans/weather-app-plan.md](../plans/weather-app-plan.md). Os IDs `T-NN` são mantidos estáveis para preservar rastreabilidade; a ordem abaixo representa a sequência de implementação. Dependências apontam somente pré-requisitos necessários, sem ciclos.

## Pré-requisitos de fundação

### T-01 — Criar entrada e shell React
- **Descrição:** iniciar a aplicação React com uma tela vazia, sem integrar dados.
- **Critérios de aceite:** `main.tsx` monta `App`; `App` renderiza sem erro; `pnpm build` passa.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra.
- **Rastreabilidade:** habilitadora de FR-01 a FR-05; NFR-01, NFR-02.

### T-02 — Adicionar estilos globais
- **Descrição:** criar o ponto de entrada CSS global com Tailwind e tema do projeto.
- **Critérios de aceite:** estilos globais são importados pela aplicação; build continua passando.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** NFR-01, NFR-02, NFR-03.

### T-03 — Configurar setup de testes
- **Descrição:** configurar setup compartilhado do Vitest e matchers de DOM usados pelos testes.
- **Critérios de aceite:** `vite.config.ts` aponta para `tests/setup.ts`; T-08 confirma que os matchers registrados podem ser usados.
- **Dependências:** T-01.
- **Arquivos prováveis:** `vite.config.ts`, `tests/setup.ts`.
- **Tipo:** Infra.
- **Rastreabilidade:** habilitadora da automação de AC-01.1 a AC-05.8.

## Entrega 1 — Tipos

### T-04 — Definir contratos de domínio
- **Descrição:** declarar os tipos compartilhados do modelo Weather App.
- **Critérios de aceite:** `weather.ts` exporta `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `WeatherServiceError` e `RequestState<T>` com os campos/nulabilidade do plano; ausência não é zero; `pnpm build` passa em TypeScript strict.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01 a FR-04; AC-01.1, AC-02.1, AC-03.1, AC-04.1.

## Entrega 2 — Funções puras

### T-05 — Implementar conversão de temperatura
- **Descrição:** implementar conversão pura a partir de Celsius canônico.
- **Critérios de aceite:** `0 °C → 32 °F`, `-10 °C → 14 °F`, `20 °C → 68 °F`; arredondamento ao inteiro mais próximo com empates afastados de zero; sem dependência de React ou rede.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-04; AC-04.2, AC-04.3.

### T-06 — Implementar formatação de datas
- **Descrição:** formatar as datas diárias em pt-BR usando explicitamente o fuso da cidade.
- **Critérios de aceite:** a data `2026-03-10` é apresentada como `10/03/2026` em `America/Sao_Paulo` e `Pacific/Kiritimati`; não desloca o dia por conversão UTC; saída determinística para a mesma entrada.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03; AC-03.1, AC-03.2; NFR-08.

### T-07 — Implementar tradução de códigos WMO
- **Descrição:** mapear códigos meteorológicos para rótulos em pt-BR.
- **Critérios de aceite:** código `0` retorna `Céu limpo`, código `61` retorna `Chuva` e código não mapeado retorna `Condição indisponível`; nenhuma entrada lança exceção.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-03.1.

## Entrega 3 — Services

### T-11 — Implementar geocoding
- **Descrição:** encapsular a busca de localidades e mapear a resposta para `City`.
- **Critérios de aceite:** chama `GET https://geocoding-api.open-meteo.com/v1/search` com consulta aparada, `count=10`, `language=pt`, `format=json`; mapeia ID, nome, coordenadas e dados geográficos disponíveis; retorna `[]` para resultados vazios; falhas de rede/HTTP/timeout e JSON inválido produzem erro tipado; encaminha `AbortSignal`.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01; AC-01.1 a AC-01.4.

### T-12 — Implementar forecast
- **Descrição:** consultar clima atual e cinco previsões diárias e normalizar para `WeatherData`.
- **Critérios de aceite:** chama o endpoint forecast com `current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure`, `daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `precipitation_unit=mm`, `timezone=auto`, `forecast_days=5`; mapeia os vetores diários pelo índice e todas as métricas atuais para `CurrentWeather`; mantém campos ausentes opcionais; converte resposta inválida, falha HTTP/rede e timeout em erro tipado.
- **Dependências:** T-04, T-11.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-02, FR-03; AC-02.1 a AC-02.3, AC-03.1 a AC-03.3.

## Entrega 4 — Hook de estado

### T-24 — Implementar o hook de clima
- **Descrição:** coordenar busca, seleção, clima atual, estados assíncronos, retry e descarte de resposta obsoleta para a primeira fatia.
- **Critérios de aceite:** busca e clima têm estados independentes; vazios não são erros; resposta parcial permanece sucesso; timeout ocorre em 10 s sem retry automático; respostas antigas são ignoradas; o hook expõe a cidade e o clima atual da seleção ativa.
- **Dependências:** T-04, T-07, T-11, T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, FR-02, FR-05; AC-01.1 a AC-02.3, AC-05.1 a AC-05.8.

### T-38 — Adicionar preferência local de unidade ao hook
- **Descrição:** acrescentar seleção e persistência local de Celsius/Fahrenheit sem alterar a consulta meteorológica.
- **Critérios de aceite:** sem preferência válida, `unit` inicia como `celsius`; selecionar Fahrenheit persiste o valor no dispositivo; armazenamento bloqueado mantém a escolha em memória; alternar unidade não chama `fetch` nem altera `WeatherData`.
- **Dependências:** T-04, T-05, T-24.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-04; AC-04.1 a AC-04.4.

## Entrega 5 — Componentes

### T-14 — Criar estados loading e vazio
- **Descrição:** apresentar estados de carregamento e ausência de resultados/dados.
- **Critérios de aceite:** loading expõe `role="status"` e texto em pt-BR; busca sem resultados e dados meteorológicos indisponíveis têm textos/estados distintos; vazio não usa `role="alert"`.
- **Dependências:** T-24.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-05; AC-05.1, AC-05.5, AC-05.6; NFR-01, NFR-03.

### T-15 — Criar estado de erro
- **Descrição:** apresentar falhas e ação de nova tentativa por callback.
- **Critérios de aceite:** erro expõe `role="alert"` e mensagem em pt-BR; callback de retry é chamado uma vez por ativação, não ao renderizar; controle tem nome acessível e funciona por Enter e Espaço.
- **Dependências:** T-24.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-05; AC-05.2, AC-05.3, AC-05.8; NFR-03.

### T-16 — Criar busca e seleção de cidades
- **Descrição:** implementar formulário e opções de geocoding sem acesso direto a serviços.
- **Critérios de aceite:** não submete campo vazio; mantém consulta editável em resultado vazio; mostra nome e região/país disponíveis; exige seleção explícita; Tab alcança campo/opções e Enter submete/seleciona a opção focada.
- **Dependências:** T-04, T-14, T-24.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01; AC-01.1 a AC-01.4; NFR-03.

### T-17 — Criar componente de clima atual
- **Descrição:** exibir localidade e condições atuais disponíveis.
- **Critérios de aceite:** com fixture de temperatura `18 °C` e condição `Céu limpo`, exibe ambos e a localidade; temperatura ausente é identificada como indisponível, sem zero substituto; não chama serviços.
- **Dependências:** T-04, T-07, T-14, T-24.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-02; AC-02.1 a AC-02.3; NFR-08.

### T-18 — Criar componentes de previsão diária
- **Descrição:** apresentar a lista de cinco dias e o cartão de cada dia.
- **Critérios de aceite:** renderiza exatamente cinco datas, mínimas, máximas, condição e probabilidade de chuva; probabilidade ausente é marcada como indisponível, sem valor fictício; não chama serviços.
- **Dependências:** T-04, T-06, T-07, T-14, T-24.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03; AC-03.1 a AC-03.3; NFR-08.

### T-19 — Criar controle de unidade
- **Descrição:** expor seleção acessível entre Celsius e Fahrenheit.
- **Critérios de aceite:** apresenta as duas opções, indica a ativa e emite mudança por callback; não acessa API nem armazenamento; seleção é operável por teclado e tem nome acessível.
- **Dependências:** T-04, T-38.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-04; AC-04.1 a AC-04.4; NFR-03.

## Entrega 6 — Integração

### T-26 — Compor a tela principal
- **Descrição:** entregar a primeira fatia visível: busca e clima atual da cidade selecionada.
- **Critérios de aceite:** fluxo permite buscar e selecionar cidade e exibe o clima atual em Celsius; loading, vazio e erro são encaminhados aos estados correspondentes; nenhum dado da seleção anterior é rotulado como atual; `pnpm build` passa.
- **Dependências:** T-02, T-14, T-15, T-16, T-17, T-24.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-02, FR-05; NFR-01, NFR-02, NFR-06.

### T-39 — Integrar previsão e alternância de unidade
- **Descrição:** completar a tela com os cinco dias e o controle Celsius/Fahrenheit.
- **Critérios de aceite:** a tela mostra hoje e os quatro dias seguintes com mínima, máxima e condição; todas as temperaturas refletem a unidade ativa; alternar unidade não dispara novo request; build passa.
- **Dependências:** T-18, T-19, T-26, T-38.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03, FR-04; AC-03.1 a AC-03.3, AC-04.1 a AC-04.4.

## Entrega 7 — Testes

Os testes são listados após a integração como etapa de verificação; cada tarefa depende também da implementação específica que testa e pode ser executada isoladamente.

### T-08 — Testar conversão de temperatura
- **Descrição:** validar conversão e arredondamento com Vitest.
- **Critérios de aceite:** testa `0 °C → 32 °F`, `-10 °C → 14 °F`, ida e volta e empates positivos/negativos; matcher do setup funciona; arquivo passa no Vitest.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-04; AC-04.2, AC-04.3.

### T-09 — Testar formatação de datas
- **Descrição:** validar datas locais e fusos distintos.
- **Critérios de aceite:** com entrada `2026-03-10`, verifica saída `10/03/2026` em `America/Sao_Paulo` e `Pacific/Kiritimati`; o dia não varia com o fuso do ambiente de teste; arquivo passa no Vitest.
- **Dependências:** T-03, T-06.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-03; AC-03.1.

### T-10 — Testar códigos meteorológicos
- **Descrição:** verificar tradução de códigos WMO conhecidos e desconhecidos.
- **Critérios de aceite:** verifica `0 → Céu limpo`, `61 → Chuva` e fallback `Condição indisponível`; arquivo passa no Vitest.
- **Dependências:** T-03, T-07.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-03.1.

### T-13 — Testar serviços meteorológicos
- **Descrição:** testar os métodos de geocoding e forecast usando `fetch` mockado.
- **Critérios de aceite:** verifica URL/parâmetros, Unicode, mapeamento, resultado vazio/parcial, JSON inválido, HTTP 429/5xx, rede, timeout, cancelamento e `Retry-After`; nenhum teste chama API real; arquivo passa no Vitest.
- **Dependências:** T-03, T-11, T-12.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.1 a AC-01.4, AC-02.1 a AC-02.3, AC-03.1 a AC-03.3, AC-05.2 a AC-05.4.

### T-20 — Testar componente de busca
- **Descrição:** validar busca, vazio, seleção explícita e acessibilidade do SearchBar.
- **Critérios de aceite:** cobre consulta vazia, homônimas e ausência de resultados; verifica callbacks, labels e teclado; arquivo passa no Vitest.
- **Dependências:** T-03, T-16.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.1 a AC-01.4; NFR-03.

### T-21 — Testar controle de unidade
- **Descrição:** validar interação e acessibilidade do UnitToggle.
- **Critérios de aceite:** seleção de cada unidade chama callback com valor correto; verifica nome acessível e teclado; arquivo passa no Vitest.
- **Dependências:** T-03, T-19.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-04.1 a AC-04.4; NFR-03.

### T-22 — Testar componente de clima atual
- **Descrição:** verificar renderização de dados atuais completos e parciais.
- **Critérios de aceite:** valida temperatura/condição presentes e indicação de temperatura ausente, sem exibir zero substituto; arquivo passa no Vitest.
- **Dependências:** T-03, T-17.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-02.1 a AC-02.3.

### T-23 — Testar componentes de previsão
- **Descrição:** verificar lista e cartões de forecast diário.
- **Critérios de aceite:** cobre cinco datas, conversão de máximas/mínimas, condição, probabilidade de chuva disponível e ausente; datas correspondem à fixture; arquivos passam no Vitest.
- **Dependências:** T-03, T-18.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`, `tests/unit/ForecastCard.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-03.1 a AC-03.3.

### T-25 — Testar transições do hook
- **Descrição:** testar o contrato de estado e as corridas assíncronas do hook.
- **Critérios de aceite:** cobre estados `idle/loading/success/empty/error`, independência entre busca e clima, retry, parcial, resposta obsoleta, `localStorage` indisponível, fallback Celsius e ausência de request ao trocar unidade; arquivo passa no Vitest.
- **Dependências:** T-03, T-24, T-38.
- **Arquivos prováveis:** `tests/unit/useWeather.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.3, AC-01.4, AC-02.2, AC-03.2, AC-04.1 a AC-04.4, AC-05.1 a AC-05.8.

### T-27 — Testar estados dos componentes
- **Descrição:** testar isoladamente os componentes de loading, erro e vazio com Testing Library.
- **Critérios de aceite:** um arquivo de teste verifica `LoadingState` com `role=status`, `ErrorState` com `role=alert` e callback de retry acionado somente por interação, e `EmptyState` distinguindo busca sem resultados de dados meteorológicos indisponíveis; `pnpm test` passa.
- **Dependências:** T-03, T-14, T-15.
- **Arquivos prováveis:** `tests/unit/States.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-05; AC-05.1, AC-05.2, AC-05.5, AC-05.6, AC-05.8; NFR-03.

### T-28 — Testar integração da tela
- **Descrição:** verificar em conjunto a primeira fatia: busca, seleção e clima atual.
- **Critérios de aceite:** Testing Library confirma busca, seleção e dados atuais na tela; verifica conteúdo pt-BR e callbacks; `pnpm test` passa.
- **Dependências:** T-03, T-13, T-20, T-22, T-26, T-27.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.1, AC-01.2, AC-02.1, AC-02.2; NFR-01.

### T-40 — Testar integração de previsão e unidade
- **Descrição:** verificar na tela integrada a segunda fatia de previsão diária e conversão.
- **Critérios de aceite:** teste com fixtures confirma cinco datas, mínimas/máximas, condições e probabilidade de chuva; alternar unidade converte temperaturas sem nova chamada a `fetch`; `pnpm test` passa.
- **Dependências:** T-03, T-08, T-09, T-21, T-23, T-25, T-39.
- **Arquivos prováveis:** `tests/unit/ForecastAndUnit.integration.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-03.1 a AC-03.3, AC-04.1 a AC-04.4.

### T-29 — Automatizar fluxo E2E principal
- **Descrição:** testar busca, seleção, consultas meteorológicas e troca de unidade com Playwright.
- **Critérios de aceite:** cobre busca com acentos, seleção de localidade, clima atual, cinco dias, troca de unidade e recarga em desktop e em viewport mobile de 375 × 812 px; intercepta as APIs; não chama Open-Meteo real; `pnpm test:e2e` passa.
- **Dependências:** T-28, T-39, T-40.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.1, AC-01.2, AC-02.1, AC-02.2, AC-03.1, AC-04.2, AC-04.4; NFR-02.

## Entrega 8 — Hardening e gates de lançamento

### T-30 — Testar falhas E2E
- **Descrição:** cobrir cidade inexistente, falha/timeout e retry no navegador.
- **Critérios de aceite:** cada cenário verifica mensagem/estado, distingue vazio de erro e confirma nova solicitação após retry; `pnpm test:e2e` passa.
- **Dependências:** T-29.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01.4, AC-05.2, AC-05.3, AC-05.8.

### T-31 — Validar viewports responsivos
- **Descrição:** verificar o fluxo principal em tamanhos mobile e desktop definidos.
- **Critérios de aceite:** Playwright verifica `scrollWidth <= clientWidth` em 320 × 640 e 375 × 812 px e localiza controles; em 1280 × 800 px localiza busca, clima e previsão; `pnpm test:e2e` passa.
- **Dependências:** T-30.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-02.

### T-32 — Configurar matriz de navegadores
- **Descrição:** registrar e executar a matriz de suporte de navegadores do plano.
- **Critérios de aceite:** `playwright.config.ts` define projetos para Chromium, Firefox e WebKit; `pnpm test:e2e` passa nesses projetos; documentação registra a política das duas versões estáveis e que WebKit não substitui Safari/iOS real.
- **Dependências:** T-31.
- **Arquivos prováveis:** `playwright.config.ts`, `plans/weather-app-plan.md`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-05.

### T-33 — Auditar acessibilidade dos fluxos
- **Descrição:** validar teclado, foco e semântica das telas principais.
- **Critérios de aceite:** Playwright verifica Tab/Enter na busca e seleção, teclado no controle de unidade e retry, além de `role=status` e `role=alert`; rotas externas são mockadas e `pnpm test:e2e` passa.
- **Dependências:** T-28, T-32.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-03; AC-01.3, AC-05.1, AC-05.2, AC-05.8.

### T-34 — Aprovar metas operacionais
- **Descrição:** fechar critérios de desempenho, disponibilidade e aprovação das metas de lançamento.
- **Critérios de aceite:** spec registra cada meta como `Aprovada` com valor/critério ou `Pendente` com responsável; plano registra ambiente, método e janela de medição do p95 e da disponibilidade, separando aplicação e provedor; resultado WCAG de T-33 e bloqueios têm decisão documentada; release fica bloqueado enquanto metas exigidas pela spec estiverem pendentes.
- **Dependências:** T-32, T-33.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-03, NFR-04, NFR-05, NFR-07.

### T-35 — Validar termos do provedor
- **Descrição:** confirmar limites, atribuição e requisitos de privacidade da Open-Meteo para a distribuição planejada.
- **Critérios de aceite:** plano registra URL e data da revisão dos termos, limites aplicáveis, texto de atribuição exigido e dados enviados; spec registra obrigações ou decisão fundamentada de que não há alteração de produto; tarefa bloqueia lançamento, não desenvolvimento.
- **Dependências:** T-34.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-06; Open Question 3; risco de termos/limites do provedor.

### T-36 — Implementar atribuição do provedor
- **Descrição:** incluir na interface a atribuição exigida, caso a validação de termos a determine.
- **Critérios de aceite:** texto e localização correspondem ao requisito documentado em T-35; se não houver exigência, a decisão de não exibir atribuição está registrada; UI permanece acessível em mobile.
- **Dependências:** T-17, T-26, T-35.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** NFR-01, NFR-06; decisão de atribuição de T-35.

### T-37 — Documentar privacidade da consulta
- **Descrição:** documentar que a consulta da cidade é enviada à Open-Meteo e que unidade fica no dispositivo.
- **Critérios de aceite:** README identifica os dados enviados, finalidade, destinatário, armazenamento local da unidade e ausência de conta/histórico; conteúdo reflete os requisitos validados em T-35.
- **Dependências:** T-35.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-06; decisão de privacidade de T-35.

## Matriz FR → Tarefas

| Requisito funcional da spec | Tarefas de implementação | Tarefas de teste relacionadas | Cobertura |
|---|---|---|---|
| FR-01 — Buscar e selecionar cidade | T-11, T-16, T-24, T-26 | T-13, T-20, T-28, T-29, T-30 | Coberto |
| FR-02 — Consultar clima atual | T-12, T-17, T-24, T-26 | T-13, T-22, T-28, T-29 | Coberto |
| FR-03 — Consultar previsão de cinco dias | T-06, T-07, T-12, T-18, T-39 | T-09, T-10, T-13, T-23, T-40, T-29 | Coberto |
| FR-04 — Alternar unidade de temperatura | T-05, T-19, T-38, T-39 | T-08, T-21, T-25, T-40, T-29 | Coberto |
| FR-05 — Comunicar estados da consulta | T-14, T-15, T-24, T-26 | T-27, T-28, T-30 | Coberto |

Todos os requisitos funcionais FR-01 a FR-05 têm tarefas de implementação correspondentes. Não há requisito funcional sem tarefa; a matriz separa implementação de verificação para facilitar a quebra posterior em subtarefas.

## Prioridade e tamanho

Prioridade indica ordem de valor/urgência, não dispensa os gates de lançamento. `P0` entrega a primeira fatia utilizável; `P1` completa as funcionalidades da v1; `P2` cobre hardening e validações de release, algumas obrigatórias antes de publicar. Tamanho relativo: `P` até meio dia, `M` cerca de 1–2 dias, `G` mais de 2 dias. Estimativas são relativas e devem ser revistas pela equipe.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | P |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P1 | P |
| T-06 | P1 | P |
| T-07 | P0 | P |
| T-08 | P1 | P |
| T-09 | P1 | P |
| T-10 | P1 | P |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | P |
| T-15 | P0 | P |
| T-16 | P0 | M |
| T-17 | P0 | P |
| T-18 | P1 | P |
| T-19 | P1 | P |
| T-20 | P0 | P |
| T-21 | P1 | P |
| T-22 | P0 | P |
| T-23 | P1 | P |
| T-24 | P0 | M |
| T-25 | P1 | M |
| T-26 | P0 | M |
| T-27 | P0 | P |
| T-28 | P0 | P |
| T-29 | P1 | M |
| T-30 | P1 | M |
| T-31 | P1 | M |
| T-32 | P2 | M |
| T-33 | P2 | M |
| T-34 | P2 | M |
| T-35 | P2 | M |
| T-36 | P2 | P |
| T-37 | P2 | P |
| T-38 | P1 | P |
| T-39 | P1 | M |
| T-40 | P1 | M |

Não há tarefas `G`: o backlog foi dividido em unidades de até dois dias estimados. T-35 é um gate legal de lançamento; T-36 implementa atribuição somente se T-35 confirmar que ela é exigida.

## Sequência de entrega em fatias verticais

### Fatia 1 — Buscar cidade e ver clima atual

**Resultado visível:** a pessoa busca uma cidade, escolhe uma localidade e vê as condições atuais em Celsius, com loading, vazio e erro tratados.

**Ordem sugerida:** fundação e tipos (T-01 a T-04) → código WMO e APIs (T-07, T-11, T-12) → hook e componentes do fluxo atual (T-24, T-14 a T-17) → integração (T-26) → testes do serviço, componentes e tela (T-13, T-20, T-22, T-27, T-28).

**Prioridade:** P0. É a menor entrega que já permite validar valor com usuários.

### Fatia 2 — Completar previsão de cinco dias e unidade

**Resultado visível:** acrescenta resumo de hoje + quatro dias, alternância Celsius/Fahrenheit e persistência local da unidade.

**Ordem sugerida:** funções de temperatura/data (T-05, T-06) → preferência no hook (T-38) → componentes de previsão/unidade (T-18, T-19) → integração na tela (T-39) → testes unitários e de integração (T-08 a T-10, T-21, T-23, T-25, T-40) → E2E completo em desktop e mobile (T-29).

**Prioridade:** P1. Completa os FR-03 e FR-04 da v1.

### Fatia 3 — Hardening e autorização para lançamento

**Resultado:** comprova falhas recuperáveis, responsividade, compatibilidade e acessibilidade; fecha metas operacionais e conformidade do provedor.

**Ordem sugerida:** falhas E2E e viewports (T-30, T-31) → matriz de navegadores e acessibilidade (T-32, T-33) → aprovações operacionais e termos do provedor (T-34, T-35) → atribuição e documentação de privacidade conforme decisões (T-36, T-37).

**Prioridade:** P2 para planejamento, mas T-32 a T-37 continuam sendo gates antes de publicar quando exigidos pela spec ou pelos termos do provedor.
