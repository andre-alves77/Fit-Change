"use strict";

function waitSwal() {
	Swal.fire({
		html: "Por favor, aguarde...",
		allowOutsideClick: false,
		allowEscapeKey: false,
		allowEnterKey: false,
		didOpen: () => {
			Swal.showLoading()
		}
	});
}

async function exibirErro(response) {
	let r = await response.text();

	let json = null;
	try {
		json = JSON.parse(r);
	} catch (ex) {
		// Apenas ignora...
	}

	if (json) {
		if (typeof json === "string") {
			r = json;
		} else if (json.message) {
			r = json.message;
		}
	}

	return Swal.fire("Erro", r, "error");
}
