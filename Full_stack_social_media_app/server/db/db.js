const oracledb = require('oracledb');
const dbConfig = require('./dbconfig');

const db = async(sql, binds, options)=>{
    let connection = null;
    let result = null;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('db connection is successful');
        result = connection.execute(sql,binds,options);
    } catch (error) {
        console.log(error);
        throw error.message;
    }finally{
        try {
            if(connection){
                await connection.close();
                console.log('db connection is closed');
            }
            if(result){
                return result;
            }
            else{
                return null;
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = db;