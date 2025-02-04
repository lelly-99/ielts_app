export default function response_service(db) {
    // Insert a new response
    const insert_response = async (session_id, section, original_text, transcribed_text) => {
      return await db.one(
        'INSERT INTO responses (session_id, section, original_text, transcribed_text) VALUES ($1, $2, $3, $4) RETURNING *',
        [session_id, section, original_text, transcribed_text]
      );
    };
  
    // Get responses for a session
    const get_session_responses = async (session_id) => {
      return await db.any(
        'SELECT * FROM responses WHERE session_id = $1 ORDER BY created_at',
        [session_id]
      );
    };
  
    return {
      insert_response,
      get_session_responses
    };
  }