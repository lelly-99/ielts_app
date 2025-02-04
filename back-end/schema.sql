CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_sessions (
    session_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    test_type VARCHAR(20) CHECK (test_type IN ('Practice', 'Full Test')),
    overall_score DECIMAL(3,1),
    fluency_score DECIMAL(3,1),
    vocabulary_score DECIMAL(3,1),
    grammar_score DECIMAL(3,1),
    pronunciation_score DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mistakes (
    mistake_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    session_id INTEGER REFERENCES test_sessions(session_id),
    mistake_type VARCHAR(20) CHECK (mistake_type IN ('Grammar', 'Vocabulary', 'Pronunciation')),
    original_sentence TEXT,
    corrected_sentence TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responses (
    response_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES test_sessions(session_id),
    section VARCHAR(50),
    original_text TEXT,
    transcribed_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);