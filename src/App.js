import './App.css';
import { useState, useEffect,cloneElement } from 'react';
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
  where,
  getDoc,
} from "firebase/firestore";
import PostList from "./components/PostList";
import Overlay from "./components/Overlay";
import NavBar from "./components/NavBar";
import {auth} from "./firebase-config";
import {onAuthStateChanged} from "firebase/auth";

function App() {

  const [user, setUser] = useState("");

 // const [userColor, setUserColor] = useState([]);

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
  const [newTime, setNewTime] = useState("new");
  const [newColor, setNewColor] = useState('');
  //const [newGenre, setNewGenre] = useState("");

  const [editId, setEditId] = useState(0);

  const [currentRadioValue, setCurrentValue] = useState('new');

  const colorIndex = [
    { id: 'MEGSNWeLIbXI2RG2ji7vf4pGGzo2', color: '#333943', name: 'Mark'},
    { id: 'amdnNVoCnFg21MZtQbWvikH9Q0r2', color: '#334341', name: 'Thibaut'},
    { id: 'bug3wGxTNKMeVrgiF58hcz9vZBn1', color: '#334336', name: 'Gael'},
    { id: '26VXYlcNZ0PR2TroSTj4kpcsEZc2', color: '#1a1a00', name: 'Fausto'},
    { id: 'JuTO8hC1k1X4F4G9FRN4YM44XDd2', color: '#660033', name: 'Mila'},
  ];

  const [colIndexes, setcolIndexes] = useState(colorIndex);

  const [movies, setMovies] = useState([]);
  const moviesColectionRef = collection(db, "movies");

  //const usersCollection = collection(db, "users");
  
  //Overlay form boolean
  const [isOpen, setIsOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  //Get all the list to render
  const getMovies = async() => {
    const data = await getDocs(query(moviesColectionRef, orderBy("title")));
      setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  }

  /*
  const getUserColor = async() => {
    const data = await getDocs(query(usersCollection));
    setUserColor(data.docs.map((doc)=>({...doc.data(), id: doc.id})));

    //console.log("user ID = "+userColor[0].id+"users color data "+ userColor[0].color);
    //const movuDoc = doc(db, "users", 0);
  }
  */
  const  Getdata = () =>{
    if(user!==null){
      colIndexes.map(item => {
        if (item.id === user.uid) {
          setNewColor(item.color);
          setNewPoster(item.name);
         // console.log("color = "+newColor+', poster = '+newPoster+', time = '+newTime);
          //console.log('user color = '+item.color+', name = '+item.name);
          return;
        } else {
          return;
        }
      })
    }else{
      return;
    }
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
 
    /*
    if(!user){
    const userId = user.uid
    const userInUser = doc(db, "users", userId);
   const color=userInUser.color;
   console.log('color = '+color);
    }
    */
    await addDoc(moviesColectionRef, {title: titleWork, description: newDescr, rating: Number(1), poster: newPoster, uid: user.uid, color:newColor, time:newTime})
    getMovies();
    setIsOpen(!isOpen);
        //reset fields
        setNewTitle("");
        setNewDescr("");
        setNewTime('new');
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
    const newFields = {title: newTitle, description: newDescr, time:newTime};
    await updateDoc(movieDoc, newFields);

    //reset fields
    setNewTitle("");
    setNewDescr("");
    setNewTime('new');
    //setNewRating(0);
    //setNewPoster("");
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
   const newtim = data.time;
   //const newRat = data.rating;
   //const newPost = data.poster;

    setNewTitle(newTi);
    setNewDescr(newDesc);
    setNewTime(newtim);
    //setNewRating(newRat);
    //setNewPoster(newPost);
  return;
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
   // console.log('clicked alphabet');
    const data = await getDocs(query(moviesColectionRef, orderBy("title")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuTwo = async () => {
   // console.log('clicked rating');
    const data = await getDocs(query(moviesColectionRef, orderBy("rating", "desc")));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuThree = async () => {
    //console.log('clicked new');
    const data = await getDocs(query(moviesColectionRef,where("time",'==','new')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuFour = async () => {
   // console.log('clicked recent');
    const data = await getDocs(query(moviesColectionRef,where("time",'==','recent')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const handleMenuFive = async () => {
    //console.log('clicked classic');
    const data = await getDocs(query(moviesColectionRef,where("time",'==','classic')));
    setMovies(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
  };

  const onOptionChange = e => {
    setNewTime(e.target.value);
//console.log('change time '+newTime);
  }

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

  return (
    <div className="App">
      <div className="container">
      <NavBar/>
      <div className='navBarUnder'></div>
      <div className="topButton">
      <button id="topButElem1" disabled = {user===null} className="showButton" onClick={toggleOverlay}>{user===null?"MUST BE LOGGED IN TO POST":"ADD NEW ENTRY"}</button>
      <div id="topButElem2">
      <a className="discord" title='discord link' href="https://discord.com/channels/1112292195207217233/1112292196943663158">Discord server</a>
      </div>
      <Dropdown
      trigger={<button>ORDER BY</button>}
      menu={[
        <button onClick={handleMenuOne}>Alphabetical</button>,
        <button onClick={handleMenuTwo}>Rating</button>,
        <button onClick={handleMenuThree}>New</button>,
        <button onClick={handleMenuFour}>Recent</button>,
        <button onClick={handleMenuFive}>Classic</button>,
      ]}
      />
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
