import React, { useEffect, useState } from 'react';
import './App.css';
import Post from './Post';
import { db, auth } from './firebase';
import { Button, Input, makeStyles, Modal } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import InstagramEmbed from 'react-instagram-embed';


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 2),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);

      } else {
        setUser(null);
      }
    })

    return () => {
      unsubscribe();
    }
  }, [user, username])

  useEffect(() => {
    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, post: doc.data()})))
    })
  }, [])

  const signUp = (e) => {
    e.preventDefault();

    auth.createUserWithEmailAndPassword(email, password).then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username,
      })
    }).catch((error) => alert(error.message))
    setOpen(false);
  }

  const signIn = (e) => {
    e.preventDefault();

    auth.signInWithEmailAndPassword(email, password).catch((error) => alert(error.message))
    setOpenSignIn(false);
  }

  return (
    <div className="app">

    <Modal open={open} onClose={() => setOpen(false)}>
      <div style={modalStyle} className={classes.paper}>
        <form className="app__signup">
          <center>
            <img className="app__headerImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/150px-Instagram_logo.svg.png" alt=""/>
          </center>
          <Input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="text" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" onClick={signUp}>sign up</Button>
        </form>
      </div>
    </Modal>

    <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
      <div style={modalStyle} className={classes.paper}>
        <form className="app__signup">
          <center>
            <img className="app__headerImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/150px-Instagram_logo.svg.png" alt=""/>
          </center>
          <Input type="text" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" onClick={signIn}>Sign In</Button>
        </form>
      </div>
    </Modal>



      <div className="app__header">
        <img className="app__headerImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/150px-Instagram_logo.svg.png" alt=""/>
        {
          user ? (
            <Button onClick={() => auth.signOut()}>Logout</Button>
          ) : (
            <div className="loginContainer">
              <Button onClick={(e) => setOpenSignIn(true)}>Sign In</Button>
              <Button onClick={(e) => setOpen(true)}>Sign Up</Button>
            </div>
          )
        }
      </div>

      <div className="app__posts">

        <div className="app__postsLeft">
          {
            posts.map(({ id, post}) => (
              <Post key={ id } postId={ id } user={user} username={post.username} caption={post.caption} imageUrl={post.imageUrl} />
            ))
          }
        </div>

        <div className="app__postsRight">
          <InstagramEmbed
            url='https://instagr.am/p/CF2iwCfsSVI/'
            maxWidth={320}
            hideCaption={false}
            containerTagName='div'
            protocol=''
            injectScript
            onLoading={() => {}}
            onSuccess={() => {}}
            onAfterRender={() => {}}
            onFailure={() => {}}
          />
        </div>

      </div>


      <div className="app__imageUpload">
        {user?.displayName ? (
          <ImageUpload username={user.displayName} /> 
        ) : (
          <h3>Sorry you need to login to upload</h3>
        )}
      </div>

    </div>
  );
}

export default App;
