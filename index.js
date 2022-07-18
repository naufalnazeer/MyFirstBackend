const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');
require('dotenv').config()

const graphiqlSchema = require('./src/graphql/schema/index')
const graphiqlResolvers = require ('./src/graphql/resolver/index')

const isAuth = require('./middlewire/is-auth')

    const app = express();

    // app.use((req,res,next)=>{
    //     res.setHeader('Access control-Allow-orgin','*');
    //     res.setHeader('Access-control-allow-method','POST,GET,OPTIONS');
    //     res.setHeader('Access-control-allow-HEADERS','Content-type,Authorization');
    //     if(req.method === 'OPTIONS'){
    //         return res.sendStatus(200)
    //     }
    //     next()
    // })

    app.use(isAuth);
    app.use(bodyParser.json());
    app.use('/graphql',graphqlHTTP({
        schema: graphiqlSchema,
        rootValue: graphiqlResolvers,
    graphiql: true,
    }));

    app.get('/', (req, res, next) => {
        res.send('WELOCME TO THE BACKEND');
    });
    console.log(process.env.MONGO_DB)
    mongoose.connect(process.env.MONGO_DB)
    .then(()=>{
        app.listen(process.env.PORT || 3000, () => {
            console.log("SERVER RUNNING ON 3000");
        });
    }).catch((err)=>{
        console.log("Error occured");
    })

   