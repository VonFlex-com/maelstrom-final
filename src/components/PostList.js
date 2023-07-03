import noImg from "../assets/no-picture-available.png";

const PostList = ({ movies, userCred, deleteMovie, getMovie, handlePoster, updateRating, handleComment }) => {
  return (
    <ul className="ulElem">
      {movies.map((t) => (
<li className="liElem" key={t.id}>
<div className="listInfos">
  <div className="titleAndRating">
      <span className="textTitle" style={{backgroundColor :t.color}}>
        {t.title}
      </span>
      <button className={t.com===0?"noCommentButton":"commentButton"} onClick={() => handleComment(t.id)}>{t.com===0?'\u00A0':t.com}</button>
      <span className={t.time==='new'?"textTime":t.time==='recent'?"textTime2":"textTime3"}>
        {t.time}
      </span>
      <span className="textRatingH">
        {t.rating}<button className="starButton" onClick={() => updateRating(t.id, t.rating)}></button>
      </span>
      </div>
      <span className="textDescr">
      <img className="imgDesc" alt="poster" src={t.imgUrl?t.imgUrl:{noImg}}/><span className="textDesc">{t.description}</span>
      </span>
      </div>
      
      <div className="listButtons">
      <button className="whoButton" onClick={() => handlePoster(t.poster)}></button>
      <button className={t.uid.valueOf() === userCred?"editButton":"editNOButton"} onClick={() => getMovie(t.id, t.uid.valueOf())}></button>
      <button className={t.uid.valueOf() === userCred?"deleteButton":"deleteNOButton"}  onClick={() => deleteMovie(t.id, t.uid.valueOf())}></button>
      </div>
</li>
      ))}
    </ul>
  );
};

export default PostList;