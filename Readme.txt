# flutter pub get
# npm init
# npm install express --save
# npm install nodemon --save
# npm install pg



<pubspec.yaml>

dependencies:
  flutter:
    sdk: flutter
    (web_socket_channel: ^2.1.0)
  (postgres: ^2.3.0)

























-----------------------------------------------
MyApp 클래스는 앱의 기본 위젯입니다. MaterialApp을 생성하여 앱의 기본 구성을 정의합니다.
MyHomePage 클래스는 StatefulWidget으로, 홈 페이지를 나타냅니다. _MyHomePageState 클래스는 해당 상태를 관리합니다.
_MyHomePageState 클래스에서는 fetchData()라는 비동기 함수를 정의합니다. 이 함수는 PostgreSQL 데이터베이스와 연결을 설정하고, 쿼리를 실행하여 결과를 가져오는 역할을 합니다.
build() 메서드에서는 Scaffold 위젯을 반환하여 앱의 기본 레이아웃을 생성합니다. AppBar를 추가하고, ElevatedButton을 추가하여 데이터를 가져오는 버튼을 생성합니다.
버튼을 누를 때 fetchData() 함수가 실행되며, 결과가 콘솔에 출력됩니다.