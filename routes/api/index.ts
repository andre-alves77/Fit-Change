import app = require("teem");

class ApiRoute {

    public async buscarIngredientes(req: app.Request, res: app.Response) {
        let id = req.query["id"] as string;
        let ing = req.query["ingrediente"] as string;

        try {
            await app.sql.connect(async (sql) => {
                let lista;
                if (id) {
                    lista = await sql.query(`
                            Select f.id, name, carbohydrates, protein, lipids, kcal, dietaryFiber 
                            from foods f
                            inner join nutrients n on f.id = n.foodId
                            where f.id = ?`, [id]);
                    const ingredientes = lista.map((item: any) => {
                        return {
                            id: item.id,
                            nome: item.name,
                            gramas: 100,
                            carboidratos: item.carbohydrates,
                            proteinas: item.protein,
                            gorduras: item.lipids,
                            calorias: item.kcal,
                            fibras: item.dietaryFiber
                        };
                    });

                    res.json(ingredientes);
                } else if (ing) {
                    lista = await sql.query(`
                            Select f.id, name, carbohydrates, protein, lipids, kcal, dietaryFiber 
                            from foods f
                            inner join nutrients n on f.id = n.foodId
                            where name LIKE ?`, [`%${ing}%`]);

                    const ingredientes = lista.map((item: any) => {
                        return {
                            id: item.id,
                            nome: item.name,
                            gramas: 100,
                            carboidratos: item.carbohydrates,
                            proteinas: item.protein,
                            gorduras: item.lipids,
                            calorias: item.kcal,
                            fibras: item.dietaryFiber
                        };
                    });

                    res.json(ingredientes);
                } else {
                    throw new Error("Parâmetros inválidos");
                }

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

}

export = ApiRoute;