import './App.css';
import { useState, useEffect,cloneElement } from 'react';
import {db} from './firebase-config';
import colorIndex  from './uData';
import {
  collection,
  getDocs, 
  addDoc,
  setDoc,
  updateDoc, 
  doc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import PostList from "./components/PostList";
import Overlay from "./components/Overlay";
import NavBar from "./components/NavBar";
import CommentsList from "./components/CommentsList";
import {auth} from "./firebase-config";
import {onAuthStateChanged} from "firebase/auth";
import ReactGa from 'react-ga';

function App() {

  const [user, setUser] = useState("");

  useEffect(() => {
      onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
      });
      getMovies();
      ReactGa.initialize('G-FPY7T6ZVNC');
      ReactGa.pageview('/');
  }, [])

  let warningLog = "You must be logged in to edit";

  const [newTitle, setNewTitle] = useState("");
  const [newDescr, setNewDescr] = useState("");
  const [newPoster, setNewPoster] = useState("");
  const [newTime, setNewTime] = useState("new");
  const [newColor, setNewColor] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [editId, setEditId] = useState(0);

  const [colIndexes, setcolIndexes] = useState(colorIndex);

  const [movies, setMovies] = useState([]);
  const moviesColectionRef = collection(db, "movies");
  
  //Overlay form boolean
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const  Getdata = () =>{
    if(user!==null){
      colIndexes.map(item => {
        if (item.id === user.uid) {
          setNewColor(item.color);
          setNewPoster(item.name);
          return;
        } else {
          return;
        }
      })
    }else{
      return;
    }
  }

  //Get all the list to render
  const getMovies = async() => {
    const data = await getDocs(query(moviesColectionRef, orderBy("createdAt", "desc")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  }

  //first letter capital for Title
  function capitalize(s)
  {
      return s && s[0].toUpperCase() + s.slice(1);
  }

  //Movie creation and update
  const createMovie = async() => {
    if(isUpdating === false){
    let titleWork = capitalize(newTitle).trim();
 
    if(user===null){
      alert(warningLog);
      return;
    }
    await addDoc(moviesColectionRef, {title: titleWork, description: newDescr, rating: Number(0), poster: newPoster, uid: user.uid, color:newColor, time:newTime, createdAt:serverTimestamp(), imgUrl: newImgUrl,link:newLinkUrl, com:0})

    getMovies();
    setIsOpen(!isOpen);
        //reset fields
        setNewTitle("");
        setNewDescr("");
        setNewImgUrl("");
        setNewLinkUrl("");
        setNewTime('new');
    }else{
      handleEdit(editId);
      setIsOpen(!isOpen);
      setIsUpdating(false);
      setEditId(0);
    }
  };

  //Delete entry
  const deleteMovie = async(id, uid) =>{
    if(user===null){
      alert(warningLog);
      return;
    }else if(uid !== user.uid){
      alert('Cannot delete other users post');
      return;
    }else{
    const movDoc = doc(db, "movies", id);
    await deleteDoc(movDoc);
    getMovies();
    }
  };

  //Increase by 1 rating
  const updateRating = async(id,rating) => {
    const movieDoc = doc(db, "movies", id)
    //console.log(movieDoc.title);
    const newFields = {rating: rating+1};
    await updateDoc(movieDoc, newFields);
    getMovies();
  };
  
  //updtqe rqting nez
  const updateRatingVoter = async(movieId, rating) => {
    if(user===null){
      alert(warningLog);
      return;
    }
    const userIDD = user.uid;

    const data = await getDoc(doc(db,'movies/'+movieId+'/voters',userIDD));

    if (data.exists()) {
      alert("You already voted");
    }
    else {
      updateRatingWriteVoter(movieId, userIDD, rating);
    }
  }

  const updateRatingWriteVoter =  async(movieId,userID,rating) =>{
    //writing userid in voters movie list
    const voters = doc(db, 'movies/'+movieId+'/voters', userID);
    const data = {};
    await setDoc(voters, data)
    .then(voters => {
   // console.log("updated setdoc with id = "+userID);
    })
    .catch(error => {
    console.log(error);
    })
    //------------uppdate rating
    updateRating(movieId, rating);
  }

  //Handle fields population--------------->
  const handleEdit = async(id) => {
    //close overlay
    toggleOverlay();
    const movieDoc = doc(db, "movies", id)
    const newFields = {title: newTitle, description: newDescr, time:newTime, imgUrl: newImgUrl,link:newLinkUrl};
    await updateDoc(movieDoc, newFields);

    setNewTitle("");
    setNewDescr("");
    setNewImgUrl("");
    setNewLinkUrl("");
    setNewTime('new');
    setIsUpdating(!isUpdating);

    getMovies();
  };

  const getMovie = async(id, uid) => {
    if(user===null){
      alert(warningLog);
      return;
    }else if(uid !== user.uid){
      alert('Cannot edit other users post');
      return;
    }else{
    setIsUpdating(true);
    toggleOverlay();
    setEditId(id);
    const movieDoc = doc(db, "movies", id)
    const docSnap = await getDoc(movieDoc)

    const data = docSnap.exists() ? docSnap.data() : null
  
    if (data === null || data === undefined) return null

   const newTi = data.title;
   const newDesc = data.description;
   const newtim = data.time;
   const newUrlIMG = data.imgUrl;
   const newUrlLINK = data.link;

    setNewTitle(newTi);
    setNewDescr(newDesc);
    setNewTime(newtim);
    setNewImgUrl(newUrlIMG);
    setNewLinkUrl(newUrlLINK);
  return;
    }
  };

  //displqy Poster name in alert
  const handlePoster = async (poster) => {
    alert("Posted by " + poster);
  };

  //toggle Overlay
  const toggleOverlay = () => {
    setIsOpen(!isOpen);
    setNewTitle("");
    setNewDescr("");
    setNewImgUrl("");
    setNewLinkUrl("");
    setNewTime('new');
    //console.log('open = '+isOpen);
    /*
    if(!isOpen)
    {
      console.log('open = true '+isOpen);
    }else{
      console.log('open = false '+isOpen);
    }
    */
    //>...............................?
    Getdata();
  };

  //Submit button validation emptiness 
  const IsValid = (tit) =>{
    if(!tit){
      return true;
    }
    return false;
  }

//----------->Order by options
  const handleMenuOne = async () => {
    const data = await getDocs(query(moviesColectionRef, orderBy("title")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  }; 

  const handleMenuTwo = async () => {
    const data = await getDocs(query(moviesColectionRef, orderBy("rating", "desc")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuThree = async () => {
    const data = await getDocs(query(moviesColectionRef,where("time",'==','new')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuFour = async () => {
    const data = await getDocs(query(moviesColectionRef,where("time",'==','recent')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuFive = async () => {
    const data = await getDocs(query(moviesColectionRef,where("time",'==','classic')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuSix = async () => {
    const data = await getDocs(query(moviesColectionRef,orderBy("createdAt", "desc")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const onOptionChange = e => {
    setNewTime(e.target.value);
  }

  const [comments, setComments] = useState([]);

  const [tempMovieID, setTempMovieID] = useState('');

  const [openComment, setOpenComment] = useState(false);

  const [newCommentText, setNewCommentText] = useState('');

  const getComments = async(movieId) => {
    const data = await getDocs(query(collection(db,'movies/'+movieId+'/comments')));
    setComments(
      data.docs.sort((a, b) => a.data().id > b.data().id ? 1:-1)
      .map((doc)=>({...doc.data(), id: doc.id})));
  }

  const handleComment = async(movieId) => {
    
    if(user===null){
      const movieDoc = doc(db, "movies", movieId)
      const docSnap = await getDoc(movieDoc)
  
      const data = docSnap.exists() ? docSnap.data() : null
    
      if (data === null || data === undefined) return null

      if(data.com === 0){
      //console.log("Commentaire "+data.com);
      alert("No comment yet");
      }else{
        setTempMovieID(movieId);
        handleOpenComment();
        getComments(movieId);
      }
    }else{
      setTempMovieID(movieId);
      handleOpenComment();
      getComments(movieId);
    }
  };

  const handleOpenComment = () => {
    setOpenComment(!openComment);
    if(openComment){
      setComments([]);
      getMovies();
    }
  };

  const handleLink = async(link) => {
    if(link === null || link === undefined || link.length === 0){
    alert('No link !');
    }else{
      window.open(link);
    }
  };

  const Dropdown = ({ trigger, menu }) => {
    const [open, setOpen] = useState(false);
  
    const handleOpen = () => {
      setOpen(!open);
    };
  
    return (
      <div className="dropdown">
        {cloneElement(trigger, {
          onClick: handleOpen,
        })}
        {open ? (
          <ul className="menu">
            {menu.map((menuItem, index) => (
              <li key={index} className="menu-item">
                {cloneElement(menuItem, {
                  onClick: () => {
                    menuItem.props.onClick();
                    setOpen(false);
                  },
                })}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  const addCommentNumber = async (movID, num) => {
    const movieDoc = doc(db, "movies", movID)
    const newFields = {com: num};
    await updateDoc(movieDoc, newFields);
  }

  const addNewComment = async(movieId, text) =>
  {
    const coll = collection(db,'movies/'+movieId+'/comments');
    const snapshot = await getCountFromServer(coll);

    let countC = snapshot.data().count;

    //console.log('count: ', countC);

    addCommentNumber(movieId, countC+1);

//-----------------> WRITING NEW COMMENT

      await addDoc(collection(db, 'movies/'+movieId+'/comments'), {
      id: countC,
      user: user.uid,
      text: text,
      date: serverTimestamp(),
    });

  //RESET THE FIELDS
    setNewCommentText('');
    setTempMovieID('');
    setComments([]);
  }

  return (
    <div className="App">
      <div className="container">
      <NavBar/>
      <div className='navBarUnder'></div>
      <div className="topButton">
      <button id="topButElem1" disabled = {user===null} className="showButton" onClick={toggleOverlay}>{user===null?"MUST BE LOGGED IN TO POST":"ADD NEW ENTRY"}</button>

     
      <Dropdown
      trigger={<button>ORDER BY</button>}
      menu={[
        <button onClick={handleMenuOne}>Alphabetical</button>,
        <button onClick={handleMenuTwo}>Rating</button>,
        <button onClick={handleMenuSix}>Time</button>,
        <button onClick={handleMenuThree}>New</button>,
        <button onClick={handleMenuFour}>Recent</button>,
        <button onClick={handleMenuFive}>Classic</button>,
      ]}
      />
  

      <Overlay isOpen={openComment} onClose={handleOpenComment}>
     
      <div className="comment_background">
        <ul className="comment_container">
<li className="liCommentElemButton">
        <button
          className="closeButton"
          type="button"
          onClick={handleOpenComment}
        >X</button>
   </li>
        <CommentsList comments={comments}/>
      
        {user!==null &&
        <>
        <label className="textLi">ADD A COMMENT...</label>
      <textarea
        className="inputForm"
        rows="3" 
        cols="20"
        type="text"
        value = {newCommentText}
        placeholder="Comment here..." 
        onChange={(event)=>{
          event.preventDefault();
          setNewCommentText(event.target.value);
        }}
      />
        <button
          className="showButton"
          type="button"
          onClick={() => {addNewComment(tempMovieID, newCommentText)
            handleOpenComment()}}
        >SUBMIT</button>

</>}

<li className='liCommentElemButton'>
        <button
          className="closeButton"
          type="button"
          onClick={handleOpenComment}
        >X</button>
   </li>
        </ul>
        </div>
      </Overlay>
      </div>

      
        <Overlay isOpen={isOpen} onClose={toggleOverlay}>
          <div className="todoForm">
      <label className="textLi">FILM TITLE</label>
      <input 
        className="inputForm"
        placeholder="Movie title..."
        value = {newTitle}
        type="text"
        onChange={(event)=>{
          event.preventDefault();
          setNewTitle(event.target.value);
        }}
      />
      <label className="textLi">DESCRIPTION</label>
      <textarea
        className="inputForm"
        rows="5" 
        cols="40"
        type="text"
        value = {newDescr}
        placeholder="Movie description..." 
        onChange={(event)=>{
          event.preventDefault();
          setNewDescr(event.target.value);
        }}
      />
      <label className="textLi">IMAGE URL</label>
      <textarea
        className="inputForm"
        rows="4" 
        cols="10"
        type="text"
        value = {newImgUrl}
        placeholder="Raw URL of the movie poster finishing with .jpg...Put nothing if none" 
        onChange={(event)=>{
          event.preventDefault();
          setNewImgUrl(event.target.value);
        }}
      />
      <label className="textLi">LINK URL</label>
      <textarea
        className="inputForm"
        rows="2" 
        cols="10"
        type="text"
        value = {newLinkUrl}
        placeholder="URL of movie" 
        onChange={(event)=>{
          event.preventDefault();
          setNewLinkUrl(event.target.value);
        }}
      />
      <label className="textLi">FRESHNESS</label>
      <div className="radioContainer">
        <div className="radioElem">
          <input
            name="radio-item-1"
            value="new"
            type="radio"
            checked={newTime === "new"}
            onChange={onOptionChange}
          />
          <label htmlFor="radio-item-1">NEW</label>
        </div>

        <div className="radioElem">
          <input
          className="inputRadio"
            name="radio-item-1"
            value="recent"
            type="radio"
            checked={newTime === "recent"}
            onChange={onOptionChange}
          />
          <label htmlFor="radio-item-2">RECENT</label>
        </div>
        <div className="radioElem">
          <input
            name="radio-item-1"
            value="classic"
            type="radio"
            checked={newTime === "classic"}
            onChange={onOptionChange}
          />
          <label htmlFor="radio-item-3">CLASSIC</label>
        </div>
        </div>

      <div className="submitButFlex">
        <button className="buttonSubmit" 
        disabled = {IsValid(newTitle)}
        onClick={createMovie}>{isUpdating?"UPDATE":"CREATE"}</button>  
      </div>
    </div>
        </Overlay>
      <PostList
        movies={movies}
        userCred={user!==null?user.uid:0}
        getMovie={getMovie}
        deleteMovie={deleteMovie}
        handlePoster={handlePoster}
        updateRating={updateRatingVoter}
        handleComment={handleComment}
        handleLink={handleLink}
      />
    </div>
    </div>
  );
}

export default App;
