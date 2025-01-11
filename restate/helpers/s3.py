import boto3
from botocore.exceptions import ClientError
from helpers.env import Env


def get_story_images(story_id: str) -> list[str]:
    """
    Get list of image filenames for a given story ID from S3 bucket

    Args:
        story_id: UUID of the story

    Returns:
        List of image filenames (without .png extension)
    """
    try:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=Env().AWS_ACCESS_KEY_ID,
            aws_secret_access_key=Env().AWS_SECRET_ACCESS_KEY,
            region_name=Env().AWS_REGION,
        )

        response = s3.list_objects_v2(Bucket="restate-story", Prefix=f"{story_id}/")

        if "Contents" not in response:
            return []

        return [
            obj["Key"].replace(f"{story_id}/", "").replace(".png", "")
            for obj in response["Contents"]
        ]

    except ClientError as e:
        print(f"Error accessing S3: {e}")
        return []
