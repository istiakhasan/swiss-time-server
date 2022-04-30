const express=require('express')
const app=express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors=require('cors')
app.use(cors())
app.use(express.json())
const port=process.env.PORT || 4000


app.get('/',(req,res)=>{
    res.send('Swiss time server start successfully')
})


//mongodb connection


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ln10s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run=async()=>{
   
      try{
        await client.connect();
        const inventoryCollection= client.db('swisstimedb').collection('inventoryes');


        app.get('/inventory',async(req,res)=>{
            const query={}
            const cursor=inventoryCollection.find(query)
            const inventoryItems=await cursor.toArray();
            res.send(inventoryItems)
        })
        app.get('/inventory/:id',async(req,res)=>{
            const id=req.params.id 
            const query={_id:ObjectId(id)}
            const inventoryItem=await inventoryCollection.findOne(query)
            res.send(inventoryItem)
        });
        app.patch('/inventory/:id',async(req,res)=>{
            const quantity=req.body.quantity-1
            const id=req.params.id 
            const query={_id:ObjectId(id)}
            const update={$set:{quantity:quantity}}
            const cursor=await  inventoryCollection.updateOne(query,update)
            res.send(cursor)
        })
      }finally{

      }
     
}


run().catch(console.dir)


app.listen(port,()=>console.log("started successfully"))