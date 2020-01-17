import { MongoClient, ObjectID } from "mongodb";
import { GraphQLServer } from "graphql-yoga";
import *as uuid from 'uuid';
import { PubSub } from "graphql-yoga";
import "babel-polyfill";


const Mutation = {

    //Mode 1 -> Lector
    //Mode 2 -> Autor

    addUser:async (parent, args, ctx, info) => {  

      const { mail,password,mode } = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      //ver si exite el usuario

      const user = await collection.findOne({mail:mail});

      if(!user){

        //generar token con uuid

        const token = uuid.v4();
        const result = await collection.insertOne({mail,password,mode,token});

        //se pone el token a undefined cuando pasan 30 minutos tras registrarse
        setTimeout( () => {
          collection.updateOne({mail}, {$set: {token:undefined}});
        }, 1800000)

        return {

          mail,            
          password,
          token,
          mode,
          _id:result.ops[0]._id

        };

      }
    },

    addEntrada:async (parent, args, ctx, info) => {  
      
      const { mail,token,titulo,descripcion } = args;
      const { client,pubsub } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      // addEntrada(mail:String!,token:ID!,titulo:String!,descripcion:String!):Entradas!
      //ver si exite el usuario

      const user = await collection.findOne({mail:mail,token:token,mode:2});

      //Mode 2 = autor
      //Mode 1 = lector
      if(user){

          const collection = db.collection("entradas");

          const idAutor = user._id;
          
          const result = await collection.insertOne({idAutor,titulo,descripcion});

          pubsub.publish(
            mail,
            {
              tellUser: {
                
                idAutor,            
                titulo,
                descripcion,
                _id:result.ops[0]._id

              }
            }
          );

        return {

          idAutor,            
          titulo,
          descripcion,
          _id:result.ops[0]._id

        };

      }else{

        throw new Error('Usuario no encontrado');

      }

    },

    login:async (parent, args, ctx, info) => {  
      
      const { mail,password } = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      //ver si exite el usuario
      let user = await collection.findOne({mail:mail,password:password});

      if(user){

        //actualizamos el token del usuario
        await collection.updateOne({"mail": mail }, { $set: { "token": uuid.v4() }});

        user = await collection.findOne({mail:mail,password:password});

        //se pone el token a undefined cuando pasan 30 minutos tras iniciar sesion
        setTimeout( () => {
          collection.updateOne({mail}, {$set: {token:undefined}});
        }, 1800000)
        
        return user;

      }else{

        throw new Error('Usuario no encontrado');

      }

    },

    logout:async (parent, args, ctx, info) => {  
      
      const { mail,token} = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      //ver si exite el usuario

      let user = await collection.findOne({mail:mail,token:token});

      if(user){

        //ponemos el token a undefined, lo invalidamos
        await collection.updateOne({"mail": mail }, { $set: { "token": undefined}});
        user = await collection.findOne({mail:mail});
        return user;

      }else{

        throw new Error('Usuario no encontrado');

      }

    },

    removeUser:async (parent, args, ctx, info) => {  
      
      const { mail,token } = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      let collection = db.collection("users");
      //ver si exite el usuario


      const user = await collection.findOne({mail:mail,token:token});

      if(user){

        

        await collection.deleteOne({mail:{$eq:mail}}); 

        if(user.mode == 2){

        const id = user._id;
        collection = db.collection("entradas");
        await collection.remove({idAutor:{$eq:id}},false);

        }
        return user.mail + " ha sido borrado";

      }else{

        throw new Error('Usuario no encontrado.');
      }

    },

    removeEntrada:async (parent, args, ctx, info) => {  
      
      const { mail,token,id} = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      let collection = db.collection("users");

      const user = await collection.findOne({mail:mail,token:token,mode:2});

      if(user){

        let collection = db.collection("entradas");
        await collection.deleteOne({_id:{$eq:ObjectID(id)}});

        return "se ha borrado la entrada.";

      }else{

        throw new Error('Usuario no encontrado');
      }

    },

}

export {Mutation as default}