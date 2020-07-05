import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { Property } from "../../model/property.model";
import { UserService } from '../../services/user.service';
import { PropertyService } from '../../services/property.service';


@Component({
  selector: 'app-my-property',
  templateUrl: './my-property.component.html',
  styleUrls: ['./my-property.component.css']
})
export class MyPropertyComponent implements OnInit {
  public propArray:Property[];
  readData=1;
  constructor(private propSer:PropertyService,private router: Router,private userSer:UserService) { }

  ngOnInit() {
    this.propSer.currentMessage.subscribe(message => 
      {
        if(message==1){
          this.readData=1;
          this.getData();
        }
      });
      this.getData();
  }
  getData(){
    if(this.readData==1){
      this.readData=0;
      this.userSer.getProperties().subscribe(data =>{this.propArray=data.obj;});
    }
  }
  deleteProp(prop){
    this.propSer.deleteProperty(prop._id).subscribe();
    var index = this.propArray.indexOf(prop);
    if (index > -1) {
      this.propArray.splice(index, 1);
    }
  }
  getImage(prop)
  {
    var urlToImg;
    if(prop.image1!="no")urlToImg=prop.image1;
    else if(prop.image2!="no")urlToImg=prop.image2;
    else if(prop.image3!="no")urlToImg=prop.image3;
    else if(prop.image4!="no")urlToImg=prop.image4;
    else urlToImg="no";
    return this.propSer.getImateUrl(urlToImg);
  }
  viewProp(prop)
  {
    this.router.navigate(['/properties/view',prop._id]);
  }

  editProp(prop)
  {
    this.router.navigate(['/properties/edit',prop._id]);
  }

  goForNew()
  {
    this.router.navigate(['/properties/add']);
  }

}
