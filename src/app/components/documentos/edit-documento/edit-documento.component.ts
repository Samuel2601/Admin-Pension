import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminService } from "src/app/service/admin.service";
import { GLOBAL } from "src/app/service/GLOBAL";
declare var iziToast: any;
declare var $: any;

@Component({
	selector: "app-edit-documento",
	templateUrl: "./edit-documento.component.html",
	styleUrls: ["./edit-documento.component.css"]
})
export class EditDocumentoComponent implements OnInit {
	public id = "";
	public load_data = false;
	public documento: any = {
		categoria: "",
		visibilidad: ""
	};
	public imgSelect: any | ArrayBuffer = "assets/img/01.jpg";
	public categorias: Array<any> = [];
	public config: any = {};
	public load_btn = false;
	public file: any = undefined;

	public arr_etiquetas: Array<any> = [];
	public token = localStorage.getItem("token");
	public new_etiqueta = "";
	public load_data_etiqueta = false;
	public etiquetas: Array<any> = [];
	public load_etiquetas = false;
	public url = GLOBAL.url;

	constructor(
		private _adminService: AdminService,
		private _router: Router,
		private _route: ActivatedRoute
	) {
		this.config = {
			height: 500
		};
	}

	ngOnInit(): void {
		this._adminService.get_categorias().subscribe((response) => {
			this.categorias = response;
		});

		this._route.params.subscribe((params) => {
			this.id = params["id"];
			//console.log(this.id);
			this.load_data = true;
			this._adminService.obtener_documento_admin(this.id, this.token).subscribe(
				(response) => {
					if (response.data == undefined) {
						this.load_data = false;
						this.documento = undefined;
					} else {
						this.load_data = false;
						this.documento = response.data;
						this.listar_etiquetas();
						this.listar_etiquetas_documento();
						this.imgSelect = this.url + "obtener_portada/" + this.documento.portada;
					}
				},
				(error) => {
					//console.log(error);
				}
			);
		});
	}

	listar_etiquetas() {
		this.load_data_etiqueta = true;
		this._adminService.listar_etiquetas_admin(this.token).subscribe((response) => {
			this.etiquetas = response.data;
			//console.log(response);
			this.load_data_etiqueta = false;
		});
	}

	listar_etiquetas_documento() {
		this.load_etiquetas = true;
		this._adminService
			.listar_etiquetas_documento_admin(this.id, this.token)
			.subscribe((response) => {
				this.arr_etiquetas = response.data;
				this.load_etiquetas = false;
			});
	}

	fileChangeEvent(event: any): void {
		var file: any;
		if (event.target.files && event.target.files[0]) {
			file = <File>event.target.files[0];
		} else {
			iziToast.show({
				title: "ERROR",
				titleColor: "#FF0000",
				color: "#FFF",
				class: "text-danger",
				position: "topRight",
				message: "No hay un imagen de envio"
			});
		}

		if (file.size <= 4000000) {
			if (
				file.type == "image/png" ||
				file.type == "image/webp" ||
				file.type == "image/jpg" ||
				file.type == "image/gif" ||
				file.type == "image/jpeg"
			) {
				const reader = new FileReader();
				reader.onload = (e) => (this.imgSelect = reader.result);
				//console.log(this.imgSelect);

				reader.readAsDataURL(file);

				$("#input-portada").text(file.name);
				this.file = file;
			} else {
				iziToast.show({
					title: "ERROR",
					titleColor: "#FF0000",
					color: "#FFF",
					class: "text-danger",
					position: "topRight",
					message: "El archivo debe ser una imagen"
				});
				$("#input-portada").text("Seleccionar imagen");
				this.imgSelect = "assets/img/01.jpg";
				this.file = undefined;
			}
		} else {
			iziToast.show({
				title: "ERROR",
				titleColor: "#FF0000",
				color: "#FFF",
				class: "text-danger",
				position: "topRight",
				message: "La imagen no puede superar los 4MB"
			});
			$("#input-portada").text("Seleccionar imagen");
			this.imgSelect = "assets/img/01.jpg";
			this.file = undefined;
		}

		//console.log(this.file);
	}

	eliminar_etiqueta(id: any) {
		this.load_etiquetas = true;
		this._adminService
			.eliminar_etiqueta_documento_admin(id, this.token)
			.subscribe((response) => {
				this.listar_etiquetas_documento();
				this.load_etiquetas = false;
			});
	}

	agregar_etiqueta() {
		let data = {
			etiqueta: this.new_etiqueta,
			documento: this.id
		};
		this.load_etiquetas = true;
		this._adminService
			.agregar_etiqueta_documento_admin(data, this.token)
			.subscribe((response) => {
				this.listar_etiquetas_documento();
				this.load_etiquetas = false;
			});
	}

	actualizar(actualizarForm: any) {
		if (actualizarForm.valid) {
			var data: any = {};

			if (this.file != undefined) {
				data.portada = this.file;
			}

			if (
				!this.documento.precio_antes_soles ||
				this.documento.precio_antes_soles == undefined
			) {
				this.documento.precio_antes_soles = 0;
			}

			if (
				!this.documento.precio_antes_dolares ||
				this.documento.precio_antes_dolares == undefined
			) {
				this.documento.precio_antes_dolares = 0;
			}

			data.titulo = this.documento.titulo;
			data.stock = this.documento.stock;
			data.precio_antes_soles = this.documento.precio_antes_soles;
			data.precio_antes_dolares = this.documento.precio_antes_dolares;
			data.precio = this.documento.precio;
			data.precio_dolar = this.documento.precio_dolar;
			data.peso = this.documento.peso;
			data.sku = this.documento.sku;
			data.categoria = this.documento.categoria;
			data.descripcion = this.documento.descripcion;
			data.contenido = this.documento.contenido;
			data.visibilidad = this.documento.visibilidad;

			this.load_btn = true;

			this._adminService.actualizar_documento_admin(data, this.id, this.token).subscribe(
				(response) => {
					iziToast.show({
						title: "SUCCESS",
						titleColor: "#1DC74C",
						color: "#FFF",
						class: "text-success",
						position: "topRight",
						message: "Se actualizó correctamente el nuevo documento."
					});

					this.load_btn = false;

					this._router.navigate(["/documentos"]);
				},
				(error) => {
					this.load_btn = false;
				}
			);
		} else {
			iziToast.show({
				title: "ERROR",
				titleColor: "#FF0000",
				color: "#FFF",
				class: "text-danger",
				position: "topRight",
				message: "Los datos del formulario no son validos"
			});
			this.load_btn = false;
		}
	}
}
