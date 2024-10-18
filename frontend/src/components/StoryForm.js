import React, { useState } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';

function StoryForm() {
  const [mainCharacter, setMainCharacter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');

  const { getToken } = useAuth();
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken()
    try {
      const response = await axios.post("http://127.0.0.1:5000/story", {
        user_name: user.fullName,
        main_character: mainCharacter,
        title: title,
        content: content,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
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
