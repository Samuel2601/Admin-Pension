import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AdminService } from "src/app/service/admin.service";
import { EstudianteService } from "src/app/service/estudiante.service";
declare var iziToast: {
	show: (arg0: {
		title: string;
		titleColor: string;
		color: string;
		class: string;
		position: string;
		message: string;
	}) => void;
};

@Component({
	selector: "app-create-estudiante",
	templateUrl: "./create-estudiante.component.html",
	styleUrls: ["./create-estudiante.component.css"]
})
export class CreateEstudianteComponent implements OnInit {
	public estudiante: any = {
		genero: "No definido",
		//password: "1234"
	};
	public arr_etiquetas: Array<any> = [];
	public etiquetas : Array<any> = [];
	public new_etiqueta = '';


	public token;
	public load_btn = false;
	public load_beca: any;
	public valores_pensiones = 0;
	public rol=undefined;
	public yo=0;
	public ch_r='repre';
	public ch_c='dni';
	public ch_co='dni';
	public vc=0;
	constructor(
		private _estudianteService: EstudianteService,
		private _adminService: AdminService,
		private _router: Router
	) {
		this.token = localStorage.getItem("token");
	}

	ngOnInit(): void {
		let aux = localStorage.getItem("identity");
		this._adminService.obtener_admin(aux, this.token).subscribe((response) => {
			this.rol = response.data.rol;
			if (response.data.email == "samuel.arevalo@espoch.edu.ec") {
				this.yo = 1;
			}
			//////console.log(this.yo);
		});
		(function () {
			"use strict";

			// Fetch all the forms we want to apply custom Bootstrap validation styles to
			var forms = document.querySelectorAll(".needs-validation");

			// Loop over them and prevent submission
			Array.prototype.slice.call(forms).forEach(function (form) {
				form.addEventListener(
					"submit",
					function (event: { preventDefault: () => void; stopPropagation: () => void }) {
						if (!form.checkValidity()) {
							event.preventDefault();
							event.stopPropagation();
						}

						form.classList.add("was-validated");
					},
					false
				);
			});
		})();
		this._adminService.obtener_config_admin().subscribe((response) => {
			if(response.data){
				console.log(response.data);
				this.vc=1;
				this.valores_pensiones = response.data.pension.toFixed(2);
				console.log(new Date(response.data.mescompleto).getMonth());
				console.log(new Date (response.data.anio_lectivo).setMonth(new Date (response.data.anio_lectivo).getMonth()+i));
				for(var i=0;i<10; i++){
					//console.log(new Date (new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i)).getMonth() );
					//console.log( new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i) );
					if(new Date(response.data.mescompleto).getMonth()!= new Date (new Date (response.data.anio_lectivo).setMonth(new Date (response.data.anio_lectivo).getMonth()+i)).getMonth()){
						this.etiquetas.push({
							etiqueta:i+1,
							titulo: new Date (new Date (response.data.anio_lectivo).setMonth(new Date (response.data.anio_lectivo).getMonth()+i) ),
							idpension:response.data._id
						
						});
					}
					

				}
			}
			

		});
	}
	descuento_valor(id) {
		if (
			this.estudiante.desc_beca != undefined &&
			this.estudiante.desc_beca > 0 &&
			this.estudiante.desc_beca <= 100
		) {
			this.estudiante.val_beca =(parseFloat((this.valores_pensiones-((this.valores_pensiones * this.estudiante.desc_beca) / 100)).toFixed(2))).toFixed(2);
			// this.estudiante.ext2 = 'Valor';
		} else {
			iziToast.show({
				title: "Warinng",
				titleColor: "red",
				color: "red",
				class: "text-warning",
				position: "topRight",
				message: "Descuento Invalido"
			});
			this.estudiante.desc_beca = "";
			this.estudiante.val_beca = "";
		}
	}
	valor_descuento(id) {
		if (
			this.estudiante.val_beca != undefined &&
			this.estudiante.val_beca <= this.valores_pensiones &&
			this.estudiante.val_beca >= 0
		) {
			this.estudiante.desc_beca = (
				(this.estudiante.val_beca * 100) /
				this.valores_pensiones
			).toFixed(2);
		} else {
			iziToast.show({
				title: "Warinng",
				titleColor: "red",
				color: "red",
				class: "text-warning",
				position: "topRight",
				message: "Valor Invalido"
			});
			this.estudiante.val_beca = "";
			this.estudiante.desc_beca = "";
		}
	}
	agregar_etiqueta(){
		let arr_label = this.new_etiqueta.split('_');
		var ir:any=arr_label[3];
		
		if(this.arr_etiquetas.find(({etiqueta})=> etiqueta===arr_label[0])==undefined){
			this.arr_etiquetas.push({
				etiqueta: arr_label[0],
				titulo: arr_label[1],
			  idpension:arr_label[2]
			});
			//this.etiquetas.splice(ir,1)
			this.new_etiqueta = '';
		}
		
	  }
	  eliminar_etiqueta(idx:any){
		this.arr_etiquetas.splice(idx,1)
	  }

	registro(registroForm: { valid: any }) {
		var conf=0;
		if (this.estudiante.password != this.estudiante.auxiliar) {
			iziToast.show({
				title: "DANGER",
				class: "text-danger",
				titleColor: "red",
				color: "red",
				position: "topRight",
				message: "Las contraseñas no coinciden"
			});
		} else {
			if (registroForm.valid) {
				//////console.log(this.estudiante);
				this.load_btn = true;
				if(this.ch_r=='repre'){
					this.estudiante.nombres_factura=this.estudiante.nombres_padre;
					this.estudiante.dni_factura=this.estudiante.dni_padre;
				}
				
				if (
					this.estudiante.condicion_beca == "Si" &&
					this.estudiante.desc_beca != undefined &&
					this.estudiante.val_beca != undefined &&
					this.estudiante.num_mes_beca != undefined &&
					(this.estudiante.matricula == 1 || this.estudiante.matricula == 0)
					&& conf==0
				) {
					if(this.arr_etiquetas.length==0){
						iziToast.show({
							title: "DANGER",
							titleColor: "red",
							color: "red",
							class: "text-warning",
							position: "topRight",
							message: 'Debe seleccionar los meses con Beca'
						});
						conf=1;
						this.load_btn = false;
					}else{
						this.estudiante.num_mes_beca=this.arr_etiquetas.length;
						this.estudiante.pension_beca=this.arr_etiquetas;
						this.estudiante.num_mes_beca=this.arr_etiquetas.length;
						this.estudiante.paga_mat=this.estudiante.matricula;
						this._adminService.registro_estudiante(this.estudiante, this.token).subscribe(
							(response) => {
								//////console.log(response);
								if (response.message == "Estudiante agregado con exito") {
									iziToast.show({
										title: "SUCCESS",
										titleColor: "#1DC74C",
										color: "#FFF",
										class: "text-success",
										position: "topRight",
										message: response.message
									});
									this.estudiante = {
										genero: "",
										nombres: "",
										apellidos: "",
										f_nacimiento: "",
										telefono: "",
										dni: "",
										email: ""
									};
									this._router.navigate(["/estudiantes"]);
								} else {
									iziToast.show({
										title: "DANGER",
										titleColor: "red",
										color: "red",
										class: "text-danger",
										position: "topRight",
										message: response.message
									});
								}
		
								this.load_btn = false;
							},
							(error) => {
								//////console.log(error);
							}
						);
					}
				} else {
					if (this.estudiante.condicion_beca == "No") {
						this.estudiante.desc_beca = undefined;
						this.estudiante.val_beca = undefined;
						this.estudiante.num_mes_beca = undefined;
						this.estudiante.matricula = undefined;
						this._adminService.registro_estudiante(this.estudiante, this.token).subscribe(
							(response) => {
								//////console.log(response);
								if (
									response.message == "Algo salió mal" ||
									response.message == "El numero de cédula ya existe en la base de datos"
								) {
									iziToast.show({
										title: "DANGER",
										titleColor: "red",
										color: "red",
										class: "text-danger",
										position: "topRight",
										message: response.message
									});
								} else {
									
									iziToast.show({
										title: "SUCCESS",
										titleColor: "#1DC74C",
										color: "#FFF",
										class: "text-success",
										position: "topRight",
										message: response.message
									});
									this.estudiante = {
										genero: "",
										nombres: "",
										apellidos: "",
										f_nacimiento: "",
										telefono: "",
										dni: "",
										email: ""
									};
									this._router.navigate(["/estudiantes"]);
								}
	
								this.load_btn = false;
							},
							(error) => {
								//////console.log(error);
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
}
