import React, { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

const Names = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Emily Davis",
  "Chris Brown",
  "Jessica Wilson",
  "David Miller",
  "Sarah Taylor",
  "James Anderson",
];

const Titles = [
  "A Day in the Life of a Cat",
  "The Great Cookie Caper",
  "Murder at the Coffee Shop",
  "The Misadventures of a Clumsy Detective",
  "Life's Little Surprises",
  "The Mystery of the Missing Sandwich",
  "A Slice of Life in the Big City",
  "The Hilarious Heist",
  "The Secret Diary of a High School Student",
];

const Settings = [
  "In a world where vibrant cultures blend and traditions thrive",
  "Sometimes we don't realize the ancient spirits guiding us towards harmony",
  "It all started with a futuristic society where every voice is valued and equality reigns",
  "In a realm where nature and technology exist in perfect harmony",
  "Once upon a time in a land where stories of resilience and hope inspired generations",
  "In a universe where diverse beings unite to protect their shared home",
];

const StoryForm = () => {
  const [mainCharacter, setMainCharacter] = useState(
    Names[Math.floor(Math.random() * Names.length)]
  );
  const [title, setTitle] = useState(
    Titles[Math.floor(Math.random() * Titles.length)]
  );
  const [content, setContent] = useState(
    Settings[Math.floor(Math.random() * Settings.length)]
  );

  return (
    <div>
      <div className="grid w-full gap-">
        <div className="grid gap-2 grid-cols-2">
          <div>
            <Label className="text-sm font-medium pl-1 mb-2">
              Title Of Story
            </Label>
            <Input
              type="text"
              placeholder="Title Of Story"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium pl-1 mb-2">
              Main Character Name
            </Label>
            <Input
              type="text"
              placeholder="Main Character Name"
              value={mainCharacter}
              onChange={(e) => setMainCharacter(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium pl-1 mb-2">Story Setting</Label>
          <Textarea
            placeholder="Story Setting"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <Button className="mt-4 py-4">Generate Story</Button>
      </div>
    </div>
  );
};

export default StoryForm;

// function StoryForm() {
//   const [mainCharacter, setMainCharacter] = useState('');
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [generatedStory, setGeneratedStory] = useState('');

//   const { getToken } = useAuth();
//   const { user } = useUser();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = await getToken()
//     try {
//       const response = await axios.post("http://127.0.0.1:5000/story", {
//         user_name: user.fullName,
//         main_character: mainCharacter,
//         title: title,
//         content: content,
//       }, {
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//     } catch (error) {
//       console.error('Error generating story:', error);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={mainCharacter}
//           onChange={(e) => setMainCharacter(e.target.value)}
//           placeholder="Main Character"
//           required
//         />
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Title"
//           required
//         />
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder="Content"
//           required
//         />
//         <button type="submit">Generate Story</button>
//       </form>
//       {generatedStory && (
//         <div>
//           <h2>Generated Story:</h2>
//           <p>{generatedStory}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StoryForm;
