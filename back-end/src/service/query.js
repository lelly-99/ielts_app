const user_service = (db) => {

  const insert_student = async (name, email) => {
    return await db.one(
      'INSERT INTO students (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
  };

  const get_student_by_email = async (email) => {
    return await db.oneOrNone(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );
  };

  const get_student_by_id = async (student_id) => {
    return await db.oneOrNone(
      'SELECT * FROM students WHERE student_id = $1',
      [student_id]
    );
  };

  const get_all_students = async () => {
    return await db.any('SELECT * FROM students');
  };

  // Test Sessions Queries
  const create_test_session = async (student_id, test_type, scores) => {
    return await db.one(
      `INSERT INTO test_sessions 
      (student_id, test_type, overall_score, fluency_score, vocabulary_score, grammar_score, pronunciation_score) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        student_id, 
        test_type, 
        scores.overall, 
        scores.fluency, 
        scores.vocabulary, 
        scores.grammar, 
        scores.pronunciation
      ]
    );
  };

  const get_student_test_sessions = async (student_id) => {
    return await db.any(
      'SELECT * FROM test_sessions WHERE student_id = $1 ORDER BY created_at DESC',
      [student_id]
    );
  };

  const get_test_session_by_id = async (session_id) => {
    return await db.oneOrNone(
      'SELECT * FROM test_sessions WHERE session_id = $1',
      [session_id]
    );
  };

  const update_test_session_scores = async (session_id, scores) => {
    return await db.one(
      `UPDATE test_sessions 
      SET 
        overall_score = $2, 
        fluency_score = $3, 
        vocabulary_score = $4, 
        grammar_score = $5, 
        pronunciation_score = $6 
      WHERE session_id = $1 
      RETURNING *`,
      [
        session_id,
        scores.overall,
        scores.fluency,
        scores.vocabulary,
        scores.grammar,
        scores.pronunciation
      ]
    );
  };

  // Responses Queries
  const insert_response = async (session_id, section, original_text, transcribed_text) => {
    return await db.one(
      'INSERT INTO responses (session_id, section, original_text, transcribed_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [session_id, section, original_text, transcribed_text]
    );
  };

  const get_responses_by_session = async (session_id) => {
    return await db.any(
      'SELECT * FROM responses WHERE session_id = $1 ORDER BY created_at',
      [session_id]
    );
  };

  const get_response_by_id = async (response_id) => {
    return await db.oneOrNone(
      'SELECT * FROM responses WHERE response_id = $1',
      [response_id]
    );
  };

  // Mistakes Queries
  const insert_mistake = async (student_id, session_id, mistake_type, original_sentence, corrected_sentence) => {
    return await db.one(
      'INSERT INTO mistakes (student_id, session_id, mistake_type, original_sentence, corrected_sentence) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_id, session_id, mistake_type, original_sentence, corrected_sentence]
    );
  };

  const get_session_mistakes = async (session_id) => {
    return await db.any(
      'SELECT * FROM mistakes WHERE session_id = $1',
      [session_id]
    );
  };

  const get_student_mistakes = async (student_id) => {
    return await db.any(
      'SELECT * FROM mistakes WHERE student_id = $1 ORDER BY created_at DESC',
      [student_id]
    );
  };

  // Comprehensive Report Queries
// In your query.js or wherever the comprehensive report query is located
const get_student_comprehensive_report = async (student_id) => {
    return await db.any(
      `SELECT 
        ts.session_id,
        ts.test_type,
        ts.overall_score,
        ts.fluency_score,
        ts.vocabulary_score,
        ts.grammar_score,
        ts.pronunciation_score,
        ts.created_at as session_date,
        (SELECT COUNT(*) 
         FROM mistakes m 
         WHERE m.student_id = $1) as total_mistakes
      FROM test_sessions ts
      WHERE ts.student_id = $1
      ORDER BY ts.created_at DESC`,
      [student_id]
    );
  };

  async function get_latest_practice_session(student_id) {
    try {
      const sessions = await db.oneOrNone(
        `SELECT * FROM test_sessions 
         WHERE student_id = $1 AND test_type = 'Practice' 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [student_id]
      );
      return sessions;
    } catch (error) {
      console.error('Error getting latest practice session:', error);
      throw error;
    }
  }

  async function create_or_update_test_session(student_id, test_type, scores) {
    try {
      // First, check if an existing test session exists
      const existingSession = await db.oneOrNone(
        `SELECT * FROM test_sessions 
         WHERE student_id = $1 AND test_type = $2 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [student_id, test_type]
      );

      if (existingSession) {
        // Update existing session
        return await db.one(
          `UPDATE test_sessions 
           SET 
             overall_score = $3, 
             fluency_score = $4, 
             vocabulary_score = $5, 
             grammar_score = $6, 
             pronunciation_score = $7
           WHERE session_id = $1 AND student_id = $2
           RETURNING *`,
          [
            existingSession.session_id,
            student_id,
            scores.overall || existingSession.overall_score, 
            scores.fluency || existingSession.fluency_score, 
            scores.vocabulary || existingSession.vocabulary_score, 
            scores.grammar || existingSession.grammar_score, 
            scores.pronunciation || existingSession.pronunciation_score
          ]
        );
      } else {
        // Create new session
        return await db.one(
          `INSERT INTO test_sessions 
          (student_id, test_type, overall_score, fluency_score, vocabulary_score, grammar_score, pronunciation_score) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`,
          [
            student_id, 
            test_type, 
            scores.overall || 0, 
            scores.fluency || 0, 
            scores.vocabulary || 0, 
            scores.grammar || 0, 
            scores.pronunciation || 0
          ]
        );
      }
    } catch (error) {
      console.error('Error creating/updating test session:', error);
      throw error;
    }
  }

  return {
    // Users
    insert_student,
    get_student_by_email,
    get_student_by_id,
    get_all_students,

    // Test Sessions
    create_test_session,
    get_student_test_sessions,
    get_test_session_by_id,
    update_test_session_scores,
    get_latest_practice_session,
    create_or_update_test_session,

    // Responses
    insert_response,
    get_responses_by_session,
    get_response_by_id,

    // Mistakes
    insert_mistake,
    get_session_mistakes,
    get_student_mistakes,

    // Reports
    get_student_comprehensive_report
  };
};

export default user_service;