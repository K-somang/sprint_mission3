import { Pool } from 'pg';

// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'ksomang',        // PostgreSQL 사용자 이름
  host: 'localhost',        // PostgreSQL 호스트 (예: localhost)
  database: 'sprint_mission3',// 데이터베이스 이름
  password: '1810',// 데이터베이스 비밀번호
  port: 5432,               // PostgreSQL 기본 포트
});

// 연결 테스트
pool.connect((err, client, release) => {
  if (err) {
    return console.error('데이터베이스 연결 오류:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('쿼리 실행 오류:', err.stack);
    }
    console.log('PostgreSQL 데이터베이스에 성공적으로 연결되었습니다.');
  });
});

export default pool;