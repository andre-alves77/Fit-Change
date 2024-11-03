import app = require("teem");

class ReceitasRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("receitas/index");
	}

}

export = ReceitasRoute;
