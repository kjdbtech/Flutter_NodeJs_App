import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'dart:math';


import 'package:ex0705_psql/db.dart';
import 'package:flutter/material.dart';
import 'package:postgres/postgres.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:http/http.dart' as http; // http로 별칭을 주는 이유는 post()가 아닌 http.post()로 명시하기 위해
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_web_auth/flutter_web_auth.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return MaterialApp(
      title: '플러터 + PostgreSQL',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
    _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  WebViewController? _webViewController;
  String? _token;
  late final String jwt;
  num _stackToView = 1;



 @override
  void initState() {
    super.initState();
    setState(() {
      _stackToView = 0;
    });
    //Token();     // 토큰 상태관리
  }


 void getTokenFromServer() async {
   final url = Uri.parse('http://your-nodejs-server/get-token');

   final response = await http.get(url);

   if (response.statusCode == 200) {
     final token = response.body;
     _token = token;

   } else {
     print('response 오류');
   }
 }


  // 비동기로 데이터 가져오기
  Future<void> fetchData() async {
    // PostgreSQL 연결
    final conn = await DatabaseProvider.getConnection();

    // 쿼리 실행, 결과 가져오기
    final res = await conn.query('select * from emp');

    // 결과 출력
    for (final row in res){
      print(row.toString());
    }

    // 연결 종료
    await conn.close();
  }



  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Scaffold(      // Scaffold : 페이지의 기본적인 디자인 뼈대를 제공해주는 위젯
      appBar: AppBar(title: Text('Flutter + nodeJs + PostgreSQL'),),   // 앱 상단의 바
      body: SafeArea(
        child: WebView(
          initialUrl: 'http://192.168.20.145:3000/',      // 접속할 웹
          javascriptMode: JavascriptMode.unrestricted,    // javascriptMode: JavaScript 코드 실행을 허용하는 모드
          onWebViewCreated:  (WebViewController webViewController){
            _webViewController = webViewController;
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final cookies = await _webViewController?.runJavascriptReturningResult('document.cookie',);
          print(cookies);
        },
        child: const Icon(Icons.web_outlined),
      )
    );
  }
}