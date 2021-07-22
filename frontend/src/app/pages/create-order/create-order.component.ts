import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/models/IUser';
//import { ResetPasswordComponent } from 'src/app/components/reset-password/reset-password.component';
import { AlertsService } from 'src/utils/alert.service';
import { LoginService } from '../login/services/login.service';
import { MatTableDataSource } from '@angular/material/table';
import { AddOrderService } from 'src/utils/order.service';
import { NewProductService } from '../products/services/products.service';
import { DomSanitizer } from '@angular/platform-browser';


export interface orderDetail {
  producto: string;
  position: number;
  precio: number;
  cantidad: number;
  stock: number[];
  subtotal: number;
  incluir: number;
  imagenSrc: any
}

@Component({
  selector: 'app-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit {
  ELEMENT_DATA: orderDetail[] = [];
  displayedColumns: string[] = ['position', 'producto', 'precio', 'cantidad', 'subtotal', 'incluir'];
  dataSource = new MatTableDataSource<orderDetail>(this.ELEMENT_DATA);
  formUser!: FormGroup;
  currentUser: any;
  orderDetails: any[] = [];
  currentPrice: number = 0;

  constructor(public fb: FormBuilder, private loginService: LoginService, private alertsService: AlertsService, private addOrderService: AddOrderService,
    private productService: NewProductService, private sanitizer: DomSanitizer) { }

  async ngOnInit(): Promise<void> {
    debugger;
    localStorage.setItem("scrolledNavBar", "true");
    let currentUser = await this.loginService.getCurrentUser(this.loginService.getToken()).toPromise();
    this.currentUser = (Object.values(currentUser))[2];
    let nombre = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    debugger;
    this.formUser = new FormGroup({
      user: new FormControl(''),
      email: new FormControl(`${this.currentUser.email}`)
    });
    this.formUser.controls.user.disable();
    debugger;
    await this.setOrderDetails();
    debugger;
    await this.setElementData();
    await this.setDataSoruce();



  }

  async setOrderDetails() {
    debugger;
    this.orderDetails = await this.addOrderService.getOrderDetails();
    debugger;
  }

  async setElementData() {
    debugger;
    for (let i = 0; i < this.orderDetails.length; i++) {
      let imagenSrc: any = "assets/images/unnamed.jpg";
      let stock = Array(this.orderDetails[i].stock).fill(1).map((x, i) => i + 1);

      let imagesResponse = await this.productService.getImagesByProductId(this.orderDetails[i].id_producto).toPromise();
      let imagesProductList = ((Object.values(imagesResponse))[2]);
      if (imagesProductList.length > 0) {
        let mainImageProductData = imagesProductList[0];
        let mainImageProductPhoto = await this.productService.getImage(this.orderDetails[i].id_producto, mainImageProductData.nombre).toPromise();
        let unsafeImageUrl = URL.createObjectURL(mainImageProductPhoto);
        imagenSrc = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      }
      
      let orderDetailToPush = {
        position: i + 1, producto: this.orderDetails[i].nombre, precio: this.orderDetails[i].precio, cantidad: 1, stock: stock, subtotal: this.orderDetails[i].precio, 
        incluir: 1, imagenSrc: imagenSrc
      }
      debugger;

      this.ELEMENT_DATA.push(orderDetailToPush);
      debugger;
      this.currentPrice += this.orderDetails[i].precio;
    }
  }

  async setDataSoruce() {
    debugger;
    debugger;
    this.dataSource = new MatTableDataSource<orderDetail>(this.ELEMENT_DATA);
    debugger;
  }

  async enableOrderDetail(checked: boolean, orderDetailIndex: number) {
    debugger;
    this.ELEMENT_DATA[orderDetailIndex].incluir = Number(checked);
    await this.setDataSoruce();
    if (checked) {
      this.currentPrice += this.ELEMENT_DATA[orderDetailIndex].subtotal;
    }
    else {
      this.currentPrice -= this.ELEMENT_DATA[orderDetailIndex].subtotal;
    }
  }

  async changeSubTotal(event: any, orderDetailIndex: number) {
    debugger;
    debugger;
    let subTotalCache = this.ELEMENT_DATA[orderDetailIndex].subtotal;
    this.ELEMENT_DATA[orderDetailIndex].subtotal = this.ELEMENT_DATA[orderDetailIndex].precio * Number(event.value);
    await this.setDataSoruce();
    this.currentPrice += (this.ELEMENT_DATA[orderDetailIndex].subtotal - subTotalCache);
  }
}
