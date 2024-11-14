import { request } from "http";
import app = require("teem");

class IndexRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("index/index");
	}

	public async sobre(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Sobre"
		};

		res.render("index/sobre", opcoes);
	}

		// essa rota deverá ser exluida pois o index de usuario logado é um e o index de usuario sem conta é outro
	public async home(req: app.Request, res: app.Response) {
		res.render("index/home");
	}

	public async empresa(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Nossa Empresa"
		};

		res.render("index/empresa", opcoes);
	}

	public async perfil(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Perfil"
		};

		res.render("index/perfil", opcoes);
	}

	public async produtos(req: app.Request, res: app.Response) {
		let produtoA = {
			id: 1,
			nome: "Produto A",
			valor: 25
		};

		let produtoB = {
			id: 2,
			nome: "Produto B",
			valor: 15
		};

		let produtoC = {
			id: 3,
			nome: "Produto C",
			valor: 100
		};

		let produtosVindosDoBanco = [ produtoA, produtoB, produtoC ];

		let opcoes = {
			titulo: "Listagem de Produtos",
			produto: null,
			produtos: produtosVindosDoBanco
		};

		res.render("index/produtos", opcoes);
	}
	
	public async teste(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "teste"
		}

		res.render("index/teste", opcoes);
	}
}

export = IndexRoute;
