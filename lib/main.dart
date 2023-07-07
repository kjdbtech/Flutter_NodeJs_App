import 'package:ex0705_psql/db.dart';
import 'package:flutter/material.dart';
import 'package:postgres/postgres.dart';
import 'package:webview_flutter/webview_flutter.dart';
// import 'package:sky_engine/_http/http.dart' as http; // http로 별칭을 주는 이유는 post()가 아닌 http.post()로 명시하기 위해

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
      appBar: AppBar(title: Text('flutter + nodeJs + postgreSQL'),),   // 앱 상단의 바
      body: SafeArea(
        child: WebView(
          initialUrl: 'http://192.168.20.145:3000/',
          javascriptMode: JavascriptMode.unrestricted,
        )
      )
    );
  }
}