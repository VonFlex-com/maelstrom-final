import './App.css';
import { useState, useEffect,cloneElement } from 'react';
import {db} from './firebase-config';
//import {useCollectionData} from 'react-firebase-hooks/firestore';
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
} from "firebase/firestore";
import PostList from "./components/PostList";
import Overlay from "./components/Overlay";
import NavBar from "./components/NavBar";
import {auth} from "./firebase-config";
import {onAuthStateChanged} from "firebase/auth";

const colorIndex = [
  { id: 'MEGSNWeLIbXI2RG2ji7vf4pGGzo2', color: '#333943', name: 'Mark'},
  { id: 'amdnNVoCnFg21MZtQbWvikH9Q0r2', color: '#334341', name: 'Thibaut'},
  { id: 'bug3wGxTNKMeVrgiF58hcz9vZBn1', color: '#334336', name: 'Gael'},
  { id: '26VXYlcNZ0PR2TroSTj4kpcsEZc2', color: '#1a1a00', name: 'Fausto'},
  { id: 'JuTO8hC1k1X4F4G9FRN4YM44XDd2', color: '#660033', name: 'Mila'},
];

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
  const [newRating, setNewRating] = useState(1);
  const [newPoster, setNewPoster] = useState("");
  const [newTime, setNewTime] = useState("new");
  const [newColor, setNewColor] = useState('');
  //const [newGenre, setNewGenre] = useState("");

  const [editId, setEditId] = useState(0);

  //const [currentRadioValue, setCurrentValue] = useState('new');

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
    let titleWork = capitalize(newTitle).trim();
 
    /*
    if(!user){
    const userId = user.uid
    const userInUser = doc(db, "users", userId);
   const color=userInUser.color;
   console.log('color = '+color);
    }
    */
    if(user===null){
      alert(warningLog);
      return;
    }
    await addDoc(moviesColectionRef, {title: titleWork, description: newDescr, rating: Number(0), poster: newPoster, uid: user.uid, color:newColor, time:newTime})
    //moviesColectionRef.collection('voters').doc(user.uid);
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
      //console.log('----------'+data.id+", Uid "+userIDD);
      alert("You already voted");
    }
    else {
      updateRatingWriteVoter(movieId, userIDD, rating);
      //console.log("New voter")
    }
    /*
    const data = await getDocs(collection(db, 'movies/'+movieId+'/voters'));
    data.docs.map((doc)=>(
      doc.id === userIDD
    //doc.id === user.uid
    ? console.log("matching user uid "+doc.id+" with userID "+userIDD+", in movie "+movieId+" voters, a deja vote !!! return")
    : updateRatingWriteVoter(movieId, userIDD, rating),
      console.log('done updating movie with ID '+movieId+' voters field with user ID '+userIDD)
    ));
    */
  }

  const updateRatingWriteVoter =  async(movieId,userID,rating) =>{
    //writing userid in voters movie list
    const voters = doc(db, 'movies/'+movieId+'/voters', userID);
    const data = {};
    setDoc(voters, data)
    .then(voters => {
   // console.log("updated setdoc with id = "+userID);
    })
    .catch(error => {
    console.log(error);
    })
    //------------uppdate rating
    updateRating(movieId, rating);
    /*
    const movieDoc = doc(db, "movies", movieId);
    //console.log(movieDoc.title);
    const newFields = {rating: rating+1};
    await updateDoc(movieDoc, newFields);
    getMovies();
    */
  }

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

  /*
  const checkVoters = async(movieId, userID) =>
  {
    console.log('Check voters');

    const data = await getDocs(collection(db, 'movies/'+movieId+'/voters'));

    //const data = docS.exists() ? docS.data() : null
  
    //if (data === null || data === undefined) return null
  


   
//const data = await getDocs(collection(db, 'movies/'+movieId+'/voters'));

    data.docs.map((doc)=>(
    //console.log("Doc exists ? = "+doc.exists()+", doc = "+doc.id)
    //doc.list.length > 0 && 
    doc.id === userID
    //doc.id === user.uid
    ? console.log("matching user uid "+doc.id+", in movie "+movieId+" voters, a deja vote !!! return")
    : null
    
      ));

//const [docs, loqding, error] = useCollectionData(query);
    const toCheck = docs?.find(userID);
    if(toCheck!==null){
      console.log("no such ID as "+userID);
      return;
    }else{
      console.log("Adding the UID to the voters");
      //write uid to voters
      //setNewRating(newRating+=1);
    }
  }
  */
  

  const Dropdown = ({ trigger, menu }) => {
    const [open, setOpen] = useState(false);
  
    const handleOpen = () => {
      setOpen(!open);
      //checkVoters('0YVeq94stG8sPco4tXv1', 'MEGSNWeLIbXI2RG2ji7vf4pGGzo2');
      //checkVoters('0YVeq94stG8sPco4tXv1', 'amdnNVoCnFg21MZtQbWvikH9Q0r2');
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
        //updateRating={updateRating}
        updateRating={updateRatingVoter}
      />
    </div>
    </div>
  );
}

export default App;
