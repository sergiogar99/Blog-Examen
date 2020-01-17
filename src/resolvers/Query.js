import { MongoClient, ObjectID } from "mongodb";
import { GraphQLServer } from "graphql-yoga";
import *as uuid from 'uuid';
import { PubSub } from "graphql-yoga";
import "babel-polyfill";


const Query = {

    getEntradas:async (parent, args, ctx, info) => { 
      
      const { mail,token } = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      const user = await collection.findOne({mail:mail,token:token});

      if(user){

        const collection = db.collection("entradas");
        const result = await collection.find().toArray(); 

        return result;

      }else{

        throw new Error( mail + ' no encontrado');

      }
    
    },      

    getAutor:async (parent, args, ctx, info) => { 
      
      const { mail,token,mail_autor} = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      const user = await collection.findOne({mail:mail,token:token});

      if(user){


        const autor = await collection.findOne({mail:mail_autor});
        
        if(autor){

          const collection = db.collection("entradas");
          const result = await collection.find({"idAutor": autor._id}).toArray(); 

          return result;

        }else{

            throw new Error( mail + ' no encontrado');

        }

      }else{

        throw new Error( mail + ' no encontrado');

      }
    
    },  

    getEntrada:async (parent, args, ctx, info) => { 
      
      const { mail,token,id } = args;
      const { client } = ctx;
      const db = client.db("Blog2");
      const collection = db.collection("users");

      const user = await collection.findOne({mail:mail,token:token});

      if(user){

        const collection = db.collection("entradas");
        const result = await collection.findOne({_id: ObjectID(id)});

        return result;

      }else{

        throw new Error( mail + ' no encontrado');

      }
    
    },      

}

export {Query as default}