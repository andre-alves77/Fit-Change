import app = require("teem");

class ReceitasRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("receitas/receita");
	}

	public async criar(req: app.Request, res: app.Response) {
		res.render("receitas/criar_receita");
	}

}

export = ReceitasRoute;
