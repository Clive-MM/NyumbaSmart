import cloudinary.uploader


def upload_to_cloudinary(file, folder="nyumbasmart_uploads"):
    try:
        result = cloudinary.uploader.upload(file, folder=folder)
        return {"url": result.get("secure_url"), "public_id": result.get("public_id")}
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
