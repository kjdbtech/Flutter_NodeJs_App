import 'package:postgres/postgres.dart';

class DatabaseProvider {
  static Future<PostgreSQLConnection> getConnection() async {
    final connection = PostgreSQLConnection(
      '192.168.30.8',
       5432, // PostgreSQL 포트 번호
      'data',
      username: 'dbtech',
      password: 'dbtechpwd',
    );
    await connection.open();
    return connection;
  }
}
