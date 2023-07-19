var express = require ('express');      // express모듈을 'express' 이름으로 호출
var app = express();    //express를 실행시키고 기능들을 'app' 별칭으로 사용 가능
var {Pool, Query} = require('pg');
var bodyParser = require('body-parser');
var jwt = require("jsonwebtoken");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http');
var ejs = require('ejs');
const crypto = require('crypto');
const { isNull } = require('util');
require('dotenv').config();



// var PgSession = require('connect-pg-simple')(session);

// DB연결
const pool = new Pool({
    user: 'dbtech',
    host: '192.168.30.8',
    database: 'data',
    password: 'dbtechpwd',
    port: 5432,

});


// pg session 저장소 연결 
// const pgSession = new PgSession({
//     conString: 'postgres://dbtech:dbtechpwd@192.168.30.8/data',
// });
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: 'dbtech',           // 비밀키 
    resave: false,              // 세션에 변경이 있을 때만 세션을 저장
    saveUninitialized: true,    // 초기화되지 않은 세션도 저장소에 저장할건지
    // store: pgSession            // express 세션 미들웨어가 세션 데이터를 postgreSQL 저장소에 저장하도록 설정
}));

app.set('view engine', 'ejs')
app.use(express.json());    // json 요청 허용

// jwt.sign 함수를 이용해 토큰 발행
const tokenCreate = async (payload, empno)  => {          // payload : 토큰에 담을 정보를 JSON 형태로 포함
    return await jwt.sign(payload,  process.env.SECRET_KEY, {           // secretKey : 비밀키
        subject: 'testToken',     // subject(토큰제목)
        expiresIn: '60m',        // expiresIn(만료시간)
        issuer: empno           // issuer(발급자)
    });
};

// jwt 토큰 검증
const verifyToken = async (token, empno) => {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);        // (토큰, 비밀키)
    try {
        console.log('검증하기 위한 토큰 출력 : ', decoded);
        if (decoded.memberToken.empno === empno) {
            console.log("토큰 인증 성공");
            return decoded;
        } else {
            
            throw new Error('토큰은 존재 하나 회원번호랑 매칭이 안되어 인증 실패');
        }
    } catch (error) {
        console.log('토큰 검증 실패');
        console.log(error);
        return null;
    }
}
const reVerifyToken = async (token) => {
    if (!token) {
        return null;
    }

    try {
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);        // (토큰, 비밀키)
        console.log('재검증하기 위한 토큰 출력 : ', decoded);
        if (decoded.memberToken.empno) {
            console.log("토큰 재인증 성공");
            return decoded;
        } else {
            throw new Error('토큰 재인증이 안되어 인증 실패');
        }
    } catch (error) {
        console.log('토큰 검증 실패');
        console.log(error);
        return null;
    }
};

// 회원번호 검증
const isValidMember = (memberNum) => {
    const sql = `select * from emp where empno = ${memberNum}`;
    return new Promise((resolve, rejects) => {
        pool.query(sql, (err, result) => {
            if(err){
                console.error(err);
                rejects(err);
            } else {
                if(result.rows.length > 0){
                    console.log(result.rows[0].ename + '님 께서 인증하셨습니다.');
                    console.log('회원번호 인증 성공');
                    resolve(result.rows[0]);
                } else {
                    console.log('회원번호 인증 실패');
                    resolve(false);
                }
            }
        })
    })
};

// 외부 css 사용
app.get('/css/main_style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/css/main_style.css');
});

app.get('/', (req, res) => {
    // 쿠키에 토큰이 있다면 home으로 redirect

    // pool.query('select * from emp', (err, result) => {
    //     console.log(result);
    //     res.render('login', result.rows[0]);
    //     console.log(result.rows[0]);
    // });

    if(req.session.token){
        res.redirect('http://192.168.20.145:3000/home');
    }else{
        pool.query('select * from emp', (err, result) => {
            console.log(result);
            res.render('login', result.rows[0]);
            console.log(result.rows[0]);
        })
    }
    console.log('시크릿 키 : ', process.env.SECRET_KEY);
});

// 인증정보 확인하기
app.post('/auth_submit', async (req, res) => {
    const name = req.body.name;
    const empno = (req.body.empno);
    const deptno = parseInt(req.body.deptno);
    const hire_date = (req.body.year) + '-'
                        + (req.body.month) + '-'
                        + (req.body.day);
    
    console.log('이름 : ' + name);
    console.log('직원번호 : ' + empno);
    console.log('부서번호 : ' + deptno);
    console.log('입사날짜 : ' + hire_date);
    console.log('토큰 확인 : ', req.session.token);

    try {
        const authenticationEmpno = await isValidMember(empno);     // 회원번호 인증 함수 실행
        
        console.log('authenticationEmpno : ',authenticationEmpno );

        if (authenticationEmpno && req.cookies.jwt != null) {
            // 회원번호 인증 완료 시 
            console.log('auth_empno = ', authenticationEmpno.empno);
            var decoded = verifyToken(req.session.token, authenticationEmpno.empno);
            
            if(decoded){
                // 회원번호 인증 후 토큰 인증까지 완료 시 
                console.log('회원번호 인증 후 토큰 인증 절차 결과 : ', decoded);
                
                const memberInfo =  {
                    ename : authenticationEmpno.ename,
                    empno : authenticationEmpno.empno,
                    deptno : authenticationEmpno.deptno,
                    hire_date : authenticationEmpno.hiredate,      
                    token : req.session.token,
                };

                res.render('home',{memberInfo});
            }
        } else {
            // 회원번호 인증 완료 후 토큰 없을 시 토큰 발급
            var payload = {
                memberToken: authenticationEmpno
            };
            const token = await tokenCreate(payload, empno);
            console.log('회원정보 인증 후 신규토큰 발행 : ', token);

            // 쿠키에 토큰 번호 저장
            // res.cookie('jwt', token,{
            //     //domain: '192.168.20.145:3000',
            //     httpOnly: true,     // js를 통한 외부접근? 금지
            //     secure: false,       // https 연결에서만 전송
            //     sameSite: 'none',     // 동일 사이트에서만 전송
            //     maxAge: 1800000 // 쿠기 유효 시간, 30분
            // });

            // 세션에  토큰 저장
            req.session.token = await token;

            console.log('세션 토큰 확인 : ', req.session.token);

            const memberInfo =  {
                ename : authenticationEmpno.ename,
                empno : authenticationEmpno.empno,
                deptno : authenticationEmpno.deptno,
                hire_date : authenticationEmpno.hiredate,      
                token : req.session.token,
            };

            console.log(memberInfo.ename + '님의 render memberInfo 변수 : ', memberInfo);
            res.render('home', {memberInfo});
        };
    } catch (error) {
        console.log('인증 중 오류 : ', error);
    };

    // // 쿠키에 멤버 정보 저장                
    // res.cookie('ename', result.rows[0].ename, {
    //     httpOnly: true,     // js를 통한 외부접근? 금지
    //     secure: false,       // https 연결에서만 전송
    //     sameSite: 'strict',     // 동일 사이트에서만 전송
    //     maxAge: 1800000 // 쿠기 유효 시간, 30분
    // });

    // 토큰을 http 응답 헤더에 포함하여 전송
    //res.header(`Authorization1`,`Bearer ${token}`);      // 헤더에 Authorization 필드를 추가 토큰을 Bearer 토큰 타입으로 클라이언트에게 http 헤더에 포함
    //res.json({success: true, massage: '인증성공', token});  // 인증성공 시 token 값을 포함해 전송
    //res.redirect('http://192.168.20.145:3000/auth_submit2');
    //const sendToken = req.header('Authorization1') // 헤더에서 토큰 값 추출
    //console.log('sendToken 입니다~~~~ \n ', sendToken);
    // const options = {
    //     hostname: '192.168.20.145',
    //     port: 3000,
    //     path: '/auth_submit',
    //     method: 'GET',
    //     headers: {
    //     Authorization2: 'Bearer ' , // 토큰 값 추가
    //     },
    // };
        
    // http.get(options, (response) => {
    //     console.log(`statusCode: ${response.statusCode}`);
    
    //     response.on('data', (data) => {
    //     // 응답 데이터 처리
    //     console.log('data값은 : ', data.toString());
    //     });
        
    // }).on('error', (error) => {
    //     // 오류 처리
    //     console.error(error);
    // });
            
});

// Flutter에서 보낸 헤더 가져오기
app.get('/get-token', (req, res) => {
    const sendToken = token;

    // 웹 뷰로 토큰 값 전송
    res.send(
        sendToken
    );
});


// 쿠키에 토큰이 남아 있다면 /home으로 접속
app.get('/home', async (req, res)  => {
    
    var decoded = await reVerifyToken(req.session.token);
    console.log('쿠키에 토큰값이 있어 자동로그인 : ', decoded);

    if (decoded) {
        // res.render('home', memberInfo = {
        //                         ename : decoded.memberToken.ename,
        //                         empno : decoded.memberToken.empno,
        //                         deptno : decoded.memberToken.deptno,
        //                         hire_date : decoded.memberToken.hiredate,
        //                         token : req.cookies.jwt,
        //                     });
    } else {
        res.write(`<script> alert("로그인 실패"); window.location.href='/'; </script>`);
    }
});


// jwt 토큰 발행
// app.get('/createToken', (req, res) => {

//     // jwt.sign 함수를 이용해 토큰 발행
//     var token = jwt.sign({
//         test: 'test'        // payload : 토큰에 담을 정보를 JSON 형태로 포함
//     },  'testkey'           // secretKey : 비밀키
//     , {
//         subject: 'testToken',     // subject(토큰제목)
//         expiresIn: '60m',        // expiresIn(만료시간)
//         issuer: 'LGC'           // issuer(발급자)
//     });
    
//     console.log("토큰 생성\n", token);

//     try {
//         var check = jwt.verify(token, "testkey");
//         if(check){
//             console.log("뭐가 나올까아아아아아아아아아아아아아아 \n", jwt.verify(token,"testkey"));
//             console.log("검증 \n", check.test);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })



app.listen(3000, () => {
    console.log('3000번 포트 사용');
});   // 3000번 포트 사용



