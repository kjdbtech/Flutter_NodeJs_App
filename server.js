var express = require ('express');      // express모듈을 'express' 이름으로 호출
var app = express();    //express를 실행시키고 기능들을 'app' 별칭으로 사용 가능
var {Pool, Query} = require('pg');
var bodyParser = require('body-parser');

const pool = new Pool({
    user: 'dbtech',
    host: '192.168.30.8',
    database: 'data',
    password: 'dbtechpwd',
    port: 5432,

})

app.use(bodyParser.urlencoded({extended:true}));


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



// 외부 css 사용
app.get('/css/main_style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/css/main_style.css');
})


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/html/main.html");
})


// 인증정보 확인하기
app.post('/auth_submit',(req, res) => {
    const name = req.body.name;
    const empno = parseInt(req.body.empno);
    const deptno = parseInt(req.body.deptno);
    const hire_date = (req.body.year) + '-'
                        + (req.body.month) + '-'
                        + (req.body.day);
    
    const sql = `select * from emp where empno = ${empno} and ename ilike '${name}' and hiredate = ${hire_date} and deptno = ${deptno}`;
    
    
    console.log('이름 : ' + name);
    console.log('직원번호 : ' + empno);
    console.log('부서번호 : ' + deptno);
    console.log('입사날짜 : ' + hire_date);

    res.send('인증정보 받음')

    try {
        pool.query(sql, (err, result) => {
            if (result) {
                console.log('인증성공');
            } else {
                console.log('인증실패');
                console.log(err);
            }
        })
    } catch (error) {
        console.log('오류 : ');
        console.log(error);
    }

});



app.listen(3000, () => {
    console.log('3000번 포트 사용');
});   // 3000번 포트 사용



