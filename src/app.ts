import express from 'express';
import router from './routers/router';
import cors from 'cors';

const app = express()
const port = 3004
const cookieParser = require('cookie-parser');

app.use(cors())
app.use(express.urlencoded( {extended : false } ));
app.use(express.json());
app.use(cookieParser());
app.use(router)

app.listen(port, ()=>{
    console.log('server running on http://localhost:'+port);
})
