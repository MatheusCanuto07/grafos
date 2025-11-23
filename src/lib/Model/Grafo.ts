export class Vertice {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}

export class Aresta {
  origem: number;
  destino: number;
  peso: number;
  constructor(origem: number, destino: number, peso: number) {
    this.origem = origem;
    this.destino = destino;
    this.peso = peso;
  }
}

export class Grafo {
  vertices: Vertice[];
  arestas: Aresta[];
  dirigido: boolean;

  constructor(
    vertices: Vertice[] = [],
    arestas: Aresta[] = [],
    dirigido: boolean = false
  ) {
    this.vertices = vertices;
    this.arestas = arestas;
    this.dirigido = dirigido;
  }
}
