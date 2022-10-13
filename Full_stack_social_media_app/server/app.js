const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;
const auth_router = require('./router/auth');
const post_router = require('./router/posts');
const user_router = require('./router/user');

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth',auth_router);
app.use('/post',post_router);
app.use('/user',user_router);

app.listen(PORT,()=>{
    console.log('server is listening on port '+ PORT);
})