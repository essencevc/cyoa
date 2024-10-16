import React, { useState } from 'react';
import axios from 'axios';

function StoryForm() {
  const [mainCharacter, setMainCharacter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/generate_story', {
        main_character: mainCharacter,
        title: title,
        content: content,
      });
      setGeneratedStory(response.data.generated_story);
    } catch (error) {
      console.error('Error generating story:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={mainCharacter}
          onChange={(e) => setMainCharacter(e.target.value)}
          placeholder="Main Character"
          required
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <button type="submit">Generate Story</button>
      </form>
      {generatedStory && (
        <div>
          <h2>Generated Story:</h2>
          <p>{generatedStory}</p>
        </div>
      )}
    </div>
  );
}

export default StoryForm;
