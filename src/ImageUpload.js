import { Button, Input } from '@material-ui/core'
import React, { useState } from 'react'
import { db, storage } from './firebase'
import "./ImageUpload.css"
import firebase from 'firebase';

function ImageUpload({username}) {

  const [caption, setCaption] = useState("")
  const [image, setImage] = useState(null)
  const [progress, setProgress] = useState("")


  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        alert(error.message);
      },
      () => {
        storage.ref("images").child(image.name).getDownloadURL().then(url => {
          db.collection("posts").add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            caption: caption,
            imageUrl: url,
            username: username,
          });

          setProgress(0);
          setCaption("");
          setImage("");
        })
      }
    )
  }

  return (
    <div className="imageUpload">
      <progress className="imageUpload__progress" value={progress} max="100" />
      <Input type="text" placeholder="Enter the caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
      <Input type="file" onChange={handleChange} />
      <Button disabled={!caption || !image} onClick={handleUpload}>Upload</Button>
    </div>
  )
}

export default ImageUpload
