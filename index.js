const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema, } = require('graphql');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const Event = require('./src/models/event')
const User = require('./src/models/user')

const user =(userId)=>{
    return User.findById(userId).then(user =>{
        return {...user._doc,_id :user.id, createdEvents : event.bind(this,user._doc.createdEvents)}
    }).catch((err)=>{
        throw err;
    })

}

const event =(eventIds)=>{
    return Event.find({_id:{$in :eventIds}}).then(events =>{
        return events.map(event =>{
            return {...event._doc,_id:event.id,creator : user.bind(this, event.creator)}
        })
    }).catch((err)=>{
        throw err;
    })
}

    const app = express();

    app.use(bodyParser.json());
    app.use('/graphql',graphqlHTTP({
        schema: buildSchema(`

            type User{
                _id : ID!
                email: String!
                password: String
                createdEvents :[Event!]
            }

            type Event {
                _id : ID!
                title :String!
                date :String!
                prize:Int!
                description : String!
                creator : User!
            }

            input EventInput {
                title :String!
                date :String!
                prize:Int!
                description : String!
            }

            input UserInput {
                email :String!
                password: String!

            }


            type RootQuery {
                events : [Event!]!
            }

            type RootMutation {
                createEvent(eventInput : EventInput): Event
                createUser(userInput: UserInput) :User
            }

            schema{
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return Event.find()
                .then(events =>{
                    return events.map(event =>{
                        return {...event._doc,_id: event.id,
                        creator: user.bind(this,event._doc.creator)
                    };
                    })
                })
                .catch(err =>{
                    throw err;
                })
            },
            createEvent: (args) => {
                let createdEvent ;
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    prize :args.eventInput.prize,
                    date : new Date(args.eventInput.date),
                    creator :"62d304ce951321e093c30d7a"
                })
                return event
                .save().then(result =>{
                    createdEvent = {...result._doc,_id :result.id};
                    return User.findById("62d304ce951321e093c30d7a")
                })
                .then((user)=>{
                    if(!user){
                        throw new Error('User not exists')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then((result)=>{
                    return createdEvent
                })
                .catch(err =>{
                    console.log(err)
                    throw err;
                })
            },
        createUser: (args) => {
            return User.
            findOne({email :args.userInput.email}).then(user =>{
                if(user){
                    throw new Error('User exists already')
                }
                return bcrypt
                .hash(args.userInput.password,12)
            })
            .then(hashedPassword =>{
                const user = new User({
                    email: args.userInput.email,
                    password : hashedPassword
            });
            return user.save()
            })
            .then(result =>{
                return {...result._doc,password :null, _id :result.id}
            })
            .catch(err => {
                throw err;
            })
        }
    },
    graphiql: true,
    }));

    app.get('/', (req, res, next) => {
        res.send('WELOCME TO THE BACKEND');
    });

    // mongoose.connect(`mongodb+srv://naufalnaz:${process.env.MONGO_PASSWORD}@cluster0.18aa0cx.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    // .then(()=>{
    //     app.listen(process.env.PORT, () => {
    //         console.log("SERVER RUNNING ON 3000");
    //     });
    // }).catch((err)=>{
    //     console.log("Error occured");
    // })
    app.listen(process.env.PORT, () => {
        console.log(`Example app listening on port ${process.env.PORT}`)
      })
   