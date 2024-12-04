
interface Ingrediente {
	id: number;
	nome: string;
    gramas: 100;
	carboidratos: number;
	proteinas: number;
	gorduras: number;
	calorias: number;
	fibras: number;
	exclusao: string | null;
}

export = Ingrediente;
