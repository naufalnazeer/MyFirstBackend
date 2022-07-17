const { buildSchema, } = require('graphql');

module.exports = buildSchema(`

type User{
    _id : ID!
    email: String!
    password: String
    createdEvents :[Event!]
}

type Booking{
    _id :ID!
   event :Event!
   user : User!
   createdAt :String!
   updatedAt :String!
}

type Event {
    _id : ID!
    title :String!
    date :String!
    prize:Int!
    description : String!
    creator : User!
}

type AuthData {
    userId: ID!
    token : String!
    tokenExpiration : Int!
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
    bookings :[Booking!]!
    login(email:String!,password:String!) : AuthData!
}

type RootMutation {
    createEvent(eventInput : EventInput): Event
    createUser(userInput: UserInput) :User
    bookingEvent(eventId:ID!): Booking
    cancelBooking(bookingId :ID!) :Event!
}

schema{
    query: RootQuery
    mutation: RootMutation
}
`)