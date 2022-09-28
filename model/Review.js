const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type:Number,
        min:1,
        max:5,
        required:[true, 'Please provide rating']
    },
    comment: { 
        type:String,
        required: [true, 'Please provide review text']
    },
    title: {
        type:String,
        trim:true,
        maxlength:100,
        required: [true, 'Please provide title']
    },
    user: {
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type:mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
},{timestamps: true}
);

// one product review per-user
ReviewSchema.index({product:1, user:1}, {unique:true});

// static method called on the schema
ReviewSchema.statics.calculateAverageRating = async function(productId) {
    const result = await this.aggregate([
        {$match: {product: productId}},
        {
            $group: {
            _id:null,
            averageRating: {$avg: '$rating'},
            numOfReviews: {$sum: 1},
            }
        },
    ])

    try {
        await this.model('Product').findOneAndUpdate(
            {_id: productId},
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        );
    } catch (error) {
        console.log(error)
    }
    console.log(result);
}

// invoking the static method of the schema
ReviewSchema.post('save', async function(){
    await this.constructor.calculateAverageRating(this.product);
})

ReviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product);
})

module.exports = mongoose.model('Review', ReviewSchema);

