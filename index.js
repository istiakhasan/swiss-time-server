const express=require('express')
const app=express()
require('dotenv').config()
const cors=require('cors')
app.use(cors())
app.use(express.json())
const port=process.env.PORT || 4000



app.get('/',(req,res)=>{
    res.send('Swiss time server start successfully')
})

app.listen(port,()=>console.log("started successfully"))