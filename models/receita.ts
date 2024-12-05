import Ingrediente = require("./ingrediente");

interface Receita {
    id: number;
    nome: string;
    descricao: string;
    img: string;
    exclusao: string | null;
    ingredientes: Ingrediente[];
    categoriasIds: [];
}

export = Receita;
