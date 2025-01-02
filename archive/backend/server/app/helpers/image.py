# async def generate_image(prompt: str, story_id: str, node_id: str):
#     # Make request to modal endpoint
#     response = requests.post(
#         restate_settings.MODAL_ENDPOINT,
#         params={"prompt": prompt},
#     )
#     response.raise_for_status()
#     image_data = response.content

#     # TODO: Move this to use R2
#     image_filename = f"{story_id}_{node_id}.jpg"
#     image_path = os.path.join(
#         os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
#         "backend",
#         "static",
#         image_filename,
#     )

#     with open(image_path, "wb") as f:
#         f.write(image_data)

#     # Set the URL for database storage
#     image_url = f"/static/{image_filename}"

#     with get_db_session() as session:
#         statement = select(StoryNode).where(StoryNode.id == node_id)
#         node = session.exec(statement).first()
#         node.image_url = image_url
#         session.add(node)
#         session.commit()
