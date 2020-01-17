import { MongoClient, ObjectID } from "mongodb";
import { GraphQLServer } from "graphql-yoga";
import *as uuid from 'uuid';
import { PubSub } from "graphql-yoga";
import "babel-polyfill";


const Subscription = {

    tellUser:{

      subscribe: async (parent, args, ctx, info) => {

          const {mail,token,mail_autor} = args;
          const {pubsub,client} = ctx;
          const db = client.db("Blog2");
          const collection = db.collection("users");

          const user = await collection.findOne({mail:mail,token:token});

          if(user){

            return pubsub.asyncIterator(mail_autor);

          }else{

            throw new Error( mail + ' no encontrado');

          }
          
          

      }

  },

}

export {Subscription as default}