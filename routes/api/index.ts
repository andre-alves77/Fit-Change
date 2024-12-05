import app = require("teem");

class ApiRoute {

//buscar receitas por nome ou por id
    public async buscarReceitas(req: app.Request, res: app.Response, filtros: any = {}, retornarJson: boolean = true) {
        let recId = req.query["recId"] as string || filtros.recId as string;
        let nome = req.query["nome"] as string || filtros.nome as string;

        try {
            return await app.sql.connect(async (sql) => {
                let lista;
                if (recId) {
                    lista = await sql.query(`
                        SELECT r.recId, r.recNome, r.recDesc, r.recImg
                        FROM receita r
                        WHERE r.recId = ?`, [recId]);
                } else if (nome) {
                    lista = await sql.query(`
                        SELECT r.recId, r.recNome, r.recDesc, r.recImg
                        FROM receita r
                        WHERE r.recNome LIKE ?`, [`%${nome}%`]);
                } else {
                    throw new Error("Parâmetros inválidos");
                }
                const receitas = [];
                for (const item of lista) {
                    const ingredientes = await this.buscarIngredientes(req, res, { recId: recId }, false);
                    const categorias = await this.buscarCategorias(req, res, { recId: recId }, false);

                    receitas.push({
                        id: item.redId,
                        nome: item.recNome,
                        descricao: item.recDesc,
                        img: item.recImg,
                        exclusao: item.exclusao,
                        ingredientes: ingredientes,
                        categorias: categorias
                    });
                }

                if (retornarJson) {
                    res.json(receitas);
                } else {
                    return receitas;
                }
            });
        } catch (error) {
            console.error("Erro ao buscar receitas:", error);
            if (retornarJson) {
                res.status(500).json({ error: "Erro ao buscar receitas." });
            } else {
                throw error;
            }
        }
    }

    public async buscarIngredientes(req: app.Request, res: app.Response, filtros: any = {}, retornarJson: boolean = true) {
        let recId = req.query["recId"] as string || filtros.recId as string;
        let id = req.query["id"] as string || filtros.id as string;
        let ing = req.query["ingrediente"] as string || filtros.ingrediente as string;

        try {
            return await app.sql.connect(async (sql) => {
                let lista;
                if (id) {
                    lista = await sql.query(`
                        SELECT f.id, f.name, n.carbohydrates, n.protein, n.lipids, n.kcal, n.dietaryFiber 
                        FROM foods f
                        INNER JOIN nutrients n ON f.id = n.foodId
                        WHERE f.id = ?`, [id]);
                } else if (ing) {
                    lista = await sql.query(`
                        SELECT f.id, f.name, n.carbohydrates, n.protein, n.lipids, n.kcal, n.dietaryFiber 
                        FROM foods f
                        INNER JOIN nutrients n ON f.id = n.foodId
                        WHERE f.name LIKE ?`, [`%${ing}%`]);
                } else if (recId) {
                    lista = await sql.query(`
                        SELECT f.id, f.name, n.carbohydrates, n.protein, n.lipids, n.kcal, n.dietaryFiber, ir.qtd
                        FROM foods f
                        INNER JOIN nutrients n ON f.id = n.foodId
                        INNER JOIN item_receita ir ON ir.foodId = f.id
                        WHERE ir.recId = ?`, [recId]);
                } else {
                    throw new Error("Parâmetros inválidos");
                }

                const ingredientes = lista.map((item: any) => ({
                    id: item.id,
                    nome: item.name,
                    gramas: item.qtd || 100,
                    carboidratos: item.carbohydrates,
                    proteinas: item.protein,
                    gorduras: item.lipids,
                    calorias: item.kcal,
                    fibras: item.dietaryFiber
                }));

                if (retornarJson) {
                    res.json(ingredientes);
                } else {
                    return ingredientes;
                }
            });
        } catch (error) {
            if (retornarJson) {
                res.status(500).json({ error: "Erro ao buscar ingredientes." });
            } else {
                throw error;
            }
        }
    }

    public async buscarCategorias(req: app.Request, res: app.Response, filtros: any = {}, retornarJson: boolean = true) {
        const recId = req.query["recId"] as string || filtros.recId as string;

        try {
            return await app.sql.connect(async (sql) => {
                let lista;
                if (recId) {
                    lista = await sql.query(`
                        SELECT c.*
                        FROM categoriaReceita c
                        INNER JOIN item_categoria ic ON c.id = ic.catId
                        WHERE ic.recId = ?`, [recId]);
                } else {
                    lista = await sql.query(`SELECT * FROM categoriaReceita`);
                }

                if (retornarJson) {
                    res.json(lista);
                } else {
                    return lista;
                }
            });
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            if (retornarJson) {
                res.status(500).json({ error: "Erro ao buscar categorias." });
            } else {
                throw error;
            }
        }
    }
}

export = ApiRoute;
