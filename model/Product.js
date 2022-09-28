const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type:String,
        trim:true,
        required: [true, 'Please provide product name'],
        maxlength:[100, 'Name cannot be more than 100 characters']
    },
    price: {
        type:Number,
        required: [true, 'Please provide product price'],
        default: 0
    },
    description: {
        type:String,
        required: [true, 'Please provide product description'],
        maxlength:[1000, 'Description cannot be more than 1000 characters']
    },
    image:{
        type:String,
        default:'/uploads/example.jpeg'
    },
    category: {
        type:String,
        required: [true, 'Please provide product category'],
        enum:['office', 'kitchen', 'bedroom'],
    },
    company: {
        type:String,
        required: [true, 'Please provide product company'],
        enum:{
            values: ['like', 'liddy', 'marcos'],
            message: '{VALUES} is not supported',
        }
    },
    colors: {
        type:[String],
        default:['#333'],
        required: true,
    },
    featured: {
        type: Boolean,
        default:false
    },
    freeShipping: {
        type:Boolean,
        default: false
    },
    inventory: {
        type:Number,
        required:true,
        default:15
    },
    averageRating: {
        type:Number,
        default:0
    },
    numOfReviews: {
        type:Number,
        default:0,
    },
    user: {
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
// to enable creation of moongose virtual on-the-fly
{ timestamps: true, toJSON: {virtuals:true}, toObject:{virtuals:true}}
);

ProductSchema.virtual('reviews', {
    ref:'Review',
    localField: '_id', 
    foreignField: 'product',
    justOne: false,
    match: {rating:4} //optional
})

//remove all reviews associated with a product when deleting the product
ProductSchema.pre('remove', async function(next){
    await this.model('Review').deleteMany({product:this._id})
})

module.exports = mongoose.model('Product', ProductSchema);