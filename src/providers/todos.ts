
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import PouchDB from 'pouchdb';

@Injectable()
export class Todos {

  data: any;
  db: any;
  remote: any;

  constructor(private http: Http) {

    this.db = new PouchDB('todos');

    this.remote = 'http://localhost:5984/todos';

    let options = {
      live: true,
      retry: true
    };

    this.db.sync(this.remote, options);

  }

  getTodos() {

  }

  createTodo(todo){

  }

  updateTodo(todo){

  }

  deleteTodo(todo){

  }

  handleChange(change){

  }

}
