import mongoose from 'mongoose'

const connectionDB = async () => {
    try {
        const connextionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`DB connected successfuly : DB HOST : ${connextionInstance.connection.host}`);        
    } catch (error) {
        console.log("Error in DB connection ", error);
    }
}


export default connectionDB