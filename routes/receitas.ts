import app = require("teem");

class ReceitasRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("receitas/index");
	}

	public async criar(req: app.Request, res: app.Response) {
		res.render("receitas/criar");
	}

	public async receita(req: app.Request, res: app.Response) {
		res.render("receitas/index");
	}

}

export = ReceitasRoute;