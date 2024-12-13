import app = require("teem");
const cookieLogin = "fitChangeUser";

class ApiRoute {

    //buscar receitas por nome ou por id
    public async buscarReceitas(req: app.Request, res: app.Response, filtros: any = {}, retornarJson: boolean = true, limit: number = 100) {
        let recId = req.query["recId"] as string || filtros.recId as string;
        let nome = req.query["nome"] as string || filtros.nome as string;

        try {
            return await app.sql.connect(async (sql) => {
                let lista;
                if (recId) {
                    lista = await sql.query(`
                        SELECT r.recId, r.recNome, r.recDesc
                        FROM receita r
                        WHERE r.recId = ?
                        LIMIT ?`, [recId, limit]);
                } else if (nome) {
                    lista = await sql.query(`
                        SELECT r.recId, r.recNome, r.recDesc
                        FROM receita r
                        WHERE r.recNome LIKE ?
                        LIMIT ?`, [`%${nome}%`, limit]);
                } else {
                    lista = await sql.query(`
                        SELECT r.recId, r.recNome, r.recDesc
                        FROM receita r
                        LIMIT ?`, [limit]);
                }

                const receitas = [];
                for (const item of lista) {
                    const ingredientes = await this.buscarIngredientes(req, res, { recId: recId }, false);
                    const categorias = await this.buscarCategorias(req, res, { recId: recId }, false);

                    receitas.push({
                        id: item.recId,
                        nome: item.recNome,
                        descricao: item.recDesc,
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



    @app.http.post()
    @app.route.formData()
    public async criarReceita(req: app.Request, res: app.Response) {
        let receita: any = req.body;
        let ingredientesArray;
        let categoriasArray;

        if (!receita || !receita.nome || !receita.descricao || !receita.ingredientes || !receita.categoriasIds) {
            res.status(400).json("Dados inválidos");
            return;
        }

        const imagem = req.uploadedFiles?.imagem;

        if (!imagem) {
            res.status(400).json("Imagem é obrigatória");
            return;
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validImageTypes.includes(imagem.mimetype)) {
            res.status(400).json("Formato de imagem inválido. Apenas JPEG, PNG ou JPG são permitidos.");
            return;
        }

        try {
            await app.sql.connect(async (sql) => {
                await sql.beginTransaction();

                const result: any = await sql.query(`
                    INSERT INTO receita (usuId, recNome, recDesc) 
                    VALUES (?, ?, ?)`,
                    [1, receita.nome, receita.descricao]
                );

                let recId: number = result.insertId;

                try {
                    ingredientesArray = typeof receita.ingredientes === 'string' ? JSON.parse(receita.ingredientes) : receita.ingredientes;
                } catch (error) {
                    res.status(400).json({ error: 'Formato inválido para ingredientes.' });
                    return;
                }

                for (let ingrediente of ingredientesArray) {
                    await sql.query(`
                        INSERT INTO item_receita (recId, foodId, qtd) 
                        VALUES (?, ?, ?)`,
                        [recId, ingrediente.id, ingrediente.gramas]
                    );
                }

                try {
                    categoriasArray = typeof receita.categoriasIds === 'string' ? JSON.parse(receita.categoriasIds) : receita.categoriasIds;
                } catch (error) {
                    res.status(400).json({ error: 'Formato inválido para categoriasIds.' });
                    return;
                }

                for (let catId of categoriasArray) {
                    await sql.query(`
                        INSERT INTO item_categoria (recId, catId) 
                        VALUES (?, ?)`,
                        [recId, catId]
                    );
                }

                const filePath = `/public/img/receitas/${recId}.jpeg`;
                await app.fileSystem.saveUploadedFile(filePath, imagem);

                await sql.commit();
                res.json({ success: true, message: "Receita criada com sucesso!", recId: recId });
            });
        } catch (error) {
            console.error("Erro ao criar receita:", error);
            res.status(500).json({ error: "Erro interno ao criar receita." });
        }
    }

    @app.http.post()
    public async criarUsuario(req: app.Request, res: app.Response) {
        const usuario: any = req.body;


        if (!usuario || !usuario.usuNome || !usuario.usuEmail || !usuario.usuSenha || !usuario.usuPesoKg ||
            !usuario.usuAlturaCm || !usuario.usuDtNasc || !usuario.usuSexo || !usuario.usuCidade ||
            !usuario.usuObjetivo || !usuario.usuAtividade) {
            res.status(400).json("Dados inválidos");
            return;
        }

        try {
            await app.sql.connect(async (sql) => {
                await sql.beginTransaction();

                const result: any = await sql.query(`
                    INSERT INTO usuario (usuNome, usuEmail, usuSenha, usuPesoKg, usuAlturaCm, usuDtNasc, usuSexo, 
                                         usuCidade, usuObjetivo, usuAtivdade)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        usuario.usuNome, usuario.usuEmail, usuario.usuSenha, usuario.usuPesoKg, usuario.usuAlturaCm,
                        usuario.usuDtNasc, usuario.usuSexo, usuario.usuCidade, usuario.usuObjetivo, usuario.usuAtivdade
                    ]
                );

                const usuarioId: number = result.insertId;

                await sql.commit();
                res.json({ success: true, message: "Usuário criado com sucesso!", usuarioId });
            });
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            res.status(500).json({ error: "Erro interno ao criar usuário." });
        }
    }

    @app.http.put()
    @app.route.formData()
    public async editarReceita(req: app.Request, res: app.Response) {
        const recId = req.body.recId;
        const recNome = req.body.recNome;
        const recDesc = req.body.recDesc;
        const ingredientes = JSON.parse(req.body.ingredientes); 
        const categorias = JSON.parse(req.body.categoriasIds); 

        if (!recId || !recNome || !recDesc || !ingredientes || !categorias) {
            res.status(400).json("Dados inválidos");
            return;
        }

        try {
            await app.sql.connect(async (sql) => {
                await sql.beginTransaction();

                await sql.query(`
                UPDATE receita
                SET recNome = ?, recDesc = ?
                WHERE recId = ?`,
                    [recNome, recDesc, recId]
                );

                await sql.query(`
                DELETE FROM item_receita
                WHERE recId = ?`, [recId]
                );

                for (const ingrediente of ingredientes) {
                    await sql.query(`
                    INSERT INTO item_receita (recId, foodId, qtd)
                    VALUES (?, ?, ?)`,
                        [recId, ingrediente.id, ingrediente.gramas]
                    );
                }

                await sql.query(`
                DELETE FROM item_categoria
                WHERE recId = ?`, [recId]
                );

                for (const catId of categorias) {
                    await sql.query(`
                    INSERT INTO item_categoria (recId, catId)
                    VALUES (?, ?)`,
                        [recId, catId]
                    );
                }

                await sql.commit();
                res.json({ success: true, message: "Receita editada com sucesso!" });
            });
        } catch (error) {
            console.error("Erro ao editar receita:", error);
            res.status(500).json({ error: "Erro interno ao editar receita." });
        }
    }


    @app.http.post()
    public async login(req: app.Request, res: app.Response) {
        let usuario: any = req.body;

        if (!usuario) {
            res.status(400).json("Dados inválidos");
            return;
        }

        if (!usuario.usuEmail) {
            res.status(400).json("E-mail inválido");
            return;
        }

        if (!usuario.usuSenha) {
            res.status(400).json("Senha inválida");
            return;
        }

        let idUsu = 0;
        let usuNome = "";

        try {
            await app.sql.connect(async (sql) => {
                let lista: any[] = await sql.query(`
                SELECT usuId, usuNome 
                FROM usuario 
                WHERE usuEmail = ? AND usuSenha = ?`,
                    [usuario.usuEmail, usuario.usuSenha]
                );

                if (lista.length) {
                    idUsu = lista[0].usuId;
                    usuNome = lista[0].usuNome;
                }
            });

            if (!idUsu) {
                res.status(400).json("Usuário ou senha inválido");
                return;
            }

            res.cookie(cookieLogin, JSON.stringify({ idUsu, usuNome }), {
                secure: false,
                maxAge: 365 * 24 * 60 * 60 * 1000,
                sameSite: "strict"
            });

            res.redirect("/home");

        } catch (error) {
            console.error("Erro ao efetuar login:", error);
            res.status(500).json({ error: "Erro interno ao efetuar login." });
        }
    }


}

export = ApiRoute;
