import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionHttpService } from '../collections/collection.http.service';
import { Collection } from './collection';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent implements OnInit {

  collection!: Collection;
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private http: CollectionHttpService
  ) { }

  ngOnInit(): void {
    let collectionId = this.route.snapshot.params["id"];
    this.http.get(collectionId).subscribe(
      {
        next: (data: any) => this.loadCollection(data)
      }
    )
  }

  loadCollection(data: any){
    this.collection = data;
    console.log(this.collection);
  }

}
