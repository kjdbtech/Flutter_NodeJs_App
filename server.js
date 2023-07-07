var express = require ('express');      // express모듈을 'express' 이름으로 호출
var app = express();    //express를 실행시키고 기능들을 'app' 별칭으로 사용 가능
var {Pool, Query} = require('pg');

const pool = new Pool({
    user: 'dbtech',
    host: '192.168.30.8',
    database: 'data',
    password: 'dbtechpwd',
    port: 5432,

})


app.use(express.json());    // json 요청 허용
const querys = 'dt';
app.get('/data', function (req, res) {
    try {
        pool.query(querys.toString, (err, result) => {
            if(err){
                console.error('error : ' + err);
            } else {
                res.json(result.rows);
                console.log(result);
            }
        });
        console.log('get_Emp_Data');
    } catch (error) {
        console.log('오류 : ' + error);
    }

});


// App에서 데이터 받아오기
app.post('/check',(req,res) => {
    const data = req.body.data;
    const sql = `select * from emp where ename ilike '`+data+`'`;
    try {
        pool.query(sql, (err, result) => {
            if (result) {
                console.log('로그인 성공');
            }else{
                console.log('로그인 실패');
                console.log(err);
            }
            // console.log(res.json(result.rows));
            // console.log('+++++++++++++++++');
            console.log(result);
            })
    } catch (error) {
        console.log('오류 : ' + error);
    }

    console.log(req.body);
    console.log('Received data : ', data);
    res.send('받기완료');
});





app.listen(3000, () => {
    console.log('3000번 포트 사용');
});   // 3000번 포트 사용



