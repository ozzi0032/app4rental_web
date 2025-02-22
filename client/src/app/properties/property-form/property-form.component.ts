import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../model/property.model';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.css']
})
export class PropertyFormComponent implements OnInit {
  @Input() prop: Property = { title: null, deposit: null, rooms: null, area: null, street: null };
  @Output() public event = new EventEmitter();
  form: FormGroup;
  public url = ["", "../../../assets/images/placeholder.jpg",
    "../../../assets/images/placeholder.jpg",
    "../../../assets/images/placeholder.jpg",
    "../../../assets/images/placeholder.jpg"];
  public iconURL = ['', "../../../assets/icons/B-wireless-network.png",
    "../../../assets/icons/B-hdtv.png",
    "../../../assets/icons/B-bed.png",
    "../../../assets/icons/B-single-bed.png",

    "../../../assets/icons/B-air-conditioner.png",
    "../../../assets/icons/B-fridge.png",
    "../../../assets/icons/B-stove-oven.png",
    "../../../assets/icons/B-washing-machine.png",

    "../../../assets/icons/B-bathtub.png",
    "../../../assets/icons/B-microwave.png",
    "../../../assets/icons/B-landline.png",
    "../../../assets/icons/B-fireplace.png"
  ];
  public fileToUpload: File[] = [];
  public isAddedFile = [];
  public isClicked = [];


  constructor(private propSer: PropertyService) { }


  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(this.prop.title, [Validators.required, Validators.minLength(3)]),
      deposit: new FormControl(this.prop.deposit, [Validators.required, Validators.min(5000), Validators.max(100000)]),
      rooms: new FormControl(this.prop.rooms, [Validators.required, Validators.min(1), Validators.max(10)]),
      area: new FormControl(this.prop.area, [Validators.required, Validators.min(10), Validators.max(1000)]),
      street: new FormControl(this.prop.street, [Validators.required, Validators.minLength(3)]),
    });
    this.isClicked[1] = this.prop.internet;
    this.isClicked[2] = this.prop.cableTV;
    this.isClicked[3] = this.prop.bBed;
    this.isClicked[4] = this.prop.sBed;
    this.isClicked[5] = this.prop.conditioner;
    this.isClicked[6] = this.prop.fridge;
    this.isClicked[7] = this.prop.stove;
    this.isClicked[8] = this.prop.washer;
    this.isClicked[9] = this.prop.bathub;
    this.isClicked[10] = this.prop.microwave;
    this.isClicked[11] = this.prop.landline;
    this.isClicked[12] = this.prop.fireplace;
    if (this.prop.image1 != "no" && this.prop.image1 != undefined) {
      this.url[1] = this.propSer.getImateUrl(this.prop.image1);
      this.isAddedFile[1] = true;
    }
    if (this.prop.image2 != "no" && this.prop.image2 != undefined) {
      this.url[2] = this.propSer.getImateUrl(this.prop.image2);
      this.isAddedFile[2] = true;
    }
    if (this.prop.image3 != "no" && this.prop.image3 != undefined) {
      this.url[3] = this.propSer.getImateUrl(this.prop.image3);
      this.isAddedFile[3] = true;
    }
    if (this.prop.image4 != "no" && this.prop.image4 != undefined) {
      this.url[4] = this.propSer.getImateUrl(this.prop.image4);
      this.isAddedFile[4] = true;
    }
  }

  onSubmit() {
    const property = new Property(
      this.form.value.title,
      this.form.value.deposit,
      this.form.value.rooms,
      this.form.value.area,
      this.form.value.street,
      this.isActive(1),
      this.isActive(2),
      this.isActive(3),
      this.isActive(4),
      this.isActive(5),
      this.isActive(6),
      this.isActive(7),
      this.isActive(8),
      this.isActive(9),
      this.isActive(10),
      this.isActive(11),
      this.isActive(12),
      this.prop.user,
      this.sendEditedImage(1),
      this.sendEditedImage(2),
      this.sendEditedImage(3),
      this.sendEditedImage(4)
    );
    var objToSend = { property: property, files: this.fileToUpload };
    this.form.reset;
    this.event.emit(objToSend);
  }
  sendEditedImage(num) {
    if (this.isAdded(num) != true) return "no";
    else {
      if (num == 1) if (!this.isThereAfile(1)) return this.prop.image1; else return "no";
      if (num == 2) if (!this.isThereAfile(2)) return this.prop.image2; else return "no";
      if (num == 3) if (!this.isThereAfile(3)) return this.prop.image3; else return "no";
      if (num == 4) if (!this.isThereAfile(4)) return this.prop.image4; else return "no";
    }
  }
  isThereAfile(num) { if (this.fileToUpload[num] == null || this.fileToUpload[num] == undefined) return false; else return true; }
  changeI(num) { if (this.isActive(num)) this.isClicked[num] = false; else this.isClicked[num] = true; }
  isActive(num) { return this.isClicked[num] == true; }
  isAdded(num) { if (this.isAddedFile[num] == true) return true; else return false; }
  clearImage(num) {
    this.fileToUpload[num] = null; this.url[num] = '../../../assets/images/placeholder.jpg'; this.isAddedFile[num] = false;
  }
  onImageAdded(event, num) {
    var temp = event.target.files[0];
    if (temp != undefined)
      if (temp.type.split('/')[0] == "image")
        if (event.target.files && event.target.files[0]) {
          this.fileToUpload[num] = event.target.files[0];
          this.isAddedFile[num] = true;
          var reader = new FileReader();
          reader.onload = (event: any) => {
            this.url[num] = event.target.result;
          }
          reader.readAsDataURL(event.target.files[0]);
        }
  }
  openUpload(event: any, num) {
    event.preventDefault();
    var element: HTMLElement;
    if (num == 1) element = document.getElementById('upload') as HTMLElement;
    if (num == 2) element = document.getElementById('upload2') as HTMLElement;
    if (num == 3) element = document.getElementById('upload3') as HTMLElement;
    if (num == 4) element = document.getElementById('upload4') as HTMLElement;
    element.click();
  }

}
