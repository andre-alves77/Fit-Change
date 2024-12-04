import app = require("teem");


class ReceitasRoute {

	private ingredientes: { id: number; name: string }[] = [];

	public async index(req: app.Request, res: app.Response) {
		res.render("receitas/index");
	}

	public async criar(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Criar receita",
			ingredientes: this.ingredientes,
		};


		res.render("receitas/criar", opcoes);
	}

	public async receita(req: app.Request, res: app.Response) {
		res.render("receitas/receita");
	}

	public async buscarIngredientes(req: app.Request, res: app.Response) {
		let ing = req.query["ingrediente"] as string;
	
		try {
			await app.sql.connect(async (sql) => {
				let lista = await sql.query(`
					Select f.id,name, carbohydrates, protein,lipids,kcal,dietaryFiber 
					  from foods f
                      inner join nutrients n on f.id = n.foodId
					  where name LIKE ?`, [`%${ing}%`]);
	
				res.json(lista);
			});
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar ingredientes." });
		}
	}

	public async buscarCategorias(req: app.Request, res: app.Response) {
	
		try {
			await app.sql.connect(async (sql) => {
				let lista = await sql.query(`select * from categoriaReceita`);
				res.json(lista);
			});
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar categorias." });
		}
	}

	public async adicionarIngrediente(req: app.Request, res: app.Response) {
		const { id, name } = req.body; 
	
		this.ingredientes.push({ id, name });
	
		res.json(this.ingredientes);
	  }
	
}

export = ReceitasRoute;