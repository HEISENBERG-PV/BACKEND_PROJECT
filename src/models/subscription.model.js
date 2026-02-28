import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        // user who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        // user who got subscribed
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Subscripton = mongoose.model("Subscription", subscriptionSchema)