import app = require("teem");
import Usuario = require("../models/usuario");
import Receita = require("../models/receita");
import Ingrediente = require("../models/ingrediente");
import ApiRoute = require("./api");

app.multer
class ReceitasRoute {

	private ingredientes: { id: number; name: string }[] = [];

	public async index(req: app.Request, res: app.Response) {

		const opcoes = {
			titulo: "Home",
		};

		res.render("receitas/index", opcoes);
	}


	public async criar(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Criar receita",
			ingredientes: this.ingredientes,
		};

		res.render("receitas/criar", opcoes);
	}

	public async receita(req: app.Request, res: app.Response) {
		let apiRoute = new ApiRoute();
		try {

			const recId = req.query["recId"] as string;

			const receitas = await apiRoute.buscarReceitas(req, res, { recId: recId }, false); // Buscar receitas sem retornar em JSON

			if (receitas.length === 0) {
				return res.status(404).send("Receita não encontrada");
			}

			const receita = receitas[0];

			res.render("receitas/receita", { receita: receita });

		} catch (error) {
			console.error("Erro ao buscar a receita:", error);
			res.status(500).send("Erro ao carregar a receita.");
		}
	}
	
	public async editar(req: app.Request, res: app.Response) {
		let apiRoute = new ApiRoute();
		try {
			const recId = req.query["recId"] as string;

			const receitas = await apiRoute.buscarReceitas(req, res, { recId: recId }, false);

			if (receitas.length === 0) {
				return res.status(404).send("Receita não encontrada");
			}

			const receita = receitas[0];

			res.render("receitas/editar", { receita });
		} catch (error) {
			console.error("Erro ao buscar a receita:", error);
			res.status(500).send("Erro ao carregar a receita.");
		}
	}

	public async adicionarIngrediente(req: app.Request, res: app.Response) {
		const { id, name } = req.body;

		this.ingredientes.push({ id, name });

		res.json(this.ingredientes);
	}

}
export = ReceitasRoute;