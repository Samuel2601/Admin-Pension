import { Component, OnInit } from "@angular/core";
import { AdminService } from "src/app/service/admin.service";
import Chart, { ChartDataset } from "chart.js/auto";
import { TableUtil } from "./tableUtil";

//import * as pdfMake from "pdfmake/build/pdfmake";
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';

//(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

declare var iziToast: any;
declare var $: any;

@Component({
	selector: "app-dashboard",
	templateUrl: "./dashboard.component.html",
	styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
	public documentos: Array<any> = [];
	public documentos_const: Array<any> = [];
	public ventas: Array<any> = [];
	public const_ventas: Array<any> = [];
	public estudiantes: Array<any> = [];
	public const_estudiantes: Array<any> = [];
	public token = localStorage.getItem("token");
	public page = 1;
	public pageSize = 50;
	public filtro = "";
	public desde: any = undefined;
	public hasta: any = undefined;

	public load_ventas = false;
	public load_documentos = false;
	public load_estudiantes = false;
	public load_administrativo = false;
	public load_registro = false;
	public nmt = 0;
	public meses = new Array(
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre"
	);

	public factual = new Date().setMonth(new Date().getMonth());
	public auxfactual = new Date(this.factual).getMonth();
	public mactual = new Date().getMonth();
	public idmactual: Array<any> = [];
	public faux = new Date().setFullYear(new Date().getFullYear() - 1);
	public totalfaux = 0;
	public totalfactual = 0;
	public pagosmes = 0;

	public sobrante = 0;

	public datosventa = {};
	public anio: Array<any> = [];
	public auxanio: Array<any> = [];

	public pensionesestudiante: any = [];
	public pagospension: any = [];
	public constpagospension: any = {};

	public recaudado: any = [];
	public myChart: Chart<"bar", number[], string> | any;
	public myChart3: Chart<"bar", number[], string> | any;
	public pagado = 0;
	public porpagar = 0;
	public deteconomico: any = [];
	public cursos: any = [];
	public cursos2: any = [];
	public documento_arr: Array<any> = [];
	public resgistro_arr: Array<any> = [];
	public resgistro_const: Array<any> = [];
	public pdffecha = 0;
	public rol: any;
	public yo = 0;
	public director = "";
	public naadmin = "";
	public nadelegado = "";
	public load_data_est = true;
	public config: any = [];
	public penest: any = [];
	public fbeca = "";
	public active: any;
	constructor(private _adminService: AdminService) {}

	ngOnInit(): void {
		let aux = localStorage.getItem("identity");
		this._adminService.obtener_admin(aux, this.token).subscribe((response) => {
			this.rol = response.data.rol;
			if (this.rol == "admin") {
				this.naadmin = response.data.nombres + " " + response.data.apellidos;
			}
			if (response.data.email == "samuel.arevalo@espoch.edu.ec") {
				this.yo = 1;
			}
			if (this.rol == "admin" || this.rol == "direc" || this.rol == "delegado") {
				this._adminService.listar_admin(this.token).subscribe((response) => {
					let respon = response.data;
					respon.forEach((element) => {
						if (element.rol == "direc") {
							this.director = element.nombres + " " + element.apellidos;
						}
						if (element.rol == "delegado") {
							this.nadelegado = element.nombres + " " + element.apellidos;
						}
					});
				});
				this.estadoventas();
			}
		});
	}

	estadoventas(): void {
		this.load_data_est = true;
		this.auxanio = [];
		this.load_documentos = false;
		this.load_estudiantes = false;
		this.load_administrativo = false;
		this.load_registro = false;
		this.load_ventas = true;
		this.ventas = [];
		this.anio = [];
		this.totalfactual = 0;
		this.pagosmes = 0;
		this._adminService.obtener_detallespagos_admin(this.token).subscribe((response) => {
			this.ventas = response.data;
			// //////console.log(response);
			//////console.log(this.ventas);
			if (this.ventas != undefined) {
				for (var i = 0; i < this.ventas.length; i++) {
					////console.log("Año anterior",new Date(this.faux).getFullYear(),"Año actual",new Date(this.factual).getFullYear());
					////console.log((new Date(this.ventas[i].createdAt).getFullYear()));
					////console.log("Valor:", this.ventas[i].valor);
					if (
						new Date(this.ventas[i].createdAt).getFullYear() ==
							new Date(this.faux).getFullYear() &&
						this.ventas[i].pago.estado == "Registrado"
					) {
						// if(this.ventas[i].pago.transaccion=='PAGOMANUAL'){
						this.totalfaux = this.ventas[i].valor + this.totalfaux;
						////console.log("Año Anterior:", this.totalfaux);
						// }
					} else if (
						new Date(this.ventas[i].createdAt).getFullYear() ==
							new Date(this.factual).getFullYear() &&
						this.ventas[i].pago.estado == "Registrado"
					) {
						// if(this.ventas[i].pago.transaccion=='PAGOMANUAL'){
						this.totalfactual += this.ventas[i].valor;
						////console.log("Año Actual:", this.totalfactual);
						//}
					}

					if (
						i == 0 &&
						new Date(this.ventas[i].createdAt).getFullYear() ==
							new Date(this.factual).getFullYear()
					) {
						this.anio.push({
							label:
								new Date(this.ventas[i].idpension.anio_lectivo).getFullYear().toString() +
								" " +
								this.ventas[i].idpension.curso +
								this.ventas[i].idpension.paralelo +
								" " +
								this.ventas[i].estudiante.estado,
							data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							backgroundColor: "rgba(54,162,235,0.2)",
							borderColor: "rgba(54,162,235,1)",
							borderWidth: 2
						});
						this.anio[0].data[new Date(this.ventas[i].createdAt).getMonth()] =
							this.anio[0].data[new Date(this.ventas[i].createdAt).getMonth()] +
							this.ventas[i].valor;
					} else if (
						new Date(this.ventas[i].createdAt).getFullYear() ==
						new Date(this.factual).getFullYear()
					) {
						let aux =
							new Date(this.ventas[i].idpension.anio_lectivo).getFullYear().toString() +
							" " +
							this.ventas[i].idpension.curso +
							this.ventas[i].idpension.paralelo +
							" " +
							this.ventas[i].estudiante.estado;
						let con = -1;
						for (var j = 0; j < this.anio.length; j++) {
							if (this.anio[j].label.toString() == aux) {
								con = j;
							}
						}
						if (con == -1) {
							var auxcolor1 = Math.random() * 255;
							var auxcolor2 = Math.random() * 255;

							this.anio.push({
								label:
									new Date(this.ventas[i].idpension.anio_lectivo)
										.getFullYear()
										.toString() +
									" " +
									this.ventas[i].idpension.curso +
									this.ventas[i].idpension.paralelo +
									" " +
									this.ventas[i].estudiante.estado,
								data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								backgroundColor: "rgba(" + auxcolor2 + "," + auxcolor1 + ",200,0.2)",
								borderColor: "rgba(" + auxcolor2 + "," + auxcolor1 + ",200,1)",
								borderWidth: 2
							});
							this.anio[this.anio.length - 1].data[
								new Date(this.ventas[i].createdAt).getMonth()
							] =
								this.anio[this.anio.length - 1].data[
									new Date(this.ventas[i].createdAt).getMonth()
								] + this.ventas[i].valor;
						} else {
							this.anio[con].data[new Date(this.ventas[i].createdAt).getMonth()] =
								this.anio[con].data[new Date(this.ventas[i].createdAt).getMonth()] +
								this.ventas[i].valor;
						}
					}
				}

				// //////console.log(this.totalfaux);
				// //////console.log(this.totalfactual);
				// //////console.log(this.mactual);

				//  ////console.log(this.anio);

				// this.const_ventas = this.ventas;

				//// //////console.log(myChart);

				// do {
				// ////console.log(document.getElementById('myChart'));
				if (document.getElementById("myChart") != null) {
					var canvas = <HTMLCanvasElement>document.getElementById("myChart");

					var ctx: CanvasRenderingContext2D | any;
					ctx = canvas.getContext("2d");
					//var myChart: Chart<"bar", number[], string>;
					if (this.myChart) {
						this.myChart.destroy();
						// //////console.log('Destruido');
					}
					this.myChart = new Chart(ctx, {
						type: "bar",
						data: {
							labels: [
								"Enero",
								"Febrero",
								"Marzo",
								"Abril",
								"Mayo",
								"Junio",
								"Julio",
								"Agosto",
								"Septiembre",
								"Octubre",
								"Noviembre",
								"Dicembre"
							],
							datasets: []
						},
						options: {
							scales: {
								y: {
									beginAtZero: true
								}
							}
						}
					});

					this.anio.forEach((element) => {
						var fech: string = element.label;
						//todos
						this.myChart.data.datasets.push(element);
						//if(fech.includes((new Date().getFullYear()).toString())){
						this.auxanio.push(element);
						//del año
						//myChart.data.datasets.push(element);

						this.pagosmes += element.data[this.auxfactual];
						//}
					});
					//this.auxanio=this.anio;
					this.auxanio = this.auxanio.sort(function (a, b) {
						if (
							a.label.charAt(5) + a.label.charAt(6) >
							b.label.charAt(5) + b.label.charAt(6)
						) {
							return 1;
						}
						if (
							a.label.charAt(5) + a.label.charAt(6) <
							b.label.charAt(5) + b.label.charAt(6)
						) {
							return -1;
						}
						// a must be equal to b
						return 0;
					});
					////console.log(this.auxanio);
					this.myChart.update();
					this.load_data_est = false;
				}

				// } while ((document.getElementById('myChart')==null)||k<5);
			}
		});
	}

	estadodocumento(): void {
		this.load_data_est = true;

		this.sobrante = 0;
		this.load_ventas = false;
		this.load_documentos = true;
		this.load_estudiantes = false;
		this.load_registro = false;
		this.load_administrativo = false;
		this.documento_arr = [];
		this._adminService.listar_documentos_admin(this.token).subscribe((response) => {
			let lb: Array<any> = [];
			this.documentos_const = response.data;
			this.documentos = this.documentos_const;
			//console.log(this.documentos);
			if (this.documentos != undefined) {

				for (var i = 0; i < this.documentos.length; i++) {
					//console.log("Valor:",this.documentos[i].valor);
					if (i == 0 && new Date(this.documentos[i].f_deposito).getFullYear()== new Date().getFullYear()) {

						lb.push(this.documentos[i].cuenta);

					} else if (lb.indexOf(this.documentos[i].cuenta) == -1) {

						lb.push(this.documentos[i].cuenta);

					}
				}
				//console.log(lb);
				
				var data: Array<any> = [];
				for (var k=0;k<lb.length;k++) {
					data.push(0);
				}
				//console.log(data);
				for (var i = 0; i < this.documentos.length; i++) {
					//// //////console.log(new Date(this.faux).getFullYear());
					//// //////console.log((new Date(this.documentos[i].createdAt).getFullYear()));
					if( new Date(this.documentos[i].f_deposito).getFullYear()== new Date().getFullYear()){
						if (i == 0) {
							//var data: Array<any> = [];
							
							//// //////console.log(data);
							this.documento_arr.push({
								label:
									new Date(this.documentos[i].createdAt).getFullYear().toString() +
									" " +
									this.documentos[i].cuenta,
								data: this.documentos[i].valor,
								backgroundColor: "rgba(54,162,235,0.2)",
								borderColor: "rgba(54,162,235,1)",
								borderWidth: 2
							});
							//// //////console.log(this.documento_arr);
							
							//this.documento_arr[0].data[(new Date(this.documentos[i].createdAt).getMonth())]=this.documento_arr[0].data[(new Date(this.documentos[i].createdAt).getMonth())]+this.documentos[i].total_pagar;
						} else {
							let aux =
								new Date(this.documentos[i].createdAt).getFullYear().toString() +
								" " +
								this.documentos[i].cuenta;
							let con = -1;
							con = this.documento_arr.indexOf(aux);
							//// //////console.log(con);
							for(var j=0; j<this.documento_arr.length;j++){
								if((this.documento_arr[j].label).toString()==aux){
								con=j;
								}
							}
							if (con == -1) {
								
								//// //////console.log(data);
								var auxcolor1 = Math.random() * 130;
								this.documento_arr.push({
									label:
										new Date(this.documentos[i].createdAt).getFullYear().toString() +
										" " +
										this.documentos[i].cuenta,
									data: this.documentos[i].valor,
									backgroundColor: "rgba(" + auxcolor1 + ",255,200,0.2)",
									borderColor: "rgba(" + auxcolor1 + ",255,200,1)",
									borderWidth: 2
								});
								
								//// //////console.log(this.documento_arr);
								//this.documento_arr[this.documento_arr.length-1].data[(new Date(this.documentos[i].createdAt).getMonth())]=this.documento_arr[this.documento_arr.length-1].data[(new Date(this.documentos[i].createdAt).getMonth())]+this.ventas[i].total_pagar;
							} else {
								//var aux1 = lb.indexOf(this.documentos[i].cuenta);
								this.documento_arr[con].data =
									this.documento_arr[con].data + parseFloat(this.documentos[i].valor);
							}
						}
					}
					
				}

				//console.log(this.documento_arr);
				for (let item of this.documento_arr) {
					var fech: string = item.label;
					if (fech.includes(new Date().getFullYear().toString())) {
						this.sobrante += parseFloat(item.data);
					}
				}
				for (let itm of this.documento_arr){
					var aux=[];
					for (var k=0;k<lb.length;k++) {
						aux.push(0);
					}
					var aux1=itm.label;
					var palabrasProhibidas = [new Date().getFullYear().toString()+' ','tonto','palabra-vulgar-1','palabra-vulgar-2'];
					var numeroPalabrasProhibidas = palabrasProhibidas.length;

					while(numeroPalabrasProhibidas--) {
					if (aux1.indexOf(palabrasProhibidas[numeroPalabrasProhibidas])!=-1) {
						aux1 = aux1.replace(new RegExp(palabrasProhibidas[numeroPalabrasProhibidas], 'ig'), "");
					}
					}
					var aux2 = lb.indexOf(aux1);
					aux[aux2]=itm.data;
					itm.data=aux;
				}

				//console.log(this.sobrante);
				//// //////console.log(this.totalfactual);
				//// //////console.log(this.mactual);

				//// //////console.log(this.documento_arr);

				//this.const_ventas = this.ventas;

				var canvas = <HTMLCanvasElement>document.getElementById("myChart2");
				var ctx: CanvasRenderingContext2D | any;
				ctx = canvas.getContext("2d");

				var myChart2 = new Chart(ctx, {
					type: "bar",
					data: {
						labels: lb,
						datasets: []
					},
					options: {
						scales: {
							y: {
								beginAtZero: true
							}
						}
					}
				});

				this.documento_arr.forEach((element) => {
					var fech: string = element.label;
					if (fech.includes(new Date().getFullYear().toString())) {
						myChart2.data.datasets.push(element);
					}
				});
				//// //////console.log(myChart2);
				myChart2.update();
				this.load_data_est = false;
			}
		});
	}
	estadoestudiante(): void {
		this.load_data_est = true;
		this.load_administrativo = false;
		this.load_ventas = false;
		this.load_documentos = false;
		this.load_estudiantes = true;
		this.load_registro = false;

		let auxpen = [];
		this._adminService.obtener_detallespagos_admin(this.token).subscribe((response) => {
			//////console.log(response.data);
			this.estudiantes = response.data;
			this.const_estudiantes = this.estudiantes;
			// ////console.log(this.estudiantes);
			this.estudiantes.forEach((element) => {
				var aux =
					this.meses[new Date(element.idpension.anio_lectivo).getMonth()] +
					" " +
					new Date(element.idpension.anio_lectivo).getFullYear() +
					"-" +
					new Date(
						new Date(element.idpension.anio_lectivo).setFullYear(
							new Date(element.idpension.anio_lectivo).getFullYear() + 1
						)
					).getFullYear();

				var con = -1;

				for (var i = 0; i < this.pensionesestudiante.length; i++) {
					if (this.pensionesestudiante[i].label == aux) {
						con = i;
					}
				}
				if (con == -1) {
					this.pensionesestudiante.push({
						label: aux,
						date: element.idpension.anio_lectivo
					});
				}
			});
			this.active=-1;
			this.detalle_data(this.pensionesestudiante.length - 1);

			//this.myChart3.update();
			// //////console.log(this.pensionesestudiante);
		});
	}

	detalle_data(val: any) {
		
		
		if(this.active != val){
			this.active = val;
			if (this.myChart3) {
				this.myChart3.destroy();
				// //////console.log('Destruido');
			}
			
			this.load_data_est = true;
			this.nmt = 0;
			this.pdffecha = this.pensionesestudiante[val].label;
			this.fbeca = this.pensionesestudiante[val].date;
			this.pagado = 0;
			this.porpagar = 0;
			this.pagospension = [];
			this.cursos = [];
			this.deteconomico = [];
			let costopension = 0;
			let costomatricula = 0;
			this._adminService.obtener_config_admin().subscribe((responese) => {
				this.config = responese.data;
				this.estudiantes.forEach((element) => {
					var aux =
						this.meses[new Date(element.idpension.anio_lectivo).getMonth()] +
						" " +
						new Date(element.idpension.anio_lectivo).getFullYear() +
						"-" +
						new Date(
							new Date(element.idpension.anio_lectivo).setFullYear(
								new Date(element.idpension.anio_lectivo).getFullYear() + 1
							)
						).getFullYear();
					if (this.pensionesestudiante[val].label == aux) {
						if (
							element.tipo == 0 &&
							!element.estado.includes("Abono") &&
							element.idpension.condicion_beca == "No"
						) {
							costomatricula = element.valor;
						}
						if (
							element.tipo == 1 &&
							!element.estado.includes("Abono") &&
							element.idpension.condicion_beca == "No"
						) {
							costopension = element.valor;
						}
					}
					if (costopension < 1) {
						costopension = this.config.pension;
					}
					if (costomatricula < 1) {
						costomatricula = this.config.matricula;
					}
				});
	
				var aux =
					this.meses[new Date(this.config.anio_lectivo).getMonth()] +
					" " +
					new Date(this.config.anio_lectivo).getFullYear() +
					"-" +
					new Date(
						new Date(this.config.anio_lectivo).setFullYear(
							new Date(this.config.anio_lectivo).getFullYear() + 1
						)
					).getFullYear();
				if (this.pensionesestudiante[val].label == aux) {
					this.nmt = this.config.numpension;
				} else {
					this.nmt = 10;
				}
				//this.nmt = 10;
	
				this._adminService
					.listar_pensiones_estudiantes_tienda(this.token)
					.subscribe((response) => {
						this.penest = response.data;
						////console.log(this.penest);
						////console.log(this.estudiantes);
						if (this.penest != undefined) {
							this.penest.forEach((element: any) => {
								var aux =
									this.meses[new Date(element.anio_lectivo).getMonth()] +
									" " +
									new Date(element.anio_lectivo).getFullYear() +
									"-" +
									new Date(
										new Date(element.anio_lectivo).setFullYear(
											new Date(element.anio_lectivo).getFullYear() + 1
										)
									).getFullYear();
								// //////console.log('Año:'+this.pensionesestudiante[val]+'Auxiliar'+aux);
	
								if (this.pensionesestudiante[val].label == aux) {
									var con = -1;
									for (var i = 0; i < this.pagospension.length; i++) {
										if (this.pagospension[i].label == element.curso + element.paralelo) {
											con = i;
										}
									}
									if (con == -1) {
										if (!this.cursos.includes(element.curso)) {
											this.cursos.push(element.curso);
										}
	
										this.pagospension.push({
											label: element.curso + element.paralelo,
											num: 0,
											data: [0, 0]
										});
										//////console.log(this.pagospension);
									}
								}
							});
							this.penest.forEach((element: any) => {
								////console.log(element);
								if (
									element.idestudiante.estado == "Activo" ||
									element.idestudiante.estado == "Activado"
								) {
									var aux =
										this.meses[new Date(element.anio_lectivo).getMonth()] +
										" " +
										new Date(element.anio_lectivo).getFullYear() +
										"-" +
										new Date(
											new Date(element.anio_lectivo).setFullYear(
												new Date(element.anio_lectivo).getFullYear() + 1
											)
										).getFullYear();
									////console.log('Año:'+this.pensionesestudiante[val].label+'Auxiliar'+aux);
	
									if (this.pensionesestudiante[val].label == aux) {
										this.pagospension.forEach((elementpp: any) => {
											// //console.log('Enviado:',element.curso+element.paralelo,'Comparado',elementpp.label);
											if (element.curso + element.paralelo == elementpp.label) {
												elementpp.num = elementpp.num + 1;
	
												if (element.condicion_beca == "Si") {
													if (
														new Date(element.anio_lectivo).getTime() ==
														new Date(this.config.anio_lectivo).getTime()
													) {
														for (var i = 1; i <= this.nmt; i++) {
															/*//console.log(
																"I Beca Si:",
																i,
																"CursoParalelo",
																element.curso + element.paralelo,
																"Tipo",
																element.idestudiante.estado,
																"Condicion",
																element.condicion_beca,
																"Fecha 1:",
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i
																	)
																).getMonth(),
																"Fecha 2:",
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getMonth()
															);*/
															if (
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i - 1
																	)
																).getTime() ==
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getTime()
															) {
																elementpp.data[1] = elementpp.data[1] + this.config.pension;
																this.porpagar += this.config.pension;
															} else {
																if (element.num_mes_beca - i >= 0) {
																	elementpp.data[1] = elementpp.data[1] + element.val_beca;
																	this.porpagar += element.val_beca;
																} else {
																	elementpp.data[1] =
																		elementpp.data[1] + this.config.pension;
																	this.porpagar += this.config.pension;
																}
															}
														}
														if (element.paga_mat == 0) {
															elementpp.data[1] = elementpp.data[1] + this.config.matricula;
															this.porpagar += this.config.matricula;
														}
													} else {
														for (var i = 1; i <= this.nmt; i++) {
															/*//console.log(
																"I Beca si otro año:",
																i,
																"CursoParalelo",
																element.curso + element.paralelo,
																"Tipo",
																element.idestudiante.estado,
																"Condicion",
																element.condicion_beca,
																"Fecha 1:",
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i
																	)
																).getMonth(),
																"Fecha 2:",
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getMonth()
															);*/
	
															if (
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i - 1
																	)
																).getTime() ==
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getTime()
															) {
																elementpp.data[1] = elementpp.data[1] + costopension;
																this.porpagar += costopension;
															} else {
																if (element.num_mes_beca - i >= 0) {
																	elementpp.data[1] = elementpp.data[1] + element.val_beca;
																	this.porpagar += element.val_beca;
																} else {
																	elementpp.data[1] = elementpp.data[1] + costopension;
																	this.porpagar += costopension;
																}
															}
														}
														if (element.paga_mat == 0) {
															elementpp.data[1] = elementpp.data[1] + costomatricula;
															this.porpagar += costomatricula;
														}
	
														// elementpp.data[1]=elementpp.data[1]+(element.val_beca*element.num_mes_beca)+((10-element.num_mes_beca)*costopension)+costomatricula;
	
														// this.porpagar+=(element.val_beca*element.num_mes_beca)+((10-element.num_mes_beca)*costopension)+costomatricula;
													}
												} else {
													// //console.log("I Beca no:",i,"CursoParalelo",element.curso+element.paralelo,"Tipo",element.idestudiante.estado,"Condicion",element.condicion_beca,"Fecha 1:",new Date(new Date(element.anio_lectivo).setMonth(new Date(element.anio_lectivo).getMonth() +i)).getMonth(),"Fecha 2:",new Date(new Date(element.anio_lectivo).setMonth(11)).getMonth());
	
													if (
														new Date(element.anio_lectivo).getTime() ==
														new Date(this.config.anio_lectivo).getTime()
													) {
														elementpp.data[1] =
															elementpp.data[1] +
															this.nmt * this.config.pension +
															this.config.matricula;
	
														this.porpagar +=
															this.nmt * this.config.pension + this.config.matricula;
													} else {
														elementpp.data[1] =
															elementpp.data[1] + 10 * costopension + costomatricula;
	
														this.porpagar += 10 * costopension + costomatricula;
													}
												}
											}
										});
									}
								} else if (element.idestudiante.estado == "Desactivado") {
									var aux =
										this.meses[new Date(element.anio_lectivo).getMonth()] +
										" " +
										new Date(element.anio_lectivo).getFullYear() +
										"-" +
										new Date(
											new Date(element.anio_lectivo).setFullYear(
												new Date(element.anio_lectivo).getFullYear() + 1
											)
										).getFullYear();
									////////console.log('Año:'+this.pensionesestudiante[val].label+'Auxiliar'+aux);
	
									if (this.pensionesestudiante[val].label == aux) {
										var auxmeses;
										let mes =
											(new Date(element.idestudiante.f_desac).getFullYear() -
												new Date(element.anio_lectivo).getFullYear()) *
											12;
										mes -= new Date(element.anio_lectivo).getMonth();
										mes += new Date(element.idestudiante.f_desac).getMonth();
										if (mes > 10) {
											auxmeses = 10;
										} else {
											auxmeses = mes + 1;
										}
										if (this.nmt < auxmeses) {
											auxmeses = this.nmt;
										}
										////console.log(auxmeses);
	
										this.pagospension.forEach((elementpp: any) => {
											//////console.log('Enviado:',element.curso+element.paralelo,'Comparado',elementpp.label);
											if (element.curso + element.paralelo == elementpp.label) {
												elementpp.num = elementpp.num + 1;
	
												if (element.condicion_beca == "Si") {
													if (
														new Date(element.anio_lectivo).getTime() ==
														new Date(this.config.anio_lectivo).getTime()
													) {
														for (var i = 1; i <= auxmeses; i++) {
															////console.log("I:",i,"Tipo",element.idestudiante.estado,"Condicion",element.condicion_beca,"Fecha 1:",new Date(new Date(element.anio_lectivo).setMonth(new Date(element.anio_lectivo).getMonth() +i)).getMonth(),"Fecha 2:",new Date(new Date(element.anio_lectivo).setMonth(11)).getMonth());
	
															if (
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i - 1
																	)
																).getTime() ==
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getTime()
															) {
																elementpp.data[1] = elementpp.data[1] + this.config.pension;
																this.porpagar += this.config.pension;
															} else {
																if (element.num_mes_beca - i >= 0) {
																	elementpp.data[1] = elementpp.data[1] + element.val_beca;
																	this.porpagar += element.val_beca;
																} else {
																	elementpp.data[1] =
																		elementpp.data[1] + this.config.pension;
																	this.porpagar += this.config.pension;
																}
															}
														}
														if (element.paga_mat == 0) {
															elementpp.data[1] = elementpp.data[1] + this.config.matricula;
															this.porpagar += this.config.matricula;
														}
													} else {
														for (var i = 1; i <= auxmeses; i++) {
															////console.log("I:",i,"Tipo",element.idestudiante.estado,"Condicion",element.condicion_beca,"Fecha 1:",new Date(new Date(element.anio_lectivo).setMonth(new Date(element.anio_lectivo).getMonth() +i)).getMonth(),"Fecha 2:",new Date(new Date(element.anio_lectivo).setMonth(11)).getMonth());
	
															if (
																new Date(
																	new Date(element.anio_lectivo).setMonth(
																		new Date(element.anio_lectivo).getMonth() + i - 1
																	)
																).getTime() ==
																new Date(
																	new Date(element.anio_lectivo).setMonth(11)
																).getTime()
															) {
																elementpp.data[1] = elementpp.data[1] + costopension;
																this.porpagar += costopension;
															} else {
																if (element.num_mes_beca - i >= 0) {
																	elementpp.data[1] = elementpp.data[1] + element.val_beca;
																	this.porpagar += element.val_beca;
																} else {
																	elementpp.data[1] = elementpp.data[1] + costopension;
																	this.porpagar += costopension;
																}
															}
														}
														if (element.paga_mat == 0) {
															elementpp.data[1] = elementpp.data[1] + costomatricula;
															this.porpagar += costomatricula;
														}
	
														// elementpp.data[1]=elementpp.data[1]+(element.val_beca*element.num_mes_beca)+((10-element.num_mes_beca)*costopension)+costomatricula;
	
														// this.porpagar+=(element.val_beca*element.num_mes_beca)+((10-element.num_mes_beca)*costopension)+costomatricula;
													}
												} else {
													for (var i = 1; i <= auxmeses; i++) {
														////console.log("I:",i,"Tipo",element.idestudiante.estado,"Condicion",element.condicion_beca,"Fecha 1:",new Date(new Date(element.anio_lectivo).setMonth(new Date(element.anio_lectivo).getMonth() +i)).getMonth(),"Fecha 2:",new Date(new Date(element.anio_lectivo).setMonth(11)).getMonth());
	
														if (
															new Date(
																new Date(element.anio_lectivo).setMonth(
																	new Date(element.anio_lectivo).getMonth() + i - 1
																)
															).getTime() ==
															new Date(
																new Date(element.anio_lectivo).setMonth(11)
															).getTime()
														) {
															elementpp.data[1] = elementpp.data[1] + costopension;
															this.porpagar += costopension;
														} else {
															if (element.num_mes_beca - i >= 0) {
																elementpp.data[1] = elementpp.data[1] + element.val_beca;
																this.porpagar += element.val_beca;
															} else {
																elementpp.data[1] = elementpp.data[1] + costopension;
																this.porpagar += costopension;
															}
														}
													}
													//if(element.matricula==0){
													elementpp.data[1] = elementpp.data[1] + costomatricula;
													this.porpagar += costomatricula;
													//}
	
													// if(new Date(element.anio_lectivo).getTime()==new Date(this.config.anio_lectivo).getTime()){
													//elementpp.data[1]=elementpp.data[1]+(auxmeses*this.config.pension)+this.config.matricula;
	
													//this.porpagar+=(auxmeses*this.config.pension)+this.config.matricula;
	
													//}else{
													// elementpp.data[1]=elementpp.data[1]+(10*costopension)+costomatricula;
	
													//this.porpagar+=(10*costopension)+costomatricula;
	
													//}
												}
											}
										});
									}
								}
							});
	
							////console.log(this.estudiantes);
							this.estudiantes.forEach((element) => {
								if (element.tipo <= this.nmt) {
									var aux =
										this.meses[new Date(element.idpension.anio_lectivo).getMonth()] +
										" " +
										new Date(element.idpension.anio_lectivo).getFullYear() +
										"-" +
										new Date(
											new Date(element.idpension.anio_lectivo).setFullYear(
												new Date(element.idpension.anio_lectivo).getFullYear() + 1
											)
										).getFullYear();
									// //////console.log('Año:'+this.pensionesestudiante[val]+'Auxiliar'+aux);
									if (this.pensionesestudiante[val].label == aux) {
										for (var k = 0; k < this.pagospension.length; k++) {
											/*//console.log(
												"aNTES 1 Pagos 0",
												this.pagospension[k].data[0],
												"Pagos 1",
												this.pagospension[k].data[1]
											);*/
											if (
												this.pagospension[k].label ==
												element.idpension.curso + element.idpension.paralelo
											) {
												/*//console.log(
													"Recuadado, Tipo:",
													element.tipo,
													"Curso y paralelo",
													element.idpension.curso + element.idpension.paralelo,
													"Beca:",
													element.idpension.condicion_beca,
													"Matricula:",
													element.idpension.matricula,
													"Valor: ",
													element.valor
												);*/
	
												this.pagospension[k].data[0] =
													this.pagospension[k].data[0] + element.valor;
												this.pagospension[k].data[1] =
													this.pagospension[k].data[1] - element.valor;
	
												this.pagado += element.valor;
												this.porpagar = this.porpagar - element.valor;
	
												k = this.pagospension.length;
											}
										}
									}
								}
							});
							////console.log(this.pagospension);
							this.cursos = this.cursos.sort(function (a: any, b: any) {
								if (parseInt(a) > parseInt(b)) {
									return 1;
								}
								if (parseInt(a) < parseInt(b)) {
									return -1;
								}
								// a must be equal to b
								return 0;
							});
							// //////console.log(this.cursos);
							this.cursos2 = [];
							this.cursos2.push("descr");
							this.cursos.forEach((element) => {
								this.cursos2.push(element);
							});
	
							// //////console.log(this.cursos2);
							var datos1: any = [];
							var datos2: any = [];
							var datos3: any = [];
							this.cursos.forEach((element: any) => {
								datos1.push(0);
								datos2.push(0);
								datos3.push(0);
							});
							this.deteconomico.push({
								label: "N° de Estudiantes",
								data: datos1,
								backgroundColor: "rgba(0,214,217,0.5)",
								borderColor: "rgba(0,214,217,1)",
								borderWidth: 2
							});
	
							this.deteconomico.push({
								label: "Valor Recaudado",
								data: datos2,
								backgroundColor: "rgba(0,217,97,0.5)",
								borderColor: "rgba(0,217,97,1)",
								borderWidth: 2
							});
							this.deteconomico.push({
								label: "Valor por Pagar",
								data: datos3,
								backgroundColor: "rgba(218,0,16,0.5)",
								borderColor: "rgba(218,0,16,1)",
								borderWidth: 2
							});
	
							//////console.log(this.pagospension);
							this.pagospension.forEach((elementp: any) => {
								for (var i = 0; i < this.cursos.length; i++) {
									// //////console.log("i",i,"elementp.label",elementp.label,"this.cursos[i]",this.cursos[i],elementp.label.includes(this.cursos[i]));
									var aux = elementp.label.substring(0, elementp.label.length - 1);
									if (aux == this.cursos[i]) {
										// //////console.log('Si');
										this.deteconomico.forEach((elementde: any) => {
											if (elementde.label == "N° de Estudiantes") {
												// //////console.log("Cuenta:",elementp.num);
												elementde.data[i] = elementde.data[i] + elementp.num;
											} else if (elementde.label == "Valor Recaudado") {
												// //////console.log("Cuenta:",elementp.data[0]);
												elementde.data[i] = elementde.data[i] + elementp.data[0];
											} else {
												// //////console.log("Cuenta:",elementp.data[1]);
												elementde.data[i] = elementde.data[i] + elementp.data[1];
											}
										});
										// //////console.log(this.deteconomico);
										i = this.cursos.length;
									}
								}
							});
						}else{
							this.load_data_est=false;
						}
	
						/*this.cursos=this.cursos.sort(function(a:any,b:any){
				  if(parseInt(a)>parseInt(b)){
					return 1;
				  }
				  if (parseInt(a) < parseInt(b)) {
					return -1;
				  }
				  // a must be equal to b
				  return 0;
				});*/
						// //////console.log(this.cursos);
						var canvas = <HTMLCanvasElement>document.getElementById("myChart3");
						var ctx: CanvasRenderingContext2D | any;
						ctx = canvas.getContext("2d");
	
						
						this.myChart3 = new Chart(ctx, {
							type: "bar",
							data: {
								labels: this.cursos,
								datasets: []
							},
							options: {
								scales: {
									y: {
										beginAtZero: true
									}
								}
							}
						});
						this.pagospension = this.pagospension.sort(function (a: any, b: any) {
							if (a.label > b.label) {
								return 1;
							}
							if (a.label < b.label) {
								return -1;
							}
							// a must be equal to b
							return 0;
						});
						// //////console.log(this.pagospension);
						/*
				this.pagospension.forEach((element: any) => {
				  this.myChart3.data.datasets.push(element);
				});
				*/
						this.deteconomico.forEach((element: any) => {
							this.myChart3.data.datasets.push(element);
						});
	
						// //////console.log(this.pagospension);
						this.constpagospension = this.pagospension;
						// //////console.log(this.constpagospension);
						this.myChart3.update();
						this.load_data_est = false;
					});
			});
			
		}

	}

	exportTabletotal(val: any) {
		
		this.cursos.forEach((element: any) => {
			document.getElementById("btncursos" + element).style.display = "none";
			document.getElementById(element).style.border = "1px solid";
			document.getElementById(element).style.width = "100%";
			document.getElementById(element).style.textAlign = "center";
		});
		document.getElementById("btncvs").style.display = "none";
		document.getElementById("btnxlsx").style.display = "none";
		document.getElementById("btnpdf").style.display = "none";

		document.getElementById("detalleeconomico").style.border = "1px solid";
		document.getElementById("detalleeconomico").style.width = "100%";

		TableUtil.exportToPdftotal(
			val.toString(),
			this.pdffecha.toString(),
			this.director,
			this.nadelegado,
			this.naadmin,
			new Intl.DateTimeFormat("es-US", { month: "long" }).format(new Date())
		);

		this.cursos.forEach((element: any) => {
			document.getElementById("btncursos" + element).style.display = "";
			document.getElementById(element).style.border = "";
			document.getElementById(element).style.tableLayout = "";
			document.getElementById(element).style.marginLeft = "";
		});
		document.getElementById("btncvs").style.display = "";
		document.getElementById("btnxlsx").style.display = "";
		document.getElementById("btnpdf").style.display = "";

		document.getElementById("detalleeconomico").style.border = "";
		document.getElementById("detalleeconomico").style.tableLayout = "";
	}

	exportTable(val: any) {
		if (val == "detalleeconomico") {
			TableUtil.exportToPdf(
				val.toString(),
				this.pdffecha.toString(),
				"Detalle Economico de pensiones",
				this.director,
				this.nadelegado,
				this.naadmin,
				new Intl.DateTimeFormat("es-US", { month: "long" }).format(new Date())
			);
		} else {
			if (val == "becados") {
				TableUtil.exportToPdf(
					val.toString(),
					this.pdffecha.toString(),
					"Becados: " + this.pdffecha,
					this.director,
					this.nadelegado,
					this.naadmin,
					new Intl.DateTimeFormat("es-US", { month: "long" }).format(new Date())
				);
			} else if (val == "eliminados") {
				TableUtil.exportToPdf(
					val.toString(),
					this.pdffecha.toString(),
					"Estudiantes Eliminados: " + this.pdffecha,
					this.director,
					this.nadelegado,
					this.naadmin,
					new Intl.DateTimeFormat("es-US", { month: "long" }).format(new Date())
				);
			} else {
				TableUtil.exportToPdf(
					val.toString(),
					this.pdffecha.toString(),
					"Pago de Curso: " + val,
					this.director,
					this.nadelegado,
					this.naadmin,
					new Intl.DateTimeFormat("es-US", { month: "long" }).format(new Date())
				);
			}
		}
	}

	estadoadministrativo(): void {
		
		this.load_data_est = true;
		this.load_ventas = false;
		this.load_documentos = false;
		this.load_estudiantes = false;
		this.load_registro = false;
		this.load_administrativo = true;
		this._adminService.listar_registro(this.token).subscribe((response) => {
			this.resgistro_arr = response.data;
			this.resgistro_const = response.data;
			this.load_data_est = false;
			//////console.log( this.resgistro_arr);
		});
	}
	filtrar_documento() {
		this.load_data_est = true;
		if (this.filtro) {
			var term = new RegExp(this.filtro.toString().trim(), "i");
			this.resgistro_arr = this.resgistro_const.filter(
				(item) =>
					term.test(item.admin.email) || term.test(item.tipo) || term.test(item.createdAt)
			);
		} else {
			this.resgistro_arr = this.resgistro_const;
		}
		this.load_data_est = false;
	}
}
