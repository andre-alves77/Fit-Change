import app = require("teem");
import Usuario = require("../models/usuario");
import Receita = require("../models/receita");
import Ingrediente = require("../models/ingrediente");

app.multer
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
	@app.route.formData()
	public async criarReceita(req: app.Request, res: app.Response) {
		let receita: Receita = req.body;
		let ingredientesArray;
		let categoriasArray;

		// Validações dos dados da receita
		if (!receita || !receita.nome || !receita.descricao || !receita.ingredientes || !receita.categoriasIds) {
			res.status(400).json("Dados inválidos");
			return;
		}

		// Acessando o arquivo enviado
		const imagem = req.uploadedFiles?.imagem;

		// Verificar se a imagem foi enviada
		if (!imagem) {
			res.status(400).json("Imagem é obrigatória");
			return;
		}

		// Verificar se o tipo de arquivo é permitido (jpeg, png, jpg)
		const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
		if (!validImageTypes.includes(imagem.mimetype)) {
			res.status(400).json("Formato de imagem inválido. Apenas JPEG, PNG ou JPG são permitidos.");
			return;
		}

		// Conectar ao banco de dados e inserir a receita
		try {
			await app.sql.connect(async (sql) => {
				// Inserir a receita na tabela 'receita' sem a imagem ainda
				const result: any = await sql.query(`
					INSERT INTO receita (usuId, recNome, recDesc) 
					VALUES (?, ?, ?)`,
					[1, receita.nome, receita.descricao]
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

				// Definindo o caminho do arquivo com o ID da receita
				const filePath = `uploads/receitas/${recId}-${imagem.originalname}`;

				// Salvar a imagem com o novo nome baseado no ID da receita
				await app.fileSystem.saveUploadedFile(filePath, imagem);

				// Atualizar a receita no banco de dados com o caminho da imagem
				await sql.query(`
					UPDATE receita SET recImg = ? WHERE recId = ?`,
					[filePath, recId]
				);



				try {
					// Verifique se 'ingredientes' é uma string e converta para um array de objetos
					ingredientesArray = typeof receita.ingredientes === 'string'
						? JSON.parse(receita.ingredientes)
						: receita.ingredientes;
				} catch (error) {
					console.log('Erro ao processar os ingredientes:', error);
					res.status(400).json({ error: 'Formato inválido para ingredientes.' });
					return;
				}
				// Inserir os ingredientes da receita
				for (let ingrediente of ingredientesArray) {
					await sql.query(`
						INSERT INTO item_receita (recId, foodId, qtd) 
						VALUES (?, ?, ?)`,
						[recId, ingrediente.id, ingrediente.gramas]
					);
				}

				try {
					// Verifique se categoriasIds é uma string e converta para um array
					categoriasArray = typeof receita.categoriasIds === 'string'
						? JSON.parse(receita.categoriasIds)
						: receita.categoriasIds;
				} catch (error) {
					console.log('Erro ao processar as categorias:', error);
					res.status(400).json({ error: 'Formato inválido para categoriasIds.' });
					return;
				}


				// Inserir as categorias da receita
				for (let catId of categoriasArray) {
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