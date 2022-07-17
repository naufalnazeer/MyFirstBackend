

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const DataLoader = require('dataloader')

const Event = require('../../models/event')
const User = require('../../models/user')
const Booking =require('../../models/bookings')

const eventLoader = new DataLoader((eventIds)=>{
    return event (eventIds)
})

const transformEvent = event =>{
   
    return {...event._doc,_id:event.id,
        date :new Date(event._doc.date).toISOString(),
        creator : user.bind(this, event._doc.creator)
    }
}

const event =(eventIds)=>{
    return Event.find({_id:{$in :eventIds}}).then(events =>{
        return events.map(event =>{
            return transformEvent(event)
        })
    }).catch((err)=>{
        throw err;
    })
}


const user =(userId)=>{
    return User.findById(userId).then(user =>{
        return {...user._doc,_id :user.id, createdEvents : event.bind(this,user._doc.createdEvents)}
    }).catch((err)=>{
        throw err;
    })

}

//single 

const singleEvent = async (eventId)=>{
    try{
        const event = await Event.findById(eventId);
        return{
            ...event._doc,_id :event.id,
            creator : user.bind(this,event.creator)
        }
    }catch(err){
        throw err
    }
}

module.exports = {
    events: () => {
        return Event.find()
        .then(events =>{
            return events.map(event =>{
                return {...event._doc,_id: event.id,
                    date :new Date(event._doc.date).toISOString(),
                    creator: user.bind(this,event._doc.creator)
            };
            })
        })
        .catch(err =>{
            throw err;
        })
    },
    createEvent: (args, req) => {
        if(!req.isAuth){
            throw new Error("Unauthenticated")
        }
        let createdEvent ;
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            prize :args.eventInput.prize,
            date : new Date(args.eventInput.date),
            creator :req.userId
        })
        return event
        .save().then(result =>{
            createdEvent = {...result._doc,_id :result.id,
            date :new Date(result._doc.date).toISOString(),
            creator: user.bind(this,result._doc.creator)};
            return User.findById(req.userId)
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
},
bookings :async (req)=>{
    if(!req.isAuth){
        throw new Error("Unauthenticated")
    }
    try{
        const bookings = await Booking.find();
        return bookings.map(booking =>{
            return {...booking._doc,
            _id :booking.id,
            user : user.bind(this,booking._doc.user),
            event : singleEvent.bind(this,booking._doc.event),
            createdAt :new Date(booking._doc.createdAt).toISOString(),
            updatedAt :new Date(booking._doc.updatedAt).toISOString()
        }
        })
    }catch(err){
        throw err
    }
},
bookingEvent : async (args,req)=>{
         if(!req.isAuth){
            throw new Error("Unauthenticated")
         }
        const fetchedEvent = await Event.findOne({_id :args.eventId})
        const booking = new Booking ({
            user : req.userId,
            event :fetchedEvent
        });
        const result = await booking.save();
        return {...result._doc,
        _id :result.id,
        user : user.bind(this,result._doc.user),
        event : singleEvent.bind(this,result._doc.event),
        createdAt :new Date(result._doc.createdAt).toISOString(),
        updatedAt :new Date(result._doc.updatedAt).toISOString()
    };
},
 
cancelBooking : async(args,req)=>{
    if(!req.isAuth){
        throw new Error("Unauthenticated")
    }
    try{
        const booking = await Booking.findById({_id:args.bookingId}).populate('event')
        const event = {...booking.event._doc,_id :booking.event.id,
                        creator :user.bind(this,booking.event._doc.creator)}
        await Booking.deleteOne({_id :args.bookingId})
        return event;
    }catch(err){
        throw err
    }
},

login : async ({email,password})=>{
    const user = await User.findOne({email:email});
    if(!user){
        throw new Error("User does not Exists!");
    }
    const isEqual = await bcrypt.compare(password,user.password);
    if(!isEqual){
        throw new Error ('Password is incorrect')
    }
   const token = jwt.sign({userId:user.id,email : user.email},"supersecretKey",{
    expiresIn :'1h'
   })
   return {userId:user.id, token:token, tokenExpiration :1}
}

}