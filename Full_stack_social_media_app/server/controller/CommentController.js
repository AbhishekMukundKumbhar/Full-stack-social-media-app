const db = require('../db/db');
const {GET_ALL_COMMENTS} = require('../db/commentQuery');

class CommentController{

    addComment = async(req,res)=>{
        try {
            const result = await db(GET_ALL_COMMENTS,[],{});
            console.log(result.rows);
            res.send('data');
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new CommentController();