export function getIsFeedbackNeededPrompt(question, response) {
    return `Below is a candidate's response in an informal IELTS Speaking test:
  Question: ${question}
  Response: ${response}
  
  A candidate is said to have 'passed' a question if they provided an answer to it. The answer does not need to be direct or detailed. However, if their response was off-topic or they asked the examiner something instead, they have not passed.
  
  Given this information, did the candidate pass this question? Respond with 'yes' or 'no' only.`;
  }
  
  export function getSpeakingCorrectionsPrompt(question, answer) {
    return `You are an IELTS Speaking examiner who has been tasked with correcting a candidate's answer. Here's their response:
  Question: ${question}
  Answer: ${answer}
  
  Rewrite the response with all language mistakes corrected. You should only modify what's wrong and leave the rest unchanged. Note that this is an informal speaking test, so informal expressions are perfectly acceptable and should be left as-is. Do not output anything else besides the corrected version.`;
  }
  
  export function getSpeakingSuggestionsPrompt(question, answer) {
    return `You are an IELTS Speaking examiner who has been tasked with helping a candidate expand their answer. Here's their response:
  Question: ${question}
  Answer: ${answer}
  
  Now, provide 3 ideas to extend it. Each idea should have a title and an example sentence. Because this is an informal speaking exam, ensure the ideas are simple, concrete, and demonstrated using conversational language. Format your output exactly as follows:
  1. **<idea1_title>**
      - <idea1_example_sentence>
  2. **<idea2_title>**
      - <idea2_example_sentence>
  3. **<idea3_title>**
      - <idea3_example_sentence>`;
  }
  
  export function getSpeakingImprovedPrompt(question, answer) {
    return `You are an IELTS examiner who has been tasked with helping a candidate improve the language used in their answer. Here's their response:
  Question: ${question}
  Answer: ${answer}
  
  Write an improved version of the response that uses more refined language. Maintain a conversational tone throughout. You may sprinkle in creative and humourous expressions (e.g. quotes, idioms, metaphors, etc.) to make it more engaging. However, refrain from incorporating too many advanced lexical features. Then, define all the new vocabulary and phrases that are not in the original. Only short definitions are required.
  
  Format your output as follows (without <> tags):
  <improved_version>
  ### Vocabulary and phrases:
  * **<item1>**: <brief_definition1>
  * **<item2>**: <brief_definition2>
  ...`;
  }