import { Pool } from 'pg';

// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'ksomang', 
  host: 'localhost',
  database: 'sprint_mission3',
  password: '1810',
  port: 5432,               
});

/* const pool = new Pool({
  user: 'sprint_mission3_nvsd_user', 
  host: 'dpg-d1cf6vgdl3ps73fj8glg-a',
  database: 'sprint_mission3_nvsd',
  password: '8ZusvsSToJ3kMwSYbyqji41xDUfRBVuG',
  port: 5432,               
}); */

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