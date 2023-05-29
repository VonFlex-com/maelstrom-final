import './App.css';
import { useState, useEffect } from 'react';
import {db} from './firebase-config';
import {
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import PostList from "./components/PostList";
import Overlay from "./components/Overlay";
import NavBar from "./components/NavBar";
import {auth} from "./firebase-config";
import {onAuthStateChanged} from "firebase/auth";

function App() {

  const [user, setUser] = useState("");

  const [userColor, setUserColor] = useState([]);

  useEffect(() => {
      onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
      });
  }, [])

  //console.log("User from apps "+ user);

  let warningLog = "You must be logged in to edit";

  const [newTitle, setNewTitle] = useState("");
  const [newDescr, setNewDescr] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newPoster, setNewPoster] = useState("");

  const [editId, setEditId] = useState(0);

  const [movies, setMovies] = useState([]);
  const moviesColectionRef = collection(db, "movies");

  const usersCollection = collection(db, "users");
  
  //Overlay form boolean
  const [isOpen, setIsOpen] = useState(false);

  const [isAlphabetical, setIsAlphabetical] = useState(false);
  //console.log("First Alphabetical is = "+isAlphabetical);

  const [isUpdating, setIsUpdating] = useState(false);

  //Get all the list to render
  const getMovies = async() => {
    //toggleIsAlphabetical(!isAlphabetical);
    //console.log("Alphabetical is = "+isAlphabetical);
    if(isAlphabetical){
    const data = await getDocs(query(moviesColectionRef, orderBy("title")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
    }else{
      const data = await getDocs(query(moviesColectionRef, orderBy("rating", "desc")));
      setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
    }
  }

  const getUserColor = async() => {
    const data = await getDocs(query(usersCollection));
    setUserColor(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
    console.log("users color data "+ userColor[0].color);
  }

 

  //first letter capital for Title
  function capitalize(s)
  {
      return s && s[0].toUpperCase() + s.slice(1);
  }

  useEffect(() =>{
    getMovies();
  }, [])

  //Movie creation and update
  const createMovie = async() => {
    if(isUpdating === false){
    let titleWork = capitalize(newTitle);
    await addDoc(moviesColectionRef, {title: titleWork, description: newDescr, rating: Number(newRating), poster: newPoster})
    getMovies();
    setIsOpen(!isOpen);
    }else{
      handleEdit(editId);
      setIsOpen(!isOpen);
      setIsUpdating(false);
      setEditId(0);
    }
  };

  //Delete entry
  const deleteMovie = async(id) =>{
    if(user===null){
      alert(warningLog);
      return;
    }
    const movDoc = doc(db, "movies", id);
    await deleteDoc(movDoc);
    getMovies();
  };

  //Increase by 1 rating
  const updateRating = async(id,rating) => {
    if(user===null){
      alert(warningLog);
      return;
    }
    const movieDoc = doc(db, "movies", id)
    //console.log(movieDoc.title);
    const newFields = {rating: rating+1};
    await updateDoc(movieDoc, newFields);
    getMovies();
  };
  

  //Handle fields population--------------->
  const handleEdit = async(id) => {
    //close overlay
    toggleOverlay();
    const movieDoc = doc(db, "movies", id)
    const newFields = {title: newTitle, description: newDescr, rating: Number(newRating), poster: newPoster};
    await updateDoc(movieDoc, newFields);

    //reset fields
    setNewTitle("");
    setNewDescr("");
    setNewRating(0);
    setNewPoster("");
    setIsUpdating(!isUpdating);

    getMovies();
  };

  const getMovie = async(id) => {
    if(user===null){
      alert(warningLog);
      return;
    }
    setIsUpdating(true);
    toggleOverlay();
    setEditId(id);
    const movieDoc = doc(db, "movies", id)
    const docSnap = await getDoc(movieDoc)

    const data = docSnap.exists() ? docSnap.data() : null
  
    if (data === null || data === undefined) return null

   const newTi = data.title;
   const newDesc = data.description;
   const newRat = data.rating;
   const newPost = data.poster;

    setNewTitle(newTi);
    setNewDescr(newDesc);
    setNewRating(newRat);
    setNewPoster(newPost);
return
  };

  //displqy Poster name in alert
  const handlePoster = async (poster) => {
    /*
    if(user===null){
      alert(warningLog);
      return;
    }*/
    alert("Posted by " + poster)
  };

  //toggle Overlay
  const toggleOverlay = () => {
    setIsOpen(!isOpen);
  };

  //Submit button validation emptiness 
  const IsValid = (tit) =>{
    if(!tit){
      return true;
    }
    return false;
  }

  //toggle list order
  const toggleIsAlphabetical = () =>
  {
    setIsAlphabetical(!isAlphabetical);
    //console.log("in toggle Alphabetical is = "+isAlphabetical);
    getMovies();
  }

  return (
    <div className="App">
      <div className="container">
      <NavBar/>
      <div className='navBarUnder'></div>
      <div className="topButton">
      <button id="topButElem1" disabled = {user===null} className="showButton" onClick={toggleOverlay}>{user===null?"MUST BE LOGGED IN TO POST":"ADD NEW ENTRY"}</button>
      <div id="topButElem2">
        <img />
      <a className="discord" title='discord link' href="https://discord.com/channels/1112292195207217233/1112292196943663158">Discord server</a>
      </div>
      <button id="topButElem2" className="showButton" onClick={toggleIsAlphabetical}>{isAlphabetical?"SORT ALPHABETICALY":"SORT BY RATING"}</button>
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
      <label className="textLi">RATING</label>
      <input 
        className="inputForm"
        type="number"
        placeholder="Movie rating..." 
        value = {newRating}
        onChange={(event)=>{
          event.preventDefault();
          setNewRating(event.target.value);
        }}
      />
      <label className="textLi">POSTER</label>
      <input
        className="inputForm"
        placeholder="Movie poster..."
        value = {newPoster}
        type="text"
        onChange={(event)=>{
          event.preventDefault();
          setNewPoster(event.target.value);
        }}
      />

      <div className="submitButFlex">
        <button className="buttonSubmit" 
        disabled = {IsValid(newTitle)}
        onClick={createMovie}>{isUpdating?"UPDATE":"CREATE"}</button>  
      </div>
    </div>
        </Overlay>

      <PostList
        movies={movies}
        getMovie={getMovie}
        deleteMovie={deleteMovie}
        handlePoster={handlePoster}
        updateRating={updateRating}
      />
    </div>
    </div>
  );
}

export default App;
