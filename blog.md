Offline sync com Ionic + PouchDB + CouchDB
=====
> O tutorial a seguir é imensamente baseado no post em [Offline Syncing in Ionic 2 with
PouchDB & CouchDB](http://www.joshmorony.com/offline-syncing-in-ionic-2-with-pouchdb-couchdb/).

Olá pessoal, hoje vamos falar sobre sincronização offline(_offline-sinc_) com
Ionic. 

**Mas por quê isso é importante?**

Mais e mais as aplicações tem que se adaptar ao nosso uso, e uma dessas
adaptações mais importantes é funcionar independente da conexão com a internet.
Seu aplicativo deve ser capaz de guardar os dados a qualquer momento, e quando
possível, fazer os devidos envios/atualizações locais e remotos.

Sincronização offline de dados soa como algo muito complexo de ser feito, e **é**!
Mas duas tecnologias fazem todo o trabalho pesado para nós:
[CouchDB](http://couchdb.apache.org/) e [PouchDB](https://pouchdb.com/).

CouchDB é uma database NoSQL, similar ao [MongoDB](https://www.mongodb.com/), e
oferece facilidades para replicação de databases em vários dispositivos.

PouchDB foi inspirado no CouchDB, mas construído para guardar os dados
localmente e depois sincronizar com uma database CouchDB quando existir uma
conexão. Na verdade, o PouchDB não sincroniza exclusivamente com o CouchDB,
qualquer database que suporte o [protocolo de replicação CouchDB](http://couchdb.readthedocs.io/en/latest/replication/protocol.html)
serve. Veja mais no [FAQ](https://pouchdb.com/faq.html) do PouchDB.

Pré-requisitos
-----
Para este tutorial, estamos assumindo que você já tenha algum contato com Ionic,
e que já tenha feito o setup inicial para desenvolvimento em sua máquina. Os
pré-requisitos são:

- Node
- Cordova
- Ionic

Instalação
-----
Vá ao site do próprio CouchDB e siga as instruções de instalação. É bem simples:
basta fazer o download, extrair e executar a aplicação.

- [CouchDB](http://couchdb.apache.org/)

    Após iniciar o CouchDB, acesse
    
    ```bash
    http://127.0.0.1:5984/_utils/
    ```
    ou
    ```bash
    http://localhost:5984/_utils/
    ```
    
    para conferir que está rodando.  
    Procure pela opção de **Create database** e crie uma database com o nome
    "todos" que usaremos para nossos testes.

Começando a aplicação
-----
1. **Inicie a aplicação utilizando o template **blank**, versão 2 do Ionic e
   arquivos typescript**

    > `ionic start ionic-offline blank --v2 --ts`

2. **Mude para dentro do diretório criado**

    > `cd ionic-offline`

3. **Instale o PouchDB no projeto**

    > `npm install pouchdb --save`

4. **Instale a biblioteca de typings**

    > `npm install -g typings`

    Lib necessária para a inclusão do código Javascript diretamente nos arquivos
    Typescript.

5. **Instale os typings necessários para o PouchDB**

    ```bash
    typings install --global --save dt~pouchdb dt~pouchdb-adapter-websql
    dt~pouchdb-browser dt~pouchdb-core dt~pouchdb-http dt~pouchdb-mapreduce
    dt~pouchdb-node dt~pouchdb-replication
    ```

6. **Resolvendo problema de
   [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)**

    > `npm install -g add-cors-to-couchdb`

    Normalmente, ao interagir com o CouchDB, deve ocorrer problemas de
    [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
    (Cross Origin Resource Sharing). Essa lib fará todo o trabalho para resolver o
    problema.

7. **Execute o seguinte comando com o CouchDB rodando**

    > `add-cors-to-couchdb`

    Se tudo correu corretamente, deverá aparecer uma mensagem de `success`.

8. **Verifique que está tudo ok**

    Execute `ionic serve --lab` e acesse `http://localhost:8100/ionic-lab` para
    ver sua aplicação rodando. Ainda não temos nada, a página que aparece se
    encontra em **src/pages/home/home.html**

Criando a tela inicial
-----

Vamos começar pelo front-end da nossa única tela e em seguida vamos adicionando
as funcionalidades.

Modifique o arquivo **src/pages/home/home.html** para o seguinte código:

```html
<!-- src/pages/home/home.html -->
<ion-header>
    <ion-navbar color="secondary" no-border-bottom>
      <ion-title>
        Todos
      </ion-title>
      <ion-buttons end>
        <button (click)="createTodo()"><ion-icon name="cloud-upload"></ion-icon></button>
      </ion-buttons>
    </ion-navbar>
</ion-header>

<ion-content class="home">

    <ion-list no-lines>
      <ion-item-sliding *ngFor="let todo of todos">
        <ion-item>
          {{todo.title}}
        </ion-item>
        <ion-item-options>
          <button ion-button color="light" (click)="updateTodo(todo)">
            <ion-icon name="create"></ion-icon>
          </button>
          <button ion-button color="primary" (click)="deleteTodo(todo)">
            <ion-icon name="checkmark"></ion-icon>
          </button>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>

</ion-content>
```

Esse será o esqueleto da nossa aplicação. Ainda vamos implementar todas as
funções que aparecem aqui mais pra frente.

Adicionando nossas funcionalidades
-----

Agora que temos nossa página, vamos ao código necessário para o funcionamento da
aplicação.

Crie um _provider_ para fazer a interface com o nosso banco de dados:

> ionic g provider Todos

Modifique o arquivo gerado em **src/providers/todos.ts**:

```typescript
// src/providers/todos.ts
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

@Injectable()
export class Todos {

  data: any;
  db: any;
  remote: any;
 
  constructor() {
    this.db = new PouchDB('todos');
    this.remote = 'http://localhost:5984/todos';
 
    let options = {
      live: true,
      retry: true,
      continuous: true
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
```

Aqui é onde ocorre a conexão entre a nossa aplicação com o PouchDB e o CouchDB.
PouchDB é responsável pelo armazenamento local dos dados e fazer todo o trabalho
pesado de sincronização e armazenamento no banco de dados remoto, no nosso caso é
o CouchDB local.

No construtor, criamos um objeto **this.db** que será utilizado em todas as funções
desse _provider_. Aqui também definimos qual será nossa database remota em
**this.remote** e as opções de sincronização entre as duas bases.

Também colocamos as funções que usaremos para nosso CRUD.
Modifique a função **getTodos()**:

```typescript
getTodos() {
  if (this.data) {
    return Promise.resolve(this.data);
  }
  return new Promise(resolve => {
    this.db.allDocs({
      include_docs: true
    }).then((result) => {
      this.data = [];
 
      let docs = result.rows.map((row) => {
        this.data.push(row.doc);
      });
 
      resolve(this.data);
      this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        this.handleChange(change);
      });
    }).catch((error) => {
      console.log(error);
    }); 
  });
}
```

Aqui retornamos uma _promise_ contendo os dados do nosso banco. Usamos o método
**this.db.allDocs** para obter todos os documentos da database e colocamos no
nosso array **this.data**.

Também configuramos um listener **db.changes** que será ativado sempre que
ocorrer uma mudança nos dados (caso nós editemos algum documento diretamente na
interface do CouchDB, por exemplo). Esse listener irá mandar a mudança para ser
processada pela função **handleChange**, que iremos definir logo em seguida.

Modifique a função **handleChange** para o seguinte:

```typescript
handleChange(change){
 
  let changedDoc = null;
  let changedIndex = null;
 
  this.data.forEach((doc, index) => {
    if(doc._id === change.id){
      changedDoc = doc;
      changedIndex = index;
    }
  });
 
  if(change.deleted){
    //Documento deletado
    this.data.splice(changedIndex, 1);
  } 
  else {
    if(changedDoc){
      //Documento atualizado
      this.data[changedIndex] = change.doc;
    } else {
      //Documento adicionado
      this.data.push(change.doc); 
    }
  }
}
```

Essa função recebe as informações referentes à mudança que ocorreu e atualizamos
nosso array **this.data**. No entanto, essa mudança pode ser um update,
uma adição ou uma deleção de um documento.

Para o caso de deleção, basta verificar a propriedade **deleted**. Para um
update, verificamos se já temos um documento com o mesmo id no nosso array, se
não tivermos, então é uma adição.

Modifique as funções **createTodo**, **updateTodo** e **deleteTodo**:

```typescript
createTodo(todo){
  this.db.post(todo);
}
 
updateTodo(todo){
  this.db.put(todo).catch((err) => {
    console.log(err);
  });
}
 
deleteTodo(todo){
  this.db.remove(todo).catch((err) => {
    console.log(err);
  });
}
```

Essas funções são bem diretas, simplesmente chamamos os métodos do PouchDB para
fazer todo o trabalho pesado.

Com o nosso provider completo, modifique o arquivo **src/app/app.module.ts**
para o seguinte:

```typescript
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Todos } from '../providers/todos';
 
@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Todos]
})
export class AppModule {}
```

Aqui estamos expondo o nosso provider para a nossa aplicação.

Agora vamos modificar o nosso código em **home.ts** para que nossa interface
tenha as devidas interações. Modifique o **home.ts** da seguinte forma:

```typescript
import { Component } from "@angular/core";
import { NavController, AlertController } from 'ionic-angular';
import { Todos } from '../../providers/todos';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  todos: any;
 
  constructor(public navCtrl: NavController, public todoService: Todos, public alertCtrl: AlertController) {
 
  }
 
  ionViewDidLoad(){
 
    this.todoService.getTodos().then((data) => {
      this.todos = data;
    });
 
  }
 
  createTodo(){
 
    let prompt = this.alertCtrl.create({
      title: 'Novo',
      message: 'O que você precisa fazer?',
      inputs: [
        {
          name: 'title'
        }
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Salvar',
          handler: data => {
            this.todoService.createTodo({title: data.title});
          }
        }
      ]
    });
 
    prompt.present();
 
  }
 
  updateTodo(todo){
 
    let prompt = this.alertCtrl.create({
      title: 'Editar',
      message: 'Mudou de ideia?',
      inputs: [
        {
          name: 'title'
        }
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Salvar',
          handler: data => {
            this.todoService.updateTodo({
              _id: todo._id,
              _rev: todo._rev,
              title: data.title
            });
          }
        }
      ]
    });
 
    prompt.present();
  }
 
  deleteTodo(todo){
    this.todoService.deleteTodo(todo);
  }
 
}
```

Aqui importamos o nosso serviço de **Todos** e carregamos os dados. Os métodos
para criação e update são feitos por meio de um **Alert**. Note que para a
criação de um **todo**, passamos apenas o título, mas para o update, fornecemos
também o **_id** e o **_rev**.

Aqui já temos tudo funcional, vamos apenas adicionar um CSS simples para
melhorar a visualização.

Modifique o arquivo **home.scss**:
```css
.ios, .md {
 
  page-home {
 
    .scroll-content {
      background-color: #ecf0f1;
      display: flex !important;
      justify-content: center;
    }
 
    ion-list {
      width: 90%;
    }
 
    ion-item-sliding {
      margin-top: 20px;
      border-radius: 20px;
    }
 
    ion-item {
      border: none !important;
      font-weight: bold !important;
    }
 
  }
 
}
```

Em seguida, modifique as **$colors** em **src/theme/variables.scss**:
```scss
$colors: (
  primary:    #95a5a6,
  secondary:  #3498db,
  danger:     #f53d3d,
  light:      #f4f4f4,
  dark:       #222,
  favorite:   #69BB7B
);
```

Bônus
-----

Por vezes, a atualização dos dados não deve ser imediata ao olhar de
dispositivos diferentes. Vamos adicionar funcionalidade de **Pull down to
refresh** que vemos em vários aplicativos para atualizar os dados ao deslizar a
página para baixo.

Modifique o arquivo **home.html** adicionando a diretiva **ion-refresher** da
seguinte forma:

```html
...

<ion-content class="home">
    <ion-refresher (ionRefresh)="doRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    
    ...
 
</ion-content>
```

Você pode ver mais sobre essa diretiva na documentação do Ionic em
[Refresher](http://ionicframework.com/docs/v2/api/components/refresher/Refresher/).
Ela invoca a nossa função **doRefresh**(que ainda vamos criar) e passa um evento
que usaremos para indicar que a atualização foi finalizada.

Adicione uma nova função **doRefresh** ao arquivo **home.ts**:
```typescript
doRefresh(refresher) {
  this.ionViewDidLoad();
  refresher.complete();
}  
```
Aqui o que fazemos é repetir a função como se estivéssemos carregando a página
novamente para atualizar o array **this.data**, em seguida indicamos que o
evento foi completo para que o ícone de atualização pare de rodar na tela.

E é isso! Finalizamos a nossa aplicação. 

Vá adiante e faça os testes adicionando dados diretamente na interface do
CouchDB. Se quiser testar no seu celular lembre de trocar o endereço que foi
apontado em no _provider_ para a conexão com o CouchDB. Troque o **localhost**
pelo IP da sua máquina que está rodando o seu banco de dados.

Se quiser encontrar mais tutoriais como esse, novamente deixo aqui a referência
que usei: [http://www.joshmorony.com/](http://www.joshmorony.com/).

E é claro, a documentação do Ionic em [http://ionicframework.com/docs/](http://ionicframework.com/docs/).

Fontes
-----

- http://www.joshmorony.com/
- http://ionicframework.com/docs/
- http://couchdb.apache.org/
- https://pouchdb.com/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
