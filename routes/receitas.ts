import app = require("teem");
import Usuario = require("../models/usuario");
import Receita = require("../models/receita");
import Ingrediente = require("../models/ingrediente");


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


	public async adicionarIngrediente(req: app.Request, res: app.Response) {
		const { id, name } = req.body;

		this.ingredientes.push({ id, name });

		res.json(this.ingredientes);
	}


	@app.http.post()
	public async criarReceita(req: app.Request, res: app.Response) {
		let receita: Receita = req.body;
	
		// Validações dos dados da receita
		if (!receita || !receita.nome || !receita.descricao || !receita.ingredientes || !receita.categoriasIds) {
			res.status(400).json("Dados inválidos");
			return;
		}
	
		try {
			await app.sql.connect(async (sql) => {
				// Inserir a receita na tabela 'receita'
				const result: any = await sql.query(`
					INSERT INTO receita (usuId, recNome, recDesc, recImg) 
					VALUES (?, ?, ?, ?)`, 
					[1, receita.nome, receita.descricao, receita.img]
				);
	
				console.log("Resultado da inserção de receita:", result);
	
				let recId: number | undefined;
				if (result && result.insertId) {
					recId = result.insertId;
				} else {
					console.log("Estrutura inesperada do retorno:", result);
					res.status(500).json({ error: "Falha ao obter o ID da receita." });
					return;
				}
	
				for (let ingrediente of receita.ingredientes) {
					await sql.query(`
						INSERT INTO item_receita (recId, foodId, qtd) 
						VALUES (?, ?, ?)`, 
						[recId, ingrediente.id, ingrediente.gramas]
					);
				}
	
				for (let catId of receita.categoriasIds) {
					await sql.query(`
						INSERT INTO item_categoria (recId, catId) 
						VALUES (?, ?)`, 
						[recId, catId]
					);
				}
	
				res.json({ success: true, message: "Receita criada com sucesso!" });
			});
		} catch (error) {
			console.error("Erro ao criar receita:", error);
			res.status(500).json({ error: "Erro interno ao criar receita." });
		}
	}
	
	

	
}
export = ReceitasRoute;