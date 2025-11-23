# Documentação do Projeto de Grafos

## Métodos

### gerarGrafo()

Gera um grafo com base nos parâmetros definidos pelo usuário,
incluindo: - Número de vértices - Direcionamento - Ponderação -
Conectividade - Geração automática de pesos quando aplicável

### desenharGrafo()

Renderiza o grafo atual na tela utilizando a biblioteca de visualização
configurada.

### gerarMST()

Gera a árvore geradora mínima (MST) do grafo atual usando Kruskal. Para
dígrafos, converte arestas para forma subjacente.

### caminhoMinimo()

Calcula o caminho mínimo entre dois vértices `verticeX` e `verticeY`
definidos pelo usuário.

### fechoTransitivo()

Calcula o fecho transitivo de um vértice: - Direto e reverso no caso de
dígrafos.

### buscaProfundidade()

Executa DFS a partir de um vértice inicial.

### buscaLargura()

Executa BFS a partir de um vértice inicial.
