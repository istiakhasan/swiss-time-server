const express=require('express')
const app=express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cors=require('cors')
app.use(cors())
app.use(express.json())
const port=process.env.PORT || 4000


app.get('/',(req,res)=>{
    res.send('Swiss time server start successfully')
})

const verifyJotToken=(req,res,next)=>{
    const authHeader=req.headers.authorization; 
    if(!authHeader){
        return res.status(401).send({message:'Unauthorized User'})
    }
    const token=authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:"Forbidden access"})
            
        }
        req.decoded=decoded
        next()
    })
}


//mongodb connection


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ln10s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run=async()=>{
   
      try{
        await client.connect();
        const inventoryCollection= client.db('swisstimedb').collection('inventoryes');
        const messageCollection= client.db('swisstimedb').collection('messages');

         //authentication
         app.post('/login',async(req,res)=>{
             const user=req.body 
           
             const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
                 expiresIn:'1d'
             })
             res.send({accessToken})
         })
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
        app.post('/inventory',async(req,res)=>{
            const newItem=req.body 
            const result=await inventoryCollection.insertOne(newItem)
            res.send(result)
            
        })
        app.delete('/inventory/:id',async(req,res)=>{
            const id=req.params.id 
            const query={_id:ObjectId(id)}
            const deleteItem=await inventoryCollection.deleteOne(query)
            res.send(deleteItem)

        })
        app.patch('/inventory/:id',async(req,res)=>{
            const isReduce=req.body.isReduce 
          
            let quantity;
            if(isReduce){

                 quantity=req.body.quantity-1
                
            }else{
                quantity=req.body.quantity
               
            }
            const id=req.params.id 
           
            const query={_id:ObjectId(id)}
            const update={$set:{quantity:quantity}}
            const cursor=await  inventoryCollection.updateOne(query,update)
            res.send(cursor)
        });
        //get items by email
        app.get('/myitems',verifyJotToken,async(req,res)=>{
             
             const email=req.query.email
             const query={email:email}
             const decodedEmail=req.decoded.email 
             if(email===decodedEmail){

                 const cursor=inventoryCollection.find(query)
                 const myitems=await cursor.toArray()
                 res.send(myitems) 
                }else{
                    res.status(403).send({message:'Forbidded access'})
                }

        })

        app.post('/sendmessage',async(req,res)=>{
            const message=req.body 
            const result= await messageCollection.insertOne(message)
            res.send(result)
        })
        //
      }finally{

      }
     
}


run().catch(console.dir)


app.listen(port,()=>console.log("started successfully"))