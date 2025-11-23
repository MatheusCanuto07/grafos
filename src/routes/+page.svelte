<script lang="ts">
  import { Network } from "vis-network";
  import { Vertice, Aresta, Grafo } from "$lib/Model/Grafo";

  let grafo: Grafo | null = null;

  let graphContainer: HTMLDivElement;

  function gerarGrafo() {
    const vertices: Vertice[] = [];
    const arestas: Aresta[] = [];

    for (let i = 1; i <= numVertices; i++) {
      vertices.push(new Vertice(i));
    }

    const gerarPeso = () => {
      if (!ponderado) return undefined;

      const p = Number(peso);

      if (!p || p <= 0) {
        return Math.floor(Math.random() * 10) + 1;
      }

      return p === 1
        ? Math.floor(Math.random() * 10) + 1
        : p;
    };


    const criarAresta = (origem: number, destino: number) => {
      const w = gerarPeso();
      const pesoFinal = w === undefined ? 1 : w;
      return new Aresta(origem, destino, pesoFinal);
    };


    if (conexo) {
      for (let i = 1; i < numVertices; i++) {
        arestas.push(criarAresta(i, i + 1));
      }
    }

    for (let i = 1; i <= numVertices; i++) {
      const destino = Math.floor(Math.random() * numVertices) + 1;
      if (destino !== i) {
        arestas.push(criarAresta(i, destino));
      }
    }

    grafo = new Grafo(vertices, arestas, dirigido);
    desenharGrafo();
  }

  function desenharGrafo() {
    if (!grafo || !graphContainer) return;

    const nodes = grafo.vertices.map((v) => ({
      id: v.id,
      label: `V${v.id}`
    }));

    const edges = grafo.arestas.map((a) => ({
      from: a.origem,
      to: a.destino,
      label: ponderado ? `${a.peso}` : "",
      arrows: grafo?.dirigido ? "to" : undefined
    }));

    new Network(
      graphContainer,
      { nodes, edges },
      {
        autoResize: true,
        physics: true
      }
    );
  }

  function gerarMST() {
    if (!grafo) return;

    const vertices = grafo.vertices;

    const arestasParaMST = grafo.dirigido
      ? grafo.arestas.map(a => ({
          origem: a.origem,
          destino: a.destino,
          peso: a.peso
        }))
      : grafo.arestas;

    const arestasOrdenadas = [...arestasParaMST].sort((a, b) => a.peso - b.peso);

    const parent = new Map<number, number>();
    const rank = new Map<number, number>();

    vertices.forEach(v => {
      parent.set(v.id, v.id);
      rank.set(v.id, 0);
    });

    function find(v: number): number {
      if (parent.get(v) !== v) {
        parent.set(v, find(parent.get(v)!));
      }
      return parent.get(v)!;
    }

    function union(v1: number, v2: number) {
      const r1 = find(v1);
      const r2 = find(v2);

      if (r1 === r2) return;

      if (rank.get(r1)! < rank.get(r2)!) {
        parent.set(r1, r2);
      } else if (rank.get(r1)! > rank.get(r2)!) {
        parent.set(r2, r1);
      } else {
        parent.set(r2, r1);
        rank.set(r1, rank.get(r1)! + 1);
      }
    }

    const mstArestas: Aresta[] = [];
    const totalVertices = vertices.length;

    for (const a of arestasOrdenadas) {
      const r1 = find(a.origem);
      const r2 = find(a.destino);

      if (r1 !== r2) {
        mstArestas.push(new Aresta(a.origem, a.destino, a.peso));
        union(a.origem, a.destino);
        
        if (mstArestas.length === totalVertices - 1 && totalVertices > 0) {
            break;
        }
      }
    }

    grafo = new Grafo(vertices, mstArestas, false);
    desenharGrafo();
  }

  function caminhoMinimo() {
    if (!grafo) return;

    const vertices = grafo.vertices;
    const dist = new Map<number, number>();
    const prev = new Map<number, { id: number, peso: number } | null>();
    const naoVisitados = new Set<number>();

    vertices.forEach(v => {
      dist.set(v.id, Infinity);
      prev.set(v.id, null);
      naoVisitados.add(v.id);
    });

    dist.set(verticeX, 0);

    while (naoVisitados.size > 0) {
      let u: number | null = null;
      let menorDist = Infinity;

      for (const id of naoVisitados) {
        const d = dist.get(id)!;
        if (d < menorDist) {
          menorDist = d;
          u = id;
        }
      }

      if (u === null || menorDist === Infinity) break;
      if (u === verticeY) break;

      naoVisitados.delete(u);

      const vizinhos = grafo.arestas.filter(a => 
        a.origem === u || (!grafo!.dirigido && a.destino === u)
      );

      for (const aresta of vizinhos) {
        const v = aresta.origem === u ? aresta.destino : aresta.origem;
        
        if (!naoVisitados.has(v)) continue;

        const alt = dist.get(u)! + aresta.peso;
        if (alt < dist.get(v)!) {
          dist.set(v, alt);
          prev.set(v, { id: u, peso: aresta.peso });
        }
      }
    }

    const caminhoArestas: Aresta[] = [];
    let atual = verticeY;

    while (atual !== verticeX) {
      const anterior = prev.get(atual);
      if (!anterior) break;

      caminhoArestas.push(new Aresta(anterior.id, atual, anterior.peso));
      atual = anterior.id;
    }

    grafo = new Grafo(vertices, caminhoArestas.reverse(), true);
    desenharGrafo();
  }

  function fechoTransitivo() {
    if (!grafo) return;

    function buscarAlcancaveis(inicio: number, inverterDirecao: boolean): Set<number> {
      const visitados = new Set<number>([inicio]);
      const fila = [inicio];

      while (fila.length > 0) {
        const u = fila.shift()!;
        
        const arestasAdjacentes = grafo!.arestas.filter(a => {
          if (!grafo!.dirigido) return a.origem === u || a.destino === u;
          return inverterDirecao ? a.destino === u : a.origem === u;
        });

        for (const a of arestasAdjacentes) {
          const v = !grafo!.dirigido
            ? (a.origem === u ? a.destino : a.origem)
            : (inverterDirecao ? a.origem : a.destino);

          if (!visitados.has(v)) {
            visitados.add(v);
            fila.push(v);
          }
        }
      }
      return visitados;
    }

    const fechoDireto = buscarAlcancaveis(verticeTransitivo, false);
    const fechoInverso = buscarAlcancaveis(verticeTransitivo, true);

    const idsNoFecho = new Set([...fechoDireto, ...fechoInverso]);

    const novosVertices = grafo.vertices.filter(v => idsNoFecho.has(v.id));
    const novasArestas = grafo.arestas.filter(a => 
      idsNoFecho.has(a.origem) && idsNoFecho.has(a.destino)
    );

    grafo = new Grafo(novosVertices, novasArestas, grafo.dirigido);
    desenharGrafo();
  }

  function buscaProfundidade() {
    if (!grafo) return;

    const visitados = new Set<number>();
    const arestasDFS: Aresta[] = [];

    function dfs(u: number) {
      visitados.add(u);

      const vizinhos = grafo!.arestas.filter(a => 
        a.origem === u || (!grafo!.dirigido && a.destino === u)
      );

      for (const a of vizinhos) {
        const v = a.origem === u ? a.destino : a.origem;

        if (!visitados.has(v)) {
          arestasDFS.push(new Aresta(u, v, a.peso));
          dfs(v);
        }
      }
    }

    dfs(verticeBusca);

    grafo = new Grafo(grafo.vertices, arestasDFS, grafo.dirigido);
    desenharGrafo();
  }

  function buscaLargura() {
    if (!grafo) return;

    const visitados = new Set<number>([verticeBusca]);
    const fila = [verticeBusca];
    const arestasBFS: Aresta[] = [];

    while (fila.length > 0) {
      const u = fila.shift()!;

      const vizinhos = grafo.arestas.filter(a => 
        a.origem === u || (!grafo!.dirigido && a.destino === u)
      );

      for (const a of vizinhos) {
        const v = a.origem === u ? a.destino : a.origem;

        if (!visitados.has(v)) {
          visitados.add(v);
          fila.push(v);
          arestasBFS.push(new Aresta(u, v, a.peso));
        }
      }
    }

    grafo = new Grafo(grafo.vertices, arestasBFS, grafo.dirigido);
    desenharGrafo();
  }

  let numVertices = $state(5);
  
  let verticeX = $state(1);
  let verticeY = $state(5);
  let verticeTransitivo = $state(1);
  let verticeBusca = $state(1);

  let ponderado = $state(false);
  let peso = $state(1);
  let dirigido = $state(true);
  let conexo = $state(true);
</script>

<div class="drawer lg:drawer-open">
  <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col items-center justify-center">
    <label for="my-drawer-3" class="btn drawer-button lg:hidden">
      Abrir Menu
    </label>
    <div class="w-full h-[600px] p-4">
      <div
        bind:this={graphContainer}
        class="w-full h-full border border-base-300 rounded">
      </div>
    </div>
  </div>

  <div class="drawer-side">
    <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4 space-y-4">
      <h2 class="text-lg font-bold">Configurar Grafo</h2>
      <li>
        <label class="form-control">
          <span class="label-text">Número de vértices</span>
          <input
            type="number"
            bind:value={numVertices}
            min="1"
            class="input input-bordered"
          />
        </label>
      </li>
      <li>
        <label class="cursor-pointer flex items-center gap-3">
          <input type="checkbox" bind:checked={ponderado} class="checkbox" />
          <span>Ponderado</span>
        </label>
      </li>
      <!-- <li>
        <label class="form-control">
          <span class="label-text">Peso</span>
          <input
            type="number"
            bind:value={peso}
            min="1"
            class="input input-bordered"
          />
        </label>
      </li> -->
      <li>
        <label class="cursor-pointer flex items-center gap-3">
          <input type="checkbox" bind:checked={dirigido} class="checkbox" />
          <span>Dirigido</span>
        </label>
      </li>
      <li>
        <label class="cursor-pointer flex items-center gap-3">
          <input type="checkbox" bind:checked={conexo} class="checkbox" />
          <span>Conexo</span>
        </label>
      </li>
      <li>
        <button class="btn btn-primary w-full" onclick={gerarGrafo}>
          Gerar Grafo
        </button>
      </li>

      <div class="divider"></div>

      <h2 class="text-lg font-bold">Algoritmos</h2>
      <li>
        <button class="btn w-full" onclick={gerarMST}>
          Árvore Geradora Mínima
        </button>
      </li>
      <li>
        <div class="border border-base-300 rounded-xl p-3 flex flex-col gap-3 bg-base-100">
          <button class="btn w-full" onclick={caminhoMinimo}>
            Caminho Mínimo
          </button>

          <label class="form-control">
            <span class="label-text">Vertice x</span>
            <input
              type="number"
              bind:value={verticeX}
              min="1"
              class="input input-bordered"
            />
          </label>

          <label class="form-control">
            <span class="label-text">Vertice y</span>
            <input
              type="number"
              bind:value={verticeY}
              min="1"
              class="input input-bordered"
            />
          </label>
        </div>
      </li>
 
      <li>
        <div class="border border-base-300 rounded-xl p-3 flex flex-col gap-3 bg-base-100">
          <label class="form-control">
              <span class="label-text">Vertice Fecho Transitivo</span>
              <input
                type="number"
                bind:value={verticeTransitivo}
                min="1"
                class="input input-bordered"
              />
            </label>
          <button class="btn w-full" onclick={fechoTransitivo}>
            Fecho Transitivo
          </button>
        </div>
      </li>

      <li>
        <div class="border border-base-300 rounded-xl p-3 flex flex-col gap-3 bg-base-100">
          <label class="form-control">
              <span class="label-text">Vertice para Busca</span>
              <input
                type="number"
                bind:value={verticeBusca}
                min="1"
                class="input input-bordered"
              />
            </label>
          <button class="btn w-full" onclick={buscaProfundidade}>
            Busca Profundidade
          </button>

          <button class="btn w-full" onclick={buscaLargura}>
            Busca em Largura
          </button>
        </div>
      </li>

    </ul>
  </div>
</div>

