const express = require('express')
const app = express()
const port = 3000
const cookieParser = require('cookie-parser');

app.use(express.urlencoded( {extended : false } ));
app.use(express.json());
app.use(cookieParser());

require('./routers/router')(app)

app.listen(port, ()=>{
    console.log("서버 실행중");
})