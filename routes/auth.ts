import app = require("teem");

class AuthRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("auth/entrar");
	}

    public async cadastro(req: app.Request, res: app.Response) {
		res.render("auth/cadastro");
	}

}

export = AuthRoute;
