import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminService } from "src/app/service/admin.service";

import { EstudianteService } from "src/app/service/estudiante.service";
import { GLOBAL } from "src/app/service/GLOBAL";
import { TableUtil } from "../show-pagos/tableUtil";
import { TableUtil2 } from "../show-pagos/tableUtil";
declare var iziToast: any;
declare var $: any;

@Component({
	selector: "app-show-pagos",
	templateUrl: "./show-pagos.component.html",
	styleUrls: ["./show-pagos.component.css"]
})
export class ShowPagosComponent implements OnInit {
	public pago: any = {};
	public id = "";
	public token = localStorage.getItem("token");
	public load = false;

	public url = GLOBAL.url;
	public detalles: Array<any> = [];
	public load_data = true;

	public totalstar = 5;

	public review: any = {};
	public load_send = false;
	public load_conf_pago = false;
	public load_final = false;
	public load_del = false;
	public tracking = "";
	public mes: any;
	public auxmes: any;
	public auxmes1: any;
	public auxmes2: any;
	public auxmes3: any;
	public auxmes4: any;
	public auxmes5: any;
	public auxmes6: any;
	public auxmes7: any;
	public auxmes8: any;
	public auxmes9: any;
	public auxmes10: any;
	public idpension: any;
	public registro: any = {};
	public xmlItems: any;
	private auxp =0;
	private mesespdf = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
	
	public fecha: Array<any> = [];
	public pension: any = {};

	constructor(
		private _route: ActivatedRoute,
		private _adminService: AdminService,

		private _estudianteService: EstudianteService,
		private _router: Router
	) {
		this.token = localStorage.getItem("token");
		this.url = GLOBAL.url;
	}

	ngOnInit(): void {
		this._route.params.subscribe((params) => {
			this.id = params["id"];

			this.init_data();
		});
	}

	init_data() {
		this._adminService
			.obtener_detalles_ordenes_estudiante(this.id, this.token)
			.subscribe((response) => {
				////console.log(response);
				if (response.data != undefined) {
					this.pago = response.data;
					this.detalles = response.detalles;
					this.load_data = false;
					this.detalle_data();
				} else {
					this.pago = undefined;
					this.load_data = false;
				}

				////console.log(this.detalles);
			});
	}
	exportTable(){
		TableUtil.exportToPdf( this.mesespdf[new Date(this.auxmes).getMonth()].toString()+ ' '+ new Date(this.auxmes).getFullYear().toString()+'-'+(new Date(this.auxmes).getFullYear()+1).toString());
	}
	exportTable2(){
		TableUtil2.exportToPdf( this.mesespdf[new Date(this.auxmes).getMonth()].toString()+ ' '+ new Date(this.auxmes).getFullYear().toString()+'-'+(new Date(this.auxmes).getFullYear()+1).toString());
	}
	detalle_data() {
		this._estudianteService
			.obtener_pension_estudiante_guest(this.pago.estudiante._id, this.token)
			.subscribe((response) => {
				this.pension = response.data;
				for (var i = 0; i <= this.pension.length; i++) {
					////console.log(this.pension[i].meses);
					////console.log(i);

					if (this.pension[i]._id == this.detalles[0].idpension) {
						this.idpension = this.pension[i]._id;

						this.auxmes = this.pension[i].anio_lectivo;
						let j = 0;

						for (j = 0; j < 10; j++) {
							//if(j>=this.pension[i].meses){
							this.fecha.push({
								date: new Date(this.pension[i].anio_lectivo).setMonth(
									new Date(this.pension[i].anio_lectivo).getMonth() + j
								)
							});

							//}
						}
						////console.log(this.fecha);

						i = this.pension.length;
					}
				}
			});
	}

	facturar_electronica(){
		//console.log(this._adminService.ejemplo(1112,this.token));
		//console.log(this.pago);
		

		console.log(this.detalles);
		console.log(this.pension[this.auxp]);
		let registro: any = {
			//detalleFactura:[]
		};
		this.registro.cedulaEstudiante=(this.pago.estudiante.dni).toString();
		this.registro.nombresEstudiante=(this.pago.estudiante.apellidos+' '+this.pago.estudiante.nombres).toString();
		this.registro.direccionEstudiante=(this.pago.estudiante.direccion).toString();
		this.registro.telefonoEstudiante=(this.pago.estudiante.telefono).toString();
		this.registro.emailEstudiante=(this.pago.estudiante.email).toString();
		
		this.registro.cedulaPadre=(this.pago.estudiante.dni_padre).toString();
		this.registro.nombrePadre=(this.pago.estudiante.nombres_padre).toString();
		this.registro.facturarA=(this.pago.estudiante.dni_factura).toString();
		this.registro.codigoTipocomprobante=parseInt(this.pago.tipo_documento);
		this.registro.subtotal=parseFloat(this.pago.total_pagar);
		this.registro.tarifaCero=parseFloat(this.pago.total_pagar);
		this.registro.tarifaDoce=parseFloat('0');
		this.registro.valoriva=parseFloat('0');
		this.registro.totalFactura=parseFloat(this.pago.total_pagar);
		this.registro.codigoTipopagosri=parseInt('20');

		//this.registro.emailPadre=(this.pago.estudiante.email_padre).toString();
		
		
		
		
		
		
		
		
		for (var k=0; k<this.detalles.length;k++) {
			let dtll=this.detalles[k];
			//console.log(dtll);
			let aux: any = {};
			aux[0]=0; 	//0
			aux[1]=0;	//0
			aux[2]=0;	//0
			aux[3]=k+1;	//numero de Item
			aux[4]=0;			//0
			aux[5]=1;			//1
			if(dtll.tipo==0){
				aux[6]=99;	//Codigo de Producto
			}else{
				aux[6]=dtll.tipo;	//Codigo de Producto
			}
			
			aux[7]=this.pago.tipo_tarifa;	//Tipo Tarifa
			aux[8]=0;	//0
			aux[9]=this.pago.tipo_producto;	//Tipo producto
			//aux[10]='0'; 		//Descripción
			if(dtll.tipo==0){
				aux[10]='Matricula';	
			}else{
				for(var i=0; i<this.fecha.length;i++){
					if(i+1 == dtll.tipo){
						var date  =new Date (this.fecha[i].date);
						let month = date.toLocaleString('default', { month: 'long' });
						//console.log(month+' '+new Date (this.fecha[i].date).getFullYear());
						aux[10]= ('Pensión '+month+' '+new Date (this.fecha[i].date).getFullYear()).toString();
					}
				}
			}
			
			

			aux[11]=dtll.estado; 	//Observación
			aux[12]=dtll.valor;		//Precio Unitario
			aux[13]=0;				//0
			aux[14]=0;				//0
			aux[15]=1;				//cantidad
			aux[16]=0;				//medida1
			aux[17]=0;				//0
			aux[18]="''";			//''
			if(this.pension[this.auxp].condicion_beca!="No" && (dtll.tipo>0&&dtll.tipo<=this.pension[this.auxp].meses)||(dtll.tipo==0 && this.pension[this.auxp].paga_mat==1)){
				aux[19]=this.pension[this.auxp].desc_beca; //descuento
				aux[21]=this.pension[this.auxp].val_beca;	//valorParcialcondescuento
				aux[20]=(this.pension[this.auxp].val_beca*(100/this.pension[this.auxp].desc_beca)); //ValorParcialsinDescuento
			}else{
				aux[19]=0;//descuento
				aux[20]=dtll.valor;//ValorParcialsinDescuento
				aux[21]=dtll.valor;//valorParcialcondescuento
			}
			
			

			
			aux[22]=0; //0
			aux[23]=1; //1
			aux[24]=0; //0
			console.log(aux);
			for(var j=0; j<25;j++){
				//console.log("J:",j,"valor",aux[j]);
				if(j==0){
					if(this.registro.detalleFactura==undefined){
						this.registro.detalleFactura='('+aux[j];
					}else{
						this.registro.detalleFactura=this.registro.detalleFactura+'('+aux[j];
					}
					
				}else{
					//console.log(typeof aux[j]==='string');
					if(typeof aux[j]==='string' && j!=18){
						this.registro.detalleFactura=this.registro.detalleFactura+",'"+aux[j]+"'";
					}else{
						if(j==18){
							this.registro.detalleFactura=this.registro.detalleFactura+','+aux[j];
						}else{
							this.registro.detalleFactura=this.registro.detalleFactura+','+aux[j];
						}
					}
					
				}
				if(j==24){
					///console.log('K',k);
					if(k==this.detalles.length-1){
						this.registro.detalleFactura=this.registro.detalleFactura+')'
					}else{
						this.registro.detalleFactura=this.registro.detalleFactura+'),'
					}
				}
			}
/*
			if(registro.detalleFactura==undefined){
				registro.detalleFactura=JSON.stringify(aux);
			}else{
				registro.detalleFactura=registro.detalleFactura+','+JSON.stringify(aux);
			}
			*/
			//console.log(aux);
		}
		//var a=1;
		//this.registro.soapenv='Envelope';
		//this.registro.xmlns="soapenv='http://schemas.xmlsoap.org/soap/envelope/'";

		console.log(this.registro);
		let b,c;
		for(var value in this.registro){
			if(b==undefined && c==undefined){
				if(value=='cedulaEstudiante'||value=='nombresEstudiante'||value=='cedulaPadre'||value=='nombrePadre'||value=='facturarA'){
					c=value+'="'+this.registro[value]+'"';
				}else{
					c=value+"="+this.registro[value];
				}

				b="<"+value+">"+this.registro[value]+"</"+value+">";
			}else{
				if(value=='cedulaEstudiante'||value=='emailEstudiante'||value=='direccionEstudiante'||value=='nombresEstudiante'||value=='cedulaPadre'||value=='nombrePadre'||value=='facturarA'||value=='telefonoEstudiante'){
					
					c=c+"&&"+value+'="'+this.registro[value]+'"';
				}else{
					c=c+"&&"+value+"="+this.registro[value];
					
					
				}
				

				b=b+"<"+value+">"+this.registro[value]+"</"+value+">";
			}
		}
		console.log(c);

		this.toXML(c);
		//this.loadXML();
	
	}
	// Ejemplo implementando el metodo POST:
	async postData(url = '', data:any) {
	// Opciones por defecto estan marcadas con un *
	const response = await fetch(url, {
	  method: 'POST', // *GET, POST, PUT, DELETE, etc.
	  mode: 'cors', // no-cors, *cors, same-origin
	  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	  credentials: 'same-origin', // include, *same-origin, omit
	  headers: {
		'Content-Type': 'text/plain'
		// 'Content-Type': 'application/x-www-form-urlencoded',
	  },
	  redirect: 'follow', // manual, *follow, error
	  referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	  body: data //JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
  }
  
  
	

	toXML(json: string) {
		var myHeaders = new Headers();
		//org.apache.axis.client.Cal call = 
/*
		this.postData('http://181.113.65.229:7071/WS/Facturador', json)
	.then(data => {
	  console.log(data); // JSON data parsed by `data.json()` call
	});*/
/* 
	

	var myInit:RequestInit  = { 
					method: 'POST',
				   headers: myHeaders,
				   mode: 'cors',
				   cache: 'default'
				 };
	
	var myRequest = new Request("http://192.168.180.1:7071/WS/Facturador?"+json,myInit);


	
	fetch(myRequest)
	.then(function(response) {
		//console.log(response);
	  return response.blob();
	})
	.then(function(myBlob) {
	  var objectURL = URL.createObjectURL(myBlob);
	  //myImage.src = objectURL;
	});
*/
/*

	
	.then(function(myBlob) {
	  var objectURL = URL.createObjectURL(myBlob);
	  //myImage.src = objectURL;
	});
*/this._adminService.facturacion(this.registro).subscribe(response=>{
	console.log(response);
});
	var myInit:RequestInit  = { 
		method: 'POST',
	   headers: {
		"Content-Type": "text/html;charset=UTF-8",
	   },
	   credentials: "omit",
	   mode: 'no-cors',
	   cache: 'default'
	 };



	 console.log("http://181.113.65.229:8080/interfaceFacturaWeb/index.xhtml?"+json);
	var myRequest = new Request("http://181.113.65.229:8080/interfaceFacturaWeb/index.xhtml?"+json,myInit);

	fetch(myRequest)
	.then((response:any)=>{
		console.log(response);
		console.log(response.clone());
		console.log(response.redirected);
		console.log(response.arrayBuffer());
		//console.log(response.formData());
		//console.log(response.blob());
		//console.log(response.json());
		console.log(response.text());
		response.text();
	}).then(printData=>console.log(printData));

	/*
	this._adminService.facturacion(this.registro).subscribe(response=>{
		console.log(response);
	});
	console.log("http://181.113.65.229:7071/WS/Facturador?"+this.registro);
	var myRequest = new Request("http://181.113.65.229:7071/WS/Facturador?");
	fetch(myRequest,{
		method: 'POST',
		//headers: myHeaders,
		mode: 'no-cors',
		cache: 'default',
		headers: [
			["Content-Type", "application/json"],
			["Content-Type", "text/plain"]
		  ],
		  credentials: "include",
		body:JSON.stringify(this.registro)
	})
	.then(result =>{
		console.log(result)
		result.text()
	})
	.then(textformat => console.log(textformat))

	
	fetch(myRequest)
	.then(function(response) {
		console.log(response.clone());
		console.log(response.redirected);
		console.log(response.arrayBuffer());
		console.log(response.formData());
		console.log(response.blob());
		console.log(response.json());
		console.log(response.text());
		console.log(response.json());
	  return response.blob();
	})
	.then(function(myBlob) {
	  var objectURL = URL.createObjectURL(myBlob);
	  //myImage.src = objectURL;
	});






		//const builder = new Builder();
		//var a = new parseString();
        //console.log(builder.buildObject(json));
		
		//var a = this._adminService.toSoap(json);
		//console.log(a);
		//var codigo = new DOMParser();
		//var oDOM = codigo.parseFromString(a, "text/xml");
		//console.log(oDOM);
*/

/*

		let res:any;

		var xmlReq = new XMLHttpRequest();
		//var myMode = xmlReq.mode();
		xmlReq.open('POST', 'http://181.113.65.229:8080/interfaceFacturaWeb/index.xhtml?'+json,true);	
		xmlReq.setRequestHeader('X-PINGOTHER', 'pingpong');
		xmlReq.setRequestHeader('Content-Type', 'application/xml');
		xmlReq.setRequestHeader('mode', 'no-cors');
		//xmlReq.onreadystatechange = handler;
		
		xmlReq.onreadystatechange = function(){
			console.log(xmlReq);
			if(xmlReq.readyState===4){
				if(xmlReq.status===200){
					console.log(xmlReq.responseText);
				}else{
					console.log("ERROR: "+xmlReq.responseText);
				}
			}
		}
		xmlReq.send();

		




		/*
		xmlReq.onload=()=>{
			console.log(xmlReq);
			//res=Object.assign(JSON.parse(xmlReq.response));
			//console.log(res);
		}

		/*
		xmlReq.open("GET", "https://reqres.in/api/users/");		
		xmlReq.onload=()=>{
			console.log(xmlReq);
			res=Object.assign(JSON.parse(xmlReq.response));
			console.log(res);
		}
		xmlReq.send();

		*/

		//this.soap.createClient('http://123.618.196.10/WCFTicket/Service1.svc?wsdl').subscribe(client => this.client = client);
		//var r:string = builder.buildObject(json);
		//r.replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>','<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.davintri.com/">');
		//r.replace('<root>','<soapenv:Header/>  <soapenv:Body> <ws:GenerarFactura>');
		//r.replace('</root>','</ws:GenerarFactura> </soapenv:Body> </soapenv:Envelope>');
		/*
		this.soap.createClient(builder.buildObject(json)).then(
			client=>{
				console.log(client);
				this.client=client;
			}
		);
*/
		//console.log(r);
		//this.loadXML(a);
		//this.loadXML(oDOM);
    }



	finalzar(id: any) {}

	enviar(id: any) {}

	eliminar(id: any) {}

	confirmar_pago(id: any) {}
}
