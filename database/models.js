
module.exports = { 
    user:{ 
        name:{type:String,required:true},
        password:{type:String,required:true}
    },
    article:{
        title:{type:String,required:true},
        body:String,
        author:String,
        date:Date,
        belong_to:String,
        comments: [{ body: String, date: Date,name:String}],
    }
};
